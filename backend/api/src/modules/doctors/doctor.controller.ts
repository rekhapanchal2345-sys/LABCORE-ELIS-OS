import {
    Request,
    Response,
    NextFunction,
  } from "express";
  
  import {
    createDoctor,
    getDoctors,
    getDoctorById,
    updateDoctor,
    updateDoctorStatus,
    deleteDoctor,
    getDoctorStatistics,
    getDoctorCommission,
    getDoctorsBySpecialization,
  } from "./doctor.service";
  
  import prisma from "../../../config/database";
  
  import {
    successResponse,
    createdResponse,
  } from "../../utils/response";
  
  export const create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const body = (req as any).validated?.body || req.body;
      
      const doctor =
        await createDoctor(body);
  
      return createdResponse(
        res,
        doctor,
        "Doctor created successfully"
      );
    } catch (error) {
      next(error);
    }
  };
  
  export const list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Check if this is a count request
      if (req.path.endsWith('/count')) {
        const count = await prisma.doctor.count();
        return successResponse(res, { count }, "Doctor count fetched successfully");
      }
      
      // Use validated data if available, otherwise fall back to original request
      const query = (req as any).validated?.query || req.query;
      
      const search =
        typeof query.search ===
        "string"
          ? query.search
          : undefined;
  
      const specialization =
        typeof query.specialization === "string"
          ? query.specialization
          : undefined;

      const doctorType =
        typeof query.doctorType === "string"
          ? query.doctorType
          : undefined;
  
      let isActive:
        | boolean
        | undefined;
  
      if (query.isActive === "true") {
        isActive = true;
      }
  
      if (query.isActive === "false") {
        isActive = false;
      }
  
      const page =
        Number(query.page) || 1;
  
      const limit =
        Number(query.limit) || 20;
  
      const result =
        await getDoctors(
          search,
          specialization,
          isActive,
          page,
          limit,
          doctorType
        );
  
      return successResponse(
        res,
        result,
        "Doctors fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  };
  
  export const getOne = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const params = (req as any).validated?.params || req.params;
      
      const doctor =
        await getDoctorById(
          params.id as string
        );
  
      return successResponse(
        res,
        doctor,
        "Doctor fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  };
  
  export const update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const params = (req as any).validated?.params || req.params;
      const body = (req as any).validated?.body || req.body;
      
      const doctor =
        await updateDoctor(
          params.id as string,
          body
        );
  
      return successResponse(
        res,
        doctor,
        "Doctor updated successfully"
      );
    } catch (error) {
      next(error);
    }
  };
  
  export const updateStatus =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        // Use validated data if available, otherwise fall back to original request
        const params = (req as any).validated?.params || req.params;
        const body = (req as any).validated?.body || req.body;
        
        const doctor =
          await updateDoctorStatus(
            params.id as string,
            body.isActive
          );
  
        return successResponse(
          res,
          doctor,
          "Doctor status updated successfully"
        );
      } catch (error) {
        next(error);
      }
    };
  
  export const remove = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const params = (req as any).validated?.params || req.params;
      
      const result =
        await deleteDoctor(
          params.id as string
        );
  
      return successResponse(
        res,
        result,
        "Doctor deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  };

export const statistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    
    const result = await getDoctorStatistics(
      params.id as string
    );

    return successResponse(
      res,
      result,
      "Doctor statistics fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const commission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const query = (req as any).validated?.query || req.query;
    
    const startDate = query.startDate 
      ? new Date(query.startDate as string) 
      : undefined;
    const endDate = query.endDate 
      ? new Date(query.endDate as string) 
      : undefined;
    
    const result = await getDoctorCommission(
      params.id as string,
      startDate,
      endDate
    );

    return successResponse(
      res,
      result,
      "Doctor commission fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const bySpecialization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const result = await getDoctorsBySpecialization(
      query.specialization as string
    );

    return successResponse(
      res,
      result,
      "Doctors by specialization fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const uploadPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    
    // In a real implementation, you would handle file upload here
    // For now, we'll just update the photoUrl field
    const { photoUrl } = req.body;
    
    const result = await updateDoctor(
      params.id as string,
      { photoUrl }
    );

    return successResponse(
      res,
      result,
      "Doctor photo uploaded successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const uploadSignature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    
    // In a real implementation, you would handle file upload here
    // For now, we'll just update the signatureUrl field
    const { signatureUrl } = req.body;
    
    const result = await updateDoctor(
      params.id as string,
      { signatureUrl }
    );

    return successResponse(
      res,
      result,
      "Doctor signature uploaded successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const processPayout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;
    const userId = (req as any).user?.id;

    const { processDoctorPayout } = require("./doctor.service");
    const result = await processDoctorPayout(params.id as string, {
      ...body,
      userId,
    });

    return successResponse(
      res,
      result,
      "Doctor commission payout processed successfully"
    );
  } catch (error) {
    next(error);
  }
};