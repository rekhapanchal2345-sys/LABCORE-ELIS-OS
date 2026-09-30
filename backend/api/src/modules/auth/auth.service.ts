import type { Request } from "express";
import crypto from "crypto";
import prisma from "../../../config/database";
import { hashPassword, comparePassword } from "../../utils/password";
import {
  accessTokenTtl,
  generateAccessToken,
  generateChallengeToken,
  hashOpaqueToken,
  randomRefreshToken,
  sessionTtlMs,
  verifyAccessToken,
  type AuthUser,
  type JwtPayload,
  type UserRole,
} from "../../lib/auth";
import {
  idleTimeoutMinutesForRole,
  maxConcurrentSessions,
  mfaRequiredForRole,
} from "../../lib/permissions";
import { HttpError } from "../../utils/http-error";
import {
  assertStrongPassword,
  isPasswordExpired,
  passwordPolicy,
} from "../../utils/password-policy";
import { decryptField, encryptField } from "../../utils/field-crypto";
import {
  generateTotpSecret,
  totpOtpauthUrl,
  verifyTotp,
} from "../../utils/totp";
import { getClientIp, getDeviceFingerprint } from "../../utils/request-meta";

const LOCKOUT_ATTEMPTS = Number(process.env.LOGIN_LOCKOUT_ATTEMPTS || 5);
const LOCKOUT_MINUTES = Number(process.env.LOGIN_LOCKOUT_MINUTES || 15);

/** Same message for unknown user and wrong password, so accounts cannot be enumerated. */
const INVALID_CREDENTIALS = "Invalid email, employee code or password";

/** Compared against so an unknown account costs the same time as a wrong password. */
let dummyHashPromise: Promise<string> | null = null;
const getDummyHash = (): Promise<string> =>
  (dummyHashPromise ??= hashPassword(crypto.randomBytes(32).toString("hex")));

type PublicUser = {
  id: string;
  employeeCode: string;
  fullName: string;
  name: string;
  email: string;
  role: UserRole;
  mfaEnabled: boolean;
  passwordExpired: boolean;
};

function toAuthUser(user: {
  id: string;
  employeeCode: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: AuthUser["status"];
}): AuthUser {
  return {
    id: user.id,
    employeeCode: user.employeeCode,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
  };
}

function toPublicUser(user: {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  role: UserRole;
  mfaEnabled: boolean;
  passwordChangedAt?: Date | null;
}): PublicUser {
  return {
    id: user.id,
    employeeCode: user.employeeCode,
    fullName: user.fullName,
    name: user.fullName,
    email: user.email,
    role: user.role,
    mfaEnabled: user.mfaEnabled,
    passwordExpired: user.passwordChangedAt ? isPasswordExpired(user.passwordChangedAt) : false,
  };
}

function backupCodes(): string[] {
  return Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString("hex")
  );
}

export const registerUser = async (data: {
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}) => {
  assertStrongPassword(data.password);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { employeeCode: data.employeeCode }],
    },
  });

  if (existingUser) {
    throw new HttpError(
      "User with this email or employee code already exists",
      409
    );
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      employeeCode: data.employeeCode,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: data.role,
      passwordChangedAt: new Date(),
    },
  });

  await prisma.passwordHistory.create({
    data: { userId: user.id, passwordHash },
  });

  return {
    user: toPublicUser({
      ...user,
      mfaEnabled: false,
      passwordChangedAt: new Date(),
    }),
  };
};

async function registerFailedLogin(userId: string): Promise<never> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { failedLoginCount: { increment: 1 } },
    select: { failedLoginCount: true },
  });

  if (user.failedLoginCount >= LOCKOUT_ATTEMPTS) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: "LOCKED",
        lockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000),
        failedLoginCount: 0,
      },
    });

    throw new HttpError(
      `Account locked after ${LOCKOUT_ATTEMPTS} failed sign-in attempts. It unlocks automatically in ${LOCKOUT_MINUTES} minutes or an administrator can unlock it now.`,
      423,
      "ACCOUNT_LOCKED"
    );
  }

  const remaining = LOCKOUT_ATTEMPTS - user.failedLoginCount;

  throw new HttpError(
    remaining <= 2
      ? `${INVALID_CREDENTIALS}. ${remaining} attempt${remaining === 1 ? "" : "s"} left before the account is locked.`
      : INVALID_CREDENTIALS,
    401,
    "INVALID_CREDENTIALS"
  );
}

async function issueSession(
  user: AuthUser & {
    mfaEnabled: boolean;
    passwordChangedAt?: Date | null;
    fullName: string;
    email: string;
    employeeCode: string;
    role: UserRole;
  },
  req: Request,
  amr: string[]
) {
  const refreshToken = randomRefreshToken();
  const refreshTokenHash = hashOpaqueToken(refreshToken);
  const idleMinutes = idleTimeoutMinutesForRole(user.role);
  const expiresAt = new Date(Date.now() + sessionTtlMs());

  const active = await prisma.userSession.findMany({
    where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { lastSeenAt: "asc" },
  });

  const overflow = active.length + 1 - maxConcurrentSessions();
  if (overflow > 0) {
    const toRevoke = active.slice(0, overflow);
    await prisma.userSession.updateMany({
      where: { id: { in: toRevoke.map((s) => s.id) } },
      data: { revokedAt: new Date(), revokeReason: "session_limit" },
    });
  }

  const session = await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshTokenHash,
      deviceFingerprint: getDeviceFingerprint(req),
      userAgent: String(req.headers["user-agent"] || "").slice(0, 500),
      ipAddress: getClientIp(req),
      expiresAt,
    },
  });

  const token = generateAccessToken(toAuthUser(user), {
    sid: session.id,
    amr,
    expiresIn: accessTokenTtl(),
  });

  return {
    user: toPublicUser(user),
    token,
    accessToken: token,
    tokenType: "Bearer",
    refreshToken,
    sessionId: session.id,
    expiresAt,
    idleTimeoutMinutes: idleMinutes,
  };
}

export const loginUser = async (
  rawIdentifier: string,
  password: string,
  req: Request
) => {
  const identifier = String(rawIdentifier ?? "").trim();

  if (!identifier || !password) {
    throw new HttpError(
      "Email or employee code and password are required",
      400
    );
  }

  // Login accepts an email address or an employee code, in any letter case.
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: identifier, mode: "insensitive" } },
        { employeeCode: { equals: identifier, mode: "insensitive" } },
      ],
    },
  });

  if (!user) {
    // Spend the same bcrypt time as a real comparison to hide which accounts exist.
    await comparePassword(password, await getDummyHash());
    throw new HttpError(INVALID_CREDENTIALS, 401, "INVALID_CREDENTIALS");
  }

  if (user.status === "LOCKED") {
    if (user.lockedUntil && user.lockedUntil.getTime() < Date.now()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: "ACTIVE", lockedUntil: null, failedLoginCount: 0 },
      });
    } else {
      const minutesLeft = user.lockedUntil
        ? Math.max(1, Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000))
        : LOCKOUT_MINUTES;
      throw new HttpError(
        `Account is locked. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"} or contact an administrator.`,
        423,
        "ACCOUNT_LOCKED"
      );
    }
  }

  if (user.status !== "ACTIVE") {
    throw new HttpError(
      `Account is ${user.status.toLowerCase()}. Contact an administrator to activate it.`,
      403,
      "ACCOUNT_INACTIVE"
    );
  }

  const passwordValid = await comparePassword(password, user.passwordHash);

  if (!passwordValid) {
    await registerFailedLogin(user.id);
  }

  if (user.failedLoginCount > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null },
    });
  }

  const needsMfa = mfaRequiredForRole(user.role) || user.mfaEnabled;

  if (needsMfa && user.mfaEnabled) {
    return {
      requiresMfa: true,
      mfaToken: generateChallengeToken(user.id, "mfa"),
      user: { id: user.id, email: user.email, fullName: user.fullName },
    };
  }

  if (needsMfa && !user.mfaEnabled) {
    const secret = generateTotpSecret();
    await prisma.user.update({
      where: { id: user.id },
      data: { totpPendingEnc: encryptField(secret) },
    });

    return {
      requiresMfaSetup: true,
      mfaToken: generateChallengeToken(user.id, "mfa_setup"),
      otpauthUrl: totpOtpauthUrl(secret, user.email),
      user: { id: user.id, email: user.email, fullName: user.fullName },
    };
  }

  return issueSession(user, req, ["pwd"]);
};

export const verifyMfaLogin = async (
  mfaToken: string,
  code: string,
  req: Request
) => {
  let payload: JwtPayload;
  try {
    payload = verifyAccessToken(mfaToken);
  } catch {
    throw new HttpError(
      "MFA challenge is invalid or expired. Please sign in again.",
      401,
      "MFA_CHALLENGE_EXPIRED"
    );
  }

  if (payload.typ !== "mfa" && payload.typ !== "mfa_setup") {
    throw new HttpError("Invalid MFA challenge", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.status !== "ACTIVE") {
    throw new HttpError("User not found or inactive", 401);
  }

  if (payload.typ === "mfa_setup") {
    if (!user.totpPendingEnc) {
      throw new HttpError("MFA setup is not in progress", 400);
    }

    const secret = decryptField(user.totpPendingEnc);
    if (!verifyTotp(secret, code)) {
      throw new HttpError("Invalid authenticator code", 401);
    }

    const codes = backupCodes();
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          mfaEnabled: true,
          totpSecretEnc: encryptField(secret),
          totpPendingEnc: null,
        },
      }),
      prisma.mfaBackupCode.deleteMany({ where: { userId: user.id } }),
      ...codes.map((plain) =>
        prisma.mfaBackupCode.create({
          data: {
            userId: user.id,
            codeHash: hashOpaqueToken(plain.toLowerCase()),
          },
        })
      ),
    ]);

    const session = await issueSession({ ...user, mfaEnabled: true }, req, [
      "pwd",
      "totp",
    ]);
    return { ...session, backupCodes: codes };
  }

  if (!user.totpSecretEnc) {
    throw new HttpError(
      "MFA is not configured for this account. Contact an administrator.",
      400
    );
  }

  const secret = decryptField(user.totpSecretEnc);
  const totpOk = verifyTotp(secret, code);

  if (!totpOk) {
    const consumed = await prisma.mfaBackupCode.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
        codeHash: hashOpaqueToken(code.trim().toLowerCase()),
      },
      data: { usedAt: new Date() },
    });

    if (consumed.count !== 1) {
      throw new HttpError("Invalid authenticator or backup code", 401);
    }
  }

  return issueSession(user, req, ["pwd", totpOk ? "totp" : "backup"]);
};

export const refreshSession = async (refreshToken: string, req: Request) => {
  const hash = hashOpaqueToken(refreshToken);
  const session = await prisma.userSession.findUnique({
    where: { refreshTokenHash: hash },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    throw new HttpError(
      "Your session has ended. Please sign in again.",
      401,
      "SESSION_EXPIRED"
    );
  }

  const user = session.user;
  if (user.status !== "ACTIVE") {
    throw new HttpError(
      `Account is ${user.status.toLowerCase()}. Please contact an administrator.`,
      401,
      "ACCOUNT_INACTIVE"
    );
  }

  const idleMs = idleTimeoutMinutesForRole(user.role) * 60 * 1000;
  if (Date.now() - session.lastSeenAt.getTime() > idleMs) {
    await prisma.userSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date(), revokeReason: "idle_timeout" },
    });
    throw new HttpError(
      "Session expired due to inactivity. Please sign in again.",
      401,
      "IDLE_TIMEOUT"
    );
  }

  const nextRefresh = randomRefreshToken();
  const lastSeenAt = new Date();

  await prisma.userSession.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: hashOpaqueToken(nextRefresh),
      lastSeenAt,
      ipAddress: getClientIp(req),
    },
  });

  const token = generateAccessToken(toAuthUser(user), {
    sid: session.id,
    expiresIn: accessTokenTtl(),
  });

  return {
    token,
    accessToken: token,
    tokenType: "Bearer",
    refreshToken: nextRefresh,
    sessionId: session.id,
    user: toPublicUser(user),
    lastSeenAt,
  };
};

export const logoutSession = async (sessionId: string, userId: string) => {
  await prisma.userSession.updateMany({
    where: { id: sessionId, userId, revokedAt: null },
    data: { revokedAt: new Date(), revokeReason: "logout" },
  });

  return { ok: true };
};

export const listUserSessions = async (userId: string) => {
  return prisma.userSession.findMany({
    where: { userId },
    orderBy: { lastSeenAt: "desc" },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      lastSeenAt: true,
      createdAt: true,
      revokedAt: true,
      revokeReason: true,
    },
  });
};

export const revokeSessionAsAdmin = async (sessionId: string) => {
  const session = await prisma.userSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) {
    throw new HttpError("Session not found", 404);
  }
  await prisma.userSession.update({
    where: { id: sessionId },
    data: { revokedAt: new Date(), revokeReason: "admin_force_logout" },
  });
  return { ok: true };
};

export const unlockUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError("User not found", 404);
  }
  await prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE", lockedUntil: null, failedLoginCount: 0 },
  });
  return { ok: true };
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  nextPassword: string
) => {
  assertStrongPassword(nextPassword);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError("User not found", 404);
  }
  const ok = await comparePassword(currentPassword, user.passwordHash);
  if (!ok) {
    throw new HttpError("Current password is incorrect", 401);
  }

  const history = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: passwordPolicy.historyCount,
  });

  for (const row of history) {
    if (await comparePassword(nextPassword, row.passwordHash)) {
      throw new HttpError(
        `You cannot reuse any of your last ${passwordPolicy.historyCount} passwords.`,
        400
      );
    }
  }

  const passwordHash = await hashPassword(nextPassword);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash, passwordChangedAt: new Date() },
    }),
    prisma.passwordHistory.create({
      data: { userId, passwordHash },
    }),
  ]);

  return { ok: true };
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      employeeCode: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      specialization: true,
      mfaEnabled: true,
      passwordChangedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new HttpError("User not found", 404);
  }

  return {
    ...user,
    name: user.fullName,
    passwordExpired: user.passwordChangedAt ? isPasswordExpired(user.passwordChangedAt) : false,
    mfaRequired: mfaRequiredForRole(user.role),
  };
};
