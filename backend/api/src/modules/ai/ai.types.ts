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

// =======================================================
// NEW ENGINE 1: CBC AUTO-ANALYZER
// =======================================================
export interface CbcAnalysisRequest {
  hb: number;           // Hemoglobin g/dL
  rbc: number;          // RBC x10^6/uL
  wbc: number;          // WBC x10^3/uL
  platelets: number;    // x10^3/uL
  hematocrit: number;   // %
  mcv: number;          // fL
  mch: number;          // pg
  mchc: number;         // g/dL
  neutrophils: number;  // %
  lymphocytes: number;  // %
  monocytes: number;    // %
  eosinophils: number;  // %
  basophils: number;    // %
  rdw: number;          // %
  patientAge?: number;
  patientGender?: "MALE" | "FEMALE";
}

export interface CbcFlag {
  parameter: string;
  value: string;
  referenceRange: string;
  flag: "CRITICAL_LOW" | "LOW" | "NORMAL" | "HIGH" | "CRITICAL_HIGH";
  interpretation: string;
}

export interface CbcAnalysisResult {
  overallImpression: string;
  urgency: "ROUTINE" | "ELEVATED" | "HIGH_RISK" | "CRITICAL_PANIC";
  flags: CbcFlag[];
  differentialDiagnosis: string[];
  morphologyPattern: string;
  recommendedFollowUp: string;
  analyzedAt: string;
}

// =======================================================
// NEW ENGINE 2: DRUG INTERACTION CHECKER
// =======================================================
export interface DrugInteractionRequest {
  medications: string[];
  patientAge?: number;
  renalFunction?: "NORMAL" | "MILD_IMPAIRMENT" | "MODERATE_IMPAIRMENT" | "SEVERE_IMPAIRMENT";
  hepaticFunction?: "NORMAL" | "MILD_IMPAIRMENT" | "SEVERE_IMPAIRMENT";
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "MINOR" | "MODERATE" | "MAJOR" | "CONTRAINDICATED";
  mechanism: string;
  clinicalEffect: string;
  management: string;
}

export interface DrugInteractionResult {
  totalInteractions: number;
  contraindicated: number;
  majorInteractions: number;
  moderateInteractions: number;
  interactions: DrugInteraction[];
  overallRisk: "SAFE" | "CAUTION" | "HIGH_RISK" | "CONTRAINDICATED";
  pharmacistAlert: string;
  analyzedAt: string;
}

// =======================================================
// NEW ENGINE 3: ANTIBIOTIC SUSCEPTIBILITY PREDICTOR (AMR)
// =======================================================
export interface AmrPredictionRequest {
  organism: string;
  specimenType: "BLOOD" | "URINE" | "WOUND" | "SPUTUM" | "CSF" | "STOOL";
  gramStain?: "POSITIVE" | "NEGATIVE";
  patientHistory?: string[];
  mic?: { [antibiotic: string]: number };
}

export interface AntibioticSusceptibility {
  antibiotic: string;
  class: string;
  predictedResult: "SENSITIVE" | "INTERMEDIATE" | "RESISTANT";
  confidencePercent: number;
  mic?: string;
  clinicalNote?: string;
}

export interface AmrPredictionResult {
  organism: string;
  specimenType: string;
  riskProfile: "LOW_AMR_RISK" | "MODERATE_AMR_RISK" | "MDR_RISK" | "XDR_RISK" | "PDR_RISK";
  susceptibilityPanel: AntibioticSusceptibility[];
  recommendedEmpiric: string[];
  avoidList: string[];
  infectiologyAlert: string;
  isoStandard: string;
  analyzedAt: string;
}

// =======================================================
// NEW ENGINE 4: THYROID DISEASE CLASSIFIER
// =======================================================
export interface ThyroidAnalysisRequest {
  tsh: number;          // mIU/L
  ft4: number;          // pmol/L or ng/dL
  ft3: number;          // pmol/L or pg/mL
  tpoAntibody?: number; // IU/mL (anti-TPO)
  tgAntibody?: number;  // IU/mL (anti-Tg)
  tshUnits?: "mIU_L";
  ft4Units?: "pmol_L" | "ng_dL";
  patientAge?: number;
  patientGender?: "MALE" | "FEMALE";
  symptoms?: string[];
}

export interface ThyroidClassificationResult {
  classification: string;
  functionalStatus: "EUTHYROID" | "HYPOTHYROID" | "HYPERTHYROID" | "SUBCLINICAL_HYPO" | "SUBCLINICAL_HYPER";
  urgency: "ROUTINE" | "ELEVATED" | "HIGH_RISK" | "CRITICAL_PANIC";
  riskScore: number;
  autoimmunityRisk: "LOW" | "MODERATE" | "HIGH";
  shapAttributions: { parameter: string; value: string; interpretation: string; flag: string }[];
  icd10Code: string;
  clinicalRecommendation: string;
  repeatInterval: string;
  analyzedAt: string;
}

// =======================================================
// NEW ENGINE 5: COAGULATION RISK ENGINE
// =======================================================
export interface CoagulationRequest {
  pt: number;        // seconds
  inr: number;       // ratio
  aptt: number;      // seconds (activated partial thromboplastin time)
  fibrinogen?: number; // mg/dL
  dDimer?: number;   // ng/mL
  platelets?: number; // x10^3/uL
  antithrombinIII?: number; // %
  proteinC?: number; // %
  indication?: "ANTICOAG_MONITORING" | "BLEEDING_WORKUP" | "PRE_OP_SCREEN" | "DIC_ASSESSMENT";
}

export interface CoagulationRiskResult {
  overallHemostaticStatus: "NORMAL" | "MILD_COAGULOPATHY" | "MODERATE_COAGULOPATHY" | "SEVERE_COAGULOPATHY" | "DIC";
  urgency: "ROUTINE" | "ELEVATED" | "HIGH_RISK" | "CRITICAL_PANIC";
  ptInterpretation: string;
  inrInterpretation: string;
  apttInterpretation: string;
  dicScore?: number;
  bleedingRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  thrombosisRisk: "LOW" | "MODERATE" | "HIGH";
  clinicalFlags: string[];
  management: string;
  analyzedAt: string;
}

// =======================================================
// NEW ENGINE 6: SMART REPORT NARRATIVE GENERATOR
// =======================================================
export interface SmartReportRequest {
  patientName: string;
  patientAge: number;
  patientGender: "MALE" | "FEMALE" | "OTHER";
  uhid: string;
  referringDoctor?: string;
  department: string;
  testResults: { testName: string; value: string | number; unit: string; referenceRange: string; flag?: string }[];
  clinicalHistory?: string;
  specimenType?: string;
  collectionDateTime?: string;
}

export interface SmartReportResult {
  narrativeSummary: string;
  clinicalImpression: string;
  criticalFindings: string[];
  recommendations: string[];
  autoIcd10Codes: { code: string; description: string }[];
  pathologistNote: string;
  reportGrade: "NORMAL" | "MILD_ABNORMAL" | "SIGNIFICANT_ABNORMAL" | "CRITICAL";
  generatedAt: string;
}
