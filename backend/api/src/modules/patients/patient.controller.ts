import {
    Request,
    Response,
    NextFunction,
  } from "express";

import type { AuthenticatedRequest } from "../../../middleware/auth";

  import {
    createPatient,
    getPatients,
    countPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    createPatientWithOrder,
    checkDuplicatePatient,
  } from "./patient.service";
  
  import {
    successResponse,
    createdResponse,
  } from "../../utils/response";

  /** Draft ownership rules and the KYC verifier check both need id + role. */
  const actorOf = (req: AuthenticatedRequest) => ({
    id: req.user?.id,
    role: req.user?.role,
  });
  
  export const create = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const body = (req as any).validated?.body || req.body;

      console.log('Patient creation request received for user:', req.user?.id || 'anonymous');

      const patient = await createPatient(body, req.user?.id);

      return createdResponse(
        res,
        patient,
        "Patient registered successfully"
      );
    } catch (error) {
      console.error('Patient creation error message:', error instanceof Error ? error.message : String(error));
      next(error);
    }
  };
  
  export const list = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const query = (req as any).validated?.query || req.query;

      const result = await getPatients({
        search: query.search,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 20,
        gender: query.gender,
        patientType: query.patientType,
        activeChip: query.activeChip,
        includeDrafts: query.includeDrafts === "true" || query.includeDrafts === true,
      });

      return successResponse(
        res,
        result,
        "Patients fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  export const count = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = (req as any).validated?.query || req.query;

      const total = await countPatients(query.search);

      return successResponse(res, { count: total }, "Patient count fetched successfully");
    } catch (error) {
      next(error);
    }
  };
  
  export const getOne = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const params = (req as any).validated?.params || req.params;
      
      const patient = await getPatientById(
        params.id as string
      );
  
      return successResponse(
        res,
        patient,
        "Patient fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  };
  
  export const update = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const params = (req as any).validated?.params || req.params;
      const body = (req as any).validated?.body || req.body;
      
      const patient = await updatePatient(
        params.id as string,
        body
      );
  
      return successResponse(
        res,
        patient,
        "Patient updated successfully"
      );
    } catch (error) {
      next(error);
    }
  };
  
  export const remove = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const params = (req as any).validated?.params || req.params;
      
      const result = await deletePatient(
        params.id as string,
        req.user?.id
      );
  
      return successResponse(
        res,
        result,
        result.deactivated
          ? "Patient deactivated successfully"
          : "Patient deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  export const createWithOrder = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;

      console.log('[PATIENT_ORDER] Patient with order creation request received for user:', req.user?.id || 'anonymous');

      const result = await createPatientWithOrder(
        body.patient,
        body.order,
        req.user?.id
      );

      return createdResponse(
        res,
        result,
        "Patient and order created successfully"
      );
    } catch (error) {
      console.error('Patient with order creation error message:', error instanceof Error ? error.message : String(error));
      next(error);
    }
  };


// ==================== 
// Advanced Patient Features
// ====================

import {
  sendPhoneVerificationOTP,
  verifyPhoneOTP,
  sendEmailVerification,
  verifyEmailToken,
  markKYCVerified,
  getFamilyMembers,
  linkToFamily,
  unlinkFromFamily,
  getRegistrationAnalytics,
  getPatientDemographics,
  getTopPatientsByVisits,
  addMedicalHistory,
  getMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
  recordConsent,
  getPatientConsents,
  revokeConsent,
} from "./patient.advanced.service";

/**
 * Check for duplicate patients
 */
export const checkDuplicate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;

    const duplicate = await checkDuplicatePatient(
      query.phone,
      query.email,
      query.aadhaarNumber,
      query.panNumber,
      query.excludeId
    );

    return successResponse(
      res,
      {
        isDuplicate: !!duplicate,
        existingPatient: duplicate,
      },
      duplicate ? "Duplicate patient found" : "No duplicate found"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Send phone verification OTP
 */
export const sendPhoneOTP = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;

    const result = await sendPhoneVerificationOTP(params.id);

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify phone OTP
 */
export const verifyPhone = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;

    const result = await verifyPhoneOTP(params.id, body.otp);

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Send email verification
 */
export const sendEmailVerificationLink = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;

    const result = await sendEmailVerification(params.id);

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;

    const result = await verifyEmailToken(body.verificationCode);

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark patient as KYC verified (Admin only)
 */
export const verifyKYC = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;

    const result = await markKYCVerified(params.id, req.user?.id);

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient family members
 */
export const getFamily = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;

    const result = await getFamilyMembers(params.id);

    return successResponse(res, result, "Family members fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Link patient to family
 */
export const addToFamily = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;

    const result = await linkToFamily(
      params.id,
      body.familyHeadId,
      body.relationship
    );

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Unlink patient from family
 */
export const removeFromFamily = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;

    const result = await unlinkFromFamily(params.id);

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Get registration analytics
 */
export const getAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;

    const result = await getRegistrationAnalytics(
      query.startDate as string,
      query.endDate as string,
      query.groupBy as any
    );

    return successResponse(res, result, "Analytics fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient demographics
 */
export const getDemographics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getPatientDemographics();

    return successResponse(res, result, "Demographics fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get top patients by visits
 */
export const getTopPatients = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    const limit = Number(query.limit) || 10;

    const result = await getTopPatientsByVisits(limit);
    return successResponse(res, result, "Top patients fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Add medical history
 */
export const addHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;

    const result = await addMedicalHistory(params.id, body);

    return createdResponse(res, result, "Medical history added successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient medical history
 */
export const getHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;

    const result = await getMedicalHistory(params.id);

    return successResponse(res, result, "Medical history fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Update medical history
 */
export const updateHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;

    const result = await updateMedicalHistory(params.id, params.historyId, body);

    return successResponse(res, result, "Medical history updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Delete medical history
 */
export const deleteHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;

    const result = await deleteMedicalHistory(params.id, params.historyId);

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Record patient consent
 */
export const addConsent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;

    const result = await recordConsent(params.id, {
      ...body,
      consentedById: req.user?.id,
    });

    return createdResponse(res, result, "Consent recorded successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient consents
 */
export const getConsents = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;

    const result = await getPatientConsents(params.id);

    return successResponse(res, result, "Consents fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke consent
 */
export const revokePatientConsent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;

    const result = await revokeConsent(params.id, params.consentId);

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};


// ====================
// Draft Management
// ====================

import {
  saveDraft as saveDraftService,
  getUserDrafts,
  getDraftById,
  finalizeDraft,
  deleteDraft,
  cleanupOldDrafts,
  getFormProgressStats,
  duplicateDraft,
} from "./patient.draft.service";

/**
 * Save or update patient draft (auto-save)
 */
export const saveDraft = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;
    const draftId = body.draftId;

    const result = await saveDraftService(body, actorOf(req), draftId);

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user drafts
 */
export const listDrafts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    // The service restricts rows to the creator unless the caller is an admin.
    const result = await getUserDrafts(actorOf(req), page, limit);

    return successResponse(res, result, "Drafts fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get single draft
 */
export const getDraft = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;

    const draft = await getDraftById(params.id, actorOf(req));

    return successResponse(res, draft, "Draft fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Finalize draft to create patient
 */
export const completeDraft = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;

    const result = await finalizeDraft(params.id, body, actorOf(req));

    return createdResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete draft
 */
export const removeDraft = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;

    const result = await deleteDraft(params.id, actorOf(req));

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Cleanup old drafts (admin only)
 */
export const cleanupDrafts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await cleanupOldDrafts();

    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Get form progress statistics
 */
export const getProgressStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getFormProgressStats(actorOf(req));

    return successResponse(res, result, "Progress statistics fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Duplicate draft
 */
export const copyDraft = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;

    const result = await duplicateDraft(params.id, actorOf(req));

    return createdResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};
