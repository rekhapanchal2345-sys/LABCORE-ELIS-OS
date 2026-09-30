import prisma from "../../../config/database";

const generateInvoiceNumber = () => {
  const timestamp = Date.now();

  const random = Math.floor(
    Math.random() * 1000
  );

  return `INV-${timestamp}-${random}`;
};

// =======================================================
// CREATE INVOICE
// =======================================================

export const createInvoice = async (
  data: {
    orderId: string;
    gstPercent?: number;
    discount?: number;
  }
) => {
  try {
    // Validate input data
    if (!data.orderId) {
      throw new Error("Order ID is required");
    }

    const order =
      await prisma.order.findUnique({
        where: {
          id: data.orderId,
        },

        include: {
          items: true,
          invoice: true,
          patient: true,
        },
      });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.invoice) {
      throw new Error(
        "Invoice already exists for this order"
      );
    }

    if (!order.items || order.items.length === 0) {
      throw new Error(
        "Cannot create invoice without order items"
      );
    }

    const subtotal = order.items.reduce(
      (total, item) => {
        return total + (Number(item.finalPrice) || 0);
      },
      0
    );

    if (subtotal <= 0) {
      throw new Error("Invalid subtotal amount");
    }

    const discount = Math.max(
      0,
      data.discount ?? 0
    );

    if (discount > subtotal) {
      throw new Error(
        "Discount cannot be greater than subtotal"
      );
    }

    const taxableAmount =
      subtotal - discount;

    const gstPercent =
      data.gstPercent ?? 18;

    if (gstPercent < 0 || gstPercent > 100) {
      throw new Error("GST percentage must be between 0 and 100");
    }

    const gstAmount =
      (taxableAmount * gstPercent) / 100;

    // For now GST is split equally into CGST + SGST.
    const cgstAmount =
      gstAmount / 2;

    const sgstAmount =
      gstAmount / 2;

    const grandTotal =
      taxableAmount + gstAmount;

    const invoice =
      await prisma.invoice.create({
        data: {
          invoiceNumber:
            generateInvoiceNumber(),

          orderId: order.id,

          subtotal,

          discount,

          taxableAmount,

          gstPercent,

          cgstAmount,

          sgstAmount,

          igstAmount: 0,

          gstAmount,

          grandTotal,

          paymentStatus:
            "PENDING",

          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },

        include: {
          order: {
            include: {
              patient: true,
              doctor: true,
              items: {
                include: {
                  test: true,
                },
              },
            },
          },
        },
      });

    return invoice;
  } catch (error) {
    console.error("Error in createInvoice:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create invoice");
  }
};

// =======================================================
// GET INVOICE BY ID
// =======================================================

export const getInvoiceById =
  async (id: string) => {
    try {
      if (!id) {
        throw new Error("Invoice ID is required");
      }

      const invoice =
        await prisma.invoice.findUnique({
          where: {
            id,
          },

          include: {
            order: {
              include: {
                patient: true,
                doctor: true,

                items: {
                  include: {
                    test: true,
                  },
                },

                payments: {
                  orderBy: {
                    paidAt: "desc",
                  },
                },

                samples: {
                  include: {
                    test: true,
                  },
                },
              },
            },
          },
        });

      if (!invoice) {
        throw new Error(
          "Invoice not found"
        );
      }

      return invoice;
    } catch (error) {
      console.error("Error in getInvoiceById:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to retrieve invoice");
    }
  };

// =======================================================
// LIST INVOICES
// =======================================================

export const getInvoices =
  async (options: any) => {
    try {
      const {
        search,
        patientId,
        orderId,
        paymentStatus,
        doctorId,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20,
      } = options;

      // Validate pagination parameters
      const validPage = Math.max(1, Number(page) || 1);
      const validLimit = Math.min(100, Math.max(1, Number(limit) || 20));

      const skip =
        (validPage - 1) * validLimit;

      const where: any = {};

      if (orderId) {
        where.orderId = orderId;
      }

      if (patientId) {
        where.order = {
          ...where.order,
          patientId: patientId,
        };
      }

      if (paymentStatus) {
        where.paymentStatus =
          paymentStatus;
      }

      if (doctorId) {
        where.order = {
          ...where.order,
          doctorId: doctorId,
        };
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        try {
          if (dateFrom) {
            const fromDate = new Date(dateFrom);
            if (!isNaN(fromDate.getTime())) {
              where.createdAt.gte = fromDate;
            }
          }
          if (dateTo) {
            const endDate = new Date(dateTo);
            if (!isNaN(endDate.getTime())) {
              endDate.setHours(23, 59, 59, 999);
              where.createdAt.lte = endDate;
            }
          }
        } catch (dateError) {
          console.error("Date parsing error in getInvoices:", dateError);
          // Continue without date filters if parsing fails
        }
      }

      if (search) {
        where.OR = [
          {
            invoiceNumber: {
              contains: search,
              mode: "insensitive",
            },
          },

          {
            order: {
              orderNumber: {
                contains: search,
                mode: "insensitive",
              },
            },
          },

          {
            order: {
              patient: {
                firstName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },

          {
            order: {
              patient: {
                lastName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },

          {
            order: {
              patient: {
                phone: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },

          {
            order: {
              patient: {
                uhid: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },

          {
            order: {
              patientId: {
                equals: search,
              },
            },
          },
        ];
      }

      let invoices, total;
      try {
        const results = await Promise.all([
          prisma.invoice.findMany({
            where,

            skip,
            take: validLimit,

            include: {
              order: {
                include: {
                  patient: true,
                  doctor: true,
                  payments: {
                    orderBy: {
                      paidAt: "desc",
                    },
                  },
                  items: {
                    include: {
                      test: true,
                    },
                  },
                },
              },
            },

            orderBy: {
              createdAt: "desc",
            },
          }),

          prisma.invoice.count({
            where,
          }),
        ]);
        invoices = results[0];
        total = results[1];
      } catch (dbError) {
        console.error("Database error in getInvoices:", dbError);
        // Return empty result instead of throwing error
        return {
          invoices: [],
          pagination: {
            page: validPage,
            limit: validLimit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }

      return {
        invoices,

        pagination: {
          page: validPage,
          limit: validLimit,
          total,

          totalPages:
            Math.ceil(
              total / validLimit
            ),

          hasNextPage:
            validPage * validLimit < total,

          hasPreviousPage:
            validPage > 1,
        },
      };
    } catch (error) {
      console.error("Error in getInvoices:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to retrieve invoices");
    }
  };

// =======================================================
// UPDATE PAYMENT STATUS
// =======================================================

export const updatePaymentStatus =
  async (
    id: string
  ) => {
    try {
      if (!id) {
        throw new Error("Invoice ID is required");
      }

      const invoice =
        await prisma.invoice.findUnique({
          where: {
            id,
          },

          include: {
            order: {
              include: {
                payments: true,
              },
            },
          },
        });

      if (!invoice) {
        throw new Error(
          "Invoice not found"
        );
      }

      const totalPaid =
        invoice.order?.payments
          ?.filter(
            (payment) =>
              payment.status === "PAID"
          )
          ?.reduce(
            (total, payment) =>
              total +
              (Number(payment.amount) || 0),
            0
          ) || 0;

      const grandTotal =
        Number(invoice.grandTotal) || 0;

      let paymentStatus:
        | "PENDING"
        | "PARTIAL"
        | "PAID";

      if (totalPaid <= 0) {
        paymentStatus = "PENDING";
      } else if (
        totalPaid < grandTotal
      ) {
        paymentStatus = "PARTIAL";
      } else {
        paymentStatus = "PAID";
      }

      const updatedInvoice =
        await prisma.invoice.update({
          where: {
            id,
          },

          data: {
            paymentStatus,
          },
        });

      await prisma.order.update({
        where: {
          id: invoice.orderId,
        },

        data: {
          paymentStatus,
        },
      });

      return updatedInvoice;
    } catch (error) {
      console.error("Error in updatePaymentStatus:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to update payment status");
    }
  };

// =======================================================
// DELETE INVOICE
// =======================================================

export const deleteInvoice = async (id: string) => {
  try {
    if (!id) {
      throw new Error("Invoice ID is required");
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Check if there are any payments
    if (invoice.order?.payments && invoice.order.payments.length > 0) {
      throw new Error(
        "Cannot delete invoice with existing payments. Please refund payments first."
      );
    }

    // Delete invoice (order relationship will cascade)
    await prisma.invoice.delete({
      where: { id },
    });

    // Update order payment status back to pending
    await prisma.order.update({
      where: { id: invoice.orderId },
      data: { paymentStatus: "PENDING" },
    });

    return { success: true, message: "Invoice deleted successfully" };
  } catch (error) {
    console.error("Error in deleteInvoice:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to delete invoice");
  }
};

// =======================================================
// GET BILLING METRICS
// =======================================================

export const getBillingMetrics = async (options: any = {}) => {
  try {
    const { startDate, endDate } = options;

    // Default to today if no date range provided
    const today = new Date();
    let startOfDay: Date;
    let endOfDay: Date;

    try {
      startOfDay = startDate ? new Date(startDate) : new Date(today.setHours(0, 0, 0, 0));
      endOfDay = endDate ? new Date(endDate) : new Date(today.setHours(23, 59, 59, 999));

      // Validate dates
      if (isNaN(startOfDay.getTime())) {
        throw new Error("Invalid start date format");
      }
      if (isNaN(endOfDay.getTime())) {
        throw new Error("Invalid end date format");
      }

      // Ensure end date includes the full day
      if (endDate) {
        endOfDay.setHours(23, 59, 59, 999);
      }
    } catch (dateError) {
      console.error("Date parsing error in getBillingMetrics:", dateError);
      // Fallback to today if date parsing fails
      const fallbackToday = new Date();
      startOfDay = new Date(fallbackToday.setHours(0, 0, 0, 0));
      endOfDay = new Date(fallbackToday.setHours(23, 59, 59, 999));
    }

    // Get all invoices within the date range with error handling
    let invoices;
    try {
      invoices = await prisma.invoice.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          order: {
            include: {
              payments: true,
            },
          },
        },
      });
    } catch (dbError) {
      console.error("Database error in getBillingMetrics:", dbError);
      // Return empty metrics instead of throwing error
      return {
        totalRevenue: 0,
        paidInvoices: {
          count: 0,
          amount: 0,
        },
        pendingDueAmount: 0,
        discountsAndRefunds: {
          discounts: 0,
          refunds: 0,
          total: 0,
        },
        dateRange: {
          startDate: startOfDay,
          endDate: endOfDay,
        },
        totalInvoices: 0,
      };
    }

    // Calculate metrics with safe number conversion
    let totalRevenue = 0;
    let paidInvoicesCount = 0;
    let paidInvoicesAmount = 0;
    let pendingDueAmount = 0;
    let totalDiscounts = 0;
    let totalRefunds = 0;

    invoices.forEach((invoice) => {
      try {
        const grandTotal = Number(invoice.grandTotal) || 0;
        const discount = Number(invoice.discount) || 0;
        const paidAmount = invoice.order?.payments
          ?.filter((p) => p.status === "PAID")
          ?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
        const refundedAmount = invoice.order?.payments
          ?.filter((p) => p.status === "REFUNDED")
          ?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

        totalRevenue += paidAmount;
        totalDiscounts += discount;
        totalRefunds += refundedAmount;

        if (invoice.paymentStatus === "PAID") {
          paidInvoicesCount++;
          paidInvoicesAmount += grandTotal;
        } else if (invoice.paymentStatus === "PARTIAL" || invoice.paymentStatus === "PENDING") {
          pendingDueAmount += (grandTotal - paidAmount);
        }
      } catch (calcError) {
        console.error("Error calculating metrics for invoice:", invoice.id, calcError);
        // Skip this invoice if calculation fails
      }
    });

    return {
      totalRevenue,
      paidInvoices: {
        count: paidInvoicesCount,
        amount: paidInvoicesAmount,
      },
      pendingDueAmount,
      discountsAndRefunds: {
        discounts: totalDiscounts,
        refunds: totalRefunds,
        total: totalDiscounts + totalRefunds,
      },
      dateRange: {
        startDate: startOfDay,
        endDate: endOfDay,
      },
      totalInvoices: invoices.length,
    };
  } catch (error) {
    console.error("Error in getBillingMetrics:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to load billing metrics");
  }
};

// =======================================================
// PROCESS REFUND
// =======================================================

export const processRefund = async (data: {
  invoiceId: string;
  amount: number;
  reason: string;
  refundMethod: string;
  transactionId?: string;
  userId?: string;
}) => {
  try {
    // Validate input data
    if (!data.invoiceId) {
      throw new Error("Invoice ID is required");
    }
    if (!data.amount || data.amount <= 0) {
      throw new Error("Refund amount must be greater than 0");
    }
    if (!data.reason) {
      throw new Error("Refund reason is required");
    }
    if (!data.refundMethod) {
      throw new Error("Refund method is required");
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: {
        order: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const refundAmount = Number(data.amount);
    const grandTotal = Number(invoice.grandTotal) || 0;

    // Calculate total refunded amount
    const totalRefunded = invoice.order?.payments
      ?.filter((p) => p.status === "REFUNDED")
      ?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

    // Check if refund amount is valid
    if (refundAmount <= 0) {
      throw new Error("Refund amount must be greater than 0");
    }

    if (totalRefunded + refundAmount > grandTotal) {
      throw new Error("Total refund amount cannot exceed invoice total");
    }

    // Generate receipt number for refund
    const receiptNumber = `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create refund payment record
    const refundPayment = await prisma.payment.create({
      data: {
        receiptNumber,
        orderId: invoice.orderId,
        amount: -refundAmount, // Negative amount for refund
        method: data.refundMethod as any,
        status: "REFUNDED",
        transactionId: data.transactionId,
        remarks: `Refund: ${data.reason}`,
        receivedById: data.userId,
      },
    });

    // Update invoice payment status
    const totalPaid = invoice.order?.payments
      ?.filter((p) => p.status === "PAID")
      ?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

    const newTotalRefunded = totalRefunded + refundAmount;
    let newPaymentStatus: "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";

    if (newTotalRefunded >= grandTotal) {
      newPaymentStatus = "REFUNDED";
    } else if (totalPaid - newTotalRefunded <= 0) {
      newPaymentStatus = "PENDING";
    } else if (totalPaid - newTotalRefunded < grandTotal) {
      newPaymentStatus = "PARTIAL";
    } else {
      newPaymentStatus = "PAID";
    }

    await prisma.invoice.update({
      where: { id: data.invoiceId },
      data: { paymentStatus: newPaymentStatus },
    });

    await prisma.order.update({
      where: { id: invoice.orderId },
      data: { paymentStatus: newPaymentStatus },
    });

    return {
      success: true,
      refundPayment,
      newPaymentStatus,
      refundAmount,
      totalRefunded: newTotalRefunded,
    };
  } catch (error) {
    console.error("Error in processRefund:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to process refund");
  }
};