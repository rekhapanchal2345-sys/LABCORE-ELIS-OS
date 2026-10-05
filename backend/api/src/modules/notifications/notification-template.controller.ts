import {
  Request,
  Response,
  NextFunction,
} from "express";

import type { AuthRequest } from "../../../middleware/auth.middleware";
import { pathParam } from "../../utils/request-meta";
  
import {
  createNotificationTemplate,
  getNotificationTemplates,
  getNotificationTemplateById,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  applyTemplate,
} from "./notification-template.service";
  
import {
  successResponse,
  createdResponse,
} from "../../utils/response";

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    
    const template = await createNotificationTemplate({
      ...body,
      createdBy: req.user?.id,
    });

    return createdResponse(
      res,
      template,
      "Notification template created successfully"
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
    const query = req.query;
    const eventType = query.eventType as string | undefined;
    const channel = query.channel as string | undefined;

    const templates = await getNotificationTemplates(eventType, channel);

    return successResponse(
      res,
      templates,
      "Notification templates fetched successfully"
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
    const template = await getNotificationTemplateById(pathParam(req, "id"));

    return successResponse(
      res,
      template,
      "Notification template fetched successfully"
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
    const template = await updateNotificationTemplate(pathParam(req, "id"), req.body);

    return successResponse(
      res,
      template,
      "Notification template updated successfully"
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
    const result = await deleteNotificationTemplate(pathParam(req, "id"));

    return successResponse(
      res,
      result,
      "Notification template deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const apply = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { templateId, variables } = req.body;
    
    const result = await applyTemplate(templateId, variables);

    return successResponse(
      res,
      result,
      "Template applied successfully"
    );
  } catch (error) {
    next(error);
  }
};