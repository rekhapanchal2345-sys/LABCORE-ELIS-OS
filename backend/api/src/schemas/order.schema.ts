import { z } from "zod";

export const createOrderItemSchema =
  z.object({
    testId: z
      .string()
      .uuid("Invalid test ID."),

    discount: z
      .number()
      .finite()
      .min(0)
      .default(0),
  });

export const createOrderSchema = z
  .object({
    patientId: z
      .string()
      .uuid("Invalid patient ID."),

    doctorId: z
      .string()
      .uuid("Invalid doctor ID.")
      .nullable()
      .optional()
      .default(null),

    notes: z
      .string()
      .trim()
      .max(1000)
      .nullable()
      .optional()
      .default(null),

    discount: z
      .number()
      .finite()
      .min(0)
      .default(0),

    discountCode: z
      .string()
      .trim()
      .max(50)
      .nullable()
      .optional()
      .default(null),

    paidAmount: z
      .number()
      .finite()
      .min(0)
      .default(0),

    collectionType: z
      .enum(["WALK_IN", "HOME_COLLECTION"])
      .nullable()
      .optional()
      .default(null),

    priority: z
      .enum(["ROUTINE", "URGENT", "STAT"])
      .nullable()
      .optional()
      .default("ROUTINE"),

    homeCollectionAddress: z
      .string()
      .trim()
      .max(500)
      .nullable()
      .optional()
      .default(null),

    collectedById: z
      .string()
      .uuid("Invalid collected by ID.")
      .nullable()
      .optional()
      .default(null),

    reportDeliveryWhatsApp: z
      .boolean()
      .optional()
      .default(false),

    reportDeliveryEmail: z
      .boolean()
      .optional()
      .default(false),

    reportDeliveryPrinted: z
      .boolean()
      .optional()
      .default(false),

    reportDeliveryPortal: z
      .boolean()
      .optional()
      .default(false),

    items: z
      .array(createOrderItemSchema)
      .min(
        1,
        "At least one test is required."
      )
      .max(
        100,
        "Maximum 100 tests are allowed in one order."
      ),
  })
  .superRefine((data, ctx) => {
    const testIds = data.items.map(
      (item) => item.testId
    );

    const uniqueTestIds = new Set(testIds);

    if (
      uniqueTestIds.size !==
      testIds.length
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message:
          "The same test cannot be added twice.",
      });
    }
  });

export const orderIdSchema = z.object({
  id: z
    .string()
    .uuid("Invalid order ID."),
});

export type CreateOrderInput = z.infer<
  typeof createOrderSchema
>;