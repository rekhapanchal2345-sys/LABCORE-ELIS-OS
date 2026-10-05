import { Prisma } from "@prisma/client";
import prisma from "../../../config/database";
import { HttpError } from "../../utils/http-error";
import { createAuditLog } from "../audit/audit.service";

/**
 * Premium Test Catalog Service
 * Bulk operations, cloning, duplicate detection, catalog analytics
 * and automated package pricing. Built on top of the existing
 * Test / TestCategory / TestPackage models (no schema changes).
 */

const notFound = (what: string) =>
  new HttpError(`${what} not found`, 404, `${what.toUpperCase().replace(/\s+/g, "_")}_NOT_FOUND`);

type AuditPayload = Omit<Parameters<typeof createAuditLog>[0], "module">;

const logAudit = (payload: AuditPayload) =>
  createAuditLog({ ...payload, module: "TESTS" }).catch((error) =>
    console.error("Audit log failed for tests module:", error)
  );

const toNumber = (value: unknown): number => Number(value ?? 0);

// ====================
// DUPLICATE DETECTION
// ====================

export const checkTestDuplicate = async (data: {
  testCode?: string;
  testName?: string;
}) => {
  const code = data.testCode?.trim();
  const name = data.testName?.trim();

  if (!code && !name) {
    throw new HttpError("Provide testCode or testName to check", 400, "CHECK_INPUT_REQUIRED");
  }

  const [byCode, byName] = await Promise.all([
    code
      ? prisma.test.findFirst({ where: { testCode: { equals: code, mode: "insensitive" } } })
      : null,
    name
      ? prisma.test.findFirst({ where: { testName: { equals: name, mode: "insensitive" } } })
      : null,
  ]);

  return {
    isDuplicate: Boolean(byCode || byName),
    matches: {
      byCode: byCode
        ? { id: byCode.id, testCode: byCode.testCode, testName: byCode.testName, isActive: byCode.isActive }
        : null,
      byName: byName
        ? { id: byName.id, testCode: byName.testCode, testName: byName.testName, isActive: byName.isActive }
        : null,
    },
  };
};

// ====================
// TEST CLONING
// ====================

export const cloneTest = async (
  testId: string,
  data: { testCode: string; suffix?: string },
  actorId?: string
) => {
  const source = await prisma.test.findUnique({
    where: { id: testId },
    include: {
      parameters: {
        include: { referenceRanges: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!source) throw notFound("Test");

  const existing = await prisma.test.findUnique({ where: { testCode: data.testCode } });
  if (existing) {
    throw new HttpError("Test code already exists", 409, "TEST_CODE_EXISTS");
  }

  const clone = await prisma.$transaction(async (tx) => {
    const created = await tx.test.create({
      data: {
        testCode: data.testCode,
        testName: data.suffix ? `${source.testName} ${data.suffix}` : `${source.testName} (Copy)`,
        shortName: source.shortName,
        categoryId: source.categoryId,
        sampleType: source.sampleType,
        sampleContainer: source.sampleContainer,
        sampleVolume: source.sampleVolume,
        processingDepartment: source.processingDepartment,
        method: source.method,
        description: source.description,
        clinicalSignificance: source.clinicalSignificance,
        patientPreparation: source.patientPreparation,
        price: source.price,
        offerPrice: source.offerPrice,
        b2bRate: source.b2bRate,
        gstPercentage: source.gstPercentage,
        tatHours: source.tatHours,
        tatDisplay: source.tatDisplay,
        displayOrder: source.displayOrder,
        deltaCheckEnabled: source.deltaCheckEnabled,
        deltaCheckAbsThreshold: source.deltaCheckAbsThreshold,
        deltaThresholdPercentage: source.deltaThresholdPercentage,
        isActive: false, // cloned tests start inactive for safety
      },
    });

    for (const param of source.parameters) {
      const { referenceRanges, ...paramData } = param;
      const newParam = await tx.testParameter.create({
        data: {
          testId: created.id,
          parameterName: paramData.parameterName,
          shortName: paramData.shortName,
          unit: paramData.unit,
          dataType: paramData.dataType,
          measurementMethod: paramData.measurementMethod,
          dropdownOptions: paramData.dropdownOptions,
          allowRichText: paramData.allowRichText,
          decimalPrecision: paramData.decimalPrecision,
          displayOrder: paramData.displayOrder,
          isRequired: paramData.isRequired,
          isActive: true,
        },
      });

      for (const range of referenceRanges) {
        await tx.referenceRange.create({
          data: {
            parameterId: newParam.id,
            gender: range.gender,
            ageGroup: range.ageGroup,
            minAge: range.minAge,
            maxAge: range.maxAge,
            minAgeUnit: range.minAgeUnit,
            maxAgeUnit: range.maxAgeUnit,
            criticalLow: range.criticalLow,
            normalLow: range.normalLow,
            normalHigh: range.normalHigh,
            criticalHigh: range.criticalHigh,
            interpretation: range.interpretation,
            notes: range.notes,
            displayOrder: range.displayOrder,
            isActive: true,
          },
        });
      }
    }

    return tx.test.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        category: true,
        parameters: { include: { referenceRanges: true }, orderBy: { displayOrder: "asc" } },
      },
    });
  });

  await logAudit({
    userId: actorId,
    action: "CLONE_TEST",
    recordId: clone.id,
    newData: { sourceTestId: testId, testCode: clone.testCode },
  });

  return clone;
};

// ====================
// BULK OPERATIONS
// ====================

export interface BulkResult {
  matched: number;
  updated: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

export const bulkUpdatePrices = async (
  data: {
    testIds?: string[];
    categoryId?: string;
    sampleType?: string;
    adjustmentType: "PERCENTAGE" | "FIXED";
    adjustmentValue: number;
    applyToB2bRate?: boolean;
    roundTo?: number;
  },
  actorId?: string
): Promise<BulkResult> => {
  const value = Number(data.adjustmentValue);
  if (!Number.isFinite(value)) {
    throw new HttpError("adjustmentValue must be a number", 400, "INVALID_ADJUSTMENT");
  }

  const where: Prisma.TestWhereInput = { isActive: true };
  if (data.testIds?.length) where.id = { in: data.testIds };
  if (data.categoryId) where.categoryId = data.categoryId;
  if (data.sampleType) where.sampleType = data.sampleType as never;

  if (!data.testIds?.length && !data.categoryId && !data.sampleType) {
    throw new HttpError(
      "Provide at least one scope: testIds, categoryId or sampleType",
      400,
      "BULK_SCOPE_REQUIRED"
    );
  }

  const tests = await prisma.test.findMany({
    where,
    select: { id: true, price: true, b2bRate: true },
  });

  const result: BulkResult = { matched: tests.length, updated: 0, failed: 0, errors: [] };

  const round = (n: number) => {
    if (data.roundTo && data.roundTo > 0) {
      const factor = data.roundTo;
      return Math.round(n / factor) * factor;
    }
    return Math.round(n * 100) / 100;
  };

  for (const test of tests) {
    try {
      const currentPrice = toNumber(test.price);
      const newPrice =
        data.adjustmentType === "PERCENTAGE"
          ? round(currentPrice * (1 + value / 100))
          : round(currentPrice + value);

      if (newPrice < 0) throw new Error("Resulting price cannot be negative");

      const updateData: Prisma.TestUpdateInput = { price: newPrice };

      if (data.applyToB2bRate && test.b2bRate !== null) {
        const currentB2b = toNumber(test.b2bRate);
        const newB2b =
          data.adjustmentType === "PERCENTAGE"
            ? round(currentB2b * (1 + value / 100))
            : round(currentB2b + value);
        if (newB2b < 0) throw new Error("Resulting b2bRate cannot be negative");
        updateData.b2bRate = newB2b;
      }

      // Keep offer price from exceeding the new price.
      const testFull = await prisma.test.findUnique({
        where: { id: test.id },
        select: { offerPrice: true },
      });
      if (testFull?.offerPrice !== null && toNumber(testFull?.offerPrice) > newPrice) {
        updateData.offerPrice = newPrice;
      }

      await prisma.test.update({ where: { id: test.id }, data: updateData });
      result.updated++;
    } catch (error: any) {
      result.failed++;
      result.errors.push({ id: test.id, error: error.message });
    }
  }

  await logAudit({
    userId: actorId,
    action: "BULK_UPDATE_PRICES",
    newData: { ...data, matched: result.matched, updated: result.updated, failed: result.failed },
  });

  return result;
};

export const bulkToggleActive = async (
  data: { testIds: string[]; isActive: boolean },
  actorId?: string
): Promise<BulkResult> => {
  if (!data.testIds?.length) {
    throw new HttpError("testIds is required", 400, "TEST_IDS_REQUIRED");
  }

  const update = await prisma.test.updateMany({
    where: { id: { in: data.testIds } },
    data: { isActive: data.isActive },
  });

  await logAudit({
    userId: actorId,
    action: data.isActive ? "BULK_ACTIVATE_TESTS" : "BULK_DEACTIVATE_TESTS",
    newData: { testIds: data.testIds, count: update.count },
  });

  return {
    matched: data.testIds.length,
    updated: update.count,
    failed: data.testIds.length - update.count,
    errors: [],
  };
};

export const bulkDeleteTests = async (
  data: { testIds: string[] },
  actorId?: string
): Promise<BulkResult> => {
  if (!data.testIds?.length) {
    throw new HttpError("testIds is required", 400, "TEST_IDS_REQUIRED");
  }

  const result: BulkResult = { matched: data.testIds.length, updated: 0, failed: 0, errors: [] };

  const tests = await prisma.test.findMany({
    where: { id: { in: data.testIds } },
    select: {
      id: true,
      _count: { select: { orderItems: true, results: true, samples: true, packageItems: true } },
    },
  });

  for (const test of tests) {
    const usage = test._count;
    if (usage.orderItems > 0 || usage.results > 0 || usage.samples > 0 || usage.packageItems > 0) {
      result.failed++;
      result.errors.push({
        id: test.id,
        error: "Used in orders/results/samples/packages. Deactivate instead.",
      });
      continue;
    }
    try {
      await prisma.test.delete({ where: { id: test.id } });
      result.updated++;
    } catch (error: any) {
      result.failed++;
      result.errors.push({ id: test.id, error: error.message });
    }
  }

  await logAudit({
    userId: actorId,
    action: "BULK_DELETE_TESTS",
    newData: { requested: result.matched, deleted: result.updated, failed: result.failed },
  });

  return result;
};

export const reorderTests = async (
  data: { items: Array<{ id: string; displayOrder: number }> },
  actorId?: string
) => {
  if (!data.items?.length) {
    throw new HttpError("items with id and displayOrder are required", 400, "ITEMS_REQUIRED");
  }

  await prisma.$transaction(
    data.items.map((item) =>
      prisma.test.update({
        where: { id: item.id },
        data: { displayOrder: Math.trunc(Number(item.displayOrder) || 0) },
      })
    )
  );

  await logAudit({
    userId: actorId,
    action: "REORDER_TESTS",
    newData: { count: data.items.length },
  });

  return { reordered: data.items.length };
};

// ====================
// CATALOG ANALYTICS
// ====================

const toDateOnly = (value: unknown, fallback: Date, label: string) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    throw new HttpError(`Invalid ${label} date`, 400, "INVALID_DATE");
  }
  return parsed;
};

export const getTestAnalytics = async (
  startDate?: string,
  endDate?: string,
  limit = 10
) => {
  const start = toDateOnly(startDate, new Date(Date.now() - 90 * 86400000), "startDate");
  const end = toDateOnly(endDate, new Date(), "endDate");

  if (start.getTime() > end.getTime()) {
    throw new HttpError("startDate cannot be after endDate", 400, "INVALID_DATE_RANGE");
  }

  const take = Math.min(50, Math.max(1, Math.trunc(Number(limit) || 10)));
  const orderItemWhere = { createdAt: { gte: start, lte: end }, testId: { not: null } };

  const [totalTests, activeTests, totalCategories, activePackages, topOrdered, sampleTypeRows, categoryRows] =
    await Promise.all([
      prisma.test.count(),
      prisma.test.count({ where: { isActive: true } }),
      prisma.testCategory.count({ where: { isActive: true } }),
      prisma.testPackage.count({ where: { isActive: true } }),
      prisma.orderItem.groupBy({
        by: ["testId"],
        where: orderItemWhere,
        _count: true,
        _sum: { finalPrice: true },
        orderBy: { _count: { testId: "desc" } },
        take,
      }),
      prisma.test.groupBy({
        by: ["sampleType"],
        where: { isActive: true },
        _count: true,
      }),
      prisma.test.groupBy({
        by: ["categoryId"],
        where: { isActive: true },
        _count: true,
        _avg: { price: true },
      }),
    ]);

  const topIds = topOrdered.map((row) => row.testId!).filter(Boolean);
  const topTests = topIds.length
    ? await prisma.test.findMany({
        where: { id: { in: topIds } },
        select: { id: true, testCode: true, testName: true, price: true, category: { select: { name: true } } },
      })
    : [];
  const testMap = new Map(topTests.map((t) => [t.id, t]));

  const mostOrderedTests = topOrdered.map((row) => {
    const test = testMap.get(row.testId!);
    return {
      testId: row.testId,
      testCode: test?.testCode ?? null,
      testName: test?.testName ?? null,
      categoryName: test?.category?.name ?? null,
      orderCount: Number(row._count ?? 0),
      revenue: toNumber(row._sum.finalPrice),
    };
  });

  // Price insight per category
  const categoryIds = categoryRows.map((row) => row.categoryId).filter((id): id is string => Boolean(id));
  const categories = categoryIds.length
    ? await prisma.testCategory.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true } })
    : [];
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const priceByCategory = categoryRows.map((row) => ({
    categoryId: row.categoryId,
    categoryName: row.categoryId ? categoryMap.get(row.categoryId) ?? null : "Uncategorised",
    testCount: Number(row._count ?? 0),
    averagePrice: Math.round(toNumber(row._avg.price) * 100) / 100,
  }));

  // Catalog completeness — a premium catalog has parameters and clinical info.
  const [withoutParameters, withoutCategory, withoutClinicalInfo] = await Promise.all([
    prisma.test.count({ where: { isActive: true, parameters: { none: {} } } }),
    prisma.test.count({ where: { isActive: true, categoryId: null } }),
    prisma.test.count({
      where: {
        isActive: true,
        OR: [{ clinicalSignificance: null }, { patientPreparation: null }],
      },
    }),
  ]);

  const activeCount = activeTests || 1;
  const completenessScore = Math.max(
    0,
    Math.round(
      100 *
        (1 -
          (withoutParameters * 0.4 + withoutCategory * 0.3 + withoutClinicalInfo * 0.3) /
            activeCount)
    )
  );

  const sampleTypeDistribution = Object.fromEntries(
    sampleTypeRows.map((row) => [String(row.sampleType), Number(row._count ?? 0)])
  );

  return {
    summary: {
      totalTests,
      activeTests,
      inactiveTests: totalTests - activeTests,
      totalCategories,
      activePackages,
      completenessScore,
      dateRange: { start, end },
    },
    mostOrderedTests,
    sampleTypeDistribution,
    priceByCategory,
    catalogGaps: {
      testsWithoutParameters: withoutParameters,
      testsWithoutCategory: withoutCategory,
      testsWithoutClinicalInfo: withoutClinicalInfo,
    },
  };
};

// ====================
// PACKAGE AUTO-PRICING
// ====================

export const recalculatePackagePricing = async (
  packageId: string,
  data: { marginPercentage?: number; gstPercentage?: number },
  actorId?: string
) => {
  const testPackage = await prisma.testPackage.findUnique({
    where: { id: packageId },
    include: { items: { include: { test: { select: { price: true } } } } },
  });

  if (!testPackage) throw notFound("Test package");
  if (testPackage.items.length === 0) {
    throw new HttpError("Package has no items to price", 400, "PACKAGE_EMPTY");
  }

  const sumOfTests = testPackage.items.reduce(
    (sum, item) => sum + toNumber(item.testPrice ?? item.test.price),
    0
  );

  const margin = Number(data.marginPercentage ?? 0);
  if (!Number.isFinite(margin) || margin < 0 || margin > 90) {
    throw new HttpError("marginPercentage must be between 0 and 90", 400, "INVALID_MARGIN");
  }

  const suggestedPrice = Math.round(sumOfTests * (1 - margin / 100) * 100) / 100;
  const savings = Math.round((sumOfTests - suggestedPrice) * 100) / 100;
  const savingsPercentage = sumOfTests > 0 ? Math.round((savings / sumOfTests) * 10000) / 100 : 0;

  const updateData: Prisma.TestPackageUpdateInput = {
    totalPrice: sumOfTests,
    offerPrice: suggestedPrice,
    discountPercentage: savingsPercentage,
  };
  if (data.gstPercentage !== undefined) {
    updateData.gstPercentage = Number(data.gstPercentage) as never;
  }

  const updated = await prisma.testPackage.update({
    where: { id: packageId },
    data: updateData,
  });

  await logAudit({
    userId: actorId,
    action: "RECALCULATE_PACKAGE_PRICING",
    recordId: packageId,
    oldData: { totalPrice: toNumber(testPackage.totalPrice), offerPrice: testPackage.offerPrice ? toNumber(testPackage.offerPrice) : null },
    newData: { totalPrice: sumOfTests, offerPrice: suggestedPrice, marginPercentage: margin },
  });

  return {
    packageId,
    packageName: updated.packageName,
    sumOfTestPrices: Math.round(sumOfTests * 100) / 100,
    suggestedOfferPrice: suggestedPrice,
    savings,
    savingsPercentage,
    itemCount: testPackage.items.length,
  };
};
