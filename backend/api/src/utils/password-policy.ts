import { HttpError } from "./http-error";

const POLICY = {
  minLength: 12,
  historyCount: 5,
  expiryDays: 90,
};

const COMPLEXITY =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

/**
 * Subset of the HIBP "top 1 000 000" and most commonly seen breach passwords,
 * reduced to entries >= 12 chars so the check applies at the policy boundary.
 * In production you can swap this for a full Bloom-filter backed service.
 */
const COMMON_PASSWORDS = new Set([
  "password123456",
  "Password12345!",
  "Password123456",
  "qwertyuiop123",
  "iloveyou123456",
  "letmein123456",
  "welcome123456",
  "monkey123456",
  "dragon123456",
  "master123456",
  "sunshine123456",
  "princess123456",
  "passw0rd1234",
  "Passw0rd1234",
  "abc123456789",
  "111111111111",
  "123456789012",
  "000000000000",
  "aaaaaaaaaaaa",
  "qqqqqqqqqqqq",
  "administrator",
  "administrator1",
  "1qaz2wsx3edc",
  "qazwsxedcrfv",
  "zxcvbnm12345",
  "trustno11234",
  "superman12345",
  "batman123456",
  "michael12345",
  "jessica12345",
  "Password1234!",
  "Welcome1234!",
  "Summer2024!!",
  "Winter2024!!",
  "Spring2024!!",
  "Autumn2024!!",
  "January2024!",
  "February2024!",
  "March2024!!!",
  "April2024!!!",
  "Company2024!",
  "Labcore2024!",
  "Hospital2024",
  "Clinical2024",
]);

/**
 * Throws if password appears on the known-weak/breached list.
 */
export function assertNotCommonPassword(password: string): void {
  if (COMMON_PASSWORDS.has(password)) {
    throw new HttpError(
      "This password is too common and has appeared in known data breaches. Please choose a unique password.",
      400,
      "COMMON_PASSWORD"
    );
  }
}

/**
 * Throws if password contains the user's email local-part or any word
 * from their full name (case-insensitive, minimum 3 chars per word).
 */
export function assertNoPersonalInfo(
  password: string,
  email: string,
  fullName: string
): void {
  const lower = password.toLowerCase();

  // Check email local-part (everything before @)
  const localPart = email.split("@")[0].toLowerCase();
  if (localPart.length >= 3 && lower.includes(localPart)) {
    throw new HttpError(
      "Password must not contain your email address.",
      400,
      "PASSWORD_CONTAINS_EMAIL"
    );
  }

  // Check each word in full name (skip words shorter than 3 chars)
  const nameParts = fullName
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  for (const part of nameParts) {
    if (lower.includes(part)) {
      throw new HttpError(
        "Password must not contain your name.",
        400,
        "PASSWORD_CONTAINS_NAME"
      );
    }
  }
}

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
