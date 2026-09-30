import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// =======================================================
// ROUTES
// =======================================================

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import patientRoutes from "./modules/patients/patient.routes";
import doctorRoutes from "./modules/doctors/doctor.routes";
import testRoutes from "./modules/tests/test.routes";
import orderRoutes from "./modules/orders/order.routes";
import sampleRoutes from "./modules/samples/sample.routes";
import invoiceRoutes from "./modules/invoices/invoice.routes";
import paymentRoutes from "./modules/payments/payment.routes";
import advanceRoutes from "./modules/advances/advance.routes";
import refundRoutes from "./modules/refunds/refund.routes";
import cashCounterRoutes from "./modules/cash-counter/cash-counter.routes";
import settlementRoutes from "./modules/settlements/settlement.routes";
import receivableRoutes from "./modules/receivables/receivable.routes";
import resultRoutes from "./modules/results/result.routes";
import approvalRoutes from "./modules/approvals/approval.routes";
import reportRoutes from "./modules/reports/report.routes";
import analyzerRoutes from "./modules/analyzers/analyzer.routes";
import auditRoutes from "./modules/audit/audit.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import communicationRoutes from "./modules/communications/communication.routes";
import laboratorySettingsRoutes from "./modules/settings/laboratory-settings.routes";
import notificationTemplateRoutes from "./modules/notifications/notification-template.routes";
import backupRoutes from "./modules/backup/backup.routes";
import barcodeRoutes from "./modules/barcode/barcode.routes";
import abdmRoutes, { abdmWebhookRouter } from "./modules/abdm/abdm.routes";

// =======================================================
// MIDDLEWARE
// =======================================================

import { errorMiddleware } from "../middleware/error.middleware";

// =======================================================
// EXPRESS APPLICATION
// =======================================================

const app = express();

// Only trust the configured number of reverse proxies (0 by default) so that
// req.ip and rate limiting cannot be spoofed with X-Forwarded-For.
app.set(
  "trust proxy",
  Number(process.env.TRUST_PROXY_HOPS || 0) || false
);

// =======================================================
// SECURITY
// =======================================================

app.use(helmet() as any);

// =======================================================
// CORS
// =======================================================

const normalizeOrigin = (value: string) => value.trim().replace(/\/+$/, "");

const allowedOrigins = new Set(
  String(process.env.CORS_ORIGINS || "")
    .split(",")
    .filter(Boolean)
    .map(normalizeOrigin)
);

const LOCAL_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|(192\.168|10)\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d{1,5})?$/;

const isAllowedOrigin = (origin: string): boolean =>
  allowedOrigins.has(normalizeOrigin(origin)) ||
  (process.env.NODE_ENV !== "production" && LOCAL_ORIGIN.test(origin));

app.use(
  cors({
    origin(origin, callback) {
      // No origin: same-origin navigation, curl, mobile and server-to-server calls.
      if (!origin || isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      // Without CORS headers the browser blocks the call; no server error.
      return callback(null, false);
    },
    credentials: true,
  })
);

// =======================================================
// REQUEST BODY
// =======================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// =======================================================
// HTTP LOGGER
// =======================================================

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// =======================================================
// ROOT & HEALTH CHECK
// =======================================================

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "LabCore ELIS API is running",
    service: "LabCore Enterprise Laboratory Information System",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "LabCore ELIS API is running",
    service: "LabCore Enterprise Laboratory Information System",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// =======================================================
// API ROOT
// =======================================================

app.get("/api", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to LabCore ELIS API",
    version: "1.0.0",

    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      patients: "/api/patients",
      doctors: "/api/doctors",
      tests: "/api/tests",
      orders: "/api/orders",
      samples: "/api/samples",
      invoices: "/api/invoices",
      payments: "/api/payments",
      advances: "/api/advances",
      refunds: "/api/refunds",
      "cash-counter": "/api/cash-counter",
      settlements: "/api/settlements",
      receivables: "/api/receivables",
      results: "/api/results",
      approvals: "/api/approvals",
      reports: "/api/reports",
      analyzers: "/api/analyzers",
      audit: "/api/audit",
      dashboard: "/api/dashboard",
      communications: "/api/communications",
      settings: "/api/settings/laboratory",
      notifications: "/api/notifications/templates",
      backups: "/api/backups",
      barcodes: "/api/barcodes",
    },
  });
});

// =======================================================
// AUTH
// =======================================================

app.use("/api/auth", authRoutes);

// =======================================================
// USERS
// =======================================================

app.use("/api/users", userRoutes);

// =======================================================
// PATIENTS
// =======================================================

app.use("/api/patients", patientRoutes);

// =======================================================
// DOCTORS
// =======================================================

app.use("/api/doctors", doctorRoutes);

// =======================================================
// TESTS
// =======================================================

app.use("/api/tests", testRoutes);

// =======================================================
// ORDERS
// =======================================================

app.use("/api/orders", orderRoutes);

// =======================================================
// SAMPLES
// =======================================================

app.use("/api/samples", sampleRoutes);

// =======================================================
// INVOICES
// =======================================================

app.use("/api/invoices", invoiceRoutes);

// =======================================================
// PAYMENTS
// =======================================================

app.use("/api/payments", paymentRoutes);

// =======================================================
// ADVANCES & WALLET
// =======================================================

app.use("/api/advances", advanceRoutes);

// =======================================================
// REFUNDS
// =======================================================

app.use("/api/refunds", refundRoutes);

// =======================================================
// CASH COUNTER
// =======================================================

app.use("/api/cash-counter", cashCounterRoutes);

// =======================================================
// SETTLEMENTS & RECONCILIATION
// =======================================================

app.use("/api/settlements", settlementRoutes);

// =======================================================
// RECEIVABLES & CORPORATE BILLING
// =======================================================

app.use("/api/receivables", receivableRoutes);

// =======================================================
// RESULTS
// =======================================================

app.use("/api/results", resultRoutes);

// =======================================================
// APPROVALS
// =======================================================

app.use("/api/approvals", approvalRoutes);

// =======================================================
// REPORTS
// =======================================================

app.use("/api/reports", reportRoutes);

// =======================================================
// ANALYZERS
// ASTM / HL7
// =======================================================

app.use("/api/analyzers", analyzerRoutes);

// =======================================================
// AUDIT
// =======================================================

app.use("/api/audit", auditRoutes);

// =======================================================
// DASHBOARD
// =======================================================

app.use("/api/dashboard", dashboardRoutes);

// =======================================================
// COMMUNICATIONS
// =======================================================

app.use("/api/communications", communicationRoutes);

// =======================================================
// SETTINGS
// =======================================================

app.use("/api/settings/laboratory", laboratorySettingsRoutes);

// =======================================================
// NOTIFICATION TEMPLATES
// =======================================================

app.use("/api/notifications/templates", notificationTemplateRoutes);

// =======================================================
// BACKUP & RESTORE
// =======================================================

app.use("/api/backups", backupRoutes);

// =======================================================
// BARCODES
// =======================================================

app.use("/api/barcodes", barcodeRoutes);

// =======================================================
// ABDM (Ayushman Bharat Digital Mission)
// =======================================================

app.use("/api/abdm", abdmRoutes);

// ABDM Gateway Webhooks (open endpoint — ABDM Gateway posts here)
app.use("/v0.5", abdmWebhookRouter);
app.use("/api/v0.5", abdmWebhookRouter);         // for Next.js /api/* proxy (simulator)
app.use("/api/abdm/v0.5", abdmWebhookRouter);

// =======================================================
// 404 HANDLER
// =======================================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// =======================================================
// GLOBAL ERROR HANDLER
// =======================================================
/**
 * -----------------------------------------
 * GLOBAL ERROR HANDLER
 *
 * IMPORTANT:
 * This must always be the LAST middleware.
 * -----------------------------------------
 */

app.use(errorMiddleware);

// =======================================================
// EXPORT
// =======================================================

export default app;