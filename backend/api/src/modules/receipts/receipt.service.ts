import prisma from "../../../config/database";
import { getNextSequenceNumber } from "../../services/sequence.service";

const generateReceiptNumber = async (tx?: any) => {
  return getNextSequenceNumber("REC", "MAIN", tx);
};

// =======================================================
// GENERATE RECEIPT FOR PAYMENT
// =======================================================

export const generateReceipt = async (
  data: {
    paymentId: string;
    receiptType?: string;
  }
) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: data.paymentId },
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
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Check if receipt already exists
    const existingReceipt = await prisma.receipt.findUnique({
      where: { paymentId: data.paymentId },
    });

    if (existingReceipt) {
      return existingReceipt;
    }

    // Generate QR code data (in real implementation, use QR code library)
    const qrCodeData = JSON.stringify({
      receiptNumber: payment.receiptNumber,
      paymentId: payment.id,
      amount: Number(payment.amount),
      timestamp: payment.paidAt,
    });

    const verificationUrl = `/verify-receipt/${payment.receiptNumber}`;

    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber: payment.receiptNumber,
        paymentId: data.paymentId,
        receiptType: data.receiptType || "PAYMENT",
        qrCode: qrCodeData,
        verificationUrl,
      },
    });

    return receipt;
  } catch (error) {
    console.error('Error in generateReceipt:', error);
    throw error;
  }
};

// =======================================================
// GET RECEIPT BY PAYMENT ID
// =======================================================

// Receipt is a standalone table (no Prisma relation to Payment), so the payment
// detail is attached manually to keep the `{ ...receipt, payment }` shape.
const receiptPaymentInclude = {
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
};

const withPayment = async <T extends { paymentId: string }>(receipt: T) => {
  const payment = await prisma.payment.findUnique({
    where: { id: receipt.paymentId },
    include: receiptPaymentInclude,
  });

  return { ...receipt, payment };
};

export const getReceiptByPaymentId = async (paymentId: string) => {
  try {
    const receipt = await prisma.receipt.findUnique({
      where: { paymentId },
    });

    if (!receipt) {
      throw new Error("Receipt not found");
    }

    return withPayment(receipt);
  } catch (error) {
    console.error('Error in getReceiptByPaymentId:', error);
    throw error;
  }
};

// =======================================================
// GET RECEIPT BY NUMBER
// =======================================================

export const getReceiptByNumber = async (receiptNumber: string) => {
  try {
    const receipt = await prisma.receipt.findUnique({
      where: { receiptNumber },
    });

    if (!receipt) {
      throw new Error("Receipt not found");
    }

    return withPayment(receipt);
  } catch (error) {
    console.error('Error in getReceiptByNumber:', error);
    throw error;
  }
};

// =======================================================
// MARK RECEIPT AS PRINTED
// =======================================================

export const markReceiptPrinted = async (receiptId: string) => {
  try {
    const receipt = await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        printedAt: new Date(),
      },
    });

    return receipt;
  } catch (error) {
    console.error('Error in markReceiptPrinted:', error);
    throw error;
  }
};

// =======================================================
// MARK RECEIPT AS EMAILED
// =======================================================

export const markReceiptEmailed = async (receiptId: string) => {
  try {
    const receipt = await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        emailedAt: new Date(),
      },
    });

    return receipt;
  } catch (error) {
    console.error('Error in markReceiptEmailed:', error);
    throw error;
  }
};

// =======================================================
// MARK RECEIPT AS SMS SENT
// =======================================================

export const markReceiptSmsed = async (receiptId: string) => {
  try {
    const receipt = await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        smsedAt: new Date(),
      },
    });

    return receipt;
  } catch (error) {
    console.error('Error in markReceiptSmsed:', error);
    throw error;
  }
};

// =======================================================
// GET PAYMENT REPORTS
// =======================================================

export const getPaymentReports = async (options: any = {}) => {
  try {
    const {
      reportType,
      startDate,
      endDate,
      method,
      page = 1,
      limit = 20,
    } = options;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (startDate || endDate) {
      where.paidAt = {};
      if (startDate) {
        where.paidAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.paidAt.lte = new Date(endDate);
      }
    }

    if (method) {
      where.method = method;
    }

    let payments;
    let total;

    switch (reportType) {
      case "daily":
        // Daily collection report
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        [payments, total] = await Promise.all([
          prisma.payment.findMany({
            where: {
              ...where,
              paidAt: { gte: today, lte: endOfToday },
            },
            skip,
            take: limit,
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
            orderBy: { paidAt: "desc" },
          }),
          prisma.payment.count({
            where: {
              ...where,
              paidAt: { gte: today, lte: endOfToday },
            },
          }),
        ]);
        break;

      case "monthly":
        // Monthly collection report
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(thisMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        [payments, total] = await Promise.all([
          prisma.payment.findMany({
            where: {
              ...where,
              paidAt: { gte: thisMonth, lte: endOfMonth },
            },
            skip,
            take: limit,
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
            orderBy: { paidAt: "desc" },
          }),
          prisma.payment.count({
            where: {
              ...where,
              paidAt: { gte: thisMonth, lte: endOfMonth },
            },
          }),
        ]);
        break;

      case "staff":
        // Staff collection report
        [payments, total] = await Promise.all([
          prisma.payment.findMany({
            where,
            skip,
            take: limit,
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
            orderBy: { paidAt: "desc" },
          }),
          prisma.payment.count({ where }),
        ]);
        break;

      case "refund":
        // Refund report
        const [refunds, refundTotal] = await Promise.all([
          prisma.refund.findMany({
            where: {
              ...(startDate || endDate ? {
                requestedAt: {}
              } : {}),
              ...(startDate ? { requestedAt: { gte: new Date(startDate) } } : {}),
              ...(endDate ? { requestedAt: { lte: new Date(endDate) } } : {}),
            },
            skip,
            take: limit,
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
              requestedBy: {
                select: {
                  id: true,
                  employeeCode: true,
                  fullName: true,
                },
              },
            },
            orderBy: { requestedAt: "desc" },
          }),
          prisma.refund.count(),
        ]);

        return {
          reportType: "refund",
          data: refunds,
          pagination: {
            page,
            limit,
            total: refundTotal,
            totalPages: Math.ceil(refundTotal / limit),
            hasNextPage: page * limit < refundTotal,
            hasPreviousPage: page > 1,
          },
        };

      default:
        // General payment report
        [payments, total] = await Promise.all([
          prisma.payment.findMany({
            where,
            skip,
            take: limit,
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
            orderBy: { paidAt: "desc" },
          }),
          prisma.payment.count({ where }),
        ]);
    }

    return {
      reportType,
      data: payments,
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
    console.error('Error in getPaymentReports:', error);
    throw error;
  }
};

// =======================================================
// EXPORT PAYMENT DATA
// =======================================================

export const exportPaymentData = async (options: any = {}) => {
  try {
    const {
      format,
      startDate,
      endDate,
      method,
      status,
    } = options;

    const where: any = {};

    if (startDate || endDate) {
      where.paidAt = {};
      if (startDate) {
        where.paidAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.paidAt.lte = new Date(endDate);
      }
    }

    if (method) {
      where.method = method;
    }

    if (status) {
      where.status = status;
    }

    const payments = await prisma.payment.findMany({
      where,
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
      orderBy: { paidAt: "desc" },
      take: 10000, // Limit for export
    });

    // Transform data for export
    const exportData = payments.map((payment) => ({
      receiptNumber: payment.receiptNumber,
      transactionId: payment.transactionId,
      orderNumber: payment.order.orderNumber,
      invoiceNumber: payment.order.invoice?.invoiceNumber,
      patientName: [payment.order.patient.title, payment.order.patient.firstName, payment.order.patient.middleName, payment.order.patient.lastName].filter(Boolean).join(" ").trim() || "Patient",
      patientUHID: payment.order.patient.uhid,
      amount: Number(payment.amount),
      method: payment.method,
      status: payment.status,
      paidAt: payment.paidAt,
      receivedBy: payment.receivedBy?.fullName,
      remarks: payment.remarks,
    }));

    return {
      format,
      data: exportData,
      count: exportData.length,
    };
  } catch (error) {
    console.error('Error in exportPaymentData:', error);
    throw error;
  }
};