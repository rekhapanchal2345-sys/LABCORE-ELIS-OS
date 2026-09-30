import prisma from "../../../config/database";

const generateSettlementNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `STL-${timestamp}-${random}`;
};

// =======================================================
// CREATE SETTLEMENT
// =======================================================

export const createSettlement = async (
  data: {
    provider: string;
    providerType: string;
    grossAmount: number;
    fees?: number;
    settlementDate?: Date;
    referenceNumber?: string;
    utr?: string;
    metadata?: any;
    notes?: string;
  }
) => {
  try {
    const grossAmount = Number(data.grossAmount);
    const fees = Number(data.fees || 0);
    const netAmount = grossAmount - fees;

    const settlement = await prisma.settlement.create({
      data: {
        settlementNumber: generateSettlementNumber(),
        provider: data.provider,
        providerType: data.providerType,
        grossAmount,
        fees,
        netAmount,
        settlementDate: data.settlementDate || new Date(),
        referenceNumber: data.referenceNumber,
        utr: data.utr,
        metadata: data.metadata,
        notes: data.notes,
        status: "EXPECTED",
      },
    });

    return settlement;
  } catch (error) {
    console.error('Error in createSettlement:', error);
    throw error;
  }
};

// =======================================================
// PROCESS SETTLEMENT
// =======================================================

export const processSettlement = async (
  data: {
    settlementId: string;
    settledAmount: number;
    paymentIds: string[];
  }
) => {
  try {
    const settledAmount = Number(data.settledAmount);

    const result = await prisma.$transaction(async (tx) => {
      const settlement = await tx.settlement.findUnique({
        where: { id: data.settlementId },
        include: { transactions: true },
      });

      if (!settlement) {
        throw new Error("Settlement not found");
      }

      const difference = settledAmount - Number(settlement.netAmount);
      
      // Update settlement
      const updatedSettlement = await tx.settlement.update({
        where: { id: data.settlementId },
        data: {
          settledAmount,
          difference,
          status: Math.abs(difference) < 0.01 ? "SETTLED" : "MISMATCH",
        },
      });

      // Link payments to settlement
      for (const paymentId of data.paymentIds) {
        await tx.settlementTransaction.create({
          data: {
            settlementId: data.settlementId,
            paymentId,
            amount: settledAmount / data.paymentIds.length, // Distribute evenly
            status: "MATCHED",
            matchedAt: new Date(),
          },
        });
      }

      return updatedSettlement;
    });

    return result;
  } catch (error) {
    console.error('Error in processSettlement:', error);
    throw error;
  }
};

// =======================================================
// GET SETTLEMENTS
// =======================================================

export const getSettlements = async (options: any = {}) => {
  try {
    const {
      provider,
      providerType,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = options;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (provider) {
      where.provider = provider;
    }

    if (providerType) {
      where.providerType = providerType;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.settlementDate = {};
      if (startDate) {
        where.settlementDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.settlementDate.lte = new Date(endDate);
      }
    }

    const [settlements, total] = await Promise.all([
      prisma.settlement.findMany({
        where,
        skip,
        take: limit,
        include: {
          transactions: {
            include: {
              payment: {
                include: {
                  order: {
                    include: {
                      patient: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { settlementDate: "desc" },
      }),
      prisma.settlement.count({ where }),
    ]);

    return {
      settlements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error('Error in getSettlements:', error);
    throw error;
  }
};

// =======================================================
// GET SETTLEMENT BY ID
// =======================================================

export const getSettlementById = async (id: string) => {
  try {
    const settlement = await prisma.settlement.findUnique({
      where: { id },
      include: {
        transactions: {
          include: {
            payment: {
              include: {
                order: {
                  include: {
                    patient: true,
                    invoice: true,
                  },
                },
                receivedBy: {
                  select: {
                    id: true,
                    employeeCode: true,
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!settlement) {
      throw new Error("Settlement not found");
    }

    return settlement;
  } catch (error) {
    console.error('Error in getSettlementById:', error);
    throw error;
  }
};

// =======================================================
// CREATE RECONCILIATION RECORD
// =======================================================

export const createReconciliationRecord = async (
  data: {
    sourceType: string;
    sourceId: string;
    transactionId: string;
    amount: number;
    status: string;
    discrepancy?: string;
    notes?: string;
  }
) => {
  try {
    const record = await prisma.reconciliationRecord.create({
      data: {
        recordDate: new Date(),
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        transactionId: data.transactionId,
        amount: Number(data.amount),
        status: data.status,
        discrepancy: data.discrepancy,
        notes: data.notes,
      },
    });

    return record;
  } catch (error) {
    console.error('Error in createReconciliationRecord:', error);
    throw error;
  }
};

// =======================================================
// RECONCILE TRANSACTIONS
// =======================================================

export const reconcileTransactions = async (
  data: {
    recordId: string;
    matchedWith: string;
    reconciledById: string;
    notes?: string;
  }
) => {
  try {
    const record = await prisma.reconciliationRecord.update({
      where: { id: data.recordId },
      data: {
        matchedWith: data.matchedWith,
        status: "MATCHED",
        reconciledAt: new Date(),
        reconciledById: data.reconciledById,
        notes: data.notes,
      },
    });

    return record;
  } catch (error) {
    console.error('Error in reconcileTransactions:', error);
    throw error;
  }
};

// =======================================================
// GET RECONCILIATION RECORDS
// =======================================================

export const getReconciliationRecords = async (options: any = {}) => {
  try {
    const {
      sourceType,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = options;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (sourceType) {
      where.sourceType = sourceType;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.recordDate = {};
      if (startDate) {
        where.recordDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.recordDate.lte = new Date(endDate);
      }
    }

    const [records, total] = await Promise.all([
      prisma.reconciliationRecord.findMany({
        where,
        skip,
        take: limit,
        include: {
          reconciledBy: {
            select: {
              id: true,
              employeeCode: true,
              fullName: true,
            },
          },
        },
        orderBy: { recordDate: "desc" },
      }),
      prisma.reconciliationRecord.count({ where }),
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error('Error in getReconciliationRecords:', error);
    throw error;
  }
};

// =======================================================
// GET SETTLEMENT SUMMARY
// =======================================================

export const getSettlementSummary = async (options: any = {}) => {
  try {
    const {
      startDate,
      endDate,
      provider,
    } = options;

    const where: any = {};
    
    if (startDate || endDate) {
      where.settlementDate = {};
      if (startDate) {
        where.settlementDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.settlementDate.lte = new Date(endDate);
      }
    }

    if (provider) {
      where.provider = provider;
    }

    const [totalSettlements, expectedAmount, settledAmount, mismatchedAmount] = await Promise.all([
      prisma.settlement.count({ where }),
      prisma.settlement.aggregate({
        where,
        _sum: { netAmount: true },
      }),
      prisma.settlement.aggregate({
        where: { ...where, status: "SETTLED" },
        _sum: { settledAmount: true },
      }),
      prisma.settlement.aggregate({
        where: { ...where, status: "MISMATCH" },
        _sum: { difference: true },
      }),
    ]);

    return {
      totalSettlements,
      expectedAmount: Number(expectedAmount._sum.netAmount || 0),
      settledAmount: Number(settledAmount._sum.settledAmount || 0),
      mismatchedAmount: Number(mismatchedAmount._sum.difference || 0),
      pendingAmount: Number(expectedAmount._sum.netAmount || 0) - Number(settledAmount._sum.settledAmount || 0),
    };
  } catch (error) {
    console.error('Error in getSettlementSummary:', error);
    throw error;
  }
};