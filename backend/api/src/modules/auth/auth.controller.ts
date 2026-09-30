import { Request, Response, NextFunction } from "express";
import {
  changePassword,
  getProfile,
  listUserSessions,
  loginUser,
  logoutSession,
  refreshSession,
  registerUser,
  revokeSessionAsAdmin,
  unlockUser,
  verifyMfaLogin,
} from "./auth.service";
import { successResponse, createdResponse } from "../../utils/response";
import { HttpError } from "../../utils/http-error";
import type { AuthenticatedRequest } from "../../../middleware/auth";

const bodyOf = (req: Request) =>
  ((req as any).validated?.body ?? req.body) as Record<string, any>;

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await registerUser(bodyOf(req) as any);
    return createdResponse(res, result, "User registered successfully");
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { identifier, password } = bodyOf(req);
    const result = await loginUser(identifier, password, req);
    return successResponse(res, result, "Login successful");
  } catch (error) {
    next(error);
  }
};

export const verifyMfa = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { mfaToken, code } = bodyOf(req);
    const result = await verifyMfaLogin(mfaToken, code, req);
    return successResponse(res, result, "MFA verified");
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = bodyOf(req);
    const result = await refreshSession(refreshToken, req);
    return successResponse(res, result, "Session refreshed");
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new HttpError("Authentication required", 401);
    }

    if (req.sid) {
      await logoutSession(req.sid, req.user.id);
    }

    return successResponse(res, { ok: true }, "Logout successful");
  } catch (error) {
    next(error);
  }
};

export const sessions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await listUserSessions(req.user!.id);
    return successResponse(res, result, "Sessions fetched");
  } catch (error) {
    next(error);
  }
};

export const revokeSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await revokeSessionAsAdmin(String(req.params.id));
    return successResponse(res, result, "Session revoked");
  } catch (error) {
    next(error);
  }
};

export const unlock = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await unlockUser(String(req.params.id));
    return successResponse(res, result, "Account unlocked");
  } catch (error) {
    next(error);
  }
};

export const changePasswordHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = bodyOf(req);
    const result = await changePassword(
      req.user!.id,
      currentPassword,
      newPassword
    );
    return successResponse(res, result, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};

export const profile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getProfile(req.user!.id);
    return successResponse(res, user, "Profile fetched successfully");
  } catch (error) {
    next(error);
  }
};
