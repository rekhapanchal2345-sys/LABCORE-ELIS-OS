/**
 * LabCore ELIS - AI Studio Master Route Definitions
 * Base Route: /api/v1/ai-studio
 */

const express = require('express');
const router = express.Router();

const aiStudioController = require('../controllers/aiStudioController');
const { authenticateUser, requirePermission, AI_PERMISSIONS } = require('../middlewares/authMiddleware');

// Apply JWT/RBAC Auth to all AI Studio endpoints
router.use(authenticateUser);

// 1. AI Overview
router.get('/overview', requirePermission(AI_PERMISSIONS.AI_VIEW), aiStudioController.getOverview);

// 2. Classical Machine Learning
router.get('/classical-ml/datasets', requirePermission(AI_PERMISSIONS.AI_VIEW), aiStudioController.getClassicalDatasets);
router.get('/classical-ml/models', requirePermission(AI_PERMISSIONS.AI_VIEW), aiStudioController.getClassicalModels);
router.post('/classical-ml/train', requirePermission(AI_PERMISSIONS.AI_TRAIN), aiStudioController.trainClassicalModel);
router.post('/classical-ml/predict', requirePermission(AI_PERMISSIONS.AI_PREDICT), aiStudioController.predictClassical);

// 3. Deep Learning
router.get('/deep-learning/experiments', requirePermission(AI_PERMISSIONS.AI_VIEW), aiStudioController.getDeepExperiments);
router.post('/deep-learning/train', requirePermission(AI_PERMISSIONS.AI_TRAIN), aiStudioController.trainDeepModel);
router.post('/deep-learning/predict', requirePermission(AI_PERMISSIONS.AI_PREDICT), aiStudioController.predictDeepRisk);

// 4. Clinical NLP
router.post('/nlp/analyze', requirePermission(AI_PERMISSIONS.AI_PREDICT), aiStudioController.analyzeClinicalText);

// 5. Anomaly Detection
router.get('/anomalies', requirePermission(AI_PERMISSIONS.AI_VIEW), aiStudioController.getAnomalies);
router.post('/anomalies/detect-result', requirePermission(AI_PERMISSIONS.AI_PREDICT), aiStudioController.detectResultDelta);

// 6. Forecasting & Prediction
router.get('/forecasting/volume', requirePermission(AI_PERMISSIONS.AI_VIEW), aiStudioController.getVolumeForecast);
router.post('/forecasting/tat', requirePermission(AI_PERMISSIONS.AI_PREDICT), aiStudioController.predictTat);
router.get('/forecasting/reagents', requirePermission(AI_PERMISSIONS.AI_VIEW), aiStudioController.getReagentsForecast);

// 7. Model Evaluation
router.get('/evaluation/:modelId?', requirePermission(AI_PERMISSIONS.AI_VIEW), aiStudioController.getModelEvaluation);

// 8. Model Registry
router.get('/registry', requirePermission(AI_PERMISSIONS.AI_VIEW), aiStudioController.getModelRegistry);
router.post('/registry/deploy', requirePermission(AI_PERMISSIONS.AI_DEPLOY), aiStudioController.updateModelDeployment);

// 9. AI Audit & Monitoring
router.get('/audit-logs', requirePermission(AI_PERMISSIONS.AI_AUDIT), aiStudioController.getAuditLogs);
router.get('/drift-metrics', requirePermission(AI_PERMISSIONS.AI_AUDIT), aiStudioController.getDriftMetrics);

module.exports = router;
