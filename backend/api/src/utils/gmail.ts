import crypto from "crypto";

/**
 * Email normalisation.
 *
 * Gmail treats these as the same mailbox, so a sign-in must too:
 *   - case is ignored            John.Doe@Gmail.com
 *   - dots in the local part     j.o.h.n@gmail.com
 *   - everything after "+"       john+elis@gmail.com
 *
 * Without this, one staff member can hold several accounts for the same mailbox,
 * and a shared address can be registered twice. Addresses at other providers are
 * only lower-cased and trimmed, because their dots and "+" are significant.
 */

const GMAIL_DOMAIN = "gmail.com";
// Google Workspace addresses behave the same way as consumer Gmail.
const GOOGLE_WORKSPACE_DOMAINS = new Set(["googlemail.com", "workspace.google.com"]);

export type EmailCanonicalisation = {
  /** The form stored and compared in the database. */
  canonical: string;
  /** True when the address belongs to a Google mailbox. */
  isGoogleMailbox: boolean;
  /** Set when the stored address differs from the one the user typed. */
  wasNormalised: boolean;
};

export function canonicaliseEmail(rawInput: string): EmailCanonicalisation {
  const trimmed = String(rawInput ?? "")
    .trim()
    .toLowerCase();
  const atIndex = trimmed.lastIndexOf("@");

  if (atIndex <= 0 || atIndex === trimmed.length - 1) {
    // Not an address shape we can safely rewrite; leave it for validation to reject.
    return { canonical: trimmed, isGoogleMailbox: false, wasNormalised: false };
  }

  const localPart = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  const isGoogleMailbox =
    domain === GMAIL_DOMAIN || GOOGLE_WORKSPACE_DOMAINS.has(domain);

  if (!isGoogleMailbox) {
    return { canonical: trimmed, isGoogleMailbox: false, wasNormalised: false };
  }

  // "+tag" is a delivery sub-address; the mailbox is the part before it.
  const withoutTag = localPart.split("+")[0];
  // Dots are cosmetic in a Google mailbox.
  const canonicalLocal = withoutTag.replace(/\./g, "");

  const canonical = `${canonicalLocal}@${domain}`;

  return {
    canonical,
    isGoogleMailbox: true,
    wasNormalised: canonical !== trimmed,
  };
}

/** Convenience wrapper for the many call sites that only need the string. */
export function normaliseEmail(rawInput: string): string {
  return canonicaliseEmail(rawInput).canonical;
}

/**
 * A stable, non-reversible index for an address.
 *
 * Lets two records be compared for "same mailbox" without storing the address a
 * second time in a form that could be read back.
 */
export function emailBlindIndex(canonical: string): string {
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

/** Hides the local part of an address for display and for log lines. */
export function maskEmail(canonical: string): string {
  const atIndex = canonical.indexOf("@");
  if (atIndex <= 0) return "***";

  const local = canonical.slice(0, atIndex);
  const domain = canonical.slice(atIndex);

  if (local.length <= 2) return `${local[0] ?? "*"}***${domain}`;
  return `${local.slice(0, 2)}${"*".repeat(
    Math.min(local.length - 2, 6)
  )}${domain}`;
}

/** True when the address is a Google mailbox that accepts IMAP/SMTP. */
export function isGoogleMailbox(email: string): boolean {
  return canonicaliseEmail(email).isGoogleMailbox;
}