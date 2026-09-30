import { z } from "zod";

export const resultValueSchema =
  z.object({
    parameterId: z
      .string()
      .uuid("Invalid parameter ID."),

    value: z
      .string()
      .trim()
      .min(
        1,
        "Result value is required."
      )
      .max(500),

    remark: z
      .string()
      .trim()
      .max(1000)
      .nullable()
      .optional()
      .default(null),
  });

export const enterResultSchema =
  z
    .object({
      orderId: z
        .string()
        .uuid("Invalid order ID."),

      testId: z
        .string()
        .uuid("Invalid test ID."),

      values: z
        .array(resultValueSchema)
        .min(
          1,
          "At least one result value is required."
        )
        .max(
          200,
          "Too many result values."
        ),

      remarks: z
        .string()
        .trim()
        .max(2000)
        .nullable()
        .optional()
        .default(null),

      interpretation: z
        .string()
        .trim()
        .max(5000)
        .nullable()
        .optional()
        .default(null),
    })
    .superRefine((data, ctx) => {
      const parameterIds =
        data.values.map(
          (item) =>
            item.parameterId
        );

      const uniqueParameterIds =
        new Set(parameterIds);

      if (
        uniqueParameterIds.size !==
        parameterIds.length
      ) {
        ctx.addIssue({
          code:
            z.ZodIssueCode.custom,
          path: ["values"],
          message:
            "The same parameter cannot be submitted twice.",
        });
      }
    });

export const resultIdSchema = z.object({
  id: z
    .string()
    .uuid("Invalid result ID."),
});

export type EnterResultInput = z.infer<
  typeof enterResultSchema
>;

export type ResultValueInput = z.infer<
  typeof resultValueSchema
>;