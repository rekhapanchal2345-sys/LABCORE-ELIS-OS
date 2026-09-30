import prisma from "../../../config/database";

// =======================================================
// GET RESULT TREND DATA
// =======================================================

export const getResultTrend = async (
  patientId: string,
  testCode: string,
  limit: number = 10
) => {
  try {
    const results = await prisma.result.findMany({
      where: {
        patientId,
        test: {
          testCode,
        },
        status: {
          in: ["APPROVED", "PUBLISHED"],
        },
      },
      include: {
        test: {
          select: {
            testCode: true,
            testName: true,
          },
        },
        values: {
          include: {
            parameter: {
              select: {
                parameterName: true,
                unit: true,
              },
            },
          },
          orderBy: {
            parameter: {
              displayOrder: 'asc',
            },
          },
        },
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        approvedAt: 'desc',
      },
      take: limit,
    });

    return results;
  } catch (error) {
    console.error('Error in getResultTrend:', error);
    throw new Error('Failed to fetch result trend data');
  }
};

// =======================================================
// ACKNOWLEDGE CRITICAL VALUE
// =======================================================

export const acknowledgeCriticalValue = async (
  data: {
    resultId: string;
    resultValueId?: string;
    notifiedPerson: string;
    notifiedPersonContact: string;
    notificationMode: string;
    notificationTime: Date;
    notes?: string;
    acknowledgmentReason?: string;
  },
  acknowledgedBy: string
) => {
  try {
    // Verify result exists and has critical values
    const result = await prisma.result.findUnique({
      where: {
        id: data.resultId,
      },
      include: {
        values: true,
      },
    });

    if (!result) {
      throw new Error("Result not found");
    }

    // If specific resultValueId provided, verify it exists and is critical
    if (data.resultValueId) {
      const resultValue = result.values.find(v => v.id === data.resultValueId);
      if (!resultValue) {
        throw new Error("Result value not found");
      }
      if (resultValue.flag !== "CRITICAL") {
        throw new Error("Only critical values can be acknowledged");
      }
    } else {
      // Verify result has at least one critical value
      const hasCriticalValues = result.values.some(v => v.flag === "CRITICAL");
      if (!hasCriticalValues) {
        throw new Error("Result has no critical values to acknowledge");
      }
    }

    // Create acknowledgment record
    const acknowledgment = await prisma.criticalValueAcknowledgment.create({
      data: {
        resultId: data.resultId,
        resultValueId: data.resultValueId,
        acknowledgedBy,
        notifiedPerson: data.notifiedPerson,
        notifiedPersonContact: data.notifiedPersonContact,
        notificationMode: data.notificationMode,
        notificationTime: data.notificationTime,
        notes: data.notes,
        acknowledgmentReason: data.acknowledgmentReason,
      },
      include: {
        acknowledgedByUser: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            role: true,
          },
        },
      },
    });

    return acknowledgment;
  } catch (error) {
    console.error('Error in acknowledgeCriticalValue:', error);
    throw error;
  }
};

// =======================================================
// CREATE RESULT AMENDMENT
// =======================================================

export const createResultAmendment = async (
  data: {
    resultId: string;
    amendmentReason: string;
    amendmentType: string;
    changedFields: string[];
    fieldChanges?: any;
  },
  amendedBy: string
) => {
  try {
    const result = await prisma.result.findUnique({
      where: {
        id: data.resultId,
      },
      include: {
        values: true,
      },
    });

    if (!result) {
      throw new Error("Result not found");
    }

    if (result.status !== "PUBLISHED") {
      throw new Error("Only published results can be amended");
    }

    // Get the latest version number for this result
    const latestAmendment = await prisma.resultAmendment.findFirst({
      where: {
        resultId: data.resultId,
      },
      orderBy: {
        versionNumber: 'desc',
      },
    });

    const versionNumber = (latestAmendment?.versionNumber || 0) + 1;

    // Store previous state
    const previousValue = {
      status: result.status,
      remarks: result.remarks,
      interpretation: result.interpretation,
      values: result.values.map(v => ({
        parameterId: v.parameterId,
        value: v.value,
        flag: v.flag,
        remark: v.remark,
      })),
    };

    // Create amendment record
    const amendment = await prisma.resultAmendment.create({
      data: {
        resultId: data.resultId,
        amendedBy,
        amendmentReason: data.amendmentReason,
        amendmentType: data.amendmentType,
        versionNumber,
        previousValue,
        changedFields: data.changedFields,
        fieldChanges: data.fieldChanges,
        requiresReportRegeneration: true,
      },
      include: {
        amendedByUser: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            role: true,
          },
        },
      },
    });

    return amendment;
  } catch (error) {
    console.error('Error in createResultAmendment:', error);
    throw error;
  }
};

// =======================================================
// BULK VERIFY RESULTS
// =======================================================

export const bulkVerifyResults = async (
  resultIds: string[],
  verifiedBy: string
) => {
  try {
    const results = await prisma.result.findMany({
      where: {
        id: {
          in: resultIds,
        },
      },
    });

    if (results.length === 0) {
      throw new Error("No results found");
    }

    const verificationResults = {
      succeeded: [] as string[],
      failed: [] as { id: string; reason: string }[],
    };

    for (const result of results) {
      try {
        if (result.status !== "ENTERED") {
          verificationResults.failed.push({
            id: result.id,
            reason: `Result is in ${result.status} status, only ENTERED results can be verified`,
          });
          continue;
        }

        await prisma.result.update({
          where: {
            id: result.id,
          },
          data: {
            status: "VERIFIED",
            verifiedAt: new Date(),
            verifiedById: verifiedBy || null,
          },
        });

        verificationResults.succeeded.push(result.id);
      } catch (error) {
        verificationResults.failed.push({
          id: result.id,
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return verificationResults;
  } catch (error) {
    console.error('Error in bulkVerifyResults:', error);
    throw new Error('Failed to bulk verify results');
  }
};

// =======================================================
// CREATE RESULT
// =======================================================

export const createResult = async (
  data: {
    orderId: string;
    testId: string;
    remarks?: string;
    interpretation?: string;
    values: {
      parameterId: string;
      value: string;
      flag?: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
      remark?: string;
    }[];
  },
  enteredById?: string
) => {
  const order = await prisma.order.findUnique({
    where: {
      id: data.orderId,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const test = await prisma.test.findUnique({
    where: {
      id: data.testId,
    },

    include: {
      parameters: true,
    },
  });

  if (!test) {
    throw new Error("Test not found");
  }

  const orderItem =
    await prisma.orderItem.findFirst({
      where: {
        orderId: data.orderId,
        testId: data.testId,
      },
    });

  if (!orderItem) {
    throw new Error(
      "This test does not belong to the order"
    );
  }

  const existing =
    await prisma.result.findUnique({
      where: {
        orderId_testId: {
          orderId: data.orderId,
          testId: data.testId,
        },
      },
    });

  if (existing) {
    throw new Error(
      "Result already exists for this test"
    );
  }

  const parameterIds =
    test.parameters.map(
      (parameter) => parameter.id
    );

  for (const value of data.values) {
    if (
      !parameterIds.includes(
        value.parameterId
      )
    ) {
      throw new Error(
        "Invalid parameter for this test"
      );
    }
  }

  const result =
    await prisma.result.create({
      data: {
        orderId: data.orderId,

        testId: data.testId,

        // Set patientId for trend queries
        patientId: order.patientId,

        status: "ENTERED",

        remarks: data.remarks,

        interpretation:
          data.interpretation,

        enteredById,

        enteredAt: new Date(),

        values: {
          create: data.values.map(
            (value) => ({
              parameterId:
                value.parameterId,

              value: value.value,

              flag: value.flag,

              remark: value.remark,
            })
          ),
        },
      },

      include: {
        test: {
          include: {
            parameters: true,
          },
        },

        values: {
          include: {
            parameter: true,
          },
        },

        order: {
          include: {
            patient: true,
            doctor: true,
          },
        },

        enteredBy: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

  return result;
};

// =======================================================
// GET RESULT
// =======================================================

export const getResultById =
  async (id: string) => {
    const result =
      await prisma.result.findUnique({
        where: {
          id,
        },

        include: {
          test: {
            include: {
              category: true,
              parameters: {
                include: {
                  referenceRanges: true,
                },
                orderBy: {
                  displayOrder: 'asc',
                },
              },
            },
          },

          values: {
            include: {
              parameter: {
                include: {
                  referenceRanges: true,
                },
              },
            },
            orderBy: {
              parameter: {
                displayOrder: 'asc',
              },
            },
          },

          order: {
            include: {
              patient: true,
              doctor: true,
            },
          },

          enteredBy: {
            select: {
              id: true,
              employeeCode: true,
              fullName: true,
              role: true,
            },
          },

          approvedBy: {
            select: {
              id: true,
              employeeCode: true,
              fullName: true,
              role: true,
            },
          },
        },
      });

    if (!result) {
      throw new Error(
        "Result not found"
      );
    }

    return result;
  };

// =======================================================
// LIST RESULTS
// =======================================================

export const getResults =
  async (options: any) => {
    try {
      const {
        orderId,
        testId,
        status,
        search,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20,
      } = options;

      const skip =
        (page - 1) * limit;

      const where: any = {};

      if (orderId) {
        where.orderId = orderId;
      }

      if (testId) {
        where.testId = testId;
      }

      if (status) {
        where.status = status;
      }

      // Search across patient name, order number, test name, result ID
      if (search) {
        where.OR = [
          {
            order: {
              patient: {
                firstName: { contains: search, mode: "insensitive" },
              },
            },
          },
          {
            order: {
              patient: {
                lastName: { contains: search, mode: "insensitive" },
              },
            },
          },
          {
            order: {
              patient: {
                uhid: { contains: search, mode: "insensitive" },
              },
            },
          },
          {
            order: {
              orderNumber: { contains: search, mode: "insensitive" },
            },
          },
          {
            order: {
              barcode: { contains: search, mode: "insensitive" },
            },
          },
          {
            test: {
              testName: { contains: search, mode: "insensitive" },
            },
          },
          {
            test: {
              testCode: { contains: search, mode: "insensitive" },
            },
          },
          {
            id: { contains: search, mode: "insensitive" },
          },
        ];
      }

      // Date range filter
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
          where.createdAt.gte = new Date(dateFrom);
        }
        if (dateTo) {
          where.createdAt.lte = new Date(dateTo);
        }
      }

      const [
        results,
        total,
      ] = await Promise.all([
        prisma.result.findMany({
          where,

          skip,

          take: limit,

          include: {
            test: {
              include: {
                category: true,
                parameters: {
                  include: {
                    referenceRanges: true,
                  },
                  orderBy: {
                    displayOrder: 'asc',
                  },
                },
              },
            },

            values: {
              include: {
                parameter: {
                  include: {
                    referenceRanges: true,
                  },
                },
              },
              orderBy: {
                parameter: {
                  displayOrder: 'asc',
                },
              },
            },

            order: {
              include: {
                patient: true,
                doctor: true,
              },
            },

            enteredBy: {
              select: {
                id: true,
                fullName: true,
                employeeCode: true,
                role: true,
                signature: true,
              },
            },

            approvedBy: {
              select: {
                id: true,
                fullName: true,
                employeeCode: true,
                role: true,
                signature: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        }),

        prisma.result.count({
          where,
        }),
      ]);

      return {
        results,

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
    } catch (error) {
      console.error('Error in getResults:', error);
      throw new Error('Failed to fetch results. Please try again later.');
    }
  };

// =======================================================
// UPDATE RESULT
// =======================================================

export const updateResult =
  async (
    id: string,
    data: {
      remarks?: string;
      interpretation?: string;
      values?: {
        parameterId: string;
        value: string;
        flag?:
          | "LOW"
          | "NORMAL"
          | "HIGH"
          | "CRITICAL";
        remark?: string;
      }[];
    }
  ) => {
    const existing =
      await prisma.result.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new Error(
        "Result not found"
      );
    }

    if (
      existing.status === "APPROVED" ||
      existing.status === "PUBLISHED"
    ) {
      throw new Error(
        "Approved or published results cannot be edited"
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          if (data.values) {
            await tx.resultValue.deleteMany(
              {
                where: {
                  resultId: id,
                },
              }
            );
          }

          return tx.result.update({
            where: {
              id,
            },

            data: {
              remarks: data.remarks,

              interpretation:
                data.interpretation,

              status: "ENTERED",

              ...(data.values
                ? {
                    values: {
                      create:
                        data.values.map(
                          (value) => ({
                            parameterId:
                              value.parameterId,

                            value:
                              value.value,

                            flag:
                              value.flag,

                            remark:
                              value.remark,
                          })
                        ),
                    },
                  }
                : {}),
            },

            include: {
              values: {
                include: {
                  parameter: true,
                },
              },

              test: true,

              order: {
                include: {
                  patient: true,
                },
              },
            },
          });
        }
      );

    return result;
  };

// =======================================================
// VERIFY RESULT
// =======================================================

export const verifyResult =
  async (id: string, verifiedById?: string) => {
    const result =
      await prisma.result.findUnique({
        where: {
          id,
        },
      });

    if (!result) {
      throw new Error(
        "Result not found"
      );
    }

    if (
      result.status !== "ENTERED"
    ) {
      throw new Error(
        "Only entered results can be verified"
      );
    }

    return prisma.result.update({
      where: {
        id,
      },

      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
        verifiedById: verifiedById || null,
      },
    });
  };

// =======================================================
// APPROVE RESULT
// =======================================================

export const approveResult =
  async (
    id: string,
    approvedById?: string
  ) => {
    const result =
      await prisma.result.findUnique({
        where: {
          id,
        },

        include: {
          values: true,
          order: {
            include: {
              patient: true
            }
          }
        },
      });

    if (!result) {
      throw new Error(
        "Result not found"
      );
    }

    if (
      result.status !== "VERIFIED"
    ) {
      throw new Error(
        "Only verified results can be approved"
      );
    }

    if (
      result.values.length === 0
    ) {
      throw new Error(
        "Result must contain values before approval"
      );
    }

    const updatedResult = await prisma.result.update({
      where: {
        id,
      },

      data: {
        status: "APPROVED",

        approvedById,

        approvedAt: new Date(),
      },

      include: {
        approvedBy: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    return updatedResult;
  };

// =======================================================
// PUBLISH RESULT
// =======================================================

export const publishResult =
  async (id: string) => {
    const result =
      await prisma.result.findUnique({
        where: {
          id,
        },
      });

    if (!result) {
      throw new Error(
        "Result not found"
      );
    }

    if (
      result.status !== "APPROVED"
    ) {
      throw new Error(
        "Only approved results can be published"
      );
    }

    return prisma.result.update({
      where: {
        id,
      },

      data: {
        status: "PUBLISHED",

        publishedAt: new Date(),
      },
    });
  };

// =======================================================
// GET RESULTS METRICS
// =======================================================

export const getResultsMetrics =
  async () => {
    try {
      const [
        pendingEntry,
        inVerification,
        approved,
        critical,
      ] = await Promise.all([
        // Pending Entry: Samples received but no result entered yet
        prisma.result.count({
          where: {
            status: "PENDING",
          },
        }),

        // In Verification: Results entered but not yet verified
        prisma.result.count({
          where: {
            status: "ENTERED",
          },
        }),

        // Approved: Results verified and approved
        prisma.result.count({
          where: {
            status: "APPROVED",
          },
        }),

        // Critical: Results with CRITICAL flag values
        prisma.resultValue.count({
          where: {
            flag: "CRITICAL",
          },
        }),
      ]);

      return {
        pendingEntry,
        inVerification,
        approved,
        critical,
      };
    } catch (error) {
      console.error('Error in getResultsMetrics:', error);
      throw new Error('Failed to fetch results metrics. Please try again later.');
    }
  };