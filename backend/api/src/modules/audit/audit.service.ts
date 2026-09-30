import prisma from "../../../config/database";

// =======================================================
// CREATE AUDIT LOG
// =======================================================

export const createAuditLog = async (
  data: {
    userId?: string;
    module: string;
    action: string;
    recordId?: string;
    ipAddress?: string;
    userAgent?: string;
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
  }
) => {
  return prisma.auditLog.create({
    data: {
      userId: data.userId,
      module: data.module,
      action: data.action,
      recordId: data.recordId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      oldData: data.oldData as any,
      newData: data.newData as any,
    },
  });
};

// =======================================================
// GET AUDIT LOG BY ID
// =======================================================

export const getAuditLogById = async (
  id: string
) => {
  const auditLog =
    await prisma.auditLog.findUnique({
      where: {
        id,
      },

      include: {
        user: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

  if (!auditLog) {
    throw new Error(
      "Audit log not found"
    );
  }

  return auditLog;
};

// =======================================================
// GET AUDIT LOGS
// =======================================================

export const getAuditLogs = async (
  options: {
    userId?: string;
    module?: string;
    action?: string;
    recordId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }
) => {
  const {
    userId,
    module,
    action,
    recordId,
    fromDate,
    toDate,
    page = 1,
    limit = 20,
  } = options;

  const skip =
    (page - 1) * limit;

  const where: any = {};

  // -----------------------------------------------------
  // USER FILTER
  // -----------------------------------------------------

  if (userId) {
    where.userId = userId;
  }

  // -----------------------------------------------------
  // MODULE FILTER
  // -----------------------------------------------------

  if (module) {
    where.module = module;
  }

  // -----------------------------------------------------
  // ACTION FILTER
  // -----------------------------------------------------

  if (action) {
    where.action = action;
  }

  // -----------------------------------------------------
  // RECORD FILTER
  // -----------------------------------------------------

  if (recordId) {
    where.recordId = recordId;
  }

  // -----------------------------------------------------
  // DATE FILTER
  // -----------------------------------------------------

  if (
    fromDate ||
    toDate
  ) {
    where.createdAt = {};

    if (fromDate) {
      where.createdAt.gte =
        new Date(fromDate);
    }

    if (toDate) {
      const endDate =
        new Date(toDate);

      endDate.setHours(
        23,
        59,
        59,
        999
      );

      where.createdAt.lte =
        endDate;
    }
  }

  const [
    logs,
    total,
  ] = await Promise.all([
    prisma.auditLog.findMany({
      where,

      skip,

      take: limit,

      include: {
        user: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            role: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.auditLog.count({
      where,
    }),
  ]);

  return {
    logs,

    pagination: {
      page,
      limit,
      total,

      totalPages:
        Math.ceil(
          total / limit
        ),

      hasNextPage:
        page * limit < total,

      hasPreviousPage:
        page > 1,
    },
  };
};

// =======================================================
// GET RECORD AUDIT HISTORY
// =======================================================

export const getRecordHistory =
  async (
    recordId: string
  ) => {
    return prisma.auditLog.findMany({
      where: {
        recordId,
      },

      include: {
        user: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            role: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  };

// =======================================================
// GET USER ACTIVITY
// =======================================================

export const getUserActivity =
  async (
    userId: string,
    page = 1,
    limit = 20
  ) => {
    const skip =
      (page - 1) * limit;

    const [
      logs,
      total,
    ] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          userId,
        },

        skip,

        take: limit,

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.auditLog.count({
        where: {
          userId,
        },
      }),
    ]);

    return {
      logs,

      pagination: {
        page,
        limit,
        total,

        totalPages:
          Math.ceil(
            total / limit
          ),

        hasNextPage:
          page * limit < total,

        hasPreviousPage:
          page > 1,
      },
    };
  };