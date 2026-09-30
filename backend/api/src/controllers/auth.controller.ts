import type {
  Request,
  Response,
  NextFunction,
} from "express";

import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";

import {
  generateAccessToken,
  type AuthUser,
} from "../lib/auth";

interface LoginRequest
  extends Request {
  body: {
    identifier: string;
    password: string;
  };
}

const sanitizeUser = (
  user: {
    id: string;
    employeeCode: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: AuthUser["role"];
    status: AuthUser["status"];
    specialization: string | null;
  }
) => {
  return {
    id: user.id,
    employeeCode:
      user.employeeCode,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    specialization:
      user.specialization,
  };
};

/**
 * POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Use validated data if available, otherwise use raw body
    const body = (req as any).validated?.body || req.body;
    
    const identifier = body.identifier
      .trim()
      .toLowerCase();

    const password = body.password;

    /**
     * Login can happen using:
     * - email
     * - employeeCode
     */
    const user =
      await prisma.user.findFirst({
        where: {
          OR: [
            {
              email: identifier,
            },
            {
              employeeCode: identifier,
            },
          ],
        },
        select: {
          id: true,
          employeeCode: true,
          fullName: true,
          email: true,
          phone: true,
          passwordHash: true,
          role: true,
          status: true,
          specialization: true,
        },
      });

    /**
     * Do not reveal whether email/
     * employee code exists.
     */
    if (!user) {
      res.status(401).json({
        success: false,
        message:
          "Invalid email/employee code or password.",
      });

      return;
    }

    /**
     * Block inactive/suspended users.
     */
    if (user.status !== "ACTIVE") {
      res.status(403).json({
        success: false,
        message:
          user.status === "SUSPENDED"
            ? "Your account is suspended."
            : "Your account is inactive.",
      });

      return;
    }

    /**
     * Compare plaintext password
     * against bcrypt hash.
     */
    const passwordValid =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordValid) {
      res.status(401).json({
        success: false,
        message:
          "Invalid email/employee code or password.",
      });

      return;
    }

    const authUser: AuthUser = {
      id: user.id,
      employeeCode:
        user.employeeCode,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    };

    const accessToken =
      generateAccessToken(
        authUser
      );

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        accessToken,

        tokenType: "Bearer",

        user: sanitizeUser(
          user
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 *
 * Returns currently authenticated user.
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq =
      req as Request & {
        user?: AuthUser;
      };

    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });

      return;
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: authReq.user.id,
        },
        select: {
          id: true,
          employeeCode: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          specialization: true,
        },
      });

    if (!user) {
      res.status(401).json({
        success: false,
        message:
          "User account not found.",
      });

      return;
    }

    if (user.status !== "ACTIVE") {
      res.status(403).json({
        success: false,
        message:
          "Your account is not active.",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};