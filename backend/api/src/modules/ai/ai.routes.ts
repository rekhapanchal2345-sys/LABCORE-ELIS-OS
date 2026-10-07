import { Router } from "express";
import {
  trainClassical,
  trainDeepLearning,
  predict,
  analyzeNlp,
  deltaCheck,
  forecastWorkloadTat,
  listRegistryModels,
  updateModelStatus,
  getAuditLogs,
} from "./ai.controller";
import { authenticate } from "../../../middleware/auth";

const router = Router();

// Allow authenticated users to interact with AI Studio
router.use(authenticate);

// Training Endpoints
router.post("/train/classical", trainClassical);
router.post("/train/deep-learning", trainDeepLearning);

// Inference & Clinical AI
router.post("/predict", predict);
router.post("/nlp/analyze", analyzeNlp);
router.post("/anomaly/delta-check", deltaCheck);
router.post("/delta-check", deltaCheck);
router.post("/forecasting/tat", forecastWorkloadTat);
router.post("/tat/forecast", forecastWorkloadTat);

// Registry & Deployment
router.get("/models", listRegistryModels);
router.post("/models/deploy", updateModelStatus);
router.post("/models/:id/deploy", updateModelStatus);
router.get("/audit", getAuditLogs);

export default router;
