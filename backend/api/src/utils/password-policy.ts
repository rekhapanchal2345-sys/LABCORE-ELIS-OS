import { HttpError } from "./http-error";

const POLICY = {
  minLength: 12,
  historyCount: 5,
  expiryDays: 90,
};

const COMPLEXITY =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export function assertStrongPassword(password: string): void {
  if (!COMPLEXITY.test(password)) {
    throw new HttpError(
      "Password must be at least 12 characters and include uppercase, lowercase, a number, and a symbol.",
      400,
      "WEAK_PASSWORD"
    );
  }
}

export function isPasswordExpired(passwordChangedAt?: Date | null): boolean {
  if (!passwordChangedAt) {
    return false;
  }

  const expiresAt = new Date(passwordChangedAt);
  expiresAt.setDate(expiresAt.getDate() + POLICY.expiryDays);
  return Date.now() > expiresAt.getTime();
}

export { POLICY as passwordPolicy };
