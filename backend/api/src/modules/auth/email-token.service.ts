import crypto from "crypto";
import prisma from "../../../config/database";

export type EmailTokenPurpose = "EMAIL_VERIFY" | "PASSWORD_RESET";

const CODE_TTL_MINUTES = Number(process.env.EMAIL_CODE_TTL_MINUTES || 15);
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = Number(
  process.env.EMAIL_CODE_RESEND_COOLDOWN_SECONDS || 60
);

/**
 * HMAC key for the one-time codes.
 *
 * Reusing JWT_SECRET here is deliberate: a keyed hash means a stolen database
 * alone cannot be brute-forced, since a 6-digit code has only a million
 * possible values but the key stays on the server.
 */
const codeSecret = (): string => {
  const secret = process.env.EMAIL_CODE_SECRET || process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "EMAIL_CODE_SECRET (or JWT_SECRET) must be set to at least 32 characters."
    );
  }

  return secret;
};

/**
 * A six-digit code from a CSPRNG.
 *
 * crypto.randomInt is used rather than Math.random because this value is the
 * only thing standing between an email address and a password reset.
 */
function generateCode(): string {
  // Leading zeros are significant and must be preserved, so the code is built
  // digit by digit rather than from a number.
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += crypto.randomInt(0, 10).toString();
  }
  return code;
}

/**
 * Codes are stored only as a keyed hash.
 *
 * Anyone who can read the database (a stolen backup, an over-broad SQL grant)
 * then cannot use a stored row to verify an address or reset a password.
 */
const hashCode = (code: string): string =>
  crypto.createHmac("sha256", codeSecret()).update(code).digest("hex");

/**
 * Verifies a code against the live rows for a user and purpose.
 *
 * The comparison is constant-time so the response time does not reveal how many
 * leading digits were correct. Every still-valid row is checked, because a
 * resend supersedes the previous code without the older row being removed yet.
 */
export async function consumeEmailCode(input: {
  userId: string;
  purpose: EmailTokenPurpose;
  code: string;
}): Promise<boolean> {
  const now = new Date();

  const candidates = await prisma.emailVerificationToken.findMany({
    where: {
      userId: input.userId,
      purpose: input.purpose,
      consumedAt: null,
      expiresAt: { gt: now },
      attempts: { lt: MAX_ATTEMPTS },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (candidates.length === 0) return false;

  const candidateHash = hashCode(input.code);

  const matched = candidates.some((row) => {
    const a = Buffer.from(candidateHash, "utf8");
    const b = Buffer.from(row.codeHash, "utf8");
    // timingSafeEqual requires equal lengths; both are 64 hex characters.
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });

  if (!matched) {
    // Count the miss so a guessed code cannot be retried indefinitely.
    await prisma.emailVerificationToken.updateMany({
      where: {
        userId: input.userId,
        purpose: input.purpose,
        consumedAt: null,
        expiresAt: { gt: now },
      },
      data: { attempts: { increment: 1 } },
    });
    return false;
  }

  // Burn every outstanding code for this purpose: a code is valid once only.
  await prisma.emailVerificationToken.updateMany({
    where: {
      userId: input.userId,
      purpose: input.purpose,
      consumedAt: null,
    },
    data: { consumedAt: now },
  });

  return true;
}

/**
 * Issues a fresh code and returns the plaintext for the email body.
 *
 * Resending supersedes any earlier code so that only the newest message works.
 */
export async function issueEmailCode(input: {
  userId: string;
  purpose: EmailTokenPurpose;
  ipAddress?: string;
}): Promise<{ code: string; expiresInMinutes: number }> {
  const now = new Date();

  await prisma.emailVerificationToken.updateMany({
    where: {
      userId: input.userId,
      purpose: input.purpose,
      consumedAt: null,
    },
    data: { consumedAt: now },
  });

  const code = generateCode();

  await prisma.emailVerificationToken.create({
    data: {
      userId: input.userId,
      purpose: input.purpose,
      codeHash: hashCode(code),
      expiresAt: new Date(now.getTime() + CODE_TTL_MINUTES * 60 * 1000),
      ipAddress: input.ipAddress,
    },
  });

  return { code, expiresInMinutes: CODE_TTL_MINUTES };
}

/**
 * Whether a new code may be issued.
 *
 * A request inside the cooldown returns false so the endpoint cannot be used to
 * mail-bomb an address. The caller still reports success to the client.
 */
export async function canIssueEmailCode(input: {
  userId: string;
  purpose: EmailTokenPurpose;
}): Promise<boolean> {
  const recent = await prisma.emailVerificationToken.findFirst({
    where: {
      userId: input.userId,
      purpose: input.purpose,
      createdAt: {
        gt: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000),
      },
    },
  });

  return !recent;
}

/** Housekeeping: drop rows that can no longer be used. */
export async function purgeExpiredEmailCodes(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const result = await prisma.emailVerificationToken.deleteMany({
    where: {
      OR: [{ expiresAt: { lt: cutoff } }, { consumedAt: { not: null }, createdAt: { lt: cutoff } }],
    },
  });

  return result.count;
}