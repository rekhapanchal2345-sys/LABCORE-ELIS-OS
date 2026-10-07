export interface ClassicalMlTrainingParams {
  modelName: string;
  algorithm: "XGBoost" | "RandomForest" | "LightGBM" | "LogisticRegression";
  dataset: string;
  nEstimators: number;
  maxDepth: number;
  learningRate: number;
  testSplitRatio?: number;
  subsample?: number;
}

export interface TrainingEpochLog {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  trainAccuracy: number;
  valAccuracy: number;
  learningRate: number;
}

export interface ClassicalMlTrainingResult {
  modelId: string;
  modelName: string;
  algorithm: string;
  dataset: string;
  accuracy: number;
  rocAuc: number;
  f1Score: number;
  precision: number;
  recall: number;
  epochs: TrainingEpochLog[];
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  featureImportances: { feature: string; weight: number; impact: string }[];
  trainedAt: string;
}

export interface DeepLearningTrainingParams {
  architecture: "DeepBioNet-MLP" | "ResNet-Tabular" | "BioTransformer";
  epochs: number;
  batchSize: number;
  optimizer: "AdamW" | "SGD" | "RMSprop";
  learningRate: number;
  dropout: number;
  layers: number[];
}

export interface DeepLearningResult {
  modelId: string;
  architecture: string;
  totalParameters: number;
  epochsRun: number;
  finalLoss: number;
  valLoss: number;
  valAccuracy: number;
  history: TrainingEpochLog[];
  convergenceState: "CONVERGED_OPTIMAL" | "EARLY_STOPPED" | "STABLE";
  trainedAt: string;
}

export interface MultiAnalytePredictionRequest {
  panel?: string;
  hba1c?: number;
  fbs?: number;
  creatinine?: number;
  troponin?: number;
  potassium?: number;
  microalbumin?: number;
  wbc?: number;
  platelets?: number;
  crp?: number;
  ckmb?: number;
  ntprobnp?: number;
  hscrp?: number;
  egfr?: number;
  bun?: number;
  procalcitonin?: number;
  lactate?: number;
  ddimer?: number;
  alt?: number;
  ast?: number;
  bilirubin?: number;
  alp?: number;
  albumin?: number;
  patientAge?: number;
  patientGender?: "MALE" | "FEMALE" | "OTHER";
}

export interface PredictionResult {
  predictedClass: string;
  riskScore: number;
  confidence: number;
  urgency: "ROUTINE" | "ELEVATED" | "HIGH_RISK" | "CRITICAL_PANIC";
  diagnosticRecommendation: string;
  shapAttributions: {
    feature: string;
    value: string;
    impactPercentage: number;
    direction: "POSITIVE_RISK" | "NEGATIVE_RISK";
  }[];
  evaluatedAt: string;
}

export interface NlpAnalysisRequest {
  clinicalText: string;
}

export interface ExtractedEntity {
  name: string;
  type: "LAB_TEST" | "BIOMARKER" | "MEDICATION" | "ANATOMY" | "SEVERITY" | "SYMPTOM";
  confidence: number;
}

export interface Icd10Prediction {
  code: string;
  description: string;
  confidence: number;
}

export interface LoincPrediction {
  code: string;
  name: string;
  confidence: number;
}

export interface NlpAnalysisResult {
  wordCount: number;
  entities: ExtractedEntity[];
  icd10Codes: Icd10Prediction[];
  loincCodes?: LoincPrediction[];
  clinicalImpression: string;
  urgency: "ROUTINE" | "HIGH_RISK" | "CRITICAL_PANIC";
  keyBiomarkersIdentified: string[];
  recommendedAction: string;
}

export interface DeltaCheckRequest {
  testCode: string;
  testName: string;
  currentValue: number;
  previousValue: number;
  timeGapHours: number;
}

export interface DeltaCheckResult {
  testName: string;
  previousValue: number;
  currentValue: number;
  absoluteDiff: number;
  percentageDiff: number;
  velocityPerHour: number;
  zScore: number;
  isSurge: boolean;
  status: "NORMAL_DRIFT" | "MODERATE_SHIFT" | "CRITICAL_DELTA_SURGE";
  clinicalInterpretation: string;
}

export interface TatForecastRequest {
  department: string;
  complexityScore: number;
  isStat: boolean;
  queueDepth: number;
  activeTechnicians: number;
}

export interface TatForecastResult {
  predictedMinutes: number;
  expectedTurnaroundFormatted: string;
  confidenceInterval: [number, number];
  potentialBottleneck: string;
  statAccelerationDiscountMinutes: number;
}

export interface RegisteredModel {
  id: string;
  name: string;
  version: string;
  framework: string;
  metric: string;
  status: "PRODUCTION" | "STAGING" | "ARCHIVED";
  latency: string;
  totalInferences: number;
  lastUpdated: string;
}
