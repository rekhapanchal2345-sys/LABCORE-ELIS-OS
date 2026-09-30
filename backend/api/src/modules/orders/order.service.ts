import prisma from "../../../config/database";

export const createOrder = async (
  data: any,
  userId?: string
) => {
  try {
    const patient =
      await prisma.patient.findUnique({
        where: {
          id: data.patientId,
        },
      });

    if (!patient) {
      throw new Error(
        "Patient not found"
      );
    }

    if (data.doctorId) {
      const doctor =
        await prisma.doctor.findUnique({
          where: {
            id: data.doctorId,
          },
        });

      if (!doctor || !doctor.isActive) {
        throw new Error(
          "Doctor not found or inactive"
        );
      }
    }

    const testIds =
      data.items.map(
        (item: any) => item.testId
      );

    const tests =
      await prisma.test.findMany({
        where: {
          id: {
            in: testIds,
          },
          isActive: true,
        },
      });

  if (
    tests.length !==
    data.items.length
  ) {
    throw new Error(
      "One or more tests are invalid or inactive"
    );
  }

  // Generate unique order number and barcode with collision prevention
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  const orderNumber = `ORD-${new Date().getFullYear()}-${randomSuffix}`;
  const barcode = `SMP-${timestamp}`;

  let subtotal = 0;
  let totalDiscount = 0;

  const items = data.items.map(
    (item: any) => {
      const test = tests.find(
        (t) => t.id === item.testId
      );

      if (!test) {
        throw new Error(
          "Test not found"
        );
      }

      const price =
        Number(test.price);

      const discount =
        Number(item.discount ?? 0);

      if (discount > price) {
        throw new Error(
          `Discount cannot exceed price for ${test.testName}`
        );
      }

      const finalPrice =
        price - discount;

      subtotal += price;
      totalDiscount += discount;

      return {
        testId: test.id,
        price,
        discount,
        finalPrice,
      };
    }
  );

  // Calculate GST and totals
  const gstRate = 0.18; // 18% GST
  const taxableAmount = subtotal - totalDiscount;
  const gstAmount = taxableAmount * gstRate;
  const grandTotal = taxableAmount + gstAmount;
  const paidAmount = Number(data.paidAmount ?? 0);
  const dueAmount = grandTotal - paidAmount;

  // Determine payment status
  let paymentStatus = "PENDING";
  if (paidAmount >= grandTotal) {
    paymentStatus = "PAID";
  } else if (paidAmount > 0) {
    paymentStatus = "PARTIAL";
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber,
        barcode,

        patientId: data.patientId,

        doctorId:
          data.doctorId,

        createdById:
          userId,

        orderStatus:
          "REGISTERED",

        paymentStatus,

        notes: data.notes,

        subtotal,
        discount: totalDiscount,
        discountCode: data.discountCode,
        paidAmount,
        gstAmount,
        grandTotal,
        dueAmount,

        reportDeliveryWhatsApp: data.reportDeliveryWhatsApp,
        reportDeliveryEmail: data.reportDeliveryEmail,
        reportDeliveryPrinted: data.reportDeliveryPrinted,
        reportDeliveryPortal: data.reportDeliveryPortal,

        priority: data.priority || "ROUTINE",
        collectionType: data.collectionType,
        homeCollectionAddress: data.homeCollectionAddress,

        items: {
          create: items,
        },
      },

      include: {
        patient: true,

        doctor: true,

        items: {
          include: {
            test: {
              include: {
                category: true,
                parameters: true,
              },
            },
          },
        },
      },
    });

    // Create samples and initial result records for each test with tracking events
    for (const item of order.items) {
      const timestamp = Date.now();
      const sample = await tx.sample.create({
        data: {
          sampleNumber: `SMP-${timestamp}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
          barcode: `BC-SMP-${timestamp}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
          patientId: order.patientId,
          orderId: order.id,
          testId: item.testId,
          sampleType: item.test.sampleType,
          status: "PENDING",
        },
      });

      // Auto-create initial Result record so patient appears immediately in tracking & pipeline
      const existingResult = await tx.result.findUnique({
        where: {
          orderId_testId: {
            orderId: order.id,
            testId: item.testId,
          },
        },
      });

      if (!existingResult) {
        await tx.result.create({
          data: {
            orderId: order.id,
            testId: item.testId,
            patientId: order.patientId,
            status: "PENDING",
            enteredAt: new Date(),
            values: {
              create: (item.test.parameters || []).map((p: any) => ({
                parameterId: p.id,
                value: "",
                flag: "NORMAL",
              })),
            },
          },
        });
      }

      // Create initial tracking event for order registration
      await tx.sampleTrackingHistory.create({
        data: {
          sampleId: sample.id,
          orderId: order.id,
          patientId: order.patientId,
          eventType: "ORDER_REGISTERED",
          status: "REGISTERED",
          notes: `Order ${orderNumber} registered for ${item.test.testName}`,
          performedById: userId,
          metadata: {
            orderNumber,
            sampleNumber: sample.sampleNumber,
            barcode: sample.barcode,
          },
        },
      });
    }

    // Auto-create Invoice for the order
    const invoiceNumber = `INV-${timestamp}-${Math.floor(Math.random() * 1000)}`;
    await tx.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        subtotal,
        discount: totalDiscount,
        taxableAmount,
        gstPercent: 18,
        cgstAmount: gstAmount / 2,
        sgstAmount: gstAmount / 2,
        igstAmount: 0,
        gstAmount,
        grandTotal,
        paymentStatus: paymentStatus as any,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // If advance payment was recorded, register payment
    if (paidAmount > 0) {
      const validMethods = ["CASH", "CARD", "UPI", "NET_BANKING", "CHEQUE"];
      const method = (data.paymentMethod && validMethods.includes(data.paymentMethod))
        ? data.paymentMethod
        : "CASH";
      await tx.payment.create({
        data: {
          receiptNumber: `RCP-${timestamp}-${Math.floor(Math.random() * 1000)}`,
          orderId: order.id,
          amount: paidAmount,
          method: method as any,
          notes: data.paymentNotes || "Advance payment collected at registration",
        },
      });
    }

    return order;
  });
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw error;
  }
};

export const getOrders = async (
  options: any
) => {
  try {
    const {
      search,
      patientId,
      doctorId,
      orderStatus,
      paymentStatus,
      page = 1,
      limit = 20,
    } = options;

    const skip =
      (page - 1) * limit;

    const where: any = {
      ...(patientId
        ? { patientId }
        : {}),

      ...(doctorId
        ? { doctorId }
        : {}),

      ...(orderStatus
        ? { orderStatus }
        : {}),

      ...(paymentStatus
        ? { paymentStatus }
        : {}),
    };

    if (search) {
      where.OR = [
        {
          orderNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          barcode: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          patient: {
            firstName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          patient: {
            lastName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          patient: {
            uhid: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [orders, total] =
      await Promise.all([
        prisma.order.findMany({
          where,

          skip,
          take: limit,

          include: {
            patient: {
              select: {
                id: true,
                uhid: true,
                firstName: true,
                lastName: true,
                phone: true,
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

            payments: true,

            samples: {
              select: {
                id: true,
                sampleNumber: true,
                barcode: true,
                sampleType: true,
                status: true,
                collectedAt: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        }),

        prisma.order.count({
          where,
        }),
      ]);

    return {
      orders,

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
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders from database');
  }
};

export const getOrderById =
  async (id: string) => {
    const order =
      await prisma.order.findUnique({
        where: { id },

        include: {
          patient: true,

          doctor: true,

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
                  parameters: {
                    include: {
                      referenceRanges: true,
                    },
                  },
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
              test: true,
              values: {
                include: {
                  parameter: true,
                },
              },
            },
          },
        },
      });

    if (!order) {
      throw new Error(
        "Order not found"
      );
    }

    return order;
  };

export const updateOrder = async (
  id: string,
  data: any
) => {
  const order =
    await prisma.order.findUnique({
      where: { id },
      include: {
        patient: true
      }
    });

  if (!order) {
    throw new Error(
      "Order not found"
    );
  }

  if (
    order.orderStatus ===
      "COMPLETED" ||
    order.orderStatus ===
      "CANCELLED"
  ) {
    throw new Error(
      "Completed or cancelled orders cannot be modified"
    );
  }

  const updateData: any = {};
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.orderStatus !== undefined) updateData.orderStatus = data.orderStatus;
  if (data.doctorId !== undefined) updateData.doctorId = data.doctorId;
  if (data.priority !== undefined) updateData.priority = data.priority;

  const updatedOrder = await prisma.order.update({
    where: { id },

    data: updateData,

    include: {
      patient: true,
      doctor: true,
      items: {
        include: {
          test: true,
        },
      },
      samples: true,
    },
  });

  return updatedOrder;
};

export const collectSample =
  async (
    id: string,
    barcode?: string,
    userId?: string,
    metadata?: any
  ) => {
    const order =
      await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              test: true,
            },
          },
          samples: true,
          patient: true,
        },
      });

    if (!order) {
      throw new Error(
        "Order not found"
      );
    }

    if (
      order.orderStatus ===
      "CANCELLED"
    ) {
      throw new Error(
        "Cannot collect sample for cancelled order"
      );
    }

    const timestamp = Date.now();
    const finalBarcode = barcode && barcode.trim().length > 0
      ? barcode.trim()
      : (order.barcode || `ORD-BC-${timestamp}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`);

    const collectionTime = new Date();
    const performerId = userId || metadata?.collectedById;

    return prisma.$transaction(async (tx) => {
      // 1. Update Order
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          barcode: finalBarcode,
          sampleCollected: true,
          collectedAt: collectionTime,
          orderStatus: "SAMPLE_COLLECTED",
        },
        include: {
          items: {
            include: {
              test: true,
            },
          },
          patient: true,
          samples: true,
        },
      });

      // 2. Ensure Samples exist and update them to COLLECTED
      if (order.samples && order.samples.length > 0) {
        for (const sample of order.samples) {
          const sampleBarcode = sample.barcode || `BC-SMP-${timestamp}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
          await tx.sample.update({
            where: { id: sample.id },
            data: {
              barcode: sampleBarcode,
              status: "COLLECTED",
              collectedAt: collectionTime,
              collectedById: performerId || null,
              collectionType: metadata?.collectionType || "WALK_IN",
              priority: metadata?.priority || "ROUTINE",
            },
          });

          // Create tracking history event
          await tx.sampleTrackingHistory.create({
            data: {
              sampleId: sample.id,
              orderId: order.id,
              patientId: order.patientId,
              eventType: "SAMPLE_COLLECTED",
              status: "COLLECTED",
              location: metadata?.location || "Phlebotomy Station",
              notes: metadata?.notes || `Sample ${sample.sampleNumber} collected (${metadata?.collectionType || 'Walk-in'})`,
              performedById: performerId || null,
              performedAt: collectionTime,
              metadata: {
                barcode: sampleBarcode,
                orderBarcode: finalBarcode,
                collectionType: metadata?.collectionType || "WALK_IN",
                priority: metadata?.priority || "ROUTINE",
                sampleQuality: metadata?.sampleQuality || "Adequate",
                sampleVolume: metadata?.sampleVolume || "Adequate",
              },
            },
          });
        }
      } else {
        // If order had no sample records created yet, create them from items
        for (const item of order.items) {
          const sampleNumber = `SMP-${timestamp}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
          const sampleBarcode = `BC-SMP-${timestamp}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;

          const newSample = await tx.sample.create({
            data: {
              sampleNumber,
              barcode: sampleBarcode,
              patientId: order.patientId,
              orderId: order.id,
              testId: item.testId,
              sampleType: item.test.sampleType,
              status: "COLLECTED",
              collectedAt: collectionTime,
              collectedById: performerId || null,
              collectionType: metadata?.collectionType || "WALK_IN",
              priority: metadata?.priority || "ROUTINE",
            },
          });

          await tx.sampleTrackingHistory.create({
            data: {
              sampleId: newSample.id,
              orderId: order.id,
              patientId: order.patientId,
              eventType: "SAMPLE_COLLECTED",
              status: "COLLECTED",
              location: metadata?.location || "Phlebotomy Station",
              notes: metadata?.notes || `Sample ${sampleNumber} collected (${item.test.testName})`,
              performedById: performerId || null,
              performedAt: collectionTime,
              metadata: {
                barcode: sampleBarcode,
                orderBarcode: finalBarcode,
                collectionType: metadata?.collectionType || "WALK_IN",
                priority: metadata?.priority || "ROUTINE",
                testName: item.test.testName,
              },
            },
          });
        }
      }

      return updatedOrder;
    });
  };

export const cancelOrder =
  async (
    id: string,
    _reason?: string
  ) => {
    const order =
      await prisma.order.findUnique({
        where: { id },
      });

    if (!order) {
      throw new Error(
        "Order not found"
      );
    }

    if (
      order.orderStatus ===
      "COMPLETED"
    ) {
      throw new Error(
        "Completed order cannot be cancelled"
      );
    }

    if (
      order.orderStatus ===
      "CANCELLED"
    ) {
      throw new Error(
        "Order is already cancelled"
      );
    }

    return prisma.order.update({
      where: { id },

      data: {
        orderStatus:
          "CANCELLED",
      },
    });
  };