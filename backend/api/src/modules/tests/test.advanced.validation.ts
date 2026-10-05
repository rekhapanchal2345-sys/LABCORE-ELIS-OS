import { z } from "zod";

// =======================================================
// DUPLICATE CHECK
// =======================================================

export const checkDuplicateSchema = z
  .object({
    testCode: z.string().min(1).max(50).optional(),
    testName: z.string().min(1).max(200).optional(),
  })
  .refine((data) => data.testCode || data.testName, {
    message: "Provide testCode or testName",
  });

// =======================================================
// TEST CLONE
// =======================================================

export const cloneTestSchema = z.object({
  testCode: z.string().min(2).max(50),
  suffix: z.string().max(50).optional(),
});

// =======================================================
// BULK OPERATIONS
// =======================================================

export const bulkPriceUpdateSchema = z
  .object({
    testIds: z.array(z.string().cuid()).min(1).optional(),
    categoryId: z.string().cuid().optional(),
    sampleType: z.string().max(50).optional(),
    adjustmentType: z.enum(["PERCENTAGE", "FIXED"]),
    adjustmentValue: z.coerce.number(),
    applyToB2bRate: z.boolean().optional(),
    roundTo: z.coerce.number().positive().optional(),
  })
  .refine(
    (data) => (data.testIds?.length ?? 0) > 0 || data.categoryId || data.sampleType,
    { message: "Provide at least one scope: testIds, categoryId or sampleType" }
  );

export const bulkToggleActiveSchema = z.object({
  testIds: z.array(z.string().cuid()).min(1),
  isActive: z.boolean(),
});

export const bulkDeleteSchema = z.object({
  testIds: z.array(z.string().cuid()).min(1),
});

export const reorderTestsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().cuid(),
        displayOrder: z.coerce.number().int().min(0),
      })
    )
    .min(1)
    .max(500),
});

// =======================================================
// ANALYTICS
// =======================================================

export const testAnalyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// =======================================================
// PACKAGE AUTO-PRICING
// =======================================================

export const recalculatePackagePricingSchema = z.object({
  marginPercentage: z.coerce.number().min(0).max(90).default(0),
  gstPercentage: z.coerce.number().min(0).max(100).optional(),
});
