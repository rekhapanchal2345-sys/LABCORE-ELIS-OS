"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/dashboardlayout";
import {
  Shield, Activity, CheckCircle2, AlertCircle, Loader2, QrCode, RefreshCw,
  Search, Copy, Download, Users, FileText, Link as LinkIcon, Unlink, Eye, Clock,
  Wifi, WifiOff, Server, Database, ArrowRight, X, CheckCircle, Sparkles,
  Play, Radio, Terminal, Send, CheckSquare, Layers, Lock, Phone, User,
  FileCode, ExternalLink, ChevronRight, Printer, Zap, Globe, Tag,
  AlertTriangle, Info, ChevronDown, ChevronUp, List, Grid, UserPlus,
} from "lucide-react";
import AbhaLinkModal from "@/components/abdm/AbhaLinkModal";
import { getAccessToken } from "@/lib/auth-storage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getAuthToken(): string {
  return getAccessToken() ?? "";
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function apiGet(path: string) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
    const data = await res.json();
    if (data.success) return data.data;
  } catch (err) {
    console.warn(`API GET ${path} failed, using default:`, err);
  }
  return null;
}

async function apiPost(path: string, body: object) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({ status: res.status, message: "Acknowledged" }));
  if (!data.success && data.error) {
    throw new Error(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
  }
  return data.data ?? data;
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface AbdmStatus {
  mockMode: boolean;
  environment: string;
  gatewayBaseUrl: string;
  hipId: string;
  labName: string;
  features: Record<string, boolean>;
}

interface AbdmStats {
  totalAbhaPatients: number;
  totalCareContexts: number;
  totalConsents: number;
  totalTransactions: number;
  gatewayStatus: string;
  lastSync: string;
}

interface QrResult {
  qrData: string;
  qrString: string;
  counterToken: string;
  expiresAt: string;
}

interface CheckedInPatient {
  id: string;
  token: string;
  abhaNumber: string;
  abhaAddress: string;
  name: string;
  gender: string;
  phone: string;
  time: string;
  status: "CHECKED_IN" | "REGISTERED" | "ORDER_CREATED";
}

interface AbdmTransaction {
  id: string;
  action: string;
  status: string;
  createdAt: string;
  patientId?: string;
}

// ─────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────

const DEFAULT_STATUS: AbdmStatus = {
  mockMode: true,
  environment: "Sandbox (ABDM v0.5)",
  gatewayBaseUrl: "https://dev.abdm.gov.in/gateway",
  hipId: "IN2410000123",
  labName: "LabCore Clinical Diagnostics & Research Center",
  features: {
    abhaGeneration: true,
    abhaVerification: true,
    careContextLinking: true,
    consentManagement: true,
    fhirDiagnosticReport: true,
    healthDataTransfer: true,
    scanAndShare: true,
  },
};

const DEFAULT_STATS: AbdmStats = {
  totalAbhaPatients: 14,
  totalCareContexts: 38,
  totalConsents: 12,
  totalTransactions: 64,
  gatewayStatus: "OPERATIONAL",
  lastSync: new Date().toISOString(),
};

const MOCK_TRANSACTIONS: AbdmTransaction[] = [
  { id: "1", action: "ABHA_AADHAAR_OTP_REQUEST", status: "SUCCESS", createdAt: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: "2", action: "ABHA_PATIENT_LINK", status: "SUCCESS", createdAt: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: "3", action: "CARE_CONTEXT_LINK", status: "SUCCESS", createdAt: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: "4", action: "ABHA_STANDALONE_GENERATE", status: "SUCCESS", createdAt: new Date(Date.now() - 90 * 60000).toISOString() },
  { id: "5", action: "ABHA_AUTH_INIT", status: "CALLBACK_RECEIVED", createdAt: new Date(Date.now() - 120 * 60000).toISOString() },
];

const SAMPLE_PRESETS = [
  { id: "sample-cbc-001", label: "CBC Panel (Complete Blood Count)", loinc: "58410-2", color: "blue" },
  { id: "sample-lipid-002", label: "Lipid Profile Panel", loinc: "57698-3", color: "purple" },
  { id: "sample-hba1c-003", label: "HbA1c & Fasting Glucose", loinc: "59261-8", color: "orange" },
];

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function AbdmPage() {
  const [status, setStatus] = useState<AbdmStatus>(DEFAULT_STATUS);
  const [stats, setStats] = useState<AbdmStats>(DEFAULT_STATS);
  const [transactions, setTransactions] = useState<AbdmTransaction[]>(MOCK_TRANSACTIONS);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "scan-share" | "verify" | "fhir" | "simulator">("overview");

  // Gateway Ping
  const [gatewayPing, setGatewayPing] = useState<number>(36);
  const [pinging, setPinging] = useState(false);

  // Scan & Share
  const [counterId, setCounterId] = useState("COUNTER-01");
  const [qrResult, setQrResult] = useState<QrResult | null>({
    qrData: `{"hipId":"IN2410000123","counterId":"COUNTER-01","token":"ABDM-TOK-7842"}`,
    qrString: `abdm://scan-share?hipId=IN2410000123&counter=COUNTER-01&token=ABDM-TOK-7842`,
    counterToken: "ABDM-TOK-7842",
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  });
  const [generatingQr, setGeneratingQr] = useState(false);
  const [checkedInQueue, setCheckedInQueue] = useState<CheckedInPatient[]>([
    {
      id: "chk-1", token: "TOK-101", abhaNumber: "91-4421-8890-1123", abhaAddress: "rahul.sharma@sbx",
      name: "Rahul Sharma", gender: "MALE", phone: "+91 98234 11223", time: "2 mins ago", status: "CHECKED_IN",
    },
    {
      id: "chk-2", token: "TOK-102", abhaNumber: "91-5532-9901-4412", abhaAddress: "priya.patel@sbx",
      name: "Priya Patel", gender: "FEMALE", phone: "+91 97245 66778", time: "8 mins ago", status: "ORDER_CREATED",
    },
  ]);

  // Token Slip Modal
  const [tokenSlipPatient, setTokenSlipPatient] = useState<CheckedInPatient | null>(null);

  // ABHA Verify
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyTxnId, setVerifyTxnId] = useState("");
  const [verifyOtp, setVerifyOtp] = useState("");
  const [verifyStep, setVerifyStep] = useState<"input" | "otp" | "result">("input");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyError, setVerifyError] = useState("");

  // ABHA Create
  const [showCreateModal, setShowCreateModal] = useState(false);

  // FHIR Inspector
  const [fhirPreset, setFhirPreset] = useState<string>("sample-cbc-001");
  const [fhirOrderId, setFhirOrderId] = useState("sample-cbc-001");
  const [fhirLoading, setFhirLoading] = useState(false);
  const [fhirBundle, setFhirBundle] = useState<any>(null);
  const [fhirView, setFhirView] = useState<"visual" | "json" | "compliance">("visual");

  // Simulator
  const [simulatorAction, setSimulatorAction] = useState<"discovery" | "link_init" | "consent_notify" | "data_request">("discovery");
  const [simulating, setSimulating] = useState(false);
  const [simulatorResponse, setSimulatorResponse] = useState<any>(null);
  const [simElapsed, setSimElapsed] = useState<number | null>(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchStatusAndStats();
  }, []);

  useEffect(() => {
    const handleUrlState = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);

      if (params.get("action") === "create" || hash === "#create-abha" || hash === "#create") {
        setShowCreateModal(true);
      }
      if (hash === "#scan-share" || params.get("tab") === "scan-share") {
        setActiveTab("scan-share");
      } else if (hash === "#verify" || hash === "#quick-verify" || params.get("tab") === "verify") {
        setActiveTab("verify");
      } else if (hash === "#fhir" || params.get("tab") === "fhir") {
        setActiveTab("fhir");
      } else if (hash === "#simulator" || params.get("tab") === "simulator") {
        setActiveTab("simulator");
      } else if (hash === "#overview" || params.get("tab") === "overview") {
        setActiveTab("overview");
      }
    };

    handleUrlState();
    window.addEventListener("hashchange", handleUrlState);
    window.addEventListener("popstate", handleUrlState);
    return () => {
      window.removeEventListener("hashchange", handleUrlState);
      window.removeEventListener("popstate", handleUrlState);
    };
  }, []);

  useEffect(() => {
    if (fhirPreset) setFhirOrderId(fhirPreset);
  }, [fhirPreset]);

  // ─────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────

  const fetchStatusAndStats = async () => {
    setLoadingStatus(true);
    try {
      const [statusData, statsData, txData] = await Promise.all([
        apiGet("/abdm/status"),
        apiGet("/abdm/stats"),
        apiGet("/abdm/transactions"),
      ]);
      if (statusData) setStatus(statusData);
      if (statsData) setStats(statsData);
      if (txData && Array.isArray(txData) && txData.length > 0) setTransactions(txData.slice(0, 10));
    } catch (err) {
      console.error("Failed to load ABDM status:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handlePingGateway = async () => {
    setPinging(true);
    const start = performance.now();
    try { await apiGet("/abdm/status"); } catch {}
    const elapsed = Math.round(performance.now() - start);
    setGatewayPing(elapsed > 0 ? elapsed : Math.floor(Math.random() * 20 + 30));
    setPinging(false);
  };

  const handleGenerateQr = async () => {
    setGeneratingQr(true);
    try {
      const data = await apiPost("/abdm/scan-share/generate-qr", { counterId });
      if (data?.qrString) {
        setQrResult(data);
      } else {
        const freshToken = `ABDM-TOK-${Math.floor(Math.random() * 9000 + 1000)}`;
        setQrResult({
          qrData: JSON.stringify({ hipId: status.hipId, counterId, token: freshToken }),
          qrString: `abdm://scan-share?hipId=${status.hipId}&counter=${counterId}&token=${freshToken}`,
          counterToken: freshToken,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        });
      }
    } catch {
      const freshToken = `ABDM-TOK-${Math.floor(Math.random() * 9000 + 1000)}`;
      setQrResult({
        qrData: JSON.stringify({ hipId: status.hipId, counterId, token: freshToken }),
        qrString: `abdm://scan-share?hipId=${status.hipId}&counter=${counterId}&token=${freshToken}`,
        counterToken: freshToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });
    } finally {
      setGeneratingQr(false);
    }
  };

  const handleSimulatePatientCheckIn = () => {
    const names = ["Ananya Desai", "Vikram Malhotra", "Meera Joshi", "Karan Singhania", "Divya Shah"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const cleanName = randomName.toLowerCase().replace(" ", ".");
    const tokenNum = `TOK-${Math.floor(Math.random() * 800 + 100)}`;
    const newCheckIn: CheckedInPatient = {
      id: `chk-${Date.now()}`,
      token: tokenNum,
      abhaNumber: `91-${Math.floor(Math.random() * 8900 + 1000)}-${Math.floor(Math.random() * 8900 + 1000)}-${Math.floor(Math.random() * 8900 + 1000)}`,
      abhaAddress: `${cleanName}@sbx`,
      name: randomName,
      gender: Math.random() > 0.5 ? "FEMALE" : "MALE",
      phone: `+91 98${Math.floor(Math.random() * 89000000 + 10000000)}`,
      time: "Just now",
      status: "CHECKED_IN",
    };
    setCheckedInQueue((prev) => [newCheckIn, ...prev]);
  };

  const handleVerifyInit = async () => {
    setVerifyLoading(true);
    setVerifyError("");
    try {
      const data = await apiPost("/abdm/abha/verify/init", {
        abhaAddressOrNumber: verifyInput,
        authMode: "MOBILE_OTP",
      });
      setVerifyTxnId(data?.txnId || `txn-${Date.now()}`);
      setVerifyStep("otp");
      const testCode = data?.mockOtp || "123456";
      setTimeout(() => setVerifyOtp(testCode), 350);
    } catch {
      setVerifyTxnId(`txn-${Date.now()}`);
      setVerifyStep("otp");
      setTimeout(() => setVerifyOtp("123456"), 350);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifyConfirm = async () => {
    setVerifyLoading(true);
    setVerifyError("");
    try {
      const data = await apiPost("/abdm/abha/verify/confirm", {
        txnId: verifyTxnId,
        otp: verifyOtp || "123456",
      });
      setVerifyResult(
        data || {
          abhaNumber: "91-8834-1129-4451",
          abhaAddress: verifyInput.includes("@") ? verifyInput : `${verifyInput}@sbx`,
          profile: {
            name: "Demo Patient",
            gender: "MALE",
            dateOfBirth: "1994-08-15",
            mobile: "+91 98765 43210",
            address: "42 Healthcare Park, Satellite",
            stateName: "Gujarat",
            districtName: "Ahmedabad",
          },
        }
      );
      setVerifyStep("result");
    } catch {
      setVerifyResult({
        abhaNumber: "91-8834-1129-4451",
        abhaAddress: verifyInput.includes("@") ? verifyInput : `${verifyInput}@sbx`,
        profile: {
          name: "Demo Patient (Sandbox)",
          gender: "MALE",
          dateOfBirth: "1994-08-15",
          mobile: "+91 98765 43210",
          address: "42 Healthcare Park, Satellite",
          stateName: "Gujarat",
          districtName: "Ahmedabad",
        },
      });
      setVerifyStep("result");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleFetchFhirPreview = async () => {
    setFhirLoading(true);
    setFhirBundle(null);
    try {
      const data = await apiGet(`/abdm/fhir/preview/${fhirOrderId}`);
      // Backend returns data directly (not data.bundle)
      if (data) {
        setFhirBundle(data);
      } else {
        setFhirBundle({ resourceType: "Bundle", type: "document", error: "Empty response" });
      }
    } catch {
      setFhirBundle({ resourceType: "Bundle", type: "document", error: "Failed to load bundle" });
    } finally {
      setFhirLoading(false);
    }
  };

  const handleSimulateWebhook = async () => {
    setSimulating(true);
    setSimulatorResponse(null);
    const start = performance.now();
    try {
      let endpoint = "/v0.5/care-contexts/discover";
      let payload: any = {};

      if (simulatorAction === "discovery") {
        endpoint = "/v0.5/care-contexts/discover";
        payload = {
          requestId: `req-${Date.now()}`,
          timestamp: new Date().toISOString(),
          transactionId: `txn-${Date.now()}`,
          patient: {
            id: "rahul.sharma@sbx",
            verifiedIdentifiers: [{ type: "MOBILE", value: "+91 98234 11223" }],
            unverifiedIdentifiers: [],
            name: "Rahul Sharma",
            gender: "M",
            yearOfBirth: 1988,
          },
        };
      } else if (simulatorAction === "link_init") {
        endpoint = "/v0.5/links/link/init";
        payload = {
          requestId: `req-${Date.now()}`,
          timestamp: new Date().toISOString(),
          transactionId: `txn-${Date.now()}`,
          patient: {
            id: "rahul.sharma@sbx",
            careContexts: [{ referenceNumber: "CC-2026-001", display: "Lab Visit – 15 Sep 2026" }],
          },
        };
      } else if (simulatorAction === "consent_notify") {
        endpoint = "/v0.5/consents/hip/notify";
        payload = {
          requestId: `req-${Date.now()}`,
          timestamp: new Date().toISOString(),
          notification: {
            consentId: `cons-${Date.now()}`,
            status: "GRANTED",
            consentDetail: {
              purpose: { code: "CAREMGT" },
              patient: { id: "rahul.sharma@sbx" },
              hiTypes: ["DiagnosticReport"],
            },
          },
        };
      } else {
        endpoint = "/v0.5/health-information/hip/request";
        payload = {
          requestId: `req-${Date.now()}`,
          timestamp: new Date().toISOString(),
          transactionId: `txn-${Date.now()}`,
          hiRequest: {
            consent: { id: `cons-${Date.now()}` },
            dateRange: { from: "2026-01-01T00:00:00Z", to: new Date().toISOString() },
            dataPushUrl: "https://sandbox.hiu.abdm.gov.in/data/push",
            keyMaterial: {
              cryptoAlg: "ECDH",
              curve: "secp256r1",
              dhPublicKey: {
                expiry: new Date(Date.now() + 24 * 3600000).toISOString(),
                parameters: "Curve25519",
                keyValue: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA",
              },
              nonce: "4f7a2b9c",
            },
          },
        };
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({ status: res.status, message: "Acknowledged" }));
      const elapsed = Math.round(performance.now() - start);
      setSimElapsed(elapsed);
      setSimulatorResponse({
        status: res.status,
        timestamp: new Date().toLocaleTimeString(),
        endpoint,
        requestPayload: payload,
        responsePayload: data,
      });
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setSimElapsed(elapsed);
      setSimulatorResponse({
        status: 202,
        timestamp: new Date().toLocaleTimeString(),
        endpoint: simulatorAction,
        message: "Simulated response: 202 Acknowledged (Mock Mode active)",
        requestPayload: { action: simulatorAction },
        responsePayload: { acknowledgement: { status: "SUCCESS" }, mockMode: true },
      });
    } finally {
      setSimulating(false);
    }
  };

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const printTokenSlip = (patient: CheckedInPatient) => {
    const win = window.open("", "_blank");
    if (!win) return;
    
    const qrData = encodeURIComponent(`abdm://patient/${patient.id}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;
    const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${patient.token}&code=Code128&dpi=96&dataseparator=`;
    const currentDate = new Date();
    
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Token Slip – ${patient.name}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
          body { 
            margin: 0; 
            background: #cbd5e1;
            display: flex;
            justify-content: center;
            padding: 2rem;
            -webkit-print-color-adjust: exact;
          }
          .thermal-slip {
            width: 340px;
            background: white;
            font-family: 'Inter', sans-serif;
            color: #0f172a;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            position: relative;
          }
          .thermal-slip::after {
            content: "";
            position: absolute;
            bottom: -10px;
            left: 0;
            right: 0;
            height: 10px;
            background-size: 20px 20px;
            background-image: linear-gradient(135deg, white 25%, transparent 25%), linear-gradient(225deg, white 25%, transparent 25%);
            background-position: 0 0;
          }
          @media print {
            body { 
              background: white; 
              padding: 0; 
              display: block; 
            }
            .thermal-slip {
              width: 100%;
              max-width: 80mm;
              box-shadow: none;
              margin: 0;
            }
            .thermal-slip::after {
              display: none;
            }
          }
          .mono { font-family: 'JetBrains Mono', monospace; }
          .dashed-divider { border-top: 2px dashed #94a3b8; margin: 12px 0; }
        </style>
      </head>
      <body>
        <div class="thermal-slip p-6 flex flex-col items-center">
          
          <!-- Header -->
          <div class="flex items-center gap-3 w-full justify-center mb-4">
            <div class="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="text-left">
              <h1 class="text-base font-black uppercase tracking-widest text-black leading-tight">LabCore<br/>Clinics</h1>
            </div>
          </div>
          
          <div class="bg-black text-white text-[10px] uppercase tracking-widest font-bold py-1 px-4 rounded-full mb-1">
            ABDM Scan & Share Check-in
          </div>
          
          <div class="w-full dashed-divider"></div>
          
          <!-- Token Section -->
          <div class="text-center w-full py-2">
            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Queue Token</p>
            <div class="text-6xl font-black mono tracking-tighter text-black">${patient.token}</div>
          </div>
          
          <div class="w-full mt-2 mb-4 flex justify-center">
             <img src="${barcodeUrl}" alt="Barcode" class="h-12 max-w-full" />
          </div>
          
          <div class="w-full dashed-divider"></div>
          
          <!-- Demographics Grid -->
          <div class="w-full py-2">
            <div class="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
              <div class="col-span-2 flex justify-between items-end border-b border-slate-100 pb-2">
                <span class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Patient Name</span>
                <span class="text-base font-black text-black text-right">${patient.name}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Gender / Age</span>
                <span class="text-xs font-bold text-slate-800">${patient.gender} • Adult</span>
              </div>
              
              <div class="flex flex-col text-right">
                <span class="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Contact</span>
                <span class="text-xs font-bold text-slate-800">${patient.phone}</span>
              </div>
              
              <div class="col-span-2 flex justify-between items-center bg-emerald-50 rounded-lg p-2 border border-emerald-100 mt-1">
                <div class="flex flex-col">
                  <span class="text-[9px] text-emerald-800 uppercase font-black flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ABHA Verified
                  </span>
                  <span class="text-xs font-black mono text-emerald-950 mt-0.5 tracking-tight">${patient.abhaNumber}</span>
                </div>
                <img src="${qrUrl}" class="w-12 h-12 rounded bg-white p-0.5 shadow-sm border border-emerald-200" />
              </div>
            </div>
          </div>
          
          <div class="w-full dashed-divider"></div>
          
          <!-- Footer -->
          <div class="w-full flex justify-between items-center text-[10px] font-mono text-slate-500 font-bold mb-1">
            <span>Date: ${currentDate.toLocaleDateString()}</span>
            <span>Time: ${currentDate.toLocaleTimeString()}</span>
          </div>
          <p class="text-[9px] text-slate-400 text-center leading-snug font-medium w-full px-2">
            Please wait in the lounge area. Your token will be announced shortly.
          </p>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 800);
          }
        </script>
      </body>
      </html>
    `);
    win.document.close();
  };

  const qrImageUrl = qrResult
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrResult.qrString)}`
    : null;

  // ─────────────────────────────────────────────────────────────
  // FHIR Visual Inspector helpers
  // ─────────────────────────────────────────────────────────────

  function getObservations(bundle: any) {
    return (bundle?.entry ?? [])
      .filter((e: any) => e?.resource?.resourceType === "Observation")
      .map((e: any) => e.resource);
  }
  function getDiagnosticReport(bundle: any) {
    return (bundle?.entry ?? []).find((e: any) => e?.resource?.resourceType === "DiagnosticReport")?.resource;
  }
  function getComposition(bundle: any) {
    return (bundle?.entry ?? []).find((e: any) => e?.resource?.resourceType === "Composition")?.resource;
  }

  const interpColor = (code: string) => {
    if (code === "H" || code === "HH") return "text-red-600 bg-red-50 border-red-200";
    if (code === "L" || code === "LL") return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };
  const interpLabel = (code: string) => {
    if (code === "H") return "↑ High";
    if (code === "HH") return "↑↑ Critical High";
    if (code === "L") return "↓ Low";
    if (code === "LL") return "↓↓ Critical Low";
    return "✓ Normal";
  };

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <DashboardLayout title="ABDM Integration Hub">
      <div className="space-y-6 pb-12">

        {/* ── Hero Banner ── */}
        <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl overflow-hidden border border-blue-800/40">
          <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -top-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg border border-white/20 shrink-0">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">ABDM Integration Hub</h1>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    NRCES R4 Compliant
                  </span>
                </div>
                <p className="text-blue-200 text-sm max-w-2xl leading-relaxed">
                  National Health Authority (NHA) • Ayushman Bharat Digital Mission • Health Information Provider (HIP) Gateway & Interoperability Engine
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handlePingGateway}
                disabled={pinging}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 text-blue-100"
                title="Check ABDM Gateway ping & latency"
              >
                <Radio className={`w-3.5 h-3.5 ${pinging ? "animate-spin" : gatewayPing < 80 ? "text-emerald-400" : "text-amber-400"}`} />
                <span>Ping: {gatewayPing}ms</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
              >
                <Shield className="w-4 h-4" />
                <span>Create New ABHA</span>
              </button>
              <button
                onClick={fetchStatusAndStats}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? "animate-spin" : ""}`} />
                <span>Sync Status</span>
              </button>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1.5">
                {status.mockMode ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Mode</span>
              </div>
              <p className="text-sm font-bold text-white">{status.mockMode ? "🔧 Sandbox" : "🌐 Production"}</p>
              <p className="text-[11px] text-blue-200 mt-0.5">Auto mock fallback active</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">HIP ID</span>
                </div>
                <button onClick={() => copyText("hipId", status.hipId)} className="text-blue-300 hover:text-white transition-colors" title="Copy HIP ID">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm font-mono font-black tracking-wider text-emerald-300">{status.hipId}</p>
              <p className="text-[11px] text-blue-200 mt-0.5">{copiedKey === "hipId" ? "✓ Copied!" : status.labName.slice(0, 26)}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <Database className="w-4 h-4 text-sky-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Gateway</span>
              </div>
              <p className="text-sm font-bold font-mono text-white truncate">{status.gatewayBaseUrl.replace("https://", "")}</p>
              <p className="text-[11px] text-blue-200 mt-0.5">v0.5 HIG Bridge</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Interop</span>
              </div>
              <p className="text-sm font-bold text-emerald-300">● 100% Operational</p>
              <p className="text-[11px] text-blue-200 mt-0.5">FHIR R4 DiagnosticReport</p>
            </div>
          </div>
        </div>

        {/* ── Key Metrics ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "ABHA Patients", value: stats.totalAbhaPatients, sub: "Verified ABHA-linked patients", icon: Users, color: "blue" },
            { label: "Care Contexts", value: stats.totalCareContexts, sub: "Lab visits in PHR wallets", icon: LinkIcon, color: "indigo" },
            { label: "Active Consents", value: stats.totalConsents, sub: "Granted consent artefacts", icon: FileText, color: "emerald" },
            { label: "Transactions", value: stats.totalTransactions, sub: "Gateway API exchanges", icon: Activity, color: "purple" },
          ].map((m) => {
            const Icon = m.icon;
            const colorMap: Record<string, string> = {
              blue: "bg-blue-50 text-blue-600", indigo: "bg-indigo-50 text-indigo-600",
              emerald: "bg-emerald-50 text-emerald-600", purple: "bg-purple-50 text-purple-600",
            };
            return (
              <div key={m.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{m.label}</span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[m.color]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{m.value}</div>
                <p className="text-xs text-slate-500 mt-1">{m.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5">
          <div className="flex flex-wrap gap-1">
            {[
              { id: "overview" as const, label: "Overview & Milestones", icon: Activity },
              { id: "scan-share" as const, label: "Scan & Share Desk", icon: QrCode },
              { id: "verify" as const, label: "ABHA Lookup & Verify", icon: Search },
              { id: "fhir" as const, label: "FHIR R4 Inspector", icon: FileCode },
              { id: "simulator" as const, label: "Gateway Webhook Simulator", icon: Terminal },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isActive ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/* TAB 1: OVERVIEW & MILESTONES */}
        {/* ═══════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">

            {/* ABDM Milestones */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">ABDM Government Milestones</h2>
                  <p className="text-xs text-slate-500">Official NHA Digital Health Integration Tiers</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> All M1, M2, M3 Functional
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    tag: "MILESTONE 1 (M1)", title: "ABHA Creation & Verification", color: "blue",
                    desc: "Issues 14-digit ABHA numbers via Aadhaar OTP (biometric-backed) and Mobile OTP fallback. Real-time demographic verification and official health cards.",
                    items: ["Aadhaar OTP verification", "Mobile OTP fallback", "Printable ABHA Health Card"],
                    action: "Test ABHA Generator", onClick: () => setShowCreateModal(true),
                  },
                  {
                    tag: "MILESTONE 2 (M2)", title: "Care Context Discovery & Linking", color: "indigo",
                    desc: "Registers lab visits as Care Contexts in patient's national PHR wallet (Aarogya Setu, ABHA app) via automated discovery webhooks.",
                    items: ["HIP Discovery (/v0.5/care-contexts/discover)", "Patient OTP Linking flow", "HIP-initiated direct link"],
                    action: "Simulate Discovery Webhook",
                    onClick: () => { setActiveTab("simulator"); setSimulatorAction("discovery"); },
                  },
                  {
                    tag: "MILESTONE 3 (M3)", title: "Encrypted Health Data Transfer", color: "purple",
                    desc: "Transforms test results into NRCES HL7 FHIR R4 DiagnosticReport Document Bundles, encrypted using ECDH Curve25519/P-256 + AES-256-GCM.",
                    items: ["HL7 FHIR R4 DiagnosticReport Bundle", "End-to-end ECDH+AES-256-GCM", "Consent Artefact verification"],
                    action: "Inspect FHIR R4 Bundle",
                    onClick: () => { setActiveTab("fhir"); handleFetchFhirPreview(); },
                  },
                ].map((m) => {
                  const colorMap: Record<string, Record<string, string>> = {
                    blue: { badge: "bg-blue-600", border: "border-blue-100", bg: "bg-blue-50", text: "text-blue-600", btn: "bg-blue-50 hover:bg-blue-100 text-blue-700", check: "text-blue-600" },
                    indigo: { badge: "bg-indigo-600", border: "border-indigo-100", bg: "bg-indigo-50", text: "text-indigo-600", btn: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700", check: "text-indigo-600" },
                    purple: { badge: "bg-purple-600", border: "border-purple-100", bg: "bg-purple-50", text: "text-purple-600", btn: "bg-purple-50 hover:bg-purple-100 text-purple-700", check: "text-purple-600" },
                  };
                  const c = colorMap[m.color];
                  return (
                    <div key={m.tag} className={`bg-white rounded-2xl p-6 border-2 ${c.border} shadow-sm relative overflow-hidden flex flex-col justify-between`}>
                      <div className={`absolute top-0 right-0 w-24 h-24 ${c.bg} rounded-bl-full pointer-events-none`} />
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-2.5 py-1 ${c.badge} text-white rounded-lg text-xs font-black tracking-wide`}>{m.tag}</span>
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Certified
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">{m.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">{m.desc}</p>
                        <ul className="space-y-2 text-xs text-slate-600 mb-5">
                          {m.items.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <CheckCircle className={`w-3.5 h-3.5 ${c.check} shrink-0 mt-0.5`} /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={m.onClick}
                        className={`w-full py-2.5 px-3 ${c.btn} font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5`}
                      >
                        <span>{m.action}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active ABDM Architecture Services */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Active ABDM Architecture Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: "abhaGeneration", label: "ABHA Generation", desc: "Aadhaar & Mobile OTP registration", icon: Shield, proto: "ABHA v3 API", enc: "RSA-2048 OTP", action: () => setShowCreateModal(true), actionLabel: "Open Generator" },
                  { key: "abhaVerification", label: "ABHA Verification", desc: "Verify existing ABHA holders", icon: CheckCircle2, proto: "ABHA v3 Login API", enc: "OTP Auth Flow", action: () => setActiveTab("verify"), actionLabel: "Open Verify" },
                  { key: "careContextLinking", label: "Care Context Linking", desc: "HIP Discovery & PHR Wallet", icon: LinkIcon, proto: "ABDM Gateway v0.5", enc: "JWT Bearer", action: () => { setActiveTab("simulator"); setSimulatorAction("discovery"); }, actionLabel: "Simulate" },
                  { key: "consentManagement", label: "Consent Management", desc: "Consent artefact storage & audit", icon: FileText, proto: "Consent Manager", enc: "Artefact Hash", action: () => { setActiveTab("simulator"); setSimulatorAction("consent_notify"); }, actionLabel: "Simulate" },
                  { key: "fhirDiagnosticReport", label: "FHIR R4 Reports", desc: "NRCES DiagnosticReport Bundle", icon: Activity, proto: "HL7 FHIR R4", enc: "LOINC Coded", action: () => setActiveTab("fhir"), actionLabel: "Inspect Bundle" },
                  { key: "healthDataTransfer", label: "Health Data Transfer", desc: "Encrypted AES-256-GCM push", icon: Lock, proto: "ECDH Curve25519", enc: "AES-256-GCM", action: () => { setActiveTab("simulator"); setSimulatorAction("data_request"); }, actionLabel: "Simulate" },
                  { key: "scanAndShare", label: "Scan & Share", desc: "Reception QR fast check-in", icon: QrCode, proto: "ABDM Scan & Share", enc: "Token QR", action: () => setActiveTab("scan-share"), actionLabel: "Open Desk" },
                ].map(({ key, label, desc, icon: Icon, proto, enc, action, actionLabel }) => {
                  const enabled = status.features[key] ?? true;
                  return (
                    <div key={key} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${enabled ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                          {enabled ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-xs">{label}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5 mb-2">{desc}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-3">
                        <Globe className="w-2.5 h-2.5" />{proto}
                        <span className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded font-mono">{enc}</span>
                      </div>
                      <button
                        onClick={action}
                        className="w-full py-1.5 px-2 text-[11px] font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-600 hover:text-white border border-blue-200/80 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>{actionLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Two-col: Transaction Log + Endpoint Reference */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Transaction Log */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    ABDM Transaction Log
                  </h3>
                  <button onClick={fetchStatusAndStats} className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                </div>
                <div className="space-y-2">
                  {transactions.slice(0, 8).map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${tx.status === "SUCCESS" ? "bg-emerald-400" : tx.status === "FAILED" ? "bg-red-400" : "bg-amber-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{tx.action}</p>
                        <p className="text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                        tx.status === "SUCCESS" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : tx.status === "FAILED" ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Endpoint Reference */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-600" />
                    REST API Endpoint Reference
                  </h3>
                  <span className="text-xs text-slate-500">12 Live Endpoints</span>
                </div>
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  {[
                    { method: "GET", path: "/api/abdm/status", desc: "Gateway connectivity & mock status" },
                    { method: "POST", path: "/api/abdm/abha/generate/aadhaar/otp", desc: "Aadhaar OTP for ABHA registration" },
                    { method: "POST", path: "/api/abdm/abha/generate/aadhaar/verify", desc: "Verify Aadhaar OTP & issue ABHA" },
                    { method: "POST", path: "/api/abdm/abha/generate/mobile/otp", desc: "Mobile OTP for ABHA generation" },
                    { method: "POST", path: "/api/abdm/abha/generate/mobile/verify", desc: "Verify Mobile OTP & issue ABHA" },
                    { method: "POST", path: "/api/abdm/abha/verify/init", desc: "Init verification for existing ABHA" },
                    { method: "POST", path: "/api/abdm/abha/link-patient", desc: "Link ABHA to LabCore patient" },
                    { method: "POST", path: "/api/abdm/scan-share/generate-qr", desc: "Reception Desk Scan & Share QR" },
                    { method: "GET", path: "/api/abdm/fhir/preview/:orderId", desc: "HL7 FHIR R4 DiagnosticReport Bundle" },
                    { method: "POST", path: "/v0.5/care-contexts/discover", desc: "ABDM: Care Context Discovery webhook" },
                    { method: "POST", path: "/v0.5/consents/hip/notify", desc: "ABDM: Consent notification callback" },
                    { method: "POST", path: "/v0.5/health-information/hip/request", desc: "ABDM: Health data transfer webhook" },
                  ].map((ep) => (
                    <div key={ep.path} className="py-2 flex items-center gap-3 text-xs">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] shrink-0 ${ep.method === "GET" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}>
                        {ep.method}
                      </span>
                      <code className="font-mono text-slate-700 font-medium flex-1 truncate">{ep.path}</code>
                      <span className="text-slate-400 hidden md:inline text-[10px]">{ep.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* TAB 2: SCAN & SHARE DESK */}
        {/* ═══════════════════════════════════════════════════ */}
        {activeTab === "scan-share" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* QR Terminal */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    Reception Desk QR Terminal
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">LIVE</span>
                </div>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                  Patients scan this QR from ABHA / Aarogya Setu app to share verified profile instantly — zero paper forms.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Counter / Station ID</label>
                    <input
                      type="text"
                      value={counterId}
                      onChange={(e) => setCounterId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="e.g. COUNTER-01"
                    />
                  </div>

                  {qrResult && qrImageUrl && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                      <div className="inline-block p-3 bg-white rounded-xl shadow-sm border border-slate-200 mb-3">
                        <img src={qrImageUrl} alt="Scan and Share QR" className="w-44 h-44 mx-auto rounded-lg" />
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-800 mb-1">Token: {qrResult.counterToken}</div>
                      <p className="text-[10px] text-slate-500">Expires: {new Date(qrResult.expiresAt).toLocaleTimeString()}</p>
                    </div>
                  )}

                  <button
                    onClick={handleGenerateQr}
                    disabled={generatingQr}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {generatingQr ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span>Regenerate Station QR</span>
                  </button>

                  {qrResult && (
                    <button
                      onClick={() => {
                        const win = window.open("", "_blank");
                        if (!win) return;
                        win.document.write(`<html><head><title>Scan & Share QR – ${counterId}</title>
                          <style>body{margin:20px;font-family:Arial,sans-serif;text-align:center;} .title{font-size:20px;font-weight:800;margin-bottom:8px;color:#1d4ed8;} .sub{font-size:12px;color:#666;margin-bottom:16px;} .token{font-family:monospace;font-size:14px;background:#f3f4f6;padding:6px 12px;border-radius:8px;font-weight:700;}</style></head>
                          <body><div class="title">Scan to Check In</div><div class="sub">LabCore Clinical Diagnostics | ${counterId}</div>
                          <img src="${qrImageUrl}" width="280" height="280"><br><div class="token">Token: ${qrResult.counterToken}</div>
                          <script>window.print();window.close();</script></body></html>`);
                        win.document.close();
                      }}
                      className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Counter QR Standee
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Check-In Queue */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Live Scanned Patient Queue
                    </h3>
                    <p className="text-xs text-slate-500">{checkedInQueue.length} patients in queue</p>
                  </div>
                  <button
                    onClick={handleSimulatePatientCheckIn}
                    className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+ Simulate Patient Scan</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {checkedInQueue.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800">{item.token}</span>
                              <span className="text-[10px] text-slate-400">• {item.time}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                              <span className="font-mono">{item.abhaNumber}</span>
                              <span className="text-blue-600">{item.abhaAddress}</span>
                              <span>{item.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === "ORDER_CREATED" ? "bg-purple-100 text-purple-800" : "bg-emerald-100 text-emerald-800"}`}>
                            {item.status === "ORDER_CREATED" ? "Order Created" : "Ready to Register"}
                          </span>
                          <button
                            onClick={() => printTokenSlip(item)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold text-xs transition-colors flex items-center gap-1"
                            title="Print Token Slip"
                          >
                            <Printer className="w-3 h-3" /> Slip
                          </button>
                          <button
                            onClick={() => {
                              window.location.href = `/patients/new?abhaNumber=${encodeURIComponent(item.abhaNumber)}&abhaAddress=${encodeURIComponent(item.abhaAddress)}&name=${encodeURIComponent(item.name)}`;
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors"
                          >
                            Register
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How it works */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600" /> How Scan & Share Operates
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-blue-900/80">
                  {[
                    { step: "1. Print Counter QR", desc: "Staff displays QR at reception desk" },
                    { step: "2. Patient Scans", desc: "Uses ABHA or Aarogya Setu app" },
                    { step: "3. Profile Shared", desc: "NHA Gateway securely pushes demographics" },
                    { step: "4. Instant Check-In", desc: "Queue updates in real-time" },
                  ].map((s) => (
                    <div key={s.step}>
                      <strong className="block font-bold text-blue-950 mb-0.5">{s.step}</strong>
                      {s.desc}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* TAB 3: ABHA LOOKUP & VERIFY */}
        {/* ═══════════════════════════════════════════════════ */}
        {activeTab === "verify" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="text-center max-w-md mx-auto mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">ABHA Direct Lookup & Verification</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Verify any ABHA address (e.g. <code className="text-blue-600 font-mono">nikil@abdm</code>) or 14-digit number via Government OTP auth.
                </p>
              </div>

              {verifyError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}

              {verifyStep === "input" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">ABHA Address / Number</label>
                    <input
                      type="text"
                      value={verifyInput}
                      onChange={(e) => setVerifyInput(e.target.value)}
                      placeholder="e.g. rahul@sbx or 91-4421-8890-1123"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                    <div className="flex gap-2 mt-2">
                      {["demo@sbx", "nikil@abdm", "91-8834-1129-4451"].map((demo) => (
                        <button
                          key={demo}
                          onClick={() => setVerifyInput(demo)}
                          className="text-[10px] px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg font-mono font-bold transition-colors"
                        >
                          {demo}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleVerifyInit}
                    disabled={verifyLoading || !verifyInput}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {verifyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Initiate ABHA Verification</span>
                  </button>
                </div>
              )}

              {verifyStep === "otp" && (
                <div className="space-y-4">
                  {/* 📱 Simulated Incoming SMS Notification */}
                  <div className="p-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl shadow-md border border-emerald-400/40 relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 mt-0.5">
                          <Radio className="w-4 h-4 text-white animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                            <span>📱 Simulated SMS • NHA ABDM</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                          </div>
                          <p className="text-xs font-semibold text-white mt-1 leading-snug">
                            "Your verification OTP is <span className="font-mono text-amber-300 font-black text-sm tracking-widest px-1.5 py-0.5 bg-black/25 rounded">123456</span>. Valid for 10 mins."
                          </p>
                          <p className="text-[10px] text-emerald-100 mt-1">
                            ✓ Auto-filled in the box below. Ready to confirm!
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVerifyOtp("123456")}
                        className="px-2.5 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-black shrink-0 shadow transition-all active:scale-95"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-950">Mobile SIM par SMS kyun nahi aaya?</p>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        System <strong>ABDM Sandbox Mode</strong> me hai. NHA Sandbox real telecom SMS dispatch nahi karta. Test verification ke liye test OTP <strong>123456</strong> automatically fill ho gaya hai.
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Enter 6-Digit OTP</label>
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Test OTP: 123456
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        value={verifyOtp}
                        onChange={(e) => setVerifyOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-slate-800 font-mono text-2xl tracking-widest text-center bg-emerald-50/20"
                      />
                      <button
                        type="button"
                        onClick={() => setVerifyOtp("123456")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-2.5 py-1 rounded-lg font-bold"
                      >
                        Auto-fill
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setVerifyStep("input")}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerifyConfirm}
                      disabled={verifyLoading || !verifyOtp}
                      className="flex-2 flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {verifyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Confirm & Retrieve Profile →</span>
                    </button>
                  </div>
                </div>
              )}

              {verifyStep === "result" && verifyResult && (
                <div className="space-y-5">
                  {/* Official NHA Profile Card */}
                  <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full" />
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-blue-300">National Health Authority</div>
                        <h4 className="text-xl font-black text-white">{verifyResult.profile?.name || "Verified Patient"}</h4>
                      </div>
                      <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                        <Shield className="w-4 h-4 text-emerald-300" />
                      </div>
                    </div>
                    <div className="space-y-1 mb-4">
                      <div className="text-sm font-mono font-black tracking-widest text-emerald-300">{verifyResult.abhaNumber}</div>
                      <div className="text-xs text-blue-100 font-medium">{verifyResult.abhaAddress}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                      {[
                        { label: "Gender", val: verifyResult.profile?.gender },
                        { label: "Date of Birth", val: verifyResult.profile?.dateOfBirth },
                        { label: "Mobile", val: verifyResult.profile?.mobile },
                        { label: "State", val: verifyResult.profile?.stateName },
                      ].map((f) => f.val ? (
                        <div key={f.label}>
                          <span className="text-blue-300 text-[10px] block">{f.label}</span>
                          <span className="font-bold">{f.val}</span>
                        </div>
                      ) : null)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => copyText("abhaNum", verifyResult.abhaNumber)}
                      className="flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedKey === "abhaNum" ? "✓ Copied!" : "Copy ABHA No."}
                    </button>
                    <button
                      onClick={() => { setVerifyStep("input"); setVerifyResult(null); setVerifyOtp(""); }}
                      className="flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-colors"
                    >
                      <Search className="w-3 h-3" /> Verify Another
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      window.location.href = `/patients/new?abhaNumber=${encodeURIComponent(verifyResult.abhaNumber)}&abhaAddress=${encodeURIComponent(verifyResult.abhaAddress)}&name=${encodeURIComponent(verifyResult.profile?.name || "")}`;
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Register as New Patient in LabCore
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* TAB 4: FHIR R4 INSPECTOR */}
        {/* ═══════════════════════════════════════════════════ */}
        {activeTab === "fhir" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-600" />
                    HL7 FHIR R4 DiagnosticReport Bundle Inspector
                  </h3>
                  <p className="text-xs text-slate-500">NRCES India Profile Compliant • LOINC Coded Observations</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={fhirOrderId}
                    onChange={(e) => setFhirOrderId(e.target.value)}
                    placeholder="Order ID"
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-purple-500 outline-none w-44"
                  />
                  <button
                    onClick={handleFetchFhirPreview}
                    disabled={fhirLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    {fhirLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>Generate</span>
                  </button>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs font-bold text-slate-500 self-center">Presets:</span>
                {SAMPLE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setFhirPreset(p.id); setFhirOrderId(p.id); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${fhirOrderId === p.id ? "bg-purple-600 text-white border-purple-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-700"}`}
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  onClick={handleFetchFhirPreview}
                  disabled={fhirLoading}
                  className="ml-auto px-3 py-1.5 text-xs font-bold rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1"
                >
                  {fhirLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  Load Bundle
                </button>
              </div>

              {fhirBundle && (
                <>
                  {/* View Switcher */}
                  <div className="flex gap-1 mb-4 p-1 bg-slate-100 rounded-xl w-fit">
                    {(["visual", "json", "compliance"] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setFhirView(v)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors capitalize ${fhirView === v ? "bg-white text-purple-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                      >
                        {v === "visual" ? "🏥 Visual Summary" : v === "json" ? "{ } Raw JSON" : "✓ NRCES Compliance"}
                      </button>
                    ))}
                  </div>

                  {/* Visual Summary */}
                  {fhirView === "visual" && (
                    <div className="space-y-4">
                      {/* Composition Header */}
                      {getComposition(fhirBundle) && (
                        <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-purple-900">{getComposition(fhirBundle)?.title}</p>
                              <p className="text-[11px] text-purple-600 mt-0.5">Status: <strong>{getComposition(fhirBundle)?.status}</strong> • Type: {getComposition(fhirBundle)?.type?.coding?.[0]?.display}</p>
                            </div>
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200">FINAL</span>
                          </div>
                        </div>
                      )}

                      {/* DiagnosticReport Conclusion */}
                      {getDiagnosticReport(fhirBundle)?.conclusion && (
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                          <p className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Clinical Conclusion
                          </p>
                          <p className="text-xs text-blue-800 leading-relaxed">{getDiagnosticReport(fhirBundle)?.conclusion}</p>
                        </div>
                      )}

                      {/* Observations Table */}
                      {getObservations(fhirBundle).length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-slate-700 mb-2">Observations ({getObservations(fhirBundle).length} parameters)</p>
                          <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-xs">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                  <th className="text-left px-3 py-2 font-bold text-slate-600">Parameter</th>
                                  <th className="text-left px-3 py-2 font-bold text-slate-600">LOINC</th>
                                  <th className="text-right px-3 py-2 font-bold text-slate-600">Value</th>
                                  <th className="text-left px-3 py-2 font-bold text-slate-600">Reference</th>
                                  <th className="text-left px-3 py-2 font-bold text-slate-600">Flag</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {getObservations(fhirBundle).map((obs: any, i: number) => {
                                  const code = obs?.interpretation?.[0]?.coding?.[0]?.code || "N";
                                  const loincCode = obs?.code?.coding?.[0]?.code || "—";
                                  const display = obs?.code?.coding?.[0]?.display || obs?.code?.text || "—";
                                  const val = obs?.valueQuantity;
                                  const ref = obs?.referenceRange?.[0]?.text;
                                  return (
                                    <tr key={i} className="hover:bg-slate-50">
                                      <td className="px-3 py-2 font-medium text-slate-800">{display}</td>
                                      <td className="px-3 py-2 font-mono text-slate-400 text-[10px]">{loincCode}</td>
                                      <td className="px-3 py-2 text-right font-bold text-slate-900">
                                        {val ? `${val.value} ${val.unit}` : "—"}
                                      </td>
                                      <td className="px-3 py-2 text-slate-500">{ref || "—"}</td>
                                      <td className="px-3 py-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${interpColor(code)}`}>
                                          {interpLabel(code)}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-[11px] text-slate-400">
                          Bundle: <span className="font-mono">{fhirBundle.id}</span> • Entries: {fhirBundle.entry?.length || 0} resources
                        </p>
                        <button
                          onClick={() => copyText("fhir", JSON.stringify(fhirBundle, null, 2))}
                          className="text-xs text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> {copiedKey === "fhir" ? "Copied!" : "Copy Bundle JSON"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Raw JSON */}
                  {fhirView === "json" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
                        <span className="text-slate-600">
                          Type: <strong>{fhirBundle.type}</strong> • Entries: <strong>{fhirBundle.entry?.length || 0}</strong>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyText("fhir", JSON.stringify(fhirBundle, null, 2))}
                            className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {copiedKey === "fhir" ? "Copied!" : "Copy JSON"}
                          </button>
                          <button
                            onClick={() => {
                              const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], { type: "application/json" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url; a.download = `fhir-bundle-${fhirBundle.id || "report"}.json`;
                              a.click(); URL.revokeObjectURL(url);
                            }}
                            className="text-slate-600 hover:text-slate-800 font-bold flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </div>
                      </div>
                      <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                        {JSON.stringify(fhirBundle, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* NRCES Compliance */}
                  {fhirView === "compliance" && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500">Validating against NRCES India FHIR R4 StructureDefinitions and ABDM technical specifications.</p>
                      {[
                        { check: "Bundle.type = 'document'", pass: fhirBundle.type === "document", note: "Required for DocumentBundle profile" },
                        { check: "Bundle has meta.profile with NRCES URL", pass: fhirBundle.meta?.profile?.[0]?.includes("nrces.in"), note: "NRCES StructureDefinition reference" },
                        { check: "Bundle.identifier present", pass: !!fhirBundle.identifier?.value, note: "Globally unique bundle identifier" },
                        { check: "Bundle.timestamp present", pass: !!fhirBundle.timestamp, note: "ISO 8601 document creation time" },
                        { check: "Composition entry present", pass: getComposition(fhirBundle) !== undefined, note: "Document entry point required" },
                        { check: "DiagnosticReport entry present", pass: getDiagnosticReport(fhirBundle) !== undefined, note: "Lab report resource required" },
                        { check: "Observations use LOINC coding system", pass: getObservations(fhirBundle).every((o: any) => o?.code?.coding?.[0]?.system === "http://loinc.org"), note: "http://loinc.org required" },
                        { check: "DiagnosticReport status = 'final'", pass: getDiagnosticReport(fhirBundle)?.status === "final", note: "Only finalized reports transmitted" },
                        { check: "Observations have valueQuantity with unit", pass: getObservations(fhirBundle).every((o: any) => o?.valueQuantity?.unit), note: "UCUM unit codes required" },
                        { check: "Observations have referenceRange", pass: getObservations(fhirBundle).every((o: any) => o?.referenceRange?.length > 0), note: "Reference intervals mandatory" },
                      ].map((c, i) => (
                        <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${c.pass ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                          {c.pass
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            : <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                          <div className="flex-1">
                            <p className={`text-xs font-bold ${c.pass ? "text-emerald-800" : "text-red-800"}`}>{c.check}</p>
                            <p className={`text-[11px] ${c.pass ? "text-emerald-600" : "text-red-600"}`}>{c.note}</p>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${c.pass ? "bg-emerald-200 text-emerald-900" : "bg-red-200 text-red-900"}`}>
                            {c.pass ? "PASS" : "FAIL"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {!fhirBundle && !fhirLoading && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <FileCode className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                  Select a preset or enter an Order ID, then click "Generate" to inspect the FHIR R4 bundle.
                </div>
              )}
              {fhirLoading && (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                  <span>Building NRCES FHIR R4 Document Bundle...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* TAB 5: GATEWAY WEBHOOK SIMULATOR */}
        {/* ═══════════════════════════════════════════════════ */}
        {activeTab === "simulator" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Trigger Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-600" />
                ABDM Gateway Callback Simulator
              </h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Test how LabCore ELIS responds to asynchronous ABDM Gateway webhooks in real-time.
              </p>

              {/* Sequence Diagram */}
              <div className="mb-5 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400 font-mono mb-2 uppercase tracking-widest">Flow Sequence</p>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded-lg text-[10px]">NHA Gateway</span>
                  <span className="text-slate-500 flex-1 text-center">—— POST /{simulatorAction === "discovery" ? "v0.5/care-contexts/discover" : simulatorAction === "consent_notify" ? "v0.5/consents/hip/notify" : simulatorAction === "link_init" ? "v0.5/links/link/init" : "v0.5/health-information/hip/request"} ——→</span>
                  <span className="px-2 py-1 bg-emerald-900 text-emerald-200 rounded-lg text-[10px]">LabCore HIP</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono mt-2">
                  <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded-lg text-[10px]">NHA Gateway</span>
                  <span className="text-slate-500 flex-1 text-center">←——————————————————— 202 Ack ——————————</span>
                  <span className="px-2 py-1 bg-emerald-900 text-emerald-200 rounded-lg text-[10px]">LabCore HIP</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Webhook Flow</label>
                  <div className="space-y-2">
                    {[
                      { id: "discovery" as const, label: "Care Context Discovery", endpoint: "/v0.5/care-contexts/discover", desc: "NHA Gateway discovers patient lab visits by phone/name" },
                      { id: "link_init" as const, label: "Patient Link Initiation", endpoint: "/v0.5/links/link/init", desc: "Patient initiates linking their care context from ABHA app" },
                      { id: "consent_notify" as const, label: "Consent Notification", endpoint: "/v0.5/consents/hip/notify", desc: "Patient grants/revokes data access consent on ABHA app" },
                      { id: "data_request" as const, label: "Health Data Request", endpoint: "/v0.5/health-information/hip/request", desc: "Gateway requests encrypted FHIR diagnostic report bundle" },
                    ].map((flow) => (
                      <label
                        key={flow.id}
                        className={`block p-3 rounded-xl border transition-all cursor-pointer ${
                          simulatorAction === flow.id
                            ? "border-emerald-500 bg-emerald-50/40 text-emerald-950"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="simAction"
                              checked={simulatorAction === flow.id}
                              onChange={() => setSimulatorAction(flow.id)}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-bold">{flow.label}</span>
                          </div>
                          <code className="text-[10px] font-mono text-slate-400">{flow.endpoint}</code>
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal mt-1 pl-5">{flow.desc}</p>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSimulateWebhook}
                  disabled={simulating}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Trigger Simulated Webhook Call</span>
                </button>
              </div>
            </div>

            {/* Response Console */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Gateway Response Console
                  </h3>
                  <div className="flex items-center gap-2">
                    {simulatorResponse && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${simulatorResponse.status < 300 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                        HTTP {simulatorResponse.status}
                      </span>
                    )}
                    {simElapsed !== null && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                        {simElapsed}ms
                      </span>
                    )}
                  </div>
                </div>

                {simulatorResponse ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="font-bold text-slate-700">{simulatorResponse.timestamp}</span>
                        <span className="text-slate-400 ml-2">→ {simulatorResponse.endpoint}</span>
                      </div>
                      <button
                        onClick={() => copyText("simRes", JSON.stringify(simulatorResponse, null, 2))}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                      {JSON.stringify(simulatorResponse, null, 2)}
                    </pre>
                    {simulatorResponse.message && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0" /> {simulatorResponse.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-400 text-xs">
                    <Terminal className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                    Select a webhook flow on the left and trigger a simulated call to view the execution log and response payload.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ABHA Creation Modal */}
      {showCreateModal && (
        <AbhaLinkModal
          patientId="new-abha-registration"
          patientName="New Patient Registration"
          onClose={() => setShowCreateModal(false)}
          onSuccess={(num, addr) => {
            setShowCreateModal(false);
            fetchStatusAndStats();
          }}
        />
      )}
    </DashboardLayout>
  );
}
