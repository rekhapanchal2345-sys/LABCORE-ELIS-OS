/**
 * LabCore ELIS - Enterprise AI Model Registry & Lifecycle Service
 * Manages model versioning, framework artifacts, deployment states (Production/Staging/Archived),
 * and strict governance controls for clinical AI models.
 */

let modelRegistry = [
  {
    registryId: 'REG-MOD-001',
    modelId: 'ML-XGB-002',
    name: 'Cardiac & AMI Emergency Classifier',
    version: 'v2.1.0-PRO',
    framework: 'XGBoost 2.0 / Python C-API',
    deploymentStatus: 'PRODUCTION',
    targetTask: 'Acute Coronary Syndrome & Myocardial Infarction Triage',
    primaryMetric: 'ROC-AUC: 0.992 | F1: 0.965',
    deployedBy: 'DR. amit shah (Lab Director)',
    deployedAt: '2026-10-05T12:00:00Z',
    artifactHash: 'SHA256-8A91F03BC284E109DF9210482B14A9',
    artifactPath: 'models/cardiac_xgb_v2.1.0.bin',
    inferenceCountTotal: 2140,
    averageLatencyMs: 8.4,
    notes: 'Approved for clinical decision support in Emergency & Cardiac Lab sections.'
  },
  {
    registryId: 'REG-MOD-002',
    modelId: 'ML-RFC-001',
    name: 'Diabetic Nephropathy Staging Engine',
    version: 'v1.4.2',
    framework: 'scikit-learn 1.5 (Random Forest)',
    deploymentStatus: 'PRODUCTION',
    targetTask: 'Chronic Renal Risk & Microalbuminuria Staging',
    primaryMetric: 'ROC-AUC: 0.978 | Accuracy: 94.2%',
    deployedBy: 'Dr. Rohit Deshmukh',
    deployedAt: '2026-10-04T10:15:00Z',
    artifactHash: 'SHA256-44B9E2198DF109AC84712039BF4102',
    artifactPath: 'models/diabetic_rf_v1.4.2.joblib',
    inferenceCountTotal: 1890,
    averageLatencyMs: 6.2,
    notes: 'Assists diabetologists and nephrologists during routine OPD review.'
  },
  {
    registryId: 'REG-MOD-003',
    modelId: 'EXP-PYTORCH-001',
    name: 'DeepBioNet Multi-Analyte MLP',
    version: 'v3.0.0-BETA',
    framework: 'PyTorch 2.4 (TorchScript)',
    deploymentStatus: 'STAGING',
    targetTask: 'Multi-Organ Metabolic Decompensation Risk',
    primaryMetric: 'ROC-AUC: 0.989 | Val Loss: 0.098',
    deployedBy: 'AI & Clinical Data Scientist',
    deployedAt: '2026-10-05T15:30:00Z',
    artifactHash: 'SHA256-F19A20847BC9100234EF8410294711',
    artifactPath: 'models/deepbionet_v3.0.0.pt',
    inferenceCountTotal: 412,
    averageLatencyMs: 14.8,
    notes: 'Running in shadow validation mode alongside standard biochemistry analyzer output.'
  },
  {
    registryId: 'REG-MOD-004',
    modelId: 'ML-LOG-003',
    name: 'TAT Delay Predictor & Queue Balancer',
    version: 'v1.0.1',
    framework: 'scikit-learn (Logistic Regression)',
    deploymentStatus: 'PRODUCTION',
    targetTask: 'Laboratory Turnaround Time Breach Early-Warning',
    primaryMetric: 'Accuracy: 91.2% | Precision: 90.5%',
    deployedBy: 'DR. amit shah',
    deployedAt: '2026-10-06T09:30:00Z',
    artifactHash: 'SHA256-788190B42A7C1094E938102984ACDF',
    artifactPath: 'models/tat_predictor_v1.0.1.joblib',
    inferenceCountTotal: 840,
    averageLatencyMs: 4.1,
    notes: 'Drives operations dashboard workload alerts.'
  },
  {
    registryId: 'REG-MOD-005',
    modelId: 'NLP-NER-001',
    name: 'Clinical Pathology Impression & ICD-10 NLP',
    version: 'v2.0.0',
    framework: 'Transformers & Clinical Regex Lexicon',
    deploymentStatus: 'PRODUCTION',
    targetTask: 'Prescription Parsing, Entity Extraction & ICD-10 Triage',
    primaryMetric: 'Entity F1: 0.954 | ICD-10 Top-1: 92.8%',
    deployedBy: 'Dr. Rohit Deshmukh',
    deployedAt: '2026-10-05T16:00:00Z',
    artifactHash: 'SHA256-3390FA8471BC0194827103849102BF',
    artifactPath: 'models/clinical_nlp_v2.0.0.bin',
    inferenceCountTotal: 1250,
    averageLatencyMs: 12.0,
    notes: 'Powers e-prescription ingestion and pathologist impression assist.'
  }
];

class ModelRegistryService {
  static getAllModels() {
    return modelRegistry;
  }

  static getModelByRegistryId(id) {
    return modelRegistry.find(m => m.registryId === id || m.modelId === id);
  }

  // Update Model Deployment Lifecycle State
  static updateDeploymentStatus(registryId, newStatus, modifiedBy = 'Authorized Administrator') {
    const validStatuses = ['PRODUCTION', 'STAGING', 'DEVELOPMENT', 'ARCHIVED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid deployment status '${newStatus}'. Must be one of: ${validStatuses.join(', ')}`);
    }

    const model = modelRegistry.find(m => m.registryId === registryId || m.modelId === registryId);
    if (!model) throw new Error(`Model with ID '${registryId}' not found in registry.`);

    const oldStatus = model.deploymentStatus;
    model.deploymentStatus = newStatus;
    model.lastModifiedAt = new Date().toISOString();
    model.lastModifiedBy = modifiedBy;

    return {
      registryId: model.registryId,
      modelName: model.name,
      previousStatus: oldStatus,
      newStatus: model.deploymentStatus,
      updatedAt: model.lastModifiedAt,
      message: `Model ${model.name} (${model.version}) successfully transitioned to ${newStatus}.`
    };
  }
}

module.exports = ModelRegistryService;
