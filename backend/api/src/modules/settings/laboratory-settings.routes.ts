import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import {
  getSettings,
  updateSettings,
} from "./laboratory-settings.controller";

const router = Router();

// All settings routes require authentication
router.use(authenticate);

// Get laboratory settings
router.get("/", getSettings);

// Update laboratory settings
router.put("/", updateSettings);

export default router;