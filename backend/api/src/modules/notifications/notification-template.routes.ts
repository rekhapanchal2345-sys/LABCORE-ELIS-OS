import { Router } from "express";
import { validate } from "../../../middleware/validate.middleware";
import { authenticate } from "../../../middleware/auth.middleware";
import {
  createTemplateSchema,
  updateTemplateSchema,
  applyTemplateSchema,
  templateIdSchema,
} from "./notification-template.validation";
import {
  create,
  list,
  getOne,
  update,
  remove,
  apply,
} from "./notification-template.controller";

const router = Router();

// All notification template routes require authentication
router.use(authenticate);

// Create notification template
router.post("/", validate({ body: createTemplateSchema }), create);

// Get all notification templates
router.get("/", list);

// Get specific notification template
router.get("/:id", validate({ params: templateIdSchema }), getOne);

// Update notification template
router.put("/:id", validate({ params: templateIdSchema, body: updateTemplateSchema }), update);

// Delete notification template
router.delete("/:id", validate({ params: templateIdSchema }), remove);

// Apply template with variables
router.post("/apply", validate({ body: applyTemplateSchema }), apply);

export default router;