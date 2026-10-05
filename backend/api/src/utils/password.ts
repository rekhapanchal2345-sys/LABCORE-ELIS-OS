import bcrypt from "bcryptjs";
import crypto from "crypto";
import env from "../../config/env";

/**
 * Apply a server-side HMAC pepper to the password before bcrypt hashing.
 *
 * Why pepper?  bcrypt is a KDF stored together with its own salt in the DB.
 * A pepper is a *secret* held only in the environment: even if an attacker
 * dumps the DB they still cannot crack hashes without the server secret.
 *
 * We HMAC (not concatenate) to avoid length-extension issues and to keep the
 * peppered value a fixed 64-char hex string regardless of input length.
 */
const applyPepper = (password: string): string => {
  const pepper = env.PASSWORD_PEPPER;
  if (!pepper) {
    // Pepper is optional (graceful degradation in development).
    return password;
  }
  return crypto
    .createHmac("sha256", pepper)
    .update(password)
    .digest("hex");
};

export const hashPassword = async (
  password: string
): Promise<string> => {
  return bcrypt.hash(applyPepper(password), env.BCRYPT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(applyPepper(password), hashedPassword);
};