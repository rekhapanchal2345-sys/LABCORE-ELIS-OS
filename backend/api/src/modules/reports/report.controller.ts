import {
    Request,
    Response,
    NextFunction,
  } from "express";
  
  import {
    getOrderReport,
    getPatientReports,
    getPublishedReports,
    getReportSummary,
    createReportAddendum,
    applyDigitalSignature,
    inlineApproveReport,
    inlineRejectReport,
    generateShareableLink,
    validateShareableLink,
    revokeShareableLink,
    addToPatientHistory,
    getPatientTimeline,
    amendReport,
    sendReportToDoctor,
  } from "./report.service";
  
  // =======================================================
  // ORDER REPORT
  // =======================================================
  
  export const orderReport =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        // Use validated data if available, otherwise fall back to original request
        const params = (req as any).validated?.params || req.params;
        
        const report =
          await getOrderReport(
            params.orderId as string
          );
  
        res.status(200).json({
          success: true,
          message:
            "Order report fetched successfully",
          data: report,
        });
      } catch (error) {
        next(error);
      }
    };
  
  // =======================================================
  // PATIENT REPORTS
  // =======================================================
  
  export const patientReports =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const report =
          await getPatientReports(
            req.params.patientId as string,
  
            Number(
              req.query.page
            ) || 1,
  
            Number(
              req.query.limit
            ) || 20
          );
  
        res.status(200).json({
          success: true,
          message:
            "Patient reports fetched successfully",
          data: report,
        });
      } catch (error) {
        next(error);
      }
    };
  
  // =======================================================
  // PUBLISHED REPORTS
  // =======================================================
  
  export const publishedReports =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const reports =
          await getPublishedReports({
            fromDate:
              req.query.fromDate,
  
            toDate:
              req.query.toDate,
  
            page:
              Number(req.query.page) ||
              1,
  
            limit:
              Number(req.query.limit) ||
              20,
          });
  
        res.status(200).json({
          success: true,
          message:
            "Published reports fetched successfully",
          data: reports,
        });
      } catch (error) {
        next(error);
      }
    };
  
  // =======================================================
  // SUMMARY
  // =======================================================
  
  export const summary =
    async (
      _req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const data =
          await getReportSummary();
  
        res.status(200).json({
          success: true,
          message:
            "Report summary fetched successfully",
          data,
        });
      } catch (error) {
        next(error);
      }
    };

// =======================================================
// CREATE REPORT ADDENDUM
// =======================================================

export const createAddendum =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { id } = req.params;
      const { content, isPrivate } = req.body;

      const addendum = await createReportAddendum(
        id,
        content,
        userId,
        isPrivate
      );

      res.status(201).json({
        success: true,
        message: "Report addendum created successfully",
        data: addendum,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// APPLY DIGITAL SIGNATURE
// =======================================================

export const applySignature =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { id } = req.params;
      const { signatureData } = req.body;

      const report = await applyDigitalSignature(
        id,
        userId,
        signatureData
      );

      res.status(200).json({
        success: true,
        message: "Digital signature applied successfully",
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// INLINE APPROVE REPORT
// =======================================================

export const inlineApprove =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { id } = req.params;
      const { notes } = req.body;

      const report = await inlineApproveReport(
        id,
        userId,
        notes
      );

      res.status(200).json({
        success: true,
        message: "Report approved successfully",
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// INLINE REJECT REPORT
// =======================================================

export const inlineReject =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { id } = req.params;
      const { reason } = req.body;

      const report = await inlineRejectReport(
        id,
        userId,
        reason
      );

      res.status(200).json({
        success: true,
        message: "Report rejected successfully",
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// GENERATE SHAREABLE LINK
// =======================================================

export const generateShareLink =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { id } = req.params;
      const { expiresIn } = req.body;

      const shareLink = await generateShareableLink(
        id,
        userId,
        expiresIn
      );

      const fullUrl = `${req.protocol}://${req.get('host')}/api/reports/share/${shareLink.token}`;

      res.status(201).json({
        success: true,
        message: "Shareable link generated successfully",
        data: {
          ...shareLink,
          url: fullUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// VALIDATE SHAREABLE LINK
// =======================================================

export const validateShareLink =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { token } = req.params;

      const shareLink = await validateShareableLink(token);

      res.status(200).json({
        success: true,
        message: "Shareable link validated successfully",
        data: shareLink,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// REVOKE SHAREABLE LINK
// =======================================================

export const revokeShareLink =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { linkId } = req.params;

      const shareLink = await revokeShareableLink(linkId, userId);

      res.status(200).json({
        success: true,
        message: "Shareable link revoked successfully",
        data: shareLink,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// ADD TO PATIENT HISTORY
// =======================================================

export const addToHistory =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { id } = req.params;
      const { notes } = req.body;

      const historyEntry = await addToPatientHistory(
        id,
        userId,
        notes
      );

      res.status(201).json({
        success: true,
        message: "Report added to patient history successfully",
        data: historyEntry,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// GET PATIENT TIMELINE
// =======================================================

export const patientTimeline =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { patientId } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const timeline = await getPatientTimeline(
        patientId,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        message: "Patient timeline fetched successfully",
        data: timeline,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// AMEND REPORT
// =======================================================

export const amendReportHandler =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { id } = req.params;
      const { amendmentType, reason } = req.body;

      const report = await amendReport(
        id,
        amendmentType,
        reason,
        userId
      );

      res.status(200).json({
        success: true,
        message: "Report amended successfully",
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// SEND REPORT TO REFERRING DOCTOR
// =======================================================

export const sendReportToDoctorHandler =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { id } = req.params;
      const { doctorId, channel } = req.body;

      const result = await sendReportToDoctor(
        id,
        doctorId,
        channel,
        userId
      );

      res.status(200).json({
        success: true,
        message: "Report sent to referring doctor successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };