import type { Request } from "express";
import prisma from "../../../config/database";
import { sendEmail } from "../../lib/communication-providers";
import { getClientIp, getDeviceFingerprint } from "../../utils/request-meta";

export type LoginAlertType =
  | "NEW_DEVICE_SIGNIN"
  | "NEW_IP_SIGNIN"
  | "REPEATED_FAILED_SIGNIN"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_RESET_COMPLETED"
  | "PASSWORD_CHANGED"
  | "EMAIL_VERIFICATION";

const SUBJECTS: Record<LoginAlertType, string> = {
  NEW_DEVICE_SIGNIN: "New sign-in to your LabCore ELIS account",
  NEW_IP_SIGNIN: "Sign-in from a new network on your LabCore ELIS account",
  REPEATED_FAILED_SIGNIN: "Repeated failed sign-in attempts on your LabCore ELIS account",
  PASSWORD_RESET_REQUESTED: "A password reset was requested for your LabCore ELIS account",
  PASSWORD_RESET_COMPLETED: "Your LabCore ELIS password was changed",
  PASSWORD_CHANGED: "Your LabCore ELIS password was changed",
  EMAIL_VERIFICATION: "Your LabCore ELIS email address was verified",
};

/** Sends mail, reporting failure instead of throwing. */
async function trySend(input: {
  to: string;
  subject: string;
  body: string;
}): Promise<boolean> {
  try {
    // sendEmail reports failure in its result rather than by throwing.
    const result = await sendEmail({
      to: input.to,
      subject: input.subject,
      body: input.body,
    });

    if (!result?.success) {
      // A mail outage must not block a password reset; the audit row still lands.
      console.error(
        `Security email could not be delivered to ${input.to}: ${
          result?.error ?? "unknown error"
        }`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      `Security email could not be delivered to ${input.to}:`,
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

/**
 * An alert body the account owner can act on.
 *
 * It states what happened, when and from where, and never repeats a password or
 * any other credential.
 */
function buildAlertBody(input: {
  type: LoginAlertType;
  fullName: string;
  ipAddress?: string;
  userAgent?: string;
}): string {
  const when = new Date().toUTCString();

  const lines = [
    `Hello ${input.fullName},`,
    "",
    SUBJECTS[input.type],
    "",
    `Time:   ${when}`,
    `IP:     ${input.ipAddress ?? "unknown"}`,
    `Device: ${input.userAgent ?? "unknown"}`,
    "",
  ];

  const suspicious =
    input.type === "NEW_DEVICE_SIGNIN" ||
    input.type === "NEW_IP_SIGNIN" ||
    input.type === "REPEATED_FAILED_SIGNIN" ||
    input.type === "PASSWORD_RESET_REQUESTED";

  lines.push(
    suspicious
      ? "If this was not you, reset your password immediately using the " +
          "'Forgot password' option on the sign-in page, and contact your administrator."
      : "No action is needed if this was you. If it was not, reset your " +
          "password immediately and contact your administrator.",
    "",
    "— LabCore ELIS Security",
    "This is an automated message. Please do not reply to it."
  );

  return lines.join("\n");
}

/**
 * Records a security-relevant event and emails the account owner.
 *
 * A device and network already alerted about are not treated as new, so an
 * ordinary repeat sign-in does not generate another email.
 */
export async function recordLoginAlert(input: {
  userId: string;
  type: LoginAlertType;
  req: Request;
  detail?: string;
  /** Send even if this device/IP was alerted before. */
  force?: boolean;
}): Promise<{ recorded: true; emailed: boolean }> {
  const ipAddress = getClientIp(input.req);
  const deviceFingerprint = getDeviceFingerprint(input.req);
  const userAgent = input.req.headers["user-agent"] || undefined;

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      status: true,
      lastAlertedDeviceFingerprint: true,
      lastAlertedIpAddress: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return { recorded: true, emailed: false };
  }

  const sameDevice = user.lastAlertedDeviceFingerprint === deviceFingerprint;
  const sameIp = user.lastAlertedIpAddress === ipAddress;
  const alreadyKnown = sameDevice && sameIp;

  let emailSent = false;
  let detail = input.detail;

  if (input.force || !alreadyKnown) {
    emailSent = await trySend({
      to: user.email,
      subject: SUBJECTS[input.type],
      body: buildAlertBody({
        type: input.type,
        fullName: user.fullName,
        ipAddress,
        userAgent,
      }),
    });
  } else {
    detail = detail ?? "known_device_and_network";
  }

  await prisma.loginAlert.create({
    data: {
      userId: user.id,
      type: input.type,
      ipAddress,
      userAgent,
      deviceFingerprint,
      emailSent,
      detail,
    },
  });

  // Remember this device/network so the next ordinary sign-in is silent.
  if (emailSent) {
    await prisma.user.updateMany({
      where: { id: user.id },
      data: {
        lastAlertedDeviceFingerprint: deviceFingerprint,
        lastAlertedIpAddress: ipAddress,
      },
    });
  }

  return { recorded: true, emailed: emailSent };
}

/**
 * Sends a one-time code to a Gmail address.
 *
 * The code is returned for the caller's email body only and is never logged.
 */
export async function sendOneTimeCodeEmail(input: {
  to: string;
  fullName: string;
  code: string;
  expiresInMinutes: number;
  purpose: "EMAIL_VERIFY" | "PASSWORD_RESET";
}): Promise<boolean> {
  const heading =
    input.purpose === "PASSWORD_RESET"
      ? "Use this code to set a new LabCore ELIS password"
      : "Use this code to verify your LabCore ELIS email address";

  const body = [
    `Hello ${input.fullName},`,
    "",
    heading,
    "",
    `     ${input.code}`,
    "",
    `This code expires in ${input.expiresInMinutes} minutes and can be used once.`,
    "",
    "If you did not request this, no action is needed and you can ignore this",
    "message. Nothing on your account changes until the code is entered.",
    "",
    "— LabCore ELIS Security",
    "This is an automated message. Please do not reply to it.",
  ].join("\n");

  return trySend({
    to: input.to,
    subject: `${input.code} — LabCore ELIS verification code`,
    body,
  });
}