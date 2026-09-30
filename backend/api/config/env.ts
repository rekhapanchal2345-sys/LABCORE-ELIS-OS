import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT || 5000),

  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",

  DATABASE_URL: requireEnv("DATABASE_URL"),

  JWT_SECRET: requireEnv("JWT_SECRET"),

  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS || 12),

  GST_PERCENTAGE: Number(process.env.GST_PERCENTAGE || 18),

  // ─── ABDM (Ayushman Bharat Digital Mission) ───────────────────────────────
  /** Set to "false" to use live ABDM sandbox/production. Default: "true" (mock mode). */
  ABDM_MOCK_MODE: process.env.ABDM_MOCK_MODE ?? "true",
  /** "sandbox" or "production" */
  ABDM_ENV: process.env.ABDM_ENV ?? "sandbox",
  ABDM_CLIENT_ID: process.env.ABDM_CLIENT_ID ?? "",
  ABDM_CLIENT_SECRET: process.env.ABDM_CLIENT_SECRET ?? "",
  ABDM_HIP_ID: process.env.ABDM_HIP_ID ?? "TEST_HIP_001",
  ABDM_HIU_ID: process.env.ABDM_HIU_ID ?? "",
  ABDM_CALLBACK_URL: process.env.ABDM_CALLBACK_URL ?? "https://your-lab-domain.com/api/abdm/v0.5",
  // Lab metadata used in FHIR bundles
  LAB_NAME: process.env.LAB_NAME ?? "LabCore Diagnostics",
  LAB_REGISTRATION_NUMBER: process.env.LAB_REGISTRATION_NUMBER ?? "",
  LAB_NABL_NUMBER: process.env.LAB_NABL_NUMBER ?? "",
  LAB_ADDRESS: process.env.LAB_ADDRESS ?? "",
  LAB_PHONE: process.env.LAB_PHONE ?? "",
  LAB_STATE_CODE: process.env.LAB_STATE_CODE ?? "MH",
} as const;

export default env;