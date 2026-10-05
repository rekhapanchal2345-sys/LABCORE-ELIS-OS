import prisma from "../../../config/database";

// ─────────────────────────────────────────────────────────────
//  ORDER ANALYTICS  (lab / hospital / clinic real-world ops)
// ─────────────────────────────────────────────────────────────

export const getOrderAnalytics = async (dateRange?: {
  from: Date;
  to: Date;
}) => {
  const now = new Date();
  const rangeFrom = dateRange?.from ?? new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const rangeTo = dateRange?.to ?? now;

  const [
    totalOrders,
    todayOrders,
    pendingSamples,
    statOrders,
    urgentOrders,
    completedToday,
    cancelledToday,
    revenueResult,
    tatBreach,
    statusBreakdown,
    paymentBreakdown,
    topTests,
    topDoctors,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: rangeFrom, lte: rangeTo } } }),
    prisma.order.count({ where: { createdAt: { gte: rangeFrom, lte: rangeTo } } }),
    prisma.order.count({ where: { orderStatus: "REGISTERED", sampleCollected: false } }),
    prisma.order.count({ where: { priority: "STAT", orderStatus: { notIn: ["COMPLETED", "CANCELLED"] } } }),
    prisma.order.count({ where: { priority: "URGENT", orderStatus: { notIn: ["COMPLETED", "CANCELLED"] } } }),
    prisma.order.count({ where: { orderStatus: "COMPLETED", createdAt: { gte: rangeFrom } } }),
    prisma.order.count({ where: { orderStatus: "CANCELLED", createdAt: { gte: rangeFrom } } }),
    prisma.order.aggregate({ _sum: { grandTotal: true, paidAmount: true, dueAmount: true }, where: { createdAt: { gte: rangeFrom, lte: rangeTo } } }),
    prisma.order.count({
      where: {
        orderStatus: { notIn: ["COMPLETED", "CANCELLED"] },
        createdAt: { lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.order.groupBy({ by: ["orderStatus"], _count: { _all: true }, where: { createdAt: { gte: rangeFrom } } }),
    prisma.order.groupBy({ by: ["paymentStatus"], _count: { _all: true }, where: { createdAt: { gte: rangeFrom } } }),
    prisma.orderItem.groupBy({
      by: ["testId"],
      _count: { _all: true },
      where: { order: { createdAt: { gte: rangeFrom } } },
      orderBy: { _count: { testId: "desc" } },
      take: 10,
    }),
    prisma.order.groupBy({
      by: ["doctorId"],
      _count: { _all: true },
      where: { doctorId: { not: null }, createdAt: { gte: rangeFrom } },
      orderBy: { _count: { doctorId: "desc" } },
      take: 10,
    }),
  ]);

  // Enrich topTests with test names
  const testIds = topTests.filter((t) => t.testId).map((t) => t.testId as string);
  const tests = await prisma.test.findMany({ where: { id: { in: testIds } }, select: { id: true, testName: true, testCode: true } });
  const enrichedTopTests = topTests.map((t) => ({
    ...t,
    test: tests.find((tt) => tt.id === t.testId),
  }));

  // Enrich topDoctors
  const doctorIds = topDoctors.filter((d) => d.doctorId).map((d) => d.doctorId as string);
  const doctors = await prisma.doctor.findMany({ where: { id: { in: doctorIds } }, select: { id: true, fullName: true, specialization: true } });
  const enrichedTopDoctors = topDoctors.map((d) => ({
    ...d,
    doctor: doctors.find((dd) => dd.id === d.doctorId),
  }));

  return {
    overview: {
      totalOrders,
      todayOrders,
      pendingSamples,
      statOrders,
      urgentOrders,
      completedToday,
      cancelledToday,
      tatBreachCount: tatBreach,
    },
    revenue: {
      totalBilled: Number(revenueResult._sum.grandTotal ?? 0),
      totalCollected: Number(revenueResult._sum.paidAmount ?? 0),
      totalPending: Number(revenueResult._sum.dueAmount ?? 0),
      collectionRate:
        revenueResult._sum.grandTotal && Number(revenueResult._sum.grandTotal) > 0
          ? Math.round((Number(revenueResult._sum.paidAmount ?? 0) / Number(revenueResult._sum.grandTotal)) * 100)
          : 0,
    },
    statusBreakdown: statusBreakdown.map((s) => ({ status: s.orderStatus, count: s._count._all })),
    paymentBreakdown: paymentBreakdown.map((p) => ({ status: p.paymentStatus, count: p._count._all })),
    topTests: enrichedTopTests,
    topDoctors: enrichedTopDoctors,
    generatedAt: now,
  };
};

// ─────────────────────────────────────────────────────────────
//  TAT (Turnaround Time) ANALYTICS
// ─────────────────────────────────────────────────────────────
export const getTATAnalytics = async () => {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const activeOrders = await prisma.order.findMany({
    where: {
      orderStatus: { notIn: ["COMPLETED", "CANCELLED"] },
      createdAt: { gte: last7Days },
    },
    select: {
      id: true,
      orderNumber: true,
      priority: true,
      orderStatus: true,
      createdAt: true,
      collectedAt: true,
      patient: { select: { firstName: true, lastName: true, uhid: true } },
      items: {
        include: { test: { select: { testName: true, tatHours: true } } },
      },
    },
  });

  const tatData = activeOrders.map((order) => {
    const ageHours = (now.getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
    const expectedTAT = order.priority === "STAT" ? 1 : order.priority === "URGENT" ? 4 : 24;
    const maxTestTAT = Math.max(...order.items.map((i) => (i.test as any)?.tatHours ?? 24));
    const finalTAT = Math.min(expectedTAT, maxTestTAT);
    const isBreached = ageHours > finalTAT;
    const percentComplete = Math.min(100, Math.round((ageHours / finalTAT) * 100));

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      priority: order.priority,
      status: order.orderStatus,
      ageHours: Math.round(ageHours * 10) / 10,
      expectedTATHours: finalTAT,
      isBreached,
      percentComplete,
      patient: order.patient,
      tests: order.items.map((i) => (i.test as any)?.testName).filter(Boolean),
    };
  });

  const breachedOrders = tatData.filter((o) => o.isBreached);
  const criticalOrders = tatData.filter((o) => o.percentComplete >= 80 && !o.isBreached);

  return {
    active: tatData.length,
    breached: breachedOrders.length,
    critical: criticalOrders.length,
    breachedOrders,
    criticalOrders,
    allActiveOrders: tatData,
  };
};

// ─────────────────────────────────────────────────────────────
//  HOURLY THROUGHPUT (for ops dashboards)
// ─────────────────────────────────────────────────────────────
export const getHourlyThroughput = async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: todayStart } },
    select: { createdAt: true, orderStatus: true },
  });

  const hourlyBuckets: Record<number, { registered: number; completed: number }> = {};
  for (let h = 0; h <= now.getHours(); h++) hourlyBuckets[h] = { registered: 0, completed: 0 };

  orders.forEach((o) => {
    const hour = new Date(o.createdAt).getHours();
    if (!hourlyBuckets[hour]) hourlyBuckets[hour] = { registered: 0, completed: 0 };
    hourlyBuckets[hour].registered += 1;
    if (o.orderStatus === "COMPLETED") hourlyBuckets[hour].completed += 1;
  });

  return Object.entries(hourlyBuckets).map(([hour, data]) => ({
    hour: `${hour.padStart(2, "0")}:00`,
    hourNum: parseInt(hour),
    ...data,
  }));
};

// ─────────────────────────────────────────────────────────────
//  BULK ESCALATE PRIORITY
// ─────────────────────────────────────────────────────────────
export const bulkEscalatePriority = async (orderIds: string[], priority: string) => {
  const updated = await prisma.order.updateMany({
    where: { id: { in: orderIds }, orderStatus: { notIn: ["COMPLETED", "CANCELLED"] } },
    data: { priority: priority as any },
  });
  return { updatedCount: updated.count };
};

// ─────────────────────────────────────────────────────────────
//  BULK STATUS UPDATE
// ─────────────────────────────────────────────────────────────
export const bulkUpdateStatus = async (orderIds: string[], status: string) => {
  const updated = await prisma.order.updateMany({
    where: { id: { in: orderIds }, orderStatus: { notIn: ["COMPLETED", "CANCELLED"] } },
    data: { orderStatus: status as any },
  });
  return { updatedCount: updated.count };
};

// ─────────────────────────────────────────────────────────────
//  PIPELINE VIEW DATA (Kanban-style by status)
// ─────────────────────────────────────────────────────────────
export const getOrderPipeline = async (dateFilter?: string) => {
  const now = new Date();
  let createdAtFilter: any = {};

  if (dateFilter === "today") {
    createdAtFilter = { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
  } else if (dateFilter === "week") {
    createdAtFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
  }

  const whereClause = Object.keys(createdAtFilter).length > 0 ? { createdAt: createdAtFilter } : {};

  const orders = await prisma.order.findMany({
    where: { ...whereClause, orderStatus: { notIn: ["CANCELLED"] } },
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      priority: true,
      createdAt: true,
      collectedAt: true,
      paymentStatus: true,
      grandTotal: true,
      paidAmount: true,
      patient: { select: { firstName: true, lastName: true, uhid: true, phone: true } },
      doctor: { select: { fullName: true, specialization: true } },
      items: { include: { test: { select: { testName: true, sampleType: true, tatHours: true } } } },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    take: 200,
  });

  const pipeline: Record<string, any[]> = {
    REGISTERED: [],
    SAMPLE_COLLECTED: [],
    PROCESSING: [],
    COMPLETED: [],
  };

  orders.forEach((o) => {
    if (pipeline[o.orderStatus]) {
      pipeline[o.orderStatus].push(o);
    }
  });

  return {
    pipeline,
    totals: {
      REGISTERED: pipeline.REGISTERED.length,
      SAMPLE_COLLECTED: pipeline.SAMPLE_COLLECTED.length,
      PROCESSING: pipeline.PROCESSING.length,
      COMPLETED: pipeline.COMPLETED.length,
    },
  };
};

// ─────────────────────────────────────────────────────────────
//  REVENUE BY DOCTOR / INSTITUTION (for commissions)
// ─────────────────────────────────────────────────────────────
export const getRevenueByDoctor = async (dateRange?: { from: Date; to: Date }) => {
  const now = new Date();
  const rangeFrom = dateRange?.from ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const rangeTo = dateRange?.to ?? now;

  const doctorRevenue = await prisma.order.groupBy({
    by: ["doctorId"],
    _sum: { grandTotal: true, paidAmount: true, dueAmount: true },
    _count: { _all: true },
    where: { doctorId: { not: null }, createdAt: { gte: rangeFrom, lte: rangeTo } },
    orderBy: { _sum: { grandTotal: "desc" } },
    take: 20,
  });

  const doctorIds = doctorRevenue.map((d) => d.doctorId as string);
  const doctors = await prisma.doctor.findMany({
    where: { id: { in: doctorIds } },
    select: { id: true, fullName: true, specialization: true, doctorCode: true, clinicName: true },
  });

  return doctorRevenue.map((row) => ({
    doctor: doctors.find((d) => d.id === row.doctorId),
    orderCount: row._count._all,
    totalBilled: Number(row._sum.grandTotal ?? 0),
    totalCollected: Number(row._sum.paidAmount ?? 0),
    totalPending: Number(row._sum.dueAmount ?? 0),
  }));
};
