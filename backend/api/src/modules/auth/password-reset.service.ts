import type { Request } from "express";
import crypto from "crypto";
import prisma from "../../../config/database";
import { hashPassword, comparePassword } from "../../utils/password";
import { assertStrongPassword, assertNotCommonPassword, assertNoPersonalInfo, passwordPolicy } from "../../utils/password-policy";
import { HttpError } from "../../utils/http-error";
import { getClientIp } from "../../utils/request-meta";
import { emailBlindIndex, normaliseEmail } from "../../utils/gmail";
import { createAuditLog } from "../audit/audit.service";
import {
  canIssueEmailCode,
  consumeEmailCode,
  issueEmailCode,
} from "./email-token.service";
import { recordLoginAlert, sendOneTimeCodeEmail } from "./login-alert.service";

const logAudit = (payload: Omit<Parameters<typeof createAuditLog>[0], "module">) =>
  createAuditLog({ ...payload, module: "AUTH" }).catch((error) =>
    console.error("Audit log failed for auth module:", error)
  );

/** Compared against so an unknown account costs the same time as a known one. */
let dummyHashPromise: Promise<string> | null = null;
const spendComparableTime = async (): Promise<void> => {
  dummyHashPromise ??= hashPassword(
    crypto.randomBytes(32).toString("hex")
  );
  await dummyHashPromise;
};

/**
 * The answer given for every password-reset request.
 *
 * An unknown address, a disabled account, a resend inside the cooldown and a
 * mail outage all produce exactly this, so the endpoint cannot be used to learn
 * which addresses have accounts. The address is never echoed back.
 */
const RESET_NEUTRAL_MESSAGE =
  "If an account exists for that address, a reset code has been sent to it.";

const VERIFY_NEUTRAL_MESSAGE =
  "If the address belongs to an unverified account, a code has been sent to it.";

const CODE_INVALID = new HttpError(
  "That code is invalid or has expired. Please request a new one.",
  400,
  "CODE_INVALID"
);

export const requestPasswordReset = async (rawEmail: string, req: Request) => {
  const canonical = normaliseEmail(rawEmail);

  const user = await prisma.user.findUnique({
    where: { email: canonical },
    select: {
      id: true,
      email: true,
      fullName: true,
      status: true,
    },
  });

  if (user && user.status === "ACTIVE") {
    const allowed = await canIssueEmailCode({
      userId: user.id,
      purpose: "PASSWORD_RESET",
    });

    if (allowed) {
      const { code, expiresInMinutes } = await issueEmailCode({
        userId: user.id,
        purpose: "PASSWORD_RESET",
        ipAddress: getClientIp(req),
      });

      await sendOneTimeCodeEmail({
        to: user.email,
        fullName: user.fullName,
        code,
        expiresInMinutes,
        purpose: "PASSWORD_RESET",
      });

      await recordLoginAlert({
        userId: user.id,
        type: "PASSWORD_RESET_REQUESTED",
        req,
        force: true,
      });

      await logAudit({
        userId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        ipAddress: getClientIp(req),
      });
    }
  }

  await spendComparableTime();

  return { message: RESET_NEUTRAL_MESSAGE };
};

export const completePasswordReset = async (input: {
  email: string;
  code: string;
  newPassword: string;
  req: Request;
}) => {
  // Policy checks run after user lookup so we have email/fullName for the
  // contextual assertion. We do NOT consume the code if policy fails.
  assertStrongPassword(input.newPassword);

  const canonical = normaliseEmail(input.email);

  const user = await prisma.user.findUnique({
    where: { email: canonical },
    select: { id: true, email: true, fullName: true, status: true },
  });

  if (!user || user.status !== "ACTIVE") {
    await spendComparableTime();
    throw CODE_INVALID;
  }

  assertNotCommonPassword(input.newPassword);
  assertNoPersonalInfo(input.newPassword, user.email, user.fullName);

  const codeOk = await consumeEmailCode({
    userId: user.id,
    purpose: "PASSWORD_RESET",
    code: input.code.trim(),
  });

  if (!codeOk) {
    throw CODE_INVALID;
  }

  // A reset must not land on a password the account has already used.
  const history = await prisma.passwordHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: passwordPolicy.historyCount,
  });

  for (const row of history) {
    if (await comparePassword(input.newPassword, row.passwordHash)) {
      throw new HttpError(
        `You cannot reuse any of your last ${passwordPolicy.historyCount} passwords.`,
        400,
        "PASSWORD_REUSED"
      );
    }
  }

  const passwordHash = await hashPassword(input.newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        // The account has just recovered access, so lockout state is cleared.
        failedLoginCount: 0,
        lockedUntil: null,
        // The address was just proven by receiving the code.
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailBlindIndex: emailBlindIndex(canonical),
      },
    }),
    prisma.passwordHistory.create({
      data: { userId: user.id, passwordHash },
    }),
    // Anything signed in before the reset is no longer trustworthy.
    prisma.userSession.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: "password_reset" },
    }),
    prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: new Date() },
    }),
  ]);

  await recordLoginAlert({
    userId: user.id,
    type: "PASSWORD_RESET_COMPLETED",
    req: input.req,
    force: true,
  });

  await logAudit({
    userId: user.id,
    action: "PASSWORD_RESET_COMPLETED",
    ipAddress: getClientIp(input.req),
  });

  return { ok: true, message: "Your password has been changed. Please sign in." };
};

/** EMAIL VERIFICATION — proves the address can receive mail. */
export const requestEmailVerification = async (
  rawEmail: string,
  req: Request
) => {
  const canonical = normaliseEmail(rawEmail);

  const user = await prisma.user.findUnique({
    where: { email: canonical },
    select: {
      id: true,
      email: true,
      fullName: true,
      status: true,
      emailVerified: true,
    },
  });

  if (user && user.status === "ACTIVE" && !user.emailVerified) {
    const allowed = await canIssueEmailCode({
      userId: user.id,
      purpose: "EMAIL_VERIFY",
    });

    if (allowed) {
      const { code, expiresInMinutes } = await issueEmailCode({
        userId: user.id,
        purpose: "EMAIL_VERIFY",
        ipAddress: getClientIp(req),
      });

      await sendOneTimeCodeEmail({
        to: user.email,
        fullName: user.fullName,
        code,
        expiresInMinutes,
        purpose: "EMAIL_VERIFY",
      });

      await logAudit({
        userId: user.id,
        action: "EMAIL_VERIFICATION_REQUESTED",
        ipAddress: getClientIp(req),
      });
    }
  }

  await spendComparableTime();

  return { message: VERIFY_NEUTRAL_MESSAGE };
};

export const confirmEmailVerification = async (input: {
  email: string;
  code: string;
  req: Request;
}) => {
  const canonical = normaliseEmail(input.email);

  const user = await prisma.user.findUnique({
    where: { email: canonical },
    select: { id: true, fullName: true, status: true, emailVerified: true },
  });

  if (!user || user.status !== "ACTIVE") {
    await spendComparableTime();
    throw CODE_INVALID;
  }

  if (user.emailVerified) {
    return { verified: true, message: "This address is already verified." };
  }

  const codeOk = await consumeEmailCode({
    userId: user.id,
    purpose: "EMAIL_VERIFY",
    code: input.code.trim(),
  });

  if (!codeOk) {
    throw CODE_INVALID;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      emailBlindIndex: emailBlindIndex(canonical),
    },
  });

  await recordLoginAlert({
    userId: user.id,
    type: "EMAIL_VERIFICATION",
    req: input.req,
    force: true,
  });

  await logAudit({
    userId: user.id,
    action: "EMAIL_VERIFIED",
    ipAddress: getClientIp(input.req),
  });

  return { verified: true, message: "Your email address is verified." };
};