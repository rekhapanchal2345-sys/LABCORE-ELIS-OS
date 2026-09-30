import { Router, Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import prisma from "../../../config/database";

import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  orderReport,
  patientReports,
  publishedReports,
  summary,
  createAddendum,
  applySignature,
  inlineApprove,
  inlineReject,
  generateShareLink,
  validateShareLink,
  revokeShareLink,
  addToHistory,
  patientTimeline,
  amendReportHandler,
  sendReportToDoctorHandler,
} from "./report.controller";

import {
  orderReportSchema,
  patientReportSchema,
  reportQuerySchema,
  addendumSchema,
  signatureSchema,
  inlineApproveSchema,
  inlineRejectSchema,
  shareLinkSchema,
  patientHistorySchema,
  amendSchema,
  sendDoctorSchema,
} from "./report.validation";

const router = Router();

router.use(
  authenticate
);

// =======================================================
// REPORT SUMMARY
// =======================================================

router.get(
  "/summary",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST
  ),
  summary
);

// =======================================================
// PUBLISHED REPORTS
// =======================================================

router.get(
  "/published",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    query: reportQuerySchema,
  }),
  publishedReports
);

// =======================================================
// ORDER REPORT
// =======================================================

router.get(
  "/order/:orderId",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    params: orderReportSchema,
  }),
  orderReport
);

// =======================================================
// GET REPORT BY ID
// =======================================================

router.get(
  "/:id",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // Fetch the report by ID
      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          patient: true,
          order: {
            include: {
              doctor: true,
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
              results: {
                where: {
                  status: "PUBLISHED",
                },
                include: {
                  test: true,
                  values: {
                    include: {
                      parameter: true,
                    },
                  },
                  enteredBy: {
                    select: {
                      id: true,
                      fullName: true,
                      employeeCode: true,
                    },
                  },
                  approvedBy: {
                    select: {
                      id: true,
                      fullName: true,
                      employeeCode: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: "asc",
                },
              },
              invoice: true,
              payments: {
                orderBy: {
                  paidAt: "desc",
                },
              },
            },
          },
          publishedBy: {
            select: {
              id: true,
              fullName: true,
              employeeCode: true,
            },
          },
        },
      });

      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Report fetched successfully",
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }
);

// =======================================================
// PATIENT REPORTS
// =======================================================

router.get(
  "/patient/:patientId",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    params: patientReportSchema,
  }),
  patientReports
);

// =======================================================
// PREMIUM REPORT ACTIONS
// =======================================================

// Create Report Addendum
router.post(
  "/:id/addendum",
  authorize(
    UserRole.ADMIN,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    body: addendumSchema,
  }),
  createAddendum
);

// Apply Digital Signature
router.post(
  "/:id/signature",
  authorize(
    UserRole.ADMIN,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    body: signatureSchema,
  }),
  applySignature
);

// Inline Approve Report
router.post(
  "/:id/approve-inline",
  authorize(
    UserRole.ADMIN,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    body: inlineApproveSchema,
  }),
  inlineApprove
);

// Inline Reject Report
router.post(
  "/:id/reject-inline",
  authorize(
    UserRole.ADMIN,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    body: inlineRejectSchema,
  }),
  inlineReject
);

// Generate Shareable Link
router.post(
  "/:id/share-link",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    body: shareLinkSchema,
  }),
  generateShareLink
);

// Validate Shareable Link (Public Access)
router.get(
  "/share/:token",
  validateShareLink
);

// Revoke Shareable Link
router.delete(
  "/share/:linkId",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  revokeShareLink
);

// Add to Patient History
router.post(
  "/:id/patient-history",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    body: patientHistorySchema,
  }),
  addToHistory
);

// Get Patient Timeline
router.get(
  "/patient/:patientId/timeline",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  patientTimeline
);

// =======================================================
// AMEND REPORT
// =======================================================

router.post(
  "/:id/amend",
  authorize(
    UserRole.ADMIN,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    body: amendSchema,
  }),
  amendReportHandler
);

// =======================================================
// SEND REPORT TO REFERRING DOCTOR
// =======================================================

router.post(
  "/:id/send-doctor",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    body: sendDoctorSchema,
  }),
  sendReportToDoctorHandler
);

export default router;