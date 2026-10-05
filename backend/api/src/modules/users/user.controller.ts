import type {
  Request,
  Response,
  NextFunction,
} from "express";

import bcrypt from "bcryptjs";

import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";

import { assertStrongPassword, assertNotCommonPassword, assertNoPersonalInfo } from "../../../src/utils/password-policy";
import { hashPassword } from "../../../src/utils/password";

import type {
  AuthenticatedRequest,
} from "../../../middleware/auth";

import {
  updateProfileSettings as updateProfileSettingsService,
} from "./user.service";

/**
 * Password hashing configuration.
 */
const BCRYPT_ROUNDS = 12;

/**
 * A concurrent request can pass the pre-check and still hit the DB unique
 * constraint; surface that as 409 instead of a generic 500.
 */
const toConflictIfDuplicate = (error: unknown, res: Response): boolean => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    res.status(409).json({
      success: false,
      message:
        "A user with this email or employee code already exists.",
    });
    return true;
  }
  return false;
};

/**
 * When a password is set or reset, stamp the change time, keep history for
 * reuse-prevention, and kill every active session so a reset actually ends
 * access immediately.
 */
const applyPasswordChange = async (
  userId: string,
  password: string
): Promise<string> => {
  assertStrongPassword(password);
  const passwordHash = await hashPassword(password);
  const passwordChangedAt = new Date();

  await prisma.$transaction([
    prisma.passwordHistory.create({
      data: { userId, passwordHash },
    }),
    prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: passwordChangedAt, revokeReason: "password_changed" },
    }),
  ]);

  return passwordHash;
};

/**
 * Never return passwordHash.
 */
const userSelect = {
  id: true,
  employeeCode: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  specialization: true,
  // Profile settings
  firstName: true,
  lastName: true,
  designation: true,
  department: true,
  profileImage: true,
  signature: true,
  language: true,
  dateFormat: true,
  timeFormat: true,
  timezone: true,
  enableEmailNotifications: true,
  enableSmsNotifications: true,
  enablePushNotifications: true,
  darkMode: true,
  compactMode: true,
  showTutorial: true,
  // Lab-specific settings
  defaultReportTemplate: true,
  autoApproveResults: true,
  enableCriticalAlerts: true,
  enableDailyDigest: true,
  preferredCommunicationMethod: true,
  workingHoursStart: true,
  workingHoursEnd: true,
  emergencyContact: true,
  emergencyContactPhone: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Helper to get authenticated user.
 */
const getAuthenticatedUser = (
  req: Request
) => {
  return (
    req as AuthenticatedRequest
  ).user;
};

/**
 * -----------------------------------------
 * CREATE USER
 * -----------------------------------------
 *
 * POST /api/users
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      employeeCode,
      fullName,
      email,
      phone,
      password,
      role,
      status,
      specialization,
    } = req.body;

    /**
     * Check employee code/email before
     * creating the record.
     */
    const existingUser =
      await prisma.user.findFirst({
        where: {
          OR: [
            {
              employeeCode,
            },
            {
              email,
            },
          ],
        },
        select: {
          id: true,
          employeeCode: true,
          email: true,
        },
      });

    if (existingUser) {
      if (
        existingUser.employeeCode ===
        employeeCode
      ) {
        res.status(409).json({
          success: false,
          message:
            "Employee code already exists.",
        });

        return;
      }

      res.status(409).json({
        success: false,
        message:
          "Email address already exists.",
      });

      return;
    }

    /**
     * Enforce the same password policy as sign-in accounts created via
     * /api/auth/register so no path can create a weak credential.
     */
    assertStrongPassword(password);
    assertNotCommonPassword(password);
    assertNoPersonalInfo(password, email, fullName);

    /**
     * Never store plaintext password.
     */
    const passwordHash = await hashPassword(password);

    const user =
      await prisma.user.create({
        data: {
          employeeCode,
          fullName,
          email,
          phone:
            phone ?? null,
          passwordHash,
          role,
          status,
          specialization:
            specialization ?? null,
          passwordChangedAt: new Date(),
        },

        select: userSelect,
      });

    // Seed reuse-prevention history with the initial credential.
    await prisma.passwordHistory
      .create({
        data: {
          userId: user.id,
          passwordHash,
        },
      })
      .catch(() => undefined);

    res.status(201).json({
      success: true,
      message:
        "User created successfully.",
      data: {
        user,
      },
    });
  } catch (error) {
    if (toConflictIfDuplicate(error, res)) return;
    next(error);
  }
};

/**
 * -----------------------------------------
 * GET USERS
 * -----------------------------------------
 *
 * GET /api/users
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search,
      role,
      status,
      page,
      limit,
    } = req.query as {
      search?: string;
      role?: string;
      status?: string;
      page?: number;
      limit?: number;
    };

    const currentPage =
      Number(page) || 1;

    const pageSize =
      Number(limit) || 20;

    const skip =
      (currentPage - 1) *
      pageSize;

    const where: Prisma.UserWhereInput =
      {};

    if (role) {
      where.role =
        role as Prisma.UserWhereInput["role"];
    }

    if (status) {
      where.status =
        status as Prisma.UserWhereInput["status"];
    }

    if (search) {
      where.OR = [
        {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          employeeCode: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [
      users,
      total,
    ] = await prisma.$transaction([
      prisma.user.findMany({
        where,

        select: userSelect,

        orderBy: {
          createdAt: "desc",
        },

        skip,

        take: pageSize,
      }),

      prisma.user.count({
        where,
      }),
    ]);

    const totalPages =
      Math.ceil(
        total / pageSize
      );

    res.status(200).json({
      success: true,

      data: {
        users,

        pagination: {
          page: currentPage,
          limit: pageSize,
          total,
          totalPages,
          hasNextPage:
            currentPage <
            totalPages,
          hasPreviousPage:
            currentPage > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * -----------------------------------------
 * GET USER BY ID
 * -----------------------------------------
 *
 * GET /api/users/:id
 */
export const getUserById =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } =
        req.params as { id: string };

      const user =
        await prisma.user.findUnique({
          where: {
            id,
          },

          select: userSelect,
        });

      if (!user) {
        res.status(404).json({
          success: false,
          message:
            "User not found.",
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

/**
 * -----------------------------------------
 * UPDATE USER
 * -----------------------------------------
 *
 * PUT /api/users/:id
 */
export const updateUser =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } =
        req.params as { id: string };

      const {
        employeeCode,
        fullName,
        email,
        phone,
        password,
        role,
        status,
        specialization,
      } = req.body;

      /**
       * Prevent accidental self-lockout.
       *
       * An ADMIN can change their own profile,
       * but cannot deactivate/suspend themselves.
       */
      const currentUser =
        getAuthenticatedUser(
          req
        );

      if (
        currentUser?.id === id &&
        status &&
        status !== "ACTIVE"
      ) {
        res.status(400).json({
          success: false,
          message:
            "You cannot deactivate or suspend your own account.",
        });

        return;
      }

      const existingUser =
        await prisma.user.findUnique({
          where: {
            id: id as string,
          },

          select: {
            id: true,
          },
        });

      if (!existingUser) {
        res.status(404).json({
          success: false,
          message:
            "User not found.",
        });

        return;
      }

      /**
       * Check unique fields if changed.
       */
      if (
        employeeCode ||
        email
      ) {
        const duplicate =
          await prisma.user.findFirst({
            where: {
              AND: [
                {
                  id: {
                    not: id as string,
                  },
                },

                {
                  OR: [
                    ...(employeeCode
                      ? [
                          {
                            employeeCode: employeeCode as string,
                          },
                        ]
                      : []),

                    ...(email
                      ? [
                          {
                            email: email as string,
                          },
                        ]
                      : []),
                  ],
                },
              ],
            },

            select: {
              employeeCode:
                true,
              email: true,
            },
          });

        if (duplicate) {
          if (
            employeeCode &&
            duplicate.employeeCode ===
              employeeCode
          ) {
            res.status(409).json({
              success: false,
              message:
                "Employee code already exists.",
            });

            return;
          }

          if (
            email &&
            duplicate.email ===
              email
          ) {
            res.status(409).json({
              success: false,
              message:
                "Email address already exists.",
            });

            return;
          }
        }
      }

      const data: Prisma.UserUpdateInput =
        {};

      if (
        employeeCode !==
        undefined
      ) {
        data.employeeCode =
          employeeCode;
      }

      if (
        fullName !==
        undefined
      ) {
        data.fullName =
          fullName;
      }

      if (
        email !==
        undefined
      ) {
        data.email =
          email;
      }

      if (
        phone !==
        undefined
      ) {
        data.phone =
          phone;
      }

      if (
        role !==
        undefined
      ) {
        data.role =
          role;
      }

      if (
        status !==
        undefined
      ) {
        data.status =
          status;
      }

      if (
        specialization !==
        undefined
      ) {
        data.specialization =
          specialization;
      }

      /**
       * Hash new password only when supplied. An administrative reset must
       * satisfy the password policy, update the expiry clock, record history
       * and revoke the user's live sessions.
       */
      if (password) {
        data.passwordHash =
          await applyPasswordChange(
            id as string,
            password
          );
        data.passwordChangedAt = new Date();
      }

      const user =
        await prisma.user.update({
          where: {
            id: id as string,
          },

          data,

          select: userSelect,
        });

      res.status(200).json({
        success: true,
        message:
          "User updated successfully.",
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

/**
 * -----------------------------------------
 * DELETE / DEACTIVATE USER
 * -----------------------------------------
 *
 * We don't physically delete the user.
 *
 * Instead, account becomes INACTIVE.
 *
 * This preserves audit/history relations.
 */
export const deactivateUser =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } =
        req.params as { id: string };

      const currentUser =
        getAuthenticatedUser(
          req
        );

      if (
        currentUser?.id === id
      ) {
        res.status(400).json({
          success: false,
          message:
            "You cannot deactivate your own account.",
        });

        return;
      }

      const user =
        await prisma.user.findUnique({
          where: {
            id: id as string,
          },

          select: {
            id: true,
            status: true,
          },
        });

      if (!user) {
        res.status(404).json({
          success: false,
          message:
            "User not found.",
        });

        return;
      }

      const updatedUser =
        await prisma.user.update({
          where: {
            id: id as string,
          },

          data: {
            status: "INACTIVE",
          },

          select: userSelect,
        });

      // A deactivated account must not keep live sessions.
      await prisma.userSession.updateMany({
        where: { userId: id as string, revokedAt: null },
        data: { revokedAt: new Date(), revokeReason: "account_disabled" },
      });

      res.status(200).json({
        success: true,
        message:
          "User deactivated successfully.",
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  };

/**
 * -----------------------------------------
 * ACTIVATE USER
 * -----------------------------------------
 *
 * PATCH /api/users/:id/activate
 */
export const activateUser =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } =
        req.params as { id: string };

      const user =
        await prisma.user.findUnique({
          where: {
            id: id as string,
          },

          select: {
            id: true,
          },
        });

      if (!user) {
        res.status(404).json({
          success: false,
          message:
            "User not found.",
        });

        return;
      }

      const updatedUser =
        await prisma.user.update({
          where: {
            id: id as string,
          },

          data: {
            status: "ACTIVE",
          },

          select: userSelect,
        });

      res.status(200).json({
        success: true,
        message:
          "User activated successfully.",
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  };

/**
 * -----------------------------------------
 * SUSPEND USER
 * -----------------------------------------
 *
 * PATCH /api/users/:id/suspend
 */
export const suspendUser =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } =
        req.params as { id: string };

      const currentUser =
        getAuthenticatedUser(
          req
        );

      if (
        currentUser?.id === id
      ) {
        res.status(400).json({
          success: false,
          message:
            "You cannot suspend your own account.",
        });

        return;
      }

      const user =
        await prisma.user.findUnique({
          where: {
            id: id as string,
          },

          select: {
            id: true,
          },
        });

      if (!user) {
        res.status(404).json({
          success: false,
          message:
            "User not found.",
        });

        return;
      }

      const updatedUser =
        await prisma.user.update({
          where: {
            id: id as string,
          },

          data: {
            status: "SUSPENDED",
          },

          select: userSelect,
        });

      // A suspended account must not keep live sessions.
      await prisma.userSession.updateMany({
        where: { userId: id as string, revokedAt: null },
        data: { revokedAt: new Date(), revokeReason: "account_disabled" },
      });

      res.status(200).json({
        success: true,
        message:
          "User suspended successfully.",
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  };

/**
 * -----------------------------------------
 * UPDATE PROFILE SETTINGS
 * -----------------------------------------
 *
 * PATCH /api/users/:id/profile
 *
 * Users can update their own profile settings
 */
export const updateProfileSettings =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } =
        req.params as { id: string };

      const currentUser =
        getAuthenticatedUser(
          req
        );

      // Only allow users to update their own profile
      if (
        currentUser?.id !== id
      ) {
        res.status(403).json({
          success: false,
          message:
            "You can only update your own profile settings.",
        });

        return;
      }

      const updatedUser =
        await updateProfileSettingsService(
          id,
          req.body
        );

      res.status(200).json({
        success: true,
        message:
          "Profile settings updated successfully.",
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  };