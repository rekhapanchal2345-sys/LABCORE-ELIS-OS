import prisma from "../../../config/database";

interface CreateDoctorInput {
  doctorCode?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  qualification?: string;
  specialization?: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  clinicName?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  commissionRate?: number;
  isActive?: boolean;
  photoUrl?: string;
  signatureUrl?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  experience?: number;
  consultationFee?: number;
  availableDays?: string;
  availableTime?: string;
  department?: string;
  designation?: string;
  // New LIMS-specific fields
  doctorType?: string;
  clinicAddress?: string;
  whatsappNumber?: string;
  reportDeliveryEmail?: boolean;
  reportDeliveryWhatsApp?: boolean;
  reportDeliveryHardCopy?: boolean;
  reportDeliveryPortal?: boolean;
  enablePortalAccess?: boolean;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankAccountHolderName?: string;
}

interface UpdateDoctorInput {
  doctorCode?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  qualification?: string;
  specialization?: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  clinicName?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  commissionRate?: number;
  isActive?: boolean;
  photoUrl?: string;
  signatureUrl?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  experience?: number;
  consultationFee?: number;
  availableDays?: string;
  availableTime?: string;
  department?: string;
  designation?: string;
  // New LIMS-specific fields
  doctorType?: string;
  clinicAddress?: string;
  whatsappNumber?: string;
  reportDeliveryEmail?: boolean;
  reportDeliveryWhatsApp?: boolean;
  reportDeliveryHardCopy?: boolean;
  reportDeliveryPortal?: boolean;
  enablePortalAccess?: boolean;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankAccountHolderName?: string;
}

export const createDoctor = async (
  data: CreateDoctorInput
) => {
  // Generate doctor code if not provided
  const doctorCode = data.doctorCode || `DOC${Date.now().toString().slice(-6)}`;
  
  // Build full name from first/last/middle names if fullName not provided
  const fullName = data.fullName || 
    [data.firstName, data.middleName, data.lastName]
      .filter(Boolean)
      .join(" ") || 
    `${data.firstName || ''} ${data.lastName || ''}`.trim();

  // Build full address
  const fullAddress = [data.address, data.city, data.state, data.postalCode]
    .filter(Boolean)
    .join(", ");

  const existingDoctor =
    await prisma.doctor.findFirst({
      where: {
        OR: [
          {
            doctorCode: doctorCode,
          },
          ...(data.email
            ? [{ email: data.email }]
            : []),
        ],
      },
    });

  if (existingDoctor) {
    throw new Error(
      "Doctor with this code or email already exists"
    );
  }

  return prisma.doctor.create({
    data: {
      doctorCode: doctorCode,
      fullName: fullName,
      qualification: data.qualification,
      specialization: data.specialization,
      registrationNumber: data.registrationNumber,
      phone: data.phone,
      email: data.email,
      clinicName: data.clinicName,
      address: fullAddress || data.address,
      commissionRate:
        data.commissionRate,
      isActive:
        data.isActive ?? true,
      photoUrl: data.photoUrl,
      signatureUrl: data.signatureUrl,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : undefined,
      experience: data.experience,
      consultationFee: data.consultationFee,
      availableDays: data.availableDays,
      availableTime: data.availableTime,
      department: data.department,
      designation: data.designation,
      // New LIMS-specific fields
      doctorType: data.doctorType as any,
      clinicAddress: data.clinicAddress,
      whatsappNumber: data.whatsappNumber,
      reportDeliveryEmail: data.reportDeliveryEmail,
      reportDeliveryWhatsApp: data.reportDeliveryWhatsApp,
      reportDeliveryHardCopy: data.reportDeliveryHardCopy,
      reportDeliveryPortal: data.reportDeliveryPortal,
      enablePortalAccess: data.enablePortalAccess,
      bankAccountNumber: data.bankAccountNumber,
      bankIfscCode: data.bankIfscCode,
      bankAccountHolderName: data.bankAccountHolderName,
    },
  });
};

export const getDoctors = async (
  search?: string,
  specialization?: string,
  isActive?: boolean,
  page = 1,
  limit = 20,
  doctorType?: string
) => {
  const skip = (page - 1) * limit;

  let doctorTypeWhere: any = {};
  if (doctorType) {
    if (doctorType === "REFERRING_DOCTOR") {
      doctorTypeWhere = {
        OR: [
          { doctorType: "REFERRING_DOCTOR" },
          { doctorType: null },
        ],
      };
    } else if (doctorType === "PATHOLOGIST") {
      doctorTypeWhere = {
        doctorType: {
          in: ["IN_HOUSE_PATHOLOGIST", "INTERNAL_PATHOLOGIST", "CONSULTANT_PATHOLOGIST"],
        },
      };
    } else {
      doctorTypeWhere = { doctorType: doctorType as any };
    }
  }

  const where = {
    ...(search
      ? {
          OR: [
            {
              fullName: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              doctorCode: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              phone: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),

    ...(specialization
      ? {
          specialization: {
            contains: specialization,
            mode: "insensitive" as const,
          },
        }
      : {}),

    ...(isActive !== undefined
      ? { isActive }
      : {}),

    ...doctorTypeWhere,
  };

  const [doctors, total] =
    await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          _count: {
            select: {
              orders: true,
              patients: true,
            },
          },
        },
      }),

      prisma.doctor.count({
        where,
      }),
    ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const doctorsWithStats = await Promise.all(
    doctors.map(async (doc) => {
      const [paidRevenueAgg, monthlyCount] = await Promise.all([
        prisma.order.aggregate({
          where: {
            doctorId: doc.id,
            paymentStatus: "PAID",
            orderStatus: { notIn: ["CANCELLED"] },
          },
          _sum: { grandTotal: true },
        }),
        prisma.order.count({
          where: {
            doctorId: doc.id,
            createdAt: { gte: startOfMonth },
          },
        }),
      ]);

      const totalRevenue = Number(paidRevenueAgg._sum.grandTotal) || 0;
      const commissionRate = Number(doc.commissionRate) || 0;
      const pendingPayout = Math.round(totalRevenue * (commissionRate / 100));

      return {
        ...doc,
        totalRevenue,
        monthlyOrders: monthlyCount,
        pendingPayout,
      };
    })
  );

  return {
    doctors: doctorsWithStats,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(
        total / limit
      ),
      hasNextPage:
        page * limit < total,
      hasPreviousPage:
        page > 1,
    },
  };
};

export const getDoctorById = async (
  id: string
) => {
  const doctor =
    await prisma.doctor.findUnique({
      where: { id },

      include: {
        patients: {
          select: {
            id: true,
            uhid: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },

        orders: {
          select: {
            id: true,
            orderNumber: true,
            orderStatus: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
      },
    });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return doctor;
};

export const updateDoctor = async (
  id: string,
  data: UpdateDoctorInput
) => {
  const doctor =
    await prisma.doctor.findUnique({
      where: { id },
    });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // Build full name from first/last/middle names if provided
  const fullName = data.fullName || 
    (data.firstName || data.lastName || data.middleName
      ? [data.firstName, data.middleName, data.lastName]
          .filter(Boolean)
          .join(" ")
      : undefined);

  // Build full address if address components provided
  const fullAddress = (data.address || data.city || data.state || data.postalCode)
    ? [data.address, data.city, data.state, data.postalCode]
        .filter(Boolean)
        .join(", ")
    : undefined;

  if (
    data.doctorCode ||
    data.email
  ) {
    const duplicate =
      await prisma.doctor.findFirst({
        where: {
          OR: [
            ...(data.doctorCode
              ? [
                  {
                    doctorCode:
                      data.doctorCode,
                  },
                ]
              : []),

            ...(data.email
              ? [
                  {
                    email: data.email,
                  },
                ]
              : []),
          ],

          NOT: {
            id,
          },
        },
      });

    if (duplicate) {
      throw new Error(
        "Doctor code or email is already in use"
      );
    }
  }

  return prisma.doctor.update({
    where: { id },

    data: {
      doctorCode:
        data.doctorCode,
      fullName:
        fullName,
      qualification:
        data.qualification,
      specialization:
        data.specialization,
      registrationNumber: data.registrationNumber,
      phone:
        data.phone,
      email:
        data.email,
      clinicName:
        data.clinicName,
      address:
        fullAddress,
      commissionRate:
        data.commissionRate,
      isActive:
        data.isActive,
      photoUrl: data.photoUrl,
      signatureUrl: data.signatureUrl,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : undefined,
      experience: data.experience,
      consultationFee: data.consultationFee,
      availableDays: data.availableDays,
      availableTime: data.availableTime,
      department: data.department,
      designation: data.designation,
      // New LIMS-specific fields
      doctorType: data.doctorType as any,
      clinicAddress: data.clinicAddress,
      whatsappNumber: data.whatsappNumber,
      reportDeliveryEmail: data.reportDeliveryEmail,
      reportDeliveryWhatsApp: data.reportDeliveryWhatsApp,
      reportDeliveryHardCopy: data.reportDeliveryHardCopy,
      reportDeliveryPortal: data.reportDeliveryPortal,
      enablePortalAccess: data.enablePortalAccess,
      bankAccountNumber: data.bankAccountNumber,
      bankIfscCode: data.bankIfscCode,
      bankAccountHolderName: data.bankAccountHolderName,
    },
  });
};

export const updateDoctorStatus =
  async (
    id: string,
    isActive: boolean
  ) => {
    const doctor =
      await prisma.doctor.findUnique({
        where: { id },
      });

    if (!doctor) {
      throw new Error(
        "Doctor not found"
      );
    }

    return prisma.doctor.update({
      where: { id },

      data: {
        isActive,
      },
    });
  };

export const deleteDoctor = async (
  id: string
) => {
  const doctor =
    await prisma.doctor.findUnique({
      where: { id },
    });

  if (!doctor) {
    throw new Error(
      "Doctor not found"
    );
  }

  // Don't physically delete a doctor
  // who has patient/order history.
  const [patientCount, orderCount] =
    await Promise.all([
      prisma.patient.count({
        where: {
          referredById: id,
        },
      }),

      prisma.order.count({
        where: {
          doctorId: id,
        },
      }),
    ]);

  if (
    patientCount > 0 ||
    orderCount > 0
  ) {
    throw new Error(
      "Doctor has patient or order history. Deactivate the doctor instead of deleting."
    );
  }

  await prisma.doctor.delete({
    where: { id },
  });

  return {
    id,
    deleted: true,
  };
};

export const getDoctorStatistics = async (
  id: string
) => {
  const doctor =
    await prisma.doctor.findUnique({
      where: { id },
    });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const [
    patientCount,
    orderCount,
    completedOrders,
    totalRevenue,
    recentOrders,
  ] = await Promise.all([
    prisma.patient.count({
      where: {
        referredById: id,
      },
    }),

    prisma.order.count({
      where: {
        doctorId: id,
      },
    }),

    prisma.order.count({
      where: {
        doctorId: id,
        orderStatus: "COMPLETED",
      },
    }),

    prisma.order.aggregate({
      where: {
        doctorId: id,
        paymentStatus: "PAID",
      },
      _sum: {
        grandTotal: true,
      },
    }),

    prisma.order.findMany({
      where: {
        doctorId: id,
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            uhid: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
  ]);

  return {
    doctor,
    statistics: {
      totalPatients: patientCount,
      totalOrders: orderCount,
      completedOrders,
      pendingOrders: orderCount - completedOrders,
      totalRevenue: Number(totalRevenue._sum.grandTotal) || 0,
      averageOrderValue: orderCount > 0 
        ? (Number(totalRevenue._sum.grandTotal) || 0) / orderCount 
        : 0,
      completionRate: orderCount > 0 
        ? (completedOrders / orderCount) * 100 
        : 0,
    },
    recentOrders,
  };
};

export const getDoctorCommission = async (
  id: string,
  startDate?: Date,
  endDate?: Date
) => {
  const doctor =
    await prisma.doctor.findUnique({
      where: { id },
    });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const dateFilter: any = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.gte = startDate;
    if (endDate) dateFilter.createdAt.lte = endDate;
  }

  const orders = await prisma.order.findMany({
    where: {
      doctorId: id,
      paymentStatus: "PAID",
      ...dateFilter,
    },
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
          uhid: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const commissionRate = Number(doctor.commissionRate) || 0;
  const totalRevenue = orders.reduce((sum, order) => 
    sum + Number(order.grandTotal), 0
  );
  const totalCommission = totalRevenue * (commissionRate / 100);

  return {
    doctor,
    commissionRate,
    totalRevenue,
    totalCommission,
    orderCount: orders.length,
    orders,
  };
};

export const getDoctorsBySpecialization = async (
  specialization: string
) => {
  return prisma.doctor.findMany({
    where: {
      specialization: {
        contains: specialization,
        mode: "insensitive",
      },
      isActive: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });
};

export const processDoctorPayout = async (
  id: string,
  payoutData: {
    amount: number;
    paymentMode: string;
    refNumber?: string;
    tdsDeduction?: number;
    remarks?: string;
    payoutDate?: string;
    userId?: string;
  }
) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  if (doctor.doctorType === "INTERNAL_PATHOLOGIST" || doctor.doctorType === "IN_HOUSE_PATHOLOGIST") {
    throw new Error("Commission payouts are only applicable for referring doctors");
  }

  if (!payoutData.amount || payoutData.amount <= 0) {
    throw new Error("Invalid payout amount");
  }

  // Calculate actual paid orders commission
  const paidOrders = await prisma.order.findMany({
    where: {
      doctorId: id,
      paymentStatus: "PAID",
      orderStatus: {
        notIn: ["CANCELLED"],
      },
    },
    select: {
      grandTotal: true,
    },
  });

  const realRevenue = paidOrders.reduce((acc, o) => acc + Number(o.grandTotal), 0);
  const commissionRate = Number(doctor.commissionRate) || 0;
  const maxEligibleCommission = Math.round(realRevenue * (commissionRate / 100));

  const tdsPct = payoutData.tdsDeduction !== undefined ? payoutData.tdsDeduction : 10;
  const tdsAmount = Math.round((payoutData.amount * tdsPct) / 100);
  const netPaid = payoutData.amount - tdsAmount;

  const voucherNumber = `VCH-${Date.now().toString().slice(-6)}`;
  const timestamp = new Date().toISOString();

  // Audit log record for payout settlement
  try {
    const { createAuditLog } = require("../audit/audit.service");
    await createAuditLog({
      userId: payoutData.userId,
      module: "DOCTORS",
      action: "COMMISSION_PAYOUT_SETTLED",
      entityId: id,
      description: `Settled commission payout of ₹${netPaid} (Gross: ₹${payoutData.amount}, TDS: ₹${tdsAmount}) for Dr. ${doctor.fullName || doctor.doctorCode} via ${payoutData.paymentMode} (Ref: ${payoutData.refNumber || 'N/A'})`,
      metadata: {
        doctorCode: doctor.doctorCode,
        doctorName: doctor.fullName,
        voucherNumber,
        grossAmount: payoutData.amount,
        tdsAmount,
        netPaid,
        paymentMode: payoutData.paymentMode,
        refNumber: payoutData.refNumber,
        payoutDate: payoutData.payoutDate || timestamp,
      },
    });
  } catch (auditErr) {
    console.warn("Audit logging for doctor payout skipped:", auditErr);
  }

  return {
    success: true,
    voucher: {
      voucherNumber,
      doctorId: id,
      doctorName: doctor.fullName,
      doctorCode: doctor.doctorCode || `DOC-${id}`,
      clinicName: doctor.clinicName || "Clinic Affiliated",
      grossAmount: payoutData.amount,
      tdsPercentage: tdsPct,
      tdsAmount,
      netPaid,
      paymentMode: payoutData.paymentMode,
      refNumber: payoutData.refNumber || `UTR-${Date.now().toString().slice(-8)}`,
      payoutDate: payoutData.payoutDate || new Date().toISOString().split("T")[0],
      remarks: payoutData.remarks || "Referral commission settlement",
      timestamp: new Date().toLocaleString("en-IN"),
      realRevenue,
      maxEligibleCommission,
    },
  };
};