import type {
  Request,
  Response,
  NextFunction,
} from "express";
import prisma from "../../config/database";;

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
  };
};

type CreateOrderItemInput = {
  testId: string;
  discount?: number;
};

type TestInfo = {
  id: string;
  testCode: string;
  testName: string;
  price: any;
  gstPercentage: any;
  sampleType: string;
  tatHours: number;
};

type NormalizedOrderItem = {
  test: TestInfo;
  price: number;
  discount: number;
  taxable: number;
  gstPercentage: number;
  gstAmount: number;
  finalPrice: number;
};

type CreateOrderBody = {
  patientId: string;
  doctorId?: string | null;
  notes?: string | null;
  discount?: number;
  items: CreateOrderItemInput[];
};

const getUserId = (req: Request): string | undefined => {
  return (req as AuthenticatedRequest).user?.id;
};

const roundMoney = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const generateOrderNumber = (): string => {
  const now = new Date();

  const date = now
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `ORD-${date}-${random}`;
};

const generateBarcode = (): string => {
  const now = Date.now();

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `BC${now}${random}`;
};

const generateInvoiceNumber = (): string => {
  const now = new Date();

  const date = now
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `INV-${date}-${random}`;
};

const generateUniqueOrderNumber = async () => {
  for (let attempt = 0; attempt < 10; attempt++) {
    const value = generateOrderNumber();

    const exists = await prisma.order.findUnique({
      where: {
        orderNumber: value,
      },
      select: {
        id: true,
      },
    });

    if (!exists) {
      return value;
    }
  }

  throw new Error(
    "Unable to generate unique order number."
  );
};

const generateUniqueBarcode = async () => {
  for (let attempt = 0; attempt < 10; attempt++) {
    const value = generateBarcode();

    const exists = await prisma.order.findUnique({
      where: {
        barcode: value,
      },
      select: {
        id: true,
      },
    });

    if (!exists) {
      return value;
    }
  }

  throw new Error(
    "Unable to generate unique barcode."
  );
};

const generateUniqueInvoiceNumber =
  async () => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const value = generateInvoiceNumber();

      const exists =
        await prisma.invoice.findUnique({
          where: {
            invoiceNumber: value,
          },
          select: {
            id: true,
          },
        });

      if (!exists) {
        return value;
      }
    }

    throw new Error(
      "Unable to generate unique invoice number."
    );
  };

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body as CreateOrderBody;

    if (!body.patientId) {
      res.status(400).json({
        success: false,
        message: "patientId is required.",
      });
      return;
    }

    if (
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "At least one test is required to create an order.",
      });
      return;
    }

    const testIds = body.items.map(
      (item) => item.testId
    );

    if (
      testIds.some(
        (id) =>
          typeof id !== "string" ||
          id.trim().length === 0
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Every order item must contain a valid testId.",
      });
      return;
    }

    const uniqueTestIds = [
      ...new Set(testIds),
    ];

    if (
      uniqueTestIds.length !== testIds.length
    ) {
      res.status(400).json({
        success: false,
        message:
          "The same test cannot be added twice to one order.",
      });
      return;
    }

    const patient =
      await prisma.patient.findUnique({
        where: {
          id: body.patientId,
        },
        select: {
          id: true,
          uhid: true,
          firstName: true,
          middleName: true,
          lastName: true,
        },
      });

    if (!patient) {
      res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
      return;
    }

    if (body.doctorId) {
      const doctor =
        await prisma.doctor.findUnique({
          where: {
            id: body.doctorId,
          },
          select: {
            id: true,
            isActive: true,
          },
        });

      if (!doctor) {
        res.status(404).json({
          success: false,
          message: "Doctor not found.",
        });
        return;
      }

      if (!doctor.isActive) {
        res.status(400).json({
          success: false,
          message: "Selected doctor is inactive.",
        });
        return;
      }
    }

    const tests = await prisma.test.findMany({
      where: {
        id: {
          in: uniqueTestIds,
        },
        isActive: true,
      },
      select: {
        id: true,
        testCode: true,
        testName: true,
        price: true,
        gstPercentage: true,
        sampleType: true,
        tatHours: true,
      },
    });

    if (tests.length !== uniqueTestIds.length) {
      const foundIds = new Set(
        tests.map((test) => test.id)
      );

      const missing = uniqueTestIds.filter(
        (id) => !foundIds.has(id)
      );

      res.status(400).json({
        success: false,
        message:
          "One or more selected tests are invalid or inactive.",
        missingTestIds: missing,
      });
      return;
    }

    const testMap = new Map(
      tests.map((test: any) => [test.id, test as any])
    ) as Map<string, any>;

    const globalDiscount =
      typeof body.discount === "number" &&
      Number.isFinite(body.discount) &&
      body.discount >= 0
        ? body.discount
        : 0;

    const normalizedItems = body.items.map(
      (item) => {
        const test = testMap.get(item.testId) as TestInfo | undefined;

        if (!test) {
          throw new Error(
            `Test ${item.testId} was not found.`
          );
        }

        const price = Number(test.price);

        const itemDiscount =
          typeof item.discount === "number" &&
          Number.isFinite(item.discount) &&
          item.discount >= 0
            ? item.discount
            : 0;

        if (itemDiscount > price) {
          throw new Error(
            `Discount cannot exceed price for test ${test.testName}.`
          );
        }

        const taxable =
          price - itemDiscount;

        const gstPercentage = Number(
          test.gstPercentage
        );

        const gstAmount = roundMoney(
          (taxable * gstPercentage) / 100
        );

        const finalPrice = roundMoney(
          taxable + gstAmount
        );

        return {
          test,
          price,
          discount: itemDiscount,
          taxable,
          gstPercentage,
          gstAmount,
          finalPrice,
        } as NormalizedOrderItem;
      }
    ) as NormalizedOrderItem[];

    const subtotal = roundMoney(
      normalizedItems.reduce(
        (sum, item) => sum + item.price,
        0
      )
    );

    const itemDiscount = roundMoney(
      normalizedItems.reduce(
        (sum, item) => sum + item.discount,
        0
      )
    );

    const totalDiscount = roundMoney(
      itemDiscount + globalDiscount
    );

    const taxableSubtotal = roundMoney(
      subtotal - totalDiscount
    );

    if (taxableSubtotal < 0) {
      res.status(400).json({
        success: false,
        message:
          "Total discount cannot exceed order subtotal.",
      });
      return;
    }

    /*
     * GST is calculated per test because Test has
     * its own gstPercentage.
     *
     * Global discount is distributed proportionally
     * across taxable item values before GST.
     */
    const itemTaxableBeforeGlobal =
      normalizedItems.reduce(
        (sum, item) => sum + item.taxable,
        0
      );

    let gstAmount = 0;

    for (const item of normalizedItems) {
      let taxableAmount = item.taxable;

      if (
        globalDiscount > 0 &&
        itemTaxableBeforeGlobal > 0
      ) {
        const allocatedDiscount =
          (item.taxable /
            itemTaxableBeforeGlobal) *
          globalDiscount;

        taxableAmount = Math.max(
          0,
          item.taxable - allocatedDiscount
        );
      }

      gstAmount +=
        (taxableAmount *
          item.gstPercentage) /
        100;
    }

    gstAmount = roundMoney(gstAmount);

    const grandTotal = roundMoney(
      taxableSubtotal + gstAmount
    );

    /*
     * Invoice has one gstPercent field while individual
     * tests can have different GST percentages.
     *
     * Store the effective weighted GST percentage.
     */
    const effectiveGstPercent =
      taxableSubtotal > 0
        ? roundMoney(
            (gstAmount / taxableSubtotal) * 100
          )
        : 0;

    const orderNumber =
      await generateUniqueOrderNumber();

    const barcode =
      await generateUniqueBarcode();

    const invoiceNumber =
      await generateUniqueInvoiceNumber();

    const userId = getUserId(req);

    const createdById = userId ?? null;

    if (createdById) {
      const user =
        await prisma.user.findUnique({
          where: {
            id: createdById,
          },
          select: {
            id: true,
          },
        });

      if (!user) {
        res.status(401).json({
          success: false,
          message:
            "Authenticated user was not found.",
        });
        return;
      }
    }

    const result =
      await prisma.$transaction(
        async (tx: any) => {
          const order =
            await tx.order.create({
              data: {
                orderNumber,
                barcode,

                patientId: patient.id,

                doctorId:
                  body.doctorId || null,

                createdById,

                orderStatus: "REGISTERED",
                paymentStatus: "PENDING",

                sampleCollected: false,

                notes:
                  body.notes?.trim() || null,

                subtotal,
                discount: totalDiscount,
                gstAmount,
                grandTotal,

                items: {
                  create: normalizedItems.map(
                    (item) => ({
                      testId: (item as NormalizedOrderItem).test.id,
                      price: (item as NormalizedOrderItem).price,
                      discount: (item as NormalizedOrderItem).discount,
                      gstPercentage:
                        (item as NormalizedOrderItem).gstPercentage,
                      gstAmount:
                        (item as NormalizedOrderItem).gstAmount,
                      finalPrice:
                        (item as NormalizedOrderItem).finalPrice,
                    })
                  ),
                },

                invoice: {
                  create: {
                    invoiceNumber,

                    subtotal,

                    discount:
                      totalDiscount,

                    taxableAmount: taxableSubtotal,

                    gstPercent:
                      effectiveGstPercent,

                    cgstAmount: gstAmount / 2,
                    sgstAmount: gstAmount / 2,
                    igstAmount: 0,

                    gstAmount,

                    grandTotal,

                    paymentStatus:
                      "PENDING",

                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  },
                },
              },

              include: {
                patient: {
                  select: {
                    id: true,
                    uhid: true,
                    firstName: true,
                    middleName: true,
                    lastName: true,
                    gender: true,
                  },
                },

                doctor: {
                  select: {
                    id: true,
                    doctorCode: true,
                    fullName: true,
                    specialization: true,
                  },
                },

                items: {
                  include: {
                    test: {
                      select: {
                        id: true,
                        testCode: true,
                        testName: true,
                        sampleType: true,
                      },
                    },
                  },
                },

                invoice: true,
              },
            });

          return order;
        }
      );

    res.status(201).json({
      success: true,
      message:
        "Test order created and GST invoice generated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const orderId = Array.isArray(id) ? id[0] : id;

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: "Order id is required.",
      });
      return;
    }

    const order =
      await prisma.order.findUnique({
        where: {
          id: orderId,
        },

        include: {
          patient: true,

          doctor: {
            select: {
              id: true,
              doctorCode: true,
              fullName: true,
              qualification: true,
              specialization: true,
              phone: true,
            },
          },

          createdBy: {
            select: {
              id: true,
              employeeCode: true,
              fullName: true,
              role: true,
            },
          },

          items: {
            include: {
              test: {
                include: {
                  category: true,
                },
              },
            },
          },

          invoice: true,

          payments: {
            orderBy: {
              paidAt: "desc",
            },
          },

          results: {
            include: {
              values: true,
            },
          },
        },
      });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};