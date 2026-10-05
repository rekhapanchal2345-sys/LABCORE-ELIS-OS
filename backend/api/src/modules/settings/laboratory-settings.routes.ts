import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { requirePermission } from "../../../middleware/rbac.middleware";
import {
  getSettings,
  updateSettings,
} from "./laboratory-settings.controller";

const router = Router();

// All settings routes require authentication
router.use(authenticate);

// Get laboratory settings - requires `settings:view`
router.get("/", requirePermission("settings:view"), getSettings);

// Update laboratory settings - requires `settings:edit`
router.put("/", requirePermission("settings:edit"), updateSettings);

export default router;