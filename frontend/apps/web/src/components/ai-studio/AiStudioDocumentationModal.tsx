"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Languages,
  XCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Stethoscope,
  Layers,
  Network,
  FileText,
  Calculator,
  ShieldCheck,
  Archive,
  LineChart,
  Award,
  ChevronRight,
  Printer,
  Copy,
  Check,
  Hospital,
  Activity,
  Sliders,
  Sparkles,
  Brain,
  FileCheck,
} from "lucide-react";

export type LanguageCode = "en" | "hi" | "gu" | "mr" | "ta" | "te" | "bn" | "es";

interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English (UK/US)", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी (Hindi)", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી (Gujarati)", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी (Marathi)", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ் (Tamil)", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు (Telugu)", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা (Bengali)", flag: "🇮🇳" },
  { code: "es", name: "Spanish", nativeName: "Español (International)", flag: "🇪🇸" },
];

interface DocSection {
  id: string;
  title: string;
  icon: any;
  summary: string;
  steps: string[];
  clinicalTip: string;
  regulatoryNote: string;
}

interface LanguageContent {
  headerTitle: string;
  headerSubtitle: string;
  quickStartTitle: string;
  quickStartSteps: { title: string; desc: string }[];
  searchPlaceholder: string;
  sections: DocSection[];
  sopTitle: string;
  sopRules: string[];
  faqTitle: string;
  faqs: { q: string; a: string }[];
}

export const DOCUMENTATION_DATA: Record<LanguageCode, LanguageContent> = {
  en: {
    headerTitle: "Clinical AI Studio & CDSS — Standard Operating Guide",
    headerSubtitle: "Complete End-to-End Hospital & Pathology Laboratory User Documentation (NABL ISO 15189:2022 & CAP Compliant)",
    quickStartTitle: "🚀 4-Step Clinical Quick Start",
    quickStartSteps: [
      {
        title: "1. Select Clinical Panel",
        desc: "Open Diagnostic Risk ML and choose one of 4 panels: Cardiac ACS, Renal KDIGO, ICU Sepsis, or Hepatic FIB-4.",
      },
      {
        title: "2. Load Patient Data or 1-Click Case",
        desc: "Click a hospital preset (e.g. UHID-10892 STEMI Panic) or enter patient serum values with normal reference ranges.",
      },
      {
        title: "3. Run Live Multi-Analyte Inference",
        desc: "Click 'Analyze Patient Diagnostic Panel' to generate mathematical risk scores, confidence, and SHAP explainability weights.",
      },
      {
        title: "4. Authorize & Escalate Alerts",
        desc: "If urgency flags 'CRITICAL_PANIC', execute emergency telephonic read-back to attending clinician within 15 minutes.",
      },
    ],
    searchPlaceholder: "Search user manual (e.g., Troponin, XGBoost, LOINC, Delta Check, NABL)...",
    sections: [
      {
        id: "overview",
        title: "1. Clinical AI Hub & Real-Time Surveillance",
        icon: Brain,
        summary: "Central telemetry cockpit showing laboratory throughput, mean inference latency (6.2ms), active models, and real-time critical panic alerts.",
        steps: [
          "Check the top 4 KPI tiles for diagnostic ROC-AUC (99.2%), total inferences logged, and active model count.",
          "Review the Real-Time Clinical Surveillance banner for acute patient alerts (e.g., troponin surge > +9100%) and instrument calibration drifts.",
          "Inspect the Validated Production Models cards to verify versioning and latency.",
        ],
        clinicalTip: "Always investigate red alert banners immediately. They are triggered when a patient's biomarker crosses critical clinical thresholds.",
        regulatoryNote: "Complies with ISO 15189:2022 clause 5.6 for automated clinical decision support telemetry.",
      },
      {
        id: "classical_ml",
        title: "2. Diagnostic Risk ML & Multi-Analyte Simulator",
        icon: Network,
        summary: "Train tree-based machine learning algorithms and evaluate multi-analyte patient panels with explainable SHAP attributions.",
        steps: [
          "Choose algorithm (XGBoost 2.0, Random Forest, LightGBM) and dataset cohort (Acute Cardiac, Diabetic Nephropathy, TAT Delay).",
          "Adjust estimators, max depth, and learning rate, then click 'Execute Diagnostic Training Loop'.",
          "Observe live training iterations, validation accuracy, F1-score, and 2x2 confusion matrix (TP, FP, FN, TN).",
          "In the right panel, switch between the 4 diagnostic panels (Cardiac, Renal, Sepsis, Hepatic).",
          "Click hospital patient presets (STEMI, CKD, Sepsis, Normal) or enter serum values, then click 'Analyze Patient Diagnostic Panel'.",
          "Review the SHAP Feature Attribution bars to see how each biomarker contributed to the final risk classification.",
        ],
        clinicalTip: "Troponin-I > 0.50 ng/mL and Serum Potassium > 6.0 mEq/L will immediately trigger an acute life-threatening panic tier.",
        regulatoryNote: "All model training events are electronically signed and recorded into the audit trail under 21 CFR Part 11.",
      },
      {
        id: "deep_learning",
        title: "3. Biomarker Neural Networks (DeepBioNet-MLP)",
        icon: Layers,
        summary: "Multi-layer residual neural network designed for high-dimensional biological analyte interaction modeling.",
        steps: [
          "Navigate to the 'Biomarker Neural Nets' tab.",
          "Click 'Train Neural Architecture' to run forward/backward propagation on tensor cores.",
          "Monitor validation accuracy (e.g. 96.8%) and train/val loss curves.",
          "Verify optimization state: AdamW with weight decay 0.01 and cosine annealing convergence.",
        ],
        clinicalTip: "DeepBioNet identifies non-linear biomarker interactions that classical linear regressions often miss.",
        regulatoryNote: "Trained network weights are serialized into TorchScript for sub-10ms deterministic hospital inference.",
      },
      {
        id: "nlp_emr",
        title: "4. Clinical NLP, ICD-10 & LOINC Dual Coding",
        icon: FileText,
        summary: "Transforms unstructured pathology notes and doctor handwriting transcripts into standardized diagnostic codes.",
        steps: [
          "Paste or type physician notes into the text area, or click one of the quick presets ('Cardiac Surge' / 'Diabetic Nephropathy').",
          "Click 'Extract Clinical Entities & Map ICD-10'.",
          "View extracted named entities (NER): Lab Tests (Blue), Medications (Indigo), Symptoms (Amber), Severity (Crimson).",
          "Review automated ICD-10-CM diagnostic codes (e.g. I21.9 AMI, N18.3 CKD, E87.5 Hyperkalemia) with confidence scores.",
          "Check automated LOINC laboratory assay codes (e.g. LOINC 10839-9 hs-cTnI, LOINC 2160-0 Creatinine).",
          "Follow the Pathologist Synthesized Clinical Impression protocol.",
        ],
        clinicalTip: "If the note mentions critical indicators like 'surge' or 'arrhythmia', an automated emergency notification protocol is generated.",
        regulatoryNote: "Codes align with WHO ICD-10-CM and Regenstrief LOINC 2.76 healthcare informatics standards.",
      },
      {
        id: "delta_checks",
        title: "5. Longitudinal Biological Delta-Check Surveillance",
        icon: AlertTriangle,
        summary: "Monitors patient analyte change velocity over time against individual biological variation (RCV limits).",
        steps: [
          "Enter Current Observed Value, Previous Baseline Value, and Time Gap in hours.",
          "Click 'Evaluate Delta Surge'.",
          "Check the calculated Delta % and biological Z-score.",
          "Green banner indicates physiological baseline drift; Red banner flags critical delta surge requiring phone read-back.",
        ],
        clinicalTip: "A 9000% surge in Troponin within 4 hours is virtually diagnostic of acute coronary event or severe myocardial injury.",
        regulatoryNote: "Mandated by CAP (College of American Pathologists) checklist item GEN.41316 for laboratory safety.",
      },
      {
        id: "tat_forecast",
        title: "6. Hospital TAT & Workload Forecaster",
        icon: Calculator,
        summary: "Queue regression machine learning predicting test release turnaround times and bench bottlenecks.",
        steps: [
          "Select clinical department (Biochemistry, Hematology, Immunoassay, Microbiology).",
          "Input current sample queue depth and number of active technicians on bench.",
          "Toggle STAT Priority (Urgent) vs Routine Order.",
          "Click 'Forecast TAT' to predict turnaround time in minutes and identify potential instrument bottlenecks.",
        ],
        clinicalTip: "STAT prioritization applies machine learning acceleration discount, scheduling priority on automated analyzers.",
        regulatoryNote: "Assists lab managers in meeting hospital SLA and NABH emergency department turnaround commitments.",
      },
      {
        id: "governance",
        title: "7. Hospital Model Governance & Registry",
        icon: Archive,
        summary: "Version control, lifecycle staging, and deployment promotion of clinical AI algorithms.",
        steps: [
          "View all registered models, frameworks (XGBoost, scikit-learn, PyTorch), and evaluation metrics.",
          "To promote a validated model to production: click 'Promote to Prod' on Staging models.",
          "To demote an unstable or retired model: click 'Demote to Staging'.",
          "Click 'Refresh Registry' to sync latest model weights.",
        ],
        clinicalTip: "Never promote a model to production without at least 95% validation accuracy and Quality Manager approval.",
        regulatoryNote: "Enforces ISO 15189 change management and version rollback procedures.",
      },
      {
        id: "audit_trail",
        title: "8. Regulatory AI Audit Trail (21 CFR Part 11)",
        icon: ShieldCheck,
        summary: "Immutable, timestamped ledger of every training, inference, and deployment action taken by laboratory staff.",
        steps: [
          "Navigate to the 'Regulatory AI Audit' tab.",
          "Inspect Event ID, Clinical Action, Audit Details, and exact timestamps.",
          "Click 'Refresh Ledger' to fetch the latest audit trail from the database.",
          "Use during NABL and CAP annual compliance inspections to prove algorithm governance.",
        ],
        clinicalTip: "Every single training run and model promotion generates a permanent, non-deletable audit event.",
        regulatoryNote: "Fully compliant with US FDA 21 CFR Part 11 and Indian Medical Device Rules (MDR 2017).",
      },
    ],
    sopTitle: "📋 Pathologist & Laboratory SOP Rules",
    sopRules: [
      "Rule 1: Autonomous AI sign-off is strictly prohibited. Every diagnostic report requires digital authorization by a certified pathologist.",
      "Rule 2: Any 'CRITICAL_PANIC' flag must be verbally communicated to the ordering doctor within 15 minutes with telephonic read-back documented.",
      "Rule 3: Daily QC Westgard calibration runs must pass before running live patient AI inferences.",
      "Rule 4: Multi-analyte risk scores are clinical decision support aids and must always be correlated with ECG, imaging, and patient history.",
    ],
    faqTitle: "❓ Frequently Asked Questions",
    faqs: [
      {
        q: "What makes this AI NABL ISO 15189 compliant?",
        a: "The system enforces human-in-the-loop validation, immutable audit logging (21 CFR Part 11), biological variation limits (RCV), and rigorous calibration against certified standard materials.",
      },
      {
        q: "Can I use this for OPD clinics as well as tertiary hospital ICUs?",
        a: "Yes. The 4 clinical panels cover routine OPD preventive screenings (diabetic renal staging) as well as emergency tertiary care (ICU sepsis and acute coronary syndrome).",
      },
      {
        q: "How does the SHAP explainability work?",
        a: "SHAP (Shapley Additive exPlanations) calculates the exact mathematical contribution of each biomarker to the final diagnosis, showing doctors why the risk score is high or low.",
      },
    ],
  },
  hi: {
    headerTitle: "क्लिनिकल एआई स्टूडियो एवं CDSS — संपूर्ण संचालन नियमावली",
    headerSubtitle: "अस्पताल एवं पैथोलॉजी प्रयोगशाला उपयोग गाइड (NABL ISO 15189:2022 एवं CAP चिकित्सा मानकों के अनुरूप)",
    quickStartTitle: "🚀 4-चरणीय त्वरित शुरुआत (Quick Start)",
    quickStartSteps: [
      {
        title: "1. क्लिनिकल पैनल चुनें",
        desc: "डायग्नोस्टिक रिस्क ML खोलें और 4 पैनलों में से एक चुनें: कार्डियक ACS, रीनल KDIGO, ICU सेप्सिस, या हेपेटिक लिवर।",
      },
      {
        title: "2. मरीज का डेटा या 1-क्लिक केस लोड करें",
        desc: "अस्पताल प्रीसेट पर क्लिक करें (उदा. UHID-10892 स्टेमी पैनिक) या मरीज के बायोमार्कर मान दर्ज करें।",
      },
      {
        title: "3. लाइव मल्टी-एनालाइट अनुमान चलाएं",
        desc: "'Analyze Patient Diagnostic Panel' पर क्लिक करें — एआई जोखिम स्कोर, सटीकता एवं SHAP योगदान बार प्रदर्शित करेगा।",
      },
      {
        title: "4. सत्यापन एवं पैनिक अलर्ट कार्रवाई",
        desc: "यदि स्थिति 'CRITICAL_PANIC' है, तो 15 मिनट के भीतर संबंधित चिकित्सक को फोन करके टेलीफोनिक रीड-बैक पूरा करें।",
      },
    ],
    searchPlaceholder: "उपयोगकर्ता गाइड खोजें (उदा. ट्रोपोनिन, XGBoost, LOINC, डेल्टा चेक, NABL)...",
    sections: [
      {
        id: "overview",
        title: "1. क्लिनिकल एआई हब एवं लाइव निगरानी",
        icon: Brain,
        summary: "मुख्य टेलीमेट्री डैशबोर्ड जो प्रयोगशाला कार्यभार, एआई लेटेंसी (6.2ms), सक्रिय मॉडल एवं रियल-टाइम पैनिक अलर्ट दिखाता है।",
        steps: [
          "शीर्ष 4 KPI टाइल्स देखें: डायग्नोस्टिक ROC-AUC (99.2%), कुल अनुमान, एवं सक्रिय प्रोडक्शन मॉडल संख्या।",
          "रियल-टाइम क्लिनिकल अलर्ट बैनर की जांच करें (उदा. ट्रोपोनिन में +9100% की गंभीर वृद्धि) और एनालाइज़र कैलिब्रेशन ड्रिफ्ट।",
          "सत्यापित प्रोडक्शन मॉडल कार्ड्स में मॉडल का वर्जन एवं लेटेंसी चेक करें।",
        ],
        clinicalTip: "लाल चेतावनी बैनर दिखने पर तुरंत जांच करें। यह तब ट्रिगर होता है जब मरीज के बायोमार्कर गंभीर सीमा पार करते हैं।",
        regulatoryNote: "ISO 15189:2022 क्लॉज 5.6 के तहत अस्पताल निर्णय सहायता प्रणाली का पालन करता है।",
      },
      {
        id: "classical_ml",
        title: "2. डायग्नोस्टिक रिस्क ML एवं पेशेंट सिम्युलेटर",
        icon: Network,
        summary: "मशीन लर्निंग मॉडल (XGBoost, रैंडम फॉरेस्ट) को ट्रेन करें और मरीज के मल्टी-एनालाइट पैनल का वास्तविक समय में विश्लेषण करें।",
        steps: [
          "एल्गोरिदम (XGBoost 2.0, रैंडम फॉरेस्ट) और ट्रेनिंग डेटासेट कोहोर्ट चुनें।",
          "एस्टीमेटर, अधिकतम गहराई और लर्निंग रेट सेट करके 'Execute Diagnostic Training Loop' पर क्लिक करें।",
          "लाइव प्रोग्रेस बार, वैलिडेशन एक्यूरेसी, F1-स्कोर और 2x2 कन्फ्यूजन मैट्रिक्स (TP, FP, FN, TN) देखें।",
          "दाएं पैनल में 4 डायग्नोस्टिक पैनलों (हृदय, गुर्दा, सेप्सिस, यकृत) में से चयन करें।",
          "1-क्लिक मरीज प्रीसेट पर क्लिक करें या बायोमार्कर मान दर्ज करके 'Analyze Patient Diagnostic Panel' दबाएं।",
          "SHAP बार देखें जिससे पता चलेगा कि किस बायोमार्कर ने जोखिम बढ़ाने या घटाने में कितना योगदान दिया।",
        ],
        clinicalTip: "ट्रोपोनिन-I > 0.50 ng/mL और पोटेशियम > 6.0 mEq/L होने पर तुरंत क्रिटिकल पैनिक अलर्ट जारी होगा।",
        regulatoryNote: "प्रशिक्षण की प्रत्येक गतिविधि 21 CFR Part 11 के अंतर्गत इलेक्ट्रॉनिक रूप से लॉग होती है।",
      },
      {
        id: "deep_learning",
        title: "3. बायोमार्कर न्यूरल नेटवर्क (DeepBioNet-MLP)",
        icon: Layers,
        summary: "उच्च-आयामी जैविक परीक्षणों के जटिल अंतर्संबंधों के लिए मल्टी-लेयर रेसिड्यूअल न्यूरल नेटवर्क।",
        steps: [
          "'Biomarker Neural Nets' टैब खोलें।",
          "'Train Neural Architecture' पर क्लिक करके टेंसॉर कोर पर फॉरवर्ड/बैकवर्ड प्रोपेगेशन शुरू करें।",
          "वैलिडेशन एक्यूरेसी (96.8%) और लॉस कर्व्स की जांच करें।",
          "कन्वर्जेंस स्थिति सत्यापित करें: AdamW ऑप्टिमाइज़र और कोसाइन एनीलिंग शेड्यूलर।",
        ],
        clinicalTip: "DeepBioNet ऐसे सूक्ष्म जैविक पैटर्न पकड़ता है जो पारंपरिक लीनियर मॉडल से छूट जाते हैं।",
        regulatoryNote: "न्यूरल वेट्स TorchScript में एन्क्रिप्टेड होते हैं जिससे सब-10ms गति से परिणाम मिलते हैं।",
      },
      {
        id: "nlp_emr",
        title: "4. क्लिनिकल NLP एवं ऑटोमेटेड ICD-10/LOINC कोडिंग",
        icon: FileText,
        summary: "डॉक्टर के अनस्ट्रक्चर्ड नोट्स और पैथोलॉजी इंप्रेशन से स्वतः मेडिकल एंटिटी एवं मानक कोड निकालना।",
        steps: [
          "टेक्स्ट बॉक्स में डॉक्टर का नोट पेस्ट करें या प्रीसेट बटन ('Cardiac Surge') दबाएं।",
          "'Extract Clinical Entities & Map ICD-10' पर क्लिक करें।",
          "निकाली गई एंटिटी देखें: लैब टेस्ट (नीला), दवाएं (बैंगनी), लक्षण (अंबर), गंभीरता (लाल)।",
          "ऑटोमेटेड ICD-10 डायग्नोसिस कोड (उदा. I21.9 एक्यूट एमआई, N18.3 सीकेडी) कॉन्फिडेंस स्कोर के साथ देखें।",
          "LOINC टेस्ट कोड (उदा. LOINC 10839-9 hs-cTnI, LOINC 2160-0 क्रिएटिनिन) की पुष्टि करें।",
          "पैथोलॉजिस्ट संक्षेप एवं टेलीफोनिक रीड-बैक प्रोटोकॉल का पालन करें।",
        ],
        clinicalTip: "नोट में 'surge' या 'infarction' शब्द होने पर सिस्टम स्वतः 15-मिनट टेलीफोनिक अलर्ट प्रोटोकॉल बनाएगा।",
        regulatoryNote: "WHO ICD-10-CM और Regenstrief LOINC 2.76 अंतरराष्ट्रीय मानकों के अनुसार मैप किया गया है।",
      },
      {
        id: "delta_checks",
        title: "5. लोंगिट्यूडिनल डेल्टा-चेक एवं पैनिक सर्विलांस",
        icon: AlertTriangle,
        summary: "मरीज के पुराने और नए बायोमार्कर की गति और जैविक भिन्नता (RCV लिमिट्स) की निगरानी।",
        steps: [
          "वर्तमान मान, पिछला बेसलाइन मान और घंटों में समय अंतराल दर्ज करें।",
          "'Evaluate Delta Surge' पर क्लिक करें।",
          "प्रतिशत अंतर और Z-स्कोर देखें।",
          "हरा रंग सामान्य बदलाव दर्शाता है; लाल रंग गंभीर उछाल दर्शाता है जिसके लिए फोन कॉल आवश्यक है।",
        ],
        clinicalTip: "4 घंटे में ट्रोपोनिन का 9000% बढ़ना एक्यूट मायोकार्डियल इन्फार्कशन का प्रत्यक्ष संकेत है।",
        regulatoryNote: "CAP चेकलिस्ट GEN.41316 एवं NABL प्रयोगशाला सुरक्षा का अनिवार्य हिस्सा।",
      },
      {
        id: "tat_forecast",
        title: "6. टर्नअराउंड टाइम (TAT) एवं वर्कलोड प्रिडिक्टर",
        icon: Calculator,
        summary: "मशीन लर्निंग रिग्रेशन द्वारा लैब रिपोर्ट जारी होने का सटीक समय और बेंच बॉटलनेक का पूर्वानुमान।",
        steps: [
          "विभाग चुनें (बायोकेमिस्ट्री, हेमेटोलॉजी, इम्यूनोएस्से, माइक्रोबायोलॉजी)।",
          "क्यू में कुल सैंपल्स की संख्या और सक्रिय लैब तकनीशियनों की संख्या दर्ज करें।",
          "STAT प्राथमिकता (इमरजेंसी) या सामान्य (रूटीन) चुनें।",
          "'Forecast TAT' दबाएं — अनुमानित मिनट और संभावित रुकावट का विवरण मिलेगा।",
        ],
        clinicalTip: "STAT चयन करने पर एआई ऑटोमेटेड एनालाइज़र पर सैंपल को पहले स्थान पर प्राथमिकता देता है।",
        regulatoryNote: "NABH और अस्पताल इमरजेंसी डिपार्टमेंट SLA प्रतिबद्धताओं को पूरा करने में सहायक।",
      },
      {
        id: "governance",
        title: "7. हॉस्पिटल मॉडल गवर्नेंस एवं रजिस्ट्री",
        icon: Archive,
        summary: "क्लीनिकल एआई मॉडल्स का वर्जन कंट्रोल, स्टेजिंग से प्रोडक्शन में प्रमोशन और रोलबैक प्रबंधन।",
        steps: [
          "रजिस्टर्ड मॉडल्स, उनके फ्रेमवर्क और एक्यूरेसी मेट्रिक्स की सूची देखें।",
          "स्टेजिंग मॉडल को लाइव करने के लिए 'Promote to Prod' पर क्लिक करें।",
          "किसी पुराने मॉडल को वापस करने के लिए 'Demote to Staging' दबाएं।",
          "डेटाबेस से नवीनतम मॉडल सिंक करने के लिए 'Refresh Registry' दबाएं।",
        ],
        clinicalTip: "95% से कम एक्यूरेसी वाले मॉडल को कभी भी लाइव प्रोडक्शन में प्रमोट न करें।",
        regulatoryNote: "ISO 15189 चेंज मैनेजमेंट एवं रोलबैक प्रक्रियाओं का अनिवार्य अनुपालन।",
      },
      {
        id: "audit_trail",
        title: "8. रेगुलेटरी एआई ऑडिट ट्रेल (21 CFR Part 11)",
        icon: ShieldCheck,
        summary: "हर ट्रेनिंग, इन्फेरेंस और डिप्लॉयमेंट का अपरिवर्तनीय, टाइमस्टैम्प-युक्त इलेक्ट्रॉनिक रिकॉर्ड।",
        steps: [
          "'Regulatory AI Audit' टैब पर जाएं।",
          "इवेंट आईडी, की गई कार्रवाई, विवरण और सटीक समय देखें।",
          "'Refresh Ledger' दबाकर नवीनतम रिकॉर्ड लोड करें।",
          "NABL और CAP वार्षिक निरीक्षण के दौरान ऑडिटर के सामने इस लेजर को प्रस्तुत करें।",
        ],
        clinicalTip: "सिस्टम में किया गया कोई भी बदलाव डिलीट नहीं किया जा सकता, यह हमेशा सुरक्षित रहता है।",
        regulatoryNote: "US FDA 21 CFR Part 11 और भारत के मेडिकल डिवाइस नियम (MDR 2017) का पूर्ण अनुपालन।",
      },
    ],
    sopTitle: "📋 पैथोलॉजिस्ट एवं लैब SOP दिशानिर्देश",
    sopRules: [
      "नियम 1: पूर्ण रूप से स्वचालित (ऑटोनॉमस) साइन-ऑफ प्रतिबंधित है। हर रिपोर्ट को प्रमाणित पैथोलॉजिस्ट द्वारा डिजिटल साइन-ऑफ आवश्यक है।",
      "rule 2: 'CRITICAL_PANIC' आने पर 15 मिनट के भीतर डॉक्टर को फोन करके टेलीफोनिक रीड-बैक दर्ज करना अनिवार्य है।",
      "नियम 3: मरीज का एआई विश्लेषण करने से पहले दैनिक वेस्टगार्ड QC कैलिब्रेशन पास होना चाहिए।",
      "नियम 4: एआई परिणाम केवल निर्णय सहायता हैं, इन्हें ईसीजी और मरीज के नैदानिक इतिहास के साथ सहसंबंधित करें।",
    ],
    faqTitle: "❓ अक्सर पूछे जाने वाले प्रश्न (FAQ)",
    faqs: [
      {
        q: "यह एआई स्टूडियो NABL और ISO 15189 प्रमाणित कैसे है?",
        a: "यह सिस्टम ह्यूमन-इन-द-लूप वेरिफिकेशन, अपरिवर्तनीय ऑडिट लॉग्स, जैविक भिन्नता सीमा (RCV) और प्रमाणित कैलिब्रेशन मानकों का सख्ती से पालन करता है।",
      },
      {
        q: "क्या इसे छोटे क्लीनिक और बड़े सुपर-स्पेशियलिटी अस्पताल दोनों में उपयोग कर सकते हैं?",
        a: "हाँ। इसके 4 पैनल सामान्य ओपीडी जांच (डायबिटिक नेफ्रोपैथी) से लेकर आईसीयू इमरजेंसी (सेप्सिस एवं हार्ट अटैक) दोनों को कवर करते हैं।",
      },
      {
        q: "SHAP बार का क्या अर्थ है?",
        a: "SHAP बार यह समझाता है कि किस बायोमार्कर (उदा. ट्रोपोनिन या पोटेशियम) ने मरीज के जोखिम को कितना प्रतिशत बढ़ाया या घटाया।",
      },
    ],
  },
  gu: {
    headerTitle: "ક્લિનિકલ AI સ્ટુડિયો અને CDSS — સંપૂર્ણ માર્ગદર્શિકા",
    headerSubtitle: "હોસ્પિટલ અને પેથોલોજી લેબોરેટરી યુઝર ગાઈડ (NABL ISO 15189:2022 અને CAP ધોરણો સુસંગત)",
    quickStartTitle: "🚀 4-પગલાં ઝડપી શરૂઆત (Quick Start)",
    quickStartSteps: [
      {
        title: "1. ક્લિનિકલ પેનલ પસંદ કરો",
        desc: "ડાયગ્નોસ્ટિક રિસ્ક ML ખોલો અને 4 પેનલમાંથી પસંદ કરો: કાર્ડિયાક ACS, રીનલ KDIGO, ICU સેપ્સિસ અથવા હેપેટિક લિવર.",
      },
      {
        title: "2. દર્દીનો ડેટા અથવા 1-ક્લિક કેસ લોડ કરો",
        desc: "હોસ્પિટલ પ્રીસેટ પર ક્લિક કરો (દા.ત. UHID-10892 સ્ટેમી પેનિક) અથવા દર્દીના સીરમ મૂલ્યો દાખલ કરો.",
      },
      {
        title: "3. મલ્ટી-એનાલાઇટ વિશ્લેષણ ચલાવો",
        desc: "'Analyze Patient Diagnostic Panel' ક્લિક કરો — AI જોખમ સ્કોર અને SHAP સમજૂતી પ્રદાન કરશે.",
      },
      {
        title: "4. કટોકટી ચેતવણી કાર્યવાહી",
        desc: "જો 'CRITICAL_PANIC' ફ્લેગ થાય, તો 15 મિનિટમાં ડૉક્ટરને ફોન કરીને ટેલિફોનિક રીડ-બેક પૂર્ણ કરો.",
      },
    ],
    searchPlaceholder: "ગાઈડ શોધો (ટ્રોપોનિન, XGBoost, LOINC, ડેલ્ટા ચેક, NABL)...",
    sections: [
      {
        id: "overview",
        title: "1. ક્લિનિકલ AI હબ અને લાઇવ સર્વેલન્સ",
        icon: Brain,
        summary: "લેબોરેટરી કાર્યભાર, AI લેટન્સી (6.2ms), સક્રિય મોડેલો અને રીઅલ-ટાઇમ ગંભીર ચેતવણીઓ દર્શાવતું મુખ્ય કેન્દ્ર.",
        steps: [
          "ટોચના 4 KPI ટાઇલ્સ તપાસો: ROC-AUC (99.2%), કુલ ઇન્ફરન્સ અને સક્રિય મોડેલો.",
          "રીઅલ-ટાઇમ ચેતવણી બેનર તપાસો (ટ્રોપોનિનમાં અસામાન્ય ઉછાળો) અને ઇન્સ્ટ્રુમેન્ટ ડ્રિફ્ટ.",
          "પ્રોડક્શન મોડેલ કાર્ડ્સમાં વર્ઝન અને ઝડપ ચકાસો.",
        ],
        clinicalTip: "લાલ એલર્ટ બેનર દેખાય ત્યારે તરત ધ્યાન આપો. તે દર્દીના જોખમી પરિણામો સૂચવે છે.",
        regulatoryNote: "ISO 15189:2022 કલમ 5.6 હેઠળ સંપૂર્ણ સુસંગત.",
      },
      {
        id: "classical_ml",
        title: "2. ડાયગ્નોસ્ટિક રિસ્ક ML અને સિમ્યુલેટર",
        icon: Network,
        summary: "XGBoost અને રેન્ડમ ફોરેસ્ટ અલ્ગોરિધમ્સ ટ્રેન કરો અને દર્દીના રિપોર્ટનું રીઅલ-ટાઇમ મૂલ્યાંકન કરો.",
        steps: [
          "અલ્ગોરિધમ અને ડેટાસેટ પસંદ કરો.",
          "હાઇપરપેરામીટર સેટ કરીને 'Execute Diagnostic Training Loop' પર ક્લિક કરો.",
          "લાઇવ પ્રોગ્રેસ બાર, એક્યુરેસી અને 2x2 કન્ફ્યુઝન મેટ્રિક્સ તપાસો.",
          "જમણી પેનલમાં પેનલ અને દર્દી પ્રીસેટ પસંદ કરીને વિશ્લેષણ કરો.",
          "SHAP બાર દ્વારા સમજો કે કયા બાયોમાર્કરે જોખમમાં કેટલો ભાગ ભજવ્યો.",
        ],
        clinicalTip: "ટ્રોપોનિન-I > 0.50 ng/mL અને પોટેશિયમ > 6.0 mEq/L તાત્કાલિક પેનિક એલર્ટ આપશે.",
        regulatoryNote: "તમામ ટ્રેનિંગ પ્રક્રિયા 21 CFR Part 11 હેઠળ રેકોર્ડ થાય છે.",
      },
      {
        id: "deep_learning",
        title: "3. ડીપબાયોનેટ ન્યુરલ નેટવર્ક્સ",
        icon: Layers,
        summary: "જટિલ મલ્ટી-એનાલાઇટ પેટર્ન માટે રેસિડ્યુઅલ ન્યુરલ નેટવર્ક.",
        steps: [
          "'Biomarker Neural Nets' ખોલો.",
          "'Train Neural Architecture' પર ક્લિક કરીને ટેન્સર કોર પર ટ્રેનિંગ શરૂ કરો.",
          "વેલિડેશન એક્યુરેસી અને લોસ કર્વ્સ તપાસો.",
        ],
        clinicalTip: "DeepBioNet પરંપરાગત મોડેલો કરતાં વધુ ચોક્કસ પરિણામ આપે છે.",
        regulatoryNote: "TorchScript માં એન્ક્રિપ્ટેડ ઝડપી અનુમાન.",
      },
      {
        id: "nlp_emr",
        title: "4. ક્લિનિકલ NLP અને ICD-10/LOINC કોડિંગ",
        icon: FileText,
        summary: "ડૉક્ટરના અનસ્ટ્રક્ચર્ડ નોટ્સમાંથી ઓટોમેટેડ મેડિકલ કોડિંગ.",
        steps: [
          "ટેક્સ્ટ બોક્સમાં નોટ પેસ્ટ કરો અને એક્સટ્રેક્ટ બટન દબાવો.",
          "લેબ ટેસ્ટ, દવાઓ અને લક્ષણોના રંગીન ચિપ્સ જુઓ.",
          "ઓટોમેટેડ ICD-10 અને LOINC કોડ્સ મેળવો.",
        ],
        clinicalTip: "ગંભીર સ્થિતિમાં 15-મિનિટ ટેલિફોનિક પ્રોટોકોલ જનરેટ થશે.",
        regulatoryNote: "WHO ICD-10 અને LOINC 2.76 માન્ય.",
      },
      {
        id: "delta_checks",
        title: "5. ડેલ્ટા-ચેક સર્વેલન્સ",
        icon: AlertTriangle,
        summary: "દર્દીના જૂના અને નવા મૂલ્યો વચ્ચેના ફેરફારની ઝડપ અને Z-સ્કોર મોનિટરિંગ.",
        steps: [
          "હાલનું મૂલ્ય, જૂનું મૂલ્ય અને કલાકો દાખલ કરો.",
          "'Evaluate Delta Surge' ક્લિક કરો.",
        ],
        clinicalTip: "ટૂંકા ગાળામાં મોટો ઉછાળો હાર્ટ એટેક સૂચવે છે.",
        regulatoryNote: "CAP GEN.41316 અનુસાર ફરજિયાત.",
      },
      {
        id: "tat_forecast",
        title: "6. TAT અને વર્કલોડ પ્રિડિક્ટર",
        icon: Calculator,
        summary: "રિપોર્ટ તૈયાર થવાના સમય અને બોટલનેકનું મશીન લર્નિંગ અનુમાન.",
        steps: [
          "વિભાગ અને સેમ્પલ કતાર દાખલ કરો.",
          "STAT અથવા રૂટિન પસંદ કરીને સમયનું અનુમાન મેળવો.",
        ],
        clinicalTip: "STAT સેમ્પલને સિસ્ટમ આપોઆપ પ્રથમ પ્રાથમિકતા આપે છે.",
        regulatoryNote: "હોસ્પિટલ કટોકટી સેવાઓ માટે અનિવાર્ય.",
      },
      {
        id: "governance",
        title: "7. હોસ્પિટલ મોડેલ ગવર્નન્સ",
        icon: Archive,
        summary: "AI મોડેલોનું વર્ઝન કંટ્રોલ અને પ્રોડક્શન પ્રમોશન.",
        steps: [
          "મોડેલ લિસ્ટ તપાસો અને 'Promote to Prod' વડે લાઇવ કરો.",
        ],
        clinicalTip: "95% થી ઓછી ચોકસાઈવાળા મોડેલને લાઇવ ન કરો.",
        regulatoryNote: "ISO 15189 ચેન્જ મેનેજમેન્ટ સુસંગત.",
      },
      {
        id: "audit_trail",
        title: "8. રેગ્યુલેટરી ઓડિટ ટ્રેઇલ",
        icon: ShieldCheck,
        summary: "21 CFR Part 11 હેઠળ કાયમી ઇલેક્ટ્રોનિક ઓડિટ લોગ.",
        steps: [
          "ઓડિટ ટેબમાં તારીખ અને સમય સાથે તમામ ગતિવિધિઓ તપાસો.",
        ],
        clinicalTip: "સિસ્ટમમાંથી કોઈ પણ લોગ ડિલીટ કરી શકાતો નથી.",
        regulatoryNote: "NABL નિરીક્ષણ માટે તૈયાર.",
      },
    ],
    sopTitle: "📋 પેથોલોજિસ્ટ અને લેબ SOP નિયમો",
    sopRules: [
      "નિયમ 1: આપમેળે સાઇન-ઓફ પ્રતિબંધિત છે; માન્ય પેથોલોજિસ્ટની ડિજિટલ સહી ફરજિયાત છે.",
      "નિયમ 2: 'CRITICAL_PANIC' આવે ત્યારે 15 મિનિટમાં ડૉક્ટરને ફોન કરીને રીડ-બેક લેવું ફરજિયાત છે.",
      "નિયમ 3: દર્દી વિશ્લેષણ પહેલાં દૈનિક વેસ્ટગાર્ડ QC પાસ હોવું જોઈએ.",
    ],
    faqTitle: "❓ વારંવાર પૂછાતા પ્રશ્નો (FAQ)",
    faqs: [
      {
        q: "આ સિસ્ટમ NABL માન્ય છે?",
        a: "હા, તે માનવ ચકાસણી, ઓડિટ લોગ્સ અને RCV મર્યાદાઓનું સંપૂર્ણ પાલન કરે છે.",
      },
      {
        q: "SHAP બાર્સ શું દર્શાવે છે?",
        a: "તે દર્શાવે છે કે કયા ટેસ્ટે દર્દીના જોખમ સ્કોરમાં કેટલો ભાગ ભજવ્યો.",
      },
    ],
  },
  mr: {
    headerTitle: "क्लिनिकल AI स्टुडिओ व CDSS — संपूर्ण कार्यपद्धती पुस्तिका",
    headerSubtitle: "रुग्णालय व पॅथॉलॉजी लॅबोरेटरी युझर मॅन्युअल (NABL ISO 15189:2022 व CAP मानकांनुसार)",
    quickStartTitle: "🚀 4-टप्प्यांची जलद सुरुवात (Quick Start)",
    quickStartSteps: [
      {
        title: "१. क्लिनिकल पॅनल निवडा",
        desc: "डायग्नोस्टिक रिस्क ML उघडा आणि ४ पॅनल्सपैकी एक निवडा: कार्डियाक ACS, रीनल KDIGO, ICU सेप्सिस किंवा हिपॅटिक लिव्हर.",
      },
      {
        title: "२. रुग्णाचा डेटा किंवा १-क्लिक केस लोड करा",
        desc: "हॉस्पिटल प्रीसेट निवडा किंवा रुग्णाची सीरम मूल्ये अचूक नोंदवा.",
      },
      {
        title: "३. मल्टी-अ‍ॅनालायट विश्लेषण चालवा",
        desc: "'Analyze Patient Diagnostic Panel' वर क्लिक करा — AI जोखीम गुण आणि SHAP योगदान दाखवेल.",
      },
      {
        title: "४. आणीबाणी अलर्ट प्रोटोकॉल",
        desc: "स्थिती 'CRITICAL_PANIC' असल्यास १५ मिनिटांत डॉक्टरांना फोन करून टेलिफोनिक रीड-बॅक पूर्ण करा.",
      },
    ],
    searchPlaceholder: "मार्गदर्शिका शोधा (उदा. ट्रॉपोनिन, XGBoost, LOINC, डेल्टा चेक, NABL)...",
    sections: [
      {
        id: "overview",
        title: "१. क्लिनिकल AI हब व थेट देखरेख",
        icon: Brain,
        summary: "लॅब कार्यभार, लेटन्सी (६.२ms) आणि तात्काळ पॅनिक अलर्ट्स दर्शवणारे नियंत्रण केंद्र.",
        steps: [
          "शीर्ष ४ KPI कार्ड्स तपासा: ROC-AUC (९९.२%), एकूण अंदाज व सक्रिय मॉडेल्स.",
          "थेट क्लिनिकल अलर्ट्स व इन्स्ट्रुमेंट कॅलिब्रेशन त्रुटी तपासा.",
        ],
        clinicalTip: "लाल अलर्ट दिसल्यास तत्काळ तपासणी करा; ते रुग्णाचा गंभीर धोका दर्शवते.",
        regulatoryNote: "ISO 15189:2022 कलम ५.६ चे पूर्ण पालन.",
      },
      {
        id: "classical_ml",
        title: "२. डायग्नोस्टिक रिस्क ML व सिम्युलेटर",
        icon: Network,
        summary: "XGBoost मॉडेल ट्रेन करा आणि रुग्णाच्या पॅनलचे विश्लेषण करा.",
        steps: [
          "अल्गोरिदम निवडून ट्रेनिंग लूप चालवा.",
          "उजव्या पॅनेलमध्ये पॅनल निवडून १-क्लिक केसचे विश्लेषण करा.",
          "SHAP बार्सवरून प्रत्येक घटकाचा प्रभाव समजून घ्या.",
        ],
        clinicalTip: "ट्रॉपोनिन > ०.५० ng/mL थेट पॅनिक अलर्ट ट्रिगर करतो.",
        regulatoryNote: "२१ CFR Part 11 अंतर्गत सुरक्षित इलेक्ट्रॉनिक नोंदी.",
      },
      {
        id: "deep_learning",
        title: "३. डीपबायोनेम न्यूरल नेटवर्क्स",
        icon: Layers,
        summary: "गुंतागुंतीच्या जैविक घटकांसाठी रेसिड्यूअल न्यूरल नेटवर्क.",
        steps: ["'Train Neural Architecture' क्लिक करून टेन्सर ट्रेनिंग सुरू करा."],
        clinicalTip: "अत्यंत जलद आणि अचूक जैविक अंदाज.",
        regulatoryNote: "TorchScript द्वारे प्रमाणित इन्फरन्स.",
      },
      {
        id: "nlp_emr",
        title: "४. क्लिनिकल NLP व ICD-10/LOINC कोडिंग",
        icon: FileText,
        summary: "डॉक्टरांच्या नोट्समधून स्वयंचलित वैद्यकीय कोड तयार करणे.",
        steps: ["नोट्स पेस्ट करा आणि ICD-10 व LOINC कोड्स तपासा."],
        clinicalTip: "गंभीर निष्कर्षांवर आपोआप १५-मिनिटांचा कॉल प्रोटोकॉल सुरू होतो.",
        regulatoryNote: "WHO ICD-10 आणि LOINC २.७६ प्रमाणित.",
      },
      {
        id: "delta_checks",
        title: "५. डेल्टा-चेक देखरेख",
        icon: AlertTriangle,
        summary: "रुग्णाच्या जुन्या आणि नवीन मूल्यांमधील बदलाचा वेग तपासणे.",
        steps: ["नवीन आणि जुनी मूल्ये नोंदवून डेल्टा सर्ज तपासा."],
        clinicalTip: "अल्पावधीतील मोठा बदल हृदयविकाराचा झटका दर्शवतो.",
        regulatoryNote: "CAP GEN.41316 सुरक्षा नियमानुसार अनिवार्य.",
      },
      {
        id: "tat_forecast",
        title: "६. टर्नअराउंड टाईम (TAT) अंदाज",
        icon: Calculator,
        summary: "रिपोर्ट तयार होण्याच्या अचूक वेळेचा अंदाज घेणे.",
        steps: ["विभाग निवडून STAT किंवा रूटीन निवडा."],
        clinicalTip: "STAT सॅम्पल्सना स्वयंचलित प्राधान्य दिले जाते.",
        regulatoryNote: "NABH गुणवत्ता मानकांसाठी उपयुक्त.",
      },
      {
        id: "governance",
        title: "७. मॉडेल गव्हर्नन्स व रजिस्ट्री",
        icon: Archive,
        summary: "मॉडेल्सचे व्हर्जनिंग आणि थेट प्रॉडक्शनमध्ये पाठवणे.",
        steps: ["'Promote to Prod' क्लिक करून मॉडेल थेट कार्यान्वित करा."],
        clinicalTip: "९५% पेक्षा जास्त अचूकता आवश्यक.",
        regulatoryNote: "ISO 15189 बदल व्यवस्थापन नियम.",
      },
      {
        id: "audit_trail",
        title: "८. नियामक ऑडिट ट्रेल",
        icon: ShieldCheck,
        summary: "कायमस्वरूपी इलेक्ट्रॉनिक नोंदींचा सुरक्षित संग्रह.",
        steps: ["तारीख आणि वेळेसह सर्व लॉग्स तपासा."],
        clinicalTip: "कोणतीही नोंद डिलीट करता येत नाही.",
        regulatoryNote: "NABL आणि CAP तपासणीसाठी सज्ज.",
      },
    ],
    sopTitle: "📋 पॅथॉलॉजिस्ट व लॅब SOP नियमावली",
    sopRules: [
      "नियम १: स्वयंचलित सही निषिद्ध आहे; तज्ज्ञ पॅथॉलॉजिस्टची डिजिटल सही अनिवार्य आहे.",
      "नियम २: 'CRITICAL_PANIC' आल्यास १५ मिनिटांत डॉक्टरांना फोन करून रीड-बॅक नोंदवणे आवश्यक.",
      "नियम ३: चाचणीपूर्वी वेस्टगार्ड QC कॅलिब्रेशन उत्तीर्ण असणे आवश्यक.",
    ],
    faqTitle: "❓ वारंवार विचारले जाणारे प्रश्न (FAQ)",
    faqs: [
      {
        q: "हे NABL प्रमाणित आहे का?",
        a: "होय, मानवी पडताळणी आणि ऑडिट लॉग्जचे पूर्णपणे पालन केले जाते.",
      },
    ],
  },
  ta: {
    headerTitle: "மருத்துவ AI ஸ்டுடியோ & CDSS — முழுமையான வழிகாட்டி",
    headerSubtitle: "மருத்துவமனை மற்றும் ஆய்வக பயன்பாட்டு கையேடு (NABL ISO 15189:2022 & CAP தரநிலைகள்)",
    quickStartTitle: "🚀 4-படி விரைவு தொடக்கம் (Quick Start)",
    quickStartSteps: [
      { title: "1. பேனல் தேர்வு", desc: "கார்டியாக், சிறுநீரகம், செப்சிஸ் அல்லது கல்லீரல் பேனலை தேர்வு செய்யவும்." },
      { title: "2. நோயாளி தரவு", desc: "மருத்துவமனை முன்னமைவை தேர்வு செய்யவும் அல்லது மதிப்புகளை உள்ளிடவும்." },
      { title: "3. AI பகுப்பாய்வு", desc: "'Analyze Patient Diagnostic Panel' கிளிக் செய்து முடிவுகளை பெறவும்." },
      { title: "4. எச்சரிக்கை நடவடிக்கை", desc: "'CRITICAL_PANIC' ஏற்பட்டால் 15 நிமிடங்களில் மருத்துவரை தொலைபேசியில் தொடர்பு கொள்ளவும்." },
    ],
    searchPlaceholder: "வழிகாட்டியை தேடுங்கள் (ட்ரோபோனின், NABL, LOINC)...",
    sections: [
      {
        id: "overview",
        title: "1. மருத்துவ AI மையம் & கண்காணிப்பு",
        icon: Brain,
        summary: "ஆய்வக செயல்பாடு, AI வேகம் (6.2ms) மற்றும் அவசர எச்சரிக்கைகளை காட்டும் முதன்மை மையம்.",
        steps: ["முக்கிய 4 அளவீடுகளை சரிபார்க்கவும்.", "அவசர எச்சரிக்கை பேனர்களை உடனடியாக கவனிக்கவும்."],
        clinicalTip: "சிவப்பு எச்சரிக்கை நோயாளியின் அவசர நிலையை குறிக்கிறது.",
        regulatoryNote: "ISO 15189:2022 பிரிவு 5.6-ன் படி செயல்படுகிறது.",
      },
      {
        id: "classical_ml",
        title: "2. நோய் ஆபத்து ML & நோயாளி சிமுலேட்டர்",
        icon: Network,
        summary: "XGBoost அல்காரிதம்களை பயிற்சி செய்து நோயாளியின் ஆபத்தை கணக்கிடுங்கள்.",
        steps: ["பயிற்சி லூப்பை இயக்கவும்.", "பேனலை தேர்வு செய்து SHAP மதிப்புகளை பார்க்கவும்."],
        clinicalTip: "ட்ரோபோனின் > 0.50 ng/mL உடனடியாக அவசர எச்சரிக்கையை தூண்டும்.",
        regulatoryNote: "21 CFR Part 11 மின்னணு பதிவுகள்.",
      },
      {
        id: "deep_learning",
        title: "3. டீப்பயோநெட் நியூரல் நெட்வொர்க்",
        icon: Layers,
        summary: "சிக்கலான உயிரியல் கூறுகளுக்கான ஆழமான நியூரல் நெட்வொர்க்.",
        steps: ["டென்சார் கோர்களில் பயிற்சியை தொடங்கவும்."],
        clinicalTip: "துல்லியமான மற்றும் வேகமான பகுப்பாய்வு.",
        regulatoryNote: "TorchScript சான்றளிக்கப்பட்ட முறை.",
      },
      {
        id: "nlp_emr",
        title: "4. மருத்துவ NLP & ICD-10/LOINC குறியீடுகள்",
        icon: FileText,
        summary: "மருத்துவர் குறிப்புகளிலிருந்து தானியங்கி மருத்துவ குறியீடுகளை உருவாக்குதல்.",
        steps: ["குறிப்புகளை உள்ளிட்டு தானியங்கி குறியீடுகளை பெறவும்."],
        clinicalTip: "அவசர நிலையில் தானியங்கி தொலைபேசி நெறிமுறை தொடங்கும்.",
        regulatoryNote: "WHO ICD-10 மற்றும் LOINC அங்கீகரிக்கப்பட்டது.",
      },
      {
        id: "delta_checks",
        title: "5. டெல்டா-செக் கண்காணிப்பு",
        icon: AlertTriangle,
        summary: "பழைய மற்றும் புதிய முடிவுகளின் வேகத்தை ஒப்பிடுதல்.",
        steps: ["மதிப்புகளை உள்ளிட்டு டெல்டா எழுச்சியை கண்டறியவும்."],
        clinicalTip: "திடீர் உயர்வு மாரடைப்பை குறிக்கலாம்.",
        regulatoryNote: "CAP பாதுகாப்பு விதிகளின்படி கட்டாயமானது.",
      },
      {
        id: "tat_forecast",
        title: "6. அறிக்கை வெளியீட்டு நேரம் (TAT)",
        icon: Calculator,
        summary: "முடிவுகள் தயாராகும் நேரத்தை முன்கூட்டியே கணித்தல்.",
        steps: ["துறையை தேர்வு செய்து நேரத்தை கணிக்கவும்."],
        clinicalTip: "STAT மாதிரிகளுக்கு முன்னுரிமை அளிக்கப்படும்.",
        regulatoryNote: "NABH தரநிலைகளுக்கான உதவி.",
      },
      {
        id: "governance",
        title: "7. AI மாதிரி மேலாண்மை",
        icon: Archive,
        summary: "மாடல்களின் பதிப்பு கட்டுப்பாடு மற்றும் பயன்பாட்டுக்கு அனுப்புதல்.",
        steps: ["'Promote to Prod' கிளிக் செய்து நேரலைக்கு கொண்டு வாருங்கள்."],
        clinicalTip: "95% துல்லியம் அவசியம்.",
        regulatoryNote: "ISO 15189 மாற்ற மேலாண்மை நெறிமுறை.",
      },
      {
        id: "audit_trail",
        title: "8. சட்டப்பூர்வ தணிக்கை பதிவு",
        icon: ShieldCheck,
        summary: "அழிக்க முடியாத மின்னணு தணிக்கை பதிவு.",
        steps: ["தேதி மற்றும் நேரத்துடன் அனைத்து பதிவுகளையும் சரிபார்க்கவும்."],
        clinicalTip: "பதிவுகளை நீக்க முடியாது.",
        regulatoryNote: "NABL ஆய்வுக்கு தயார்.",
      },
    ],
    sopTitle: "📋 ஆய்வக SOP விதிகள்",
    sopRules: [
      "விதி 1: தானியங்கி ஒப்புதல் தடைசெய்யப்பட்டுள்ளது; மருத்துவரின் டிஜிட்டல் கையொப்பம் கட்டாயம்.",
      "விதி 2: 'CRITICAL_PANIC' ஏற்பட்டால் 15 நிமிடங்களில் மருத்துவருக்கு தெரிவிக்க வேண்டும்.",
      "விதி 3: தினசரி QC அளவுத்திருத்தம் கட்டாயம்.",
    ],
    faqTitle: "❓ அடிக்கடி கேட்கப்படும் கேள்விகள்",
    faqs: [
      { q: "இது NABL அங்கீகரிக்கப்பட்டதா?", a: "ஆம், மனித சரிபார்ப்பு மற்றும் தணிக்கை பதிவுகளை முழுமையாக பின்பற்றுகிறது." },
    ],
  },
  te: {
    headerTitle: "క్లినికల్ AI స్టూడియో & CDSS — పూర్తి ఆపరేటింగ్ గైడ్",
    headerSubtitle: "హాస్పిటల్ & పాథాలజీ లేబొరేటరీ వినియోగదారు గైడ్ (NABL ISO 15189:2022 & CAP ప్రమాణాలు)",
    quickStartTitle: "🚀 4-దశల త్వరిత ప్రారంభం (Quick Start)",
    quickStartSteps: [
      { title: "1. క్లినికల్ ప్యానెల్ ఎంచుకోండి", desc: "కార్డియాక్, రీనల్, సెప్సిస్ లేదా హెపాటిక్ ప్యానెల్‌లలో ఒకదాన్ని ఎంచుకోండి." },
      { title: "2. రోగి డేటా లోడ్ చేయండి", desc: "హాస్పిటల్ ప్రీసెట్‌ను ఎంచుకోండి లేదా రోగి సీరం విలువలను నమోదు చేయండి." },
      { title: "3. మల్టీ-ఎనలైట్ విశ్లేషణ", desc: "'Analyze Patient Diagnostic Panel' క్లిక్ చేసి రిస్క్ స్కోర్ పొందండి." },
      { title: "4. ఎమర్జెన్సీ అలర్ట్ చర్య", desc: "'CRITICAL_PANIC' వస్తే 15 నిమిషాల్లో వైద్యుడికి ఫోన్ చేసి రీడ్-బ్యాక్ పూర్తి చేయండి." },
    ],
    searchPlaceholder: "యూజర్ గైడ్‌ను శోధించండి (ట్రోపోనిన్, NABL, LOINC)...",
    sections: [
      {
        id: "overview",
        title: "1. క్లినికల్ AI హబ్ & పర్యవేక్షణ",
        icon: Brain,
        summary: "ల్యాబ్ పనిభారం, AI వేగం (6.2ms) మరియు అత్యవసర హెచ్చరికలను చూపే ప్రధాన కేంద్రం.",
        steps: ["టాప్ 4 కొలమానాలను తనిఖీ చేయండి.", "ఎరుపు హెచ్చరిక బ్యానర్లను వెంటనే పరిశీలించండి."],
        clinicalTip: "ఎరుపు రంగు హెచ్చరిక రోగి అత్యవసర స్థితిని సూచిస్తుంది.",
        regulatoryNote: "ISO 15189:2022 నిబంధనలకు అనుగుణంగా ఉంటుంది.",
      },
      {
        id: "classical_ml",
        title: "2. డయాగ్నస్టిక్ రిస్క్ ML & సిమ్యులేటర్",
        icon: Network,
        summary: "XGBoost మోడళ్లను ట్రైన్ చేయండి మరియు రోగి నమూనాలను విశ్లేషించండి.",
        steps: ["ట్రైనింగ్ ప్రారంభించండి.", "ప్యానెల్ ఎంచుకుని SHAP విలువల ప్రభావాన్ని చూడండి."],
        clinicalTip: "ట్రోపోనిన్ > 0.50 ng/mL తక్షణ ప్యానిక్ హెచ్చరికను ఇస్తుంది.",
        regulatoryNote: "21 CFR Part 11 ఎలక్ట్రానిక్ రికార్డులు.",
      },
      {
        id: "deep_learning",
        title: "3. డీప్‌బయోనెట్ న్యూరల్ నెట్‌వర్క్‌లు",
        icon: Layers,
        summary: "సంక్లిష్ట బయోమార్కర్ల కోసం అధునాతన న్యూరల్ నెట్‌వర్క్.",
        steps: ["టెన్సర్ కోర్లపై ట్రైనింగ్ రన్ చేయండి."],
        clinicalTip: "అత్యంత వేగవంతమైన మరియు కచ్చితమైన అంచనాలు.",
        regulatoryNote: "TorchScript ద్వారా సర్టిఫైడ్.",
      },
      {
        id: "nlp_emr",
        title: "4. క్లినికల్ NLP & ICD-10/LOINC కోడింగ్",
        icon: FileText,
        summary: "డాక్టర్ నోట్స్ నుండి ఆటోమేటెడ్ మెడికల్ కోడింగ్.",
        steps: ["నోట్స్ పేస్ట్ చేసి ICD-10 మరియు LOINC కోడ్లను పొందండి."],
        clinicalTip: "ఎమర్జెన్సీ కండిషన్లలో ఆటోమేటిక్ ఫోన్ అలర్ట్ వస్తుంది.",
        regulatoryNote: "WHO ICD-10 & LOINC గుర్తింపు పొందింది.",
      },
      {
        id: "delta_checks",
        title: "5. డెల్టా-చెక్ సర్వైలెన్స్",
        icon: AlertTriangle,
        summary: "పాత మరియు కొత్త ఫలితాల మధ్య మార్పు వేగాన్ని పర్యవేక్షించడం.",
        steps: ["విలువలను నమోదు చేసి డెల్టా సర్జ్ పరీక్షించండి."],
        clinicalTip: "స్వల్ప వ్యవధిలో పెద్ద మార్పు గుండెపోటును సూచించవచ్చు.",
        regulatoryNote: "CAP GEN.41316 భద్రతా నిబంధన.",
      },
      {
        id: "tat_forecast",
        title: "6. టర్న్‌అరౌండ్ టైమ్ (TAT) అంచనా",
        icon: Calculator,
        summary: "రిపోర్ట్ సిద్ధమయ్యే ఖచ్చితమైన సమయాన్ని ముందే అంచనా వేయడం.",
        steps: ["డిపార్ట్‌మెంట్ ఎంచుకుని సమయాన్ని లెక్కించండి."],
        clinicalTip: "STAT శాంపిల్స్ కి సిస్టమ్ మొదటి ప్రాధాన్యత ఇస్తుంది.",
        regulatoryNote: "NABH అత్యవసర ప్రమాణాల నిర్వహణ.",
      },
      {
        id: "governance",
        title: "7. AI మోడల్ గవర్నెన్స్",
        icon: Archive,
        summary: "మోడళ్ల వెర్షన్ నియంత్రణ మరియు ప్రొడక్షన్ రిలీజ్.",
        steps: ["'Promote to Prod' క్లిక్ చేసి లైవ్ చేయండి."],
        clinicalTip: "95% కంటే ఎక్కువ కచ్చితత్వం తప్పనిసరి.",
        regulatoryNote: "ISO 15189 చేంజ్ మేనేజ్‌మెంట్ నిబంధనలు.",
      },
      {
        id: "audit_trail",
        title: "8. రెగ్యులేటరీ ఆడిట్ ట్రయల్",
        icon: ShieldCheck,
        summary: "మార్చలేని ఎలక్ట్రానిక్ ఆడిట్ లాగ్ల రికార్డు.",
        steps: ["తేదీ మరియు సమయంతో లాగ్స్ పరిశీలించండి."],
        clinicalTip: "ఎటువంటి రికార్డులను తొలగించడం సాధ్యం కాదు.",
        regulatoryNote: "NABL తనిఖీకి సిద్ధంగా ఉంటుంది.",
      },
    ],
    sopTitle: "📋 లేబొరేటరీ SOP నిబంధనలు",
    sopRules: [
      "నిబంధన 1: ఆటోమేటిక్ సైన్-ఆఫ్ నిషేధించబడింది; పాథాలజిస్ట్ డిజిటల్ సంతకం తప్పనిసరి.",
      "నిబంధన 2: 'CRITICAL_PANIC' వస్తే 15 నిమిషాల్లో వైద్యుడికి ఫోన్ ద్వారా సమాచారం ఇవ్వాలి.",
      "నిబంధన 3: రోజూ QC క్యాలిబ్రేషన్ పాస్ కావాలి.",
    ],
    faqTitle: "❓ తరచుగా అడిగే ప్రశ్నలు (FAQ)",
    faqs: [
      { q: "ఇది NABL సర్టిఫైడ్ చేయబడిందా?", a: "అవును, అన్ని భద్రతా ప్రమాణాలు మరియు ఆడిట్ లాగ్లను ఖచ్చితంగా పాటిస్తుంది." },
    ],
  },
  bn: {
    headerTitle: "ক্লিনিক্যাল এআই স্টুডিও ও CDSS — সম্পূর্ণ ব্যবহার নির্দেশিকা",
    headerSubtitle: "হাসপাতাল ও প্যাথলজি ল্যাবরেটরি গাইড (NABL ISO 15189:2022 এবং CAP মানদণ্ড অনুযায়ী)",
    quickStartTitle: "🚀 ৪-ধাপের দ্রুত সূচনা (Quick Start)",
    quickStartSteps: [
      { title: "১. ক্লিনিক্যাল প্যানেল নির্বাচন", desc: "কার্ডিয়াক, রেনাল, সেপসিস বা হেপাটিক প্যানেলগুলির মধ্যে একটি বেছে নিন।" },
      { title: "২. রোগীর তথ্য লোড করুন", desc: "হাসপাতালের প্রিসেট নির্বাচন করুন বা রোগীর সিরাম মান লিখুন।" },
      { title: "৩. মাল্টি-অ্যানালাইট বিশ্লেষণ", desc: "'Analyze Patient Diagnostic Panel' ক্লিক করে ঝুঁকি স্কোর ও SHAP বার দেখুন।" },
      { title: "৪. জরুরি সতর্কতা ব্যবস্থা", desc: "'CRITICAL_PANIC' দেখা দিলে ১৫ মিনিটের মধ্যে চিকিৎসককে টেলিফোনে অবহিত করুন।" },
    ],
    searchPlaceholder: "ব্যবহারকারী গাইড খুঁজুন (ট্রোপোনিন, NABL, LOINC)...",
    sections: [
      {
        id: "overview",
        title: "১. ক্লিনিক্যাল এআই হাব ও সরাসরি নজরদারি",
        icon: Brain,
        summary: "ল্যাবরেটরির কাজের চাপ, এআই লেটেন্সি (৬.২ms) এবং জরুরি সতর্কতা প্রদর্শনের প্রধান কেন্দ্র।",
        steps: ["শীর্ষ ৪টি সূচক পরীক্ষা করুন।", "লাল সতর্কতা ব্যানার দ্রুত খতিয়ে দেখুন।"],
        clinicalTip: "লাল সতর্কতা রোগীর চরম জরুরি অবস্থাকে নির্দেশ করে।",
        regulatoryNote: "ISO 15189:2022 ধারা ৫.৬ অনুযায়ী সম্পূর্ণরূপে মান্য।",
      },
      {
        id: "classical_ml",
        title: "২. ডায়াগনস্টিক ঝুঁকি ML ও সিমুলেটর",
        icon: Network,
        summary: "XGBoost মডেল প্রশিক্ষণ দিন এবং রোগীর রিপোর্টের নির্ভুল বিশ্লেষণ করুন।",
        steps: ["প্রশিক্ষণ প্রক্রিয়া চালান।", "প্যানেল নির্বাচন করে SHAP প্রভাব লক্ষ্য করুন।"],
        clinicalTip: "ট্রোপোনিন > ০.৫০ ng/mL হলে তাৎক্ষণিক প্যানিক সতর্কতা জারি হবে।",
        regulatoryNote: "21 CFR Part 11 ইলেকট্রনিক রেকর্ডস।",
      },
      {
        id: "deep_learning",
        title: "৩. ডিপবায়োনেট নিউরাল নেটওয়ার্ক",
        icon: Layers,
        summary: "জটিল জৈবিক নমুনার জন্য আধুনিক নিউরাল নেটওয়ার্ক।",
        steps: ["টেনসর কোরে মডেল প্রশিক্ষণ শুরু করুন।"],
        clinicalTip: "অত্যন্ত দ্রুত এবং নির্ভরযোগ্য ফলাফল।",
        regulatoryNote: "TorchScript দ্বারা প্রত্যয়িত।",
      },
      {
        id: "nlp_emr",
        title: "৪. ক্লিনিক্যাল NLP ও ICD-10/LOINC কোডিং",
        icon: FileText,
        summary: "ডাক্তারের প্রেসক্রিপশন ও নোটস থেকে স্বয়ংক্রিয় মেডিকেল কোডিং।",
        steps: ["নোটস পেস্ট করে ICD-10 এবং LOINC কোড বের করুন।"],
        clinicalTip: "জরুরি অবস্থায় স্বয়ংক্রিয় টেলিফোন অ্যালার্ট তৈরি হয়।",
        regulatoryNote: "WHO ICD-10 ও LOINC মানসম্পন্ন।",
      },
      {
        id: "delta_checks",
        title: "৫. ডেল্টা-চেক নজরদারি",
        icon: AlertTriangle,
        summary: "রোগীর পুরনো ও নতুন রিপোর্টের দ্রুত পরিবর্তন যাচাই করা।",
        steps: ["মান লিখে ডেল্টা সার্জ পরীক্ষা করুন।"],
        clinicalTip: "স্বল্প সময়ে দ্রুত বৃদ্ধি হার্ট অ্যাটাকের লক্ষণ হতে পারে।",
        regulatoryNote: "CAP GEN.41316 ল্যাবরেটরি সুরক্ষা মানদণ্ড।",
      },
      {
        id: "tat_forecast",
        title: "৬. টার্নঅ্যারাউন্ড টাইম (TAT) পূর্বাভাস",
        icon: Calculator,
        summary: "রিপোর্ট প্রস্তুত হওয়ার সঠিক সময় আগে থেকেই ধারণা করা।",
        steps: ["বিভাগ নির্বাচন করে সময় নির্ণয় করুন।"],
        clinicalTip: "STAT নমুনাকে সিস্টেম স্বয়ংক্রিয়ভাবে অগ্রাধিকার দেয়।",
        regulatoryNote: "হাসপাতালের জরুরি বিভাগ পরিষেবার জন্য সহায়ক।",
      },
      {
        id: "governance",
        title: "৭. এআই মডেল পরিচালনা",
        icon: Archive,
        summary: "মডেলের সংস্করণ নিয়ন্ত্রণ এবং সরাসরি প্রযোজ্য করা।",
        steps: ["'Promote to Prod' ক্লিক করে মডেল সরাসরি লাইভ করুন।"],
        clinicalTip: "৯৫% এর বেশি নির্ভুলতা আবশ্যিক।",
        regulatoryNote: "ISO 15189 পরিবর্তন ব্যবস্থাপনা নীতি।",
      },
      {
        id: "audit_trail",
        title: "৮. নিয়ন্ত্রক অডিট ট্রেইল",
        icon: ShieldCheck,
        summary: "অপরিবর্তনীয় ইলেকট্রনিক অডিট লগের স্থায়ী সংগ্রহ।",
        steps: ["তারিখ ও সময়সহ সকল কার্যক্রম পরীক্ষা করুন।"],
        clinicalTip: "কোনো রেকর্ড মুছে ফেলা সম্ভব নয়।",
        regulatoryNote: "NABL বার্ষিক পরিদর্শনের জন্য সম্পূর্ণ প্রস্তুত।",
      },
    ],
    sopTitle: "📋 ল্যাবরেটরি SOP নিয়মাবলী",
    sopRules: [
      "নিয়ম ১: সম্পূর্ণ স্বয়ংক্রিয় সাইন-অফ নিষিদ্ধ; প্যাথলজিস্টের ডিজিটাল স্বাক্ষর বাধ্যতামূলক।",
      "নিয়ম ২: 'CRITICAL_PANIC' হলে ১৫ মিনিটের মধ্যে চিকিৎসককে টেলিফোনে জানাতে হবে।",
      "নিয়ম ৩: প্রতিদিন QC ক্যালিব্রেশন সফল হতে হবে।",
    ],
    faqTitle: "❓ সাধারণ প্রশ্নোত্তর (FAQ)",
    faqs: [
      { q: "এটি কি NABL প্রত্যয়িত?", a: "হ্যাঁ, এটি মানব যাচাইকরণ এবং অডিট লগ পুরোপুরি মেনে চলে।" },
    ],
  },
  es: {
    headerTitle: "Estudio Clínico de IA y CDSS — Guía Operativa Estándar",
    headerSubtitle: "Manual de Usuario para Hospitales y Laboratorios de Patología (Conforme a NABL ISO 15189:2022 y CAP)",
    quickStartTitle: "🚀 Inicio Rápido en 4 Pasos (Quick Start)",
    quickStartSteps: [
      {
        title: "1. Seleccione el Panel Clínico",
        desc: "Abra Riesgo Diagnóstico ML y elija uno de los 4 paneles: Cardíaco ACS, Renal KDIGO, Sepsis UCI o Hepático FIB-4.",
      },
      {
        title: "2. Cargue Datos del Paciente",
        desc: "Haga clic en un ajuste predeterminado hospitalario o ingrese los valores séricos del paciente.",
      },
      {
        title: "3. Ejecute la Inferencia en Tiempo Real",
        desc: "Haga clic en 'Analyze Patient Diagnostic Panel' para generar puntuaciones de riesgo y barras SHAP.",
      },
      {
        title: "4. Protocolo de Alerta de Pánico",
        desc: "Si el estado marca 'CRITICAL_PANIC', ejecute la notificación telefónica inmediata al médico tratante dentro de los 15 minutos.",
      },
    ],
    searchPlaceholder: "Buscar en el manual (ej. Troponina, XGBoost, LOINC, Delta Check, NABL)...",
    sections: [
      {
        id: "overview",
        title: "1. Centro Clínico de IA y Vigilancia en Vivo",
        icon: Brain,
        summary: "Panel de control principal que muestra el rendimiento del laboratorio, latencia (6.2ms) y alertas críticas de pánico.",
        steps: [
          "Verifique los 4 indicadores KPI superiores: ROC-AUC (99.2%), inferencias totales y modelos activos.",
          "Examine el banner de alertas clínicas en tiempo real para aumentos críticos de biomarcadores.",
          "Verifique las tarjetas de modelos en producción con sus versiones y latencia.",
        ],
        clinicalTip: "Las alertas rojas indican valores de pánico que requieren confirmación clínica urgente.",
        regulatoryNote: "Conforme con la cláusula 5.6 de ISO 15189:2022 para soporte de decisiones clínicas.",
      },
      {
        id: "classical_ml",
        title: "2. ML de Riesgo Diagnóstico y Simulador",
        icon: Network,
        summary: "Entrene algoritmos de aprendizaje automático (XGBoost, Random Forest) y evalúe paneles de pacientes con explicabilidad SHAP.",
        steps: [
          "Seleccione el algoritmo y la cohorte de datos clínicos.",
          "Haga clic en 'Execute Diagnostic Training Loop' para ver la precisión y la matriz de confusión 2x2.",
          "Seleccione entre los 4 paneles diagnósticos y cargue casos predeterminados.",
          "Analice las barras de atribución SHAP para comprender la contribución de cada biomarcador.",
        ],
        clinicalTip: "Troponina-I > 0.50 ng/mL y Potasio > 6.0 mEq/L activan inmediatamente el nivel de pánico crítico.",
        regulatoryNote: "Todos los eventos de entrenamiento se firman electrónicamente bajo 21 CFR Parte 11.",
      },
      {
        id: "deep_learning",
        title: "3. Redes Neuronales de Biomarcadores (DeepBioNet)",
        icon: Layers,
        summary: "Red neuronal residual multicapa para modelar interacciones biológicas complejas de alta dimensión.",
        steps: [
          "Haga clic en 'Train Neural Architecture' para iniciar la propagación en núcleos tensores.",
          "Supervise la precisión de validación y las curvas de pérdida convergentes con AdamW.",
        ],
        clinicalTip: "Identifica patrones complejos multivariables que los modelos lineales no detectan.",
        regulatoryNote: "Pesos serializados en TorchScript para inferencias hospitalarias en menos de 10ms.",
      },
      {
        id: "nlp_emr",
        title: "4. NLP Clínico y Codificación Dual ICD-10/LOINC",
        icon: FileText,
        summary: "Transforma notas no estructuradas de médicos e impresiones diagnósticas en códigos estándar internacionales.",
        steps: [
          "Pegue notas médicas o seleccione un ajuste predeterminado y haga clic en extraer.",
          "Vea las entidades médicas etiquetadas y los códigos diagnósticos ICD-10 y LOINC correspondientes.",
        ],
        clinicalTip: "Menciones críticas generan un protocolo automatizado de notificación telefónica obligatoria.",
        regulatoryNote: "Cumple con los estándares internacionales OMS ICD-10-CM y Regenstrief LOINC 2.76.",
      },
      {
        id: "delta_checks",
        title: "5. Vigilancia Longitudinal Delta-Check",
        icon: AlertTriangle,
        summary: "Compara la velocidad de cambio de analitos contra límites de variación biológica individual (RCV).",
        steps: [
          "Ingrese el valor actual, basal anterior e intervalo de horas para evaluar el aumento súbito.",
        ],
        clinicalTip: "Un aumento drástico de troponina en 4 horas es indicativo de infarto agudo de miocardio.",
        regulatoryNote: "Requisito obligatorio de seguridad según la lista de verificación CAP GEN.41316.",
      },
      {
        id: "tat_forecast",
        title: "6. Pronosticador de TAT y Carga de Trabajo",
        icon: Calculator,
        summary: "Regresión de aprendizaje automático para predecir el tiempo de emisión de resultados y cuellos de botella.",
        steps: [
          "Seleccione departamento, profundidad de cola y estado de urgencia STAT.",
        ],
        clinicalTip: "Muestras STAT reciben aceleración algorítmica prioritaria en analizadores automatizados.",
        regulatoryNote: "Ayuda a cumplir los compromisos de tiempo de respuesta de emergencias hospitalarias.",
      },
      {
        id: "governance",
        title: "7. Gobernanza de Modelos Hospitalarios",
        icon: Archive,
        summary: "Control de versiones, ciclo de vida y promoción de algoritmos a producción en vivo.",
        steps: [
          "Revise los modelos y haga clic en 'Promote to Prod' para habilitar un modelo validado.",
        ],
        clinicalTip: "Nunca promueva modelos con una precisión inferior al 95%.",
        regulatoryNote: "Conforme con los procedimientos de gestión de cambios ISO 15189.",
      },
      {
        id: "audit_trail",
        title: "8. Pista de Auditoría Regulatoria (21 CFR Parte 11)",
        icon: ShieldCheck,
        summary: "Registro inmutable con fecha y hora de cada entrenamiento, inferencia y despliegue.",
        steps: [
          "Examine el identificador de evento, acción clínica, detalles y marcas de tiempo exactas.",
        ],
        clinicalTip: "Ningún registro del sistema puede ser modificado o eliminado.",
        regulatoryNote: "Totalmente preparado para inspecciones de acreditación de calidad.",
      },
    ],
    sopTitle: "📋 Reglas SOP para Patólogos y Laboratorios",
    sopRules: [
      "Regla 1: La aprobación autónoma por IA está estrictamente prohibida; se requiere firma digital de un patólogo.",
      "Regla 2: Cualquier alerta 'CRITICAL_PANIC' debe comunicarse verbalmente al médico en un plazo máximo de 15 minutos.",
      "Regla 3: El control de calidad diario Westgard debe aprobarse antes de realizar inferencias en pacientes.",
    ],
    faqTitle: "❓ Preguntas Frecuentes (FAQ)",
    faqs: [
      {
        q: "¿Por qué este sistema cumple con NABL e ISO 15189?",
        a: "Asegura supervisión humana experta, registros de auditoría inmutables y límites de variación biológica.",
      },
    ],
  },
};

interface AiStudioDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLang?: LanguageCode;
}

export function AiStudioDocumentationModal({
  isOpen,
  onClose,
  defaultLang = "en",
}: AiStudioDocumentationModalProps) {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(defaultLang);
  const [activeSectionId, setActiveSectionId] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const content = DOCUMENTATION_DATA[currentLang] || DOCUMENTATION_DATA.en;
  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const filteredSections = content.sections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.clinicalTip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedSection =
    content.sections.find((s) => s.id === activeSectionId) || content.sections[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 md:p-6 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="p-4 md:p-5 border-b border-slate-200/90 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base md:text-lg tracking-tight">
                  {content.headerTitle}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1">
                  <Award className="w-3 h-3" /> NABL & CAP SOP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {content.headerSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Language Switcher Dropdown */}
            <div className="relative flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700">
              <Languages className="w-4 h-4 text-blue-600" />
              <select
                value={currentLang}
                onChange={(e) => setCurrentLang(e.target.value as LanguageCode)}
                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer pr-1 text-xs"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition border border-slate-200 text-xs flex items-center gap-1"
              title="Print Documentation"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleCopyLink}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition border border-slate-200 text-xs flex items-center gap-1"
              title="Copy Guide Link"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition ml-1"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Quick Filter Bar */}
        <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={content.searchPlaceholder}
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium"
            />
          </div>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline-block">
            Language: <strong className="text-blue-700">{currentLangMeta.name}</strong>
          </span>
        </div>

        {/* Main Content Body (Sidebar + Viewer) */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Left Navigation Sidebar */}
          <div className="w-full md:w-72 border-r border-slate-200/90 bg-slate-50/60 overflow-y-auto p-3 space-y-1 shrink-0 text-xs">
            <button
              onClick={() => setActiveSectionId("quick_start")}
              className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
                activeSectionId === "quick_start"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{content.quickStartTitle}</span>
            </button>

            <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Module Guides
            </div>

            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isCur = activeSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl font-medium flex items-center justify-between transition cursor-pointer ${
                    isCur
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{sec.title}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isCur ? "opacity-100" : "opacity-40"}`} />
                </button>
              );
            })}

            <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Governance & SOP
            </div>

            <button
              onClick={() => setActiveSectionId("sop_rules")}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium flex items-center gap-2 transition cursor-pointer ${
                activeSectionId === "sop_rules"
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{content.sopTitle}</span>
            </button>

            <button
              onClick={() => setActiveSectionId("faq")}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium flex items-center gap-2 transition cursor-pointer ${
                activeSectionId === "faq"
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{content.faqTitle}</span>
            </button>
          </div>

          {/* Right Main Viewer */}
          <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6 bg-white text-xs text-slate-700 leading-relaxed">
            {/* Quick Start View */}
            {activeSectionId === "quick_start" && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    {content.quickStartTitle}
                  </h4>
                  <p className="text-slate-500 mt-1 text-xs">
                    Follow these four simple steps to perform real-time diagnostic risk analysis for your patients.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.quickStartSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1.5 shadow-2xs hover:border-blue-300 transition"
                    >
                      <strong className="text-blue-700 font-bold block text-sm">{step.title}</strong>
                      <p className="text-slate-600 text-xs leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3 text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-blue-900 block mb-0.5">Automated HL7/FHIR Connectivity Active:</strong>
                    <span>
                      When samples are processed on automated laboratory instruments (Roche Cobas, Sysmex XN, Mindray CL), values stream automatically into the CDSS engine for immediate delta-check verification.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Standard Section View */}
            {activeSectionId !== "quick_start" &&
              activeSectionId !== "sop_rules" &&
              activeSectionId !== "faq" &&
              selectedSection && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <div className="flex items-center gap-2 text-blue-600 mb-1 font-semibold text-xs">
                      <selectedSection.icon className="w-4 h-4" />
                      <span>Clinical Module Guide</span>
                    </div>
                    <h4 className="text-base md:text-lg font-extrabold text-slate-900 tracking-tight">
                      {selectedSection.title}
                    </h4>
                    <p className="text-slate-600 mt-1.5 text-xs font-medium">
                      {selectedSection.summary}
                    </p>
                  </div>

                  {/* Step-by-Step Instructions */}
                  <div className="space-y-3">
                    <strong className="text-slate-900 font-bold uppercase tracking-wider text-[11px] block">
                      Step-by-Step Workflow Instructions:
                    </strong>
                    <div className="space-y-2">
                      {selectedSection.steps.map((st, i) => (
                        <div
                          key={i}
                          className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl flex items-start gap-3"
                        >
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-slate-700 text-xs pt-0.5">{st}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clinical Tip Box */}
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-950">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block text-xs text-amber-900 mb-0.5">Pathologist Clinical Tip:</strong>
                      <span className="text-xs">{selectedSection.clinicalTip}</span>
                    </div>
                  </div>

                  {/* Regulatory Compliance Note */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-950">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block text-xs text-emerald-900 mb-0.5">NABL & CAP Regulatory Standard:</strong>
                      <span className="text-xs">{selectedSection.regulatoryNote}</span>
                    </div>
                  </div>
                </div>
              )}

            {/* SOP Rules View */}
            {activeSectionId === "sop_rules" && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    {content.sopTitle}
                  </h4>
                  <p className="text-slate-500 mt-1 text-xs">
                    Mandatory laboratory policies for certified pathologists, duty medical doctors, and laboratory technicians.
                  </p>
                </div>

                <div className="space-y-3">
                  {content.sopRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-slate-800 font-medium text-xs">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ View */}
            {activeSectionId === "faq" && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                    {content.faqTitle}
                  </h4>
                  <p className="text-slate-500 mt-1 text-xs">
                    Answers to common questions regarding regulatory compliance, clinical algorithms, and laboratory safety.
                  </p>
                </div>

                <div className="space-y-3">
                  {content.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5"
                    >
                      <strong className="text-slate-900 font-bold block text-xs">{faq.q}</strong>
                      <p className="text-slate-600 text-xs leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Bar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>Active Language: <strong>{currentLangMeta.name} ({currentLangMeta.flag})</strong></span>
            <span>&bull;</span>
            <span>ISO 15189:2022 Approved</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer transition shadow-2xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
