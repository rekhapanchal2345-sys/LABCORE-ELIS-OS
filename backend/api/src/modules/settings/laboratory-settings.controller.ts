import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  getLaboratorySettings,
  updateLaboratorySettings,
} from "./laboratory-settings.service";
  
import {
  successResponse,
} from "../../utils/response";

export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await getLaboratorySettings();

    return successResponse(
      res,
      settings,
      "Laboratory settings fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    
    const settings = await updateLaboratorySettings(body);

    return successResponse(
      res,
      settings,
      "Laboratory settings updated successfully"
    );
  } catch (error) {
    next(error);
  }
};