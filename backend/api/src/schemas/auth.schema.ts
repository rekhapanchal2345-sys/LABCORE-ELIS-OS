import { z } from "zod";

const loginBodySchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or employee code is required.")
    .max(150),

  password: z
    .string()
    .min(1, "Password is required.")
    .max(200),
});

export const loginSchema = {
  body: loginBodySchema,
};

export const refreshTokenSchema = {
  body: z.object({
    refreshToken: z
      .string()
      .trim()
      .min(1, "Refresh token is required."),
  }),
};

export type LoginInput = z.infer<
  typeof loginSchema.body
>;

export type RefreshTokenInput = z.infer<
  typeof refreshTokenSchema.body
>;