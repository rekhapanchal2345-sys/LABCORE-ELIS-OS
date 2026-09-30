"use client";

import React, { useRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Printer,
  X,
  Phone,
  Mail,
  Shield,
  User,
  MapPin,
  Heart,
  MessageCircle,
  Calendar,
  CreditCard,
  Globe,
  CheckCircle,
  FileText,
  Send,
  Loader2,
  ExternalLink,
  Sparkles,
  Paperclip,
  Check,
  Download,
  FileCheck,
  AlertCircle,
  Eye,
  Key,
  Copy,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Share2,
  Smartphone,
  History,
  Languages,
  CheckCheck,
  Clock,
} from "lucide-react";
import { communicationApi } from "@/lib/api";

// =======================================================
// CSS VARIABLES & PERFECT A4 LAYOUT (ZERO CLIPPING & BALANCED SPACING)
// =======================================================

const printFormStyles = `
  :root {
    --color-navy-primary: #0A1628;
    --color-blue: #1E40AF;
    --color-bright-blue: #3B82F6;
    --color-purple-primary: #5B21B6;
    --color-purple-secondary: #7C3AED;
    --color-teal: #0E7490;
    --color-green: #059669;
    --color-orange: #EA580C;
    --color-pink: #BE185D;
    --color-white: #FFFFFF;
    --color-soft-background: #F8FAFC;
    --color-border: #CBD5E1;
    --color-primary-text: #0F172A;
    --color-muted-text: #475569;
  }

  .print-form-page {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: #f8fafc;
    color: var(--color-primary-text);
    line-height: 1.35;
    padding: 0;
    margin: 0;
    width: 100%;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    box-sizing: border-box;
    position: relative;
  }

  .print-form-container {
    width: 100%;
    max-width: 100%;
    margin: 0;
    background: var(--color-white);
    border-radius: 0;
    overflow: visible;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  /* ===== HEADER SECTION ===== */
  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    background: var(--color-white);
    border-bottom: 2.5px solid;
    border-image: linear-gradient(to right, var(--color-blue), var(--color-purple-primary)) 1;
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-icon {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, var(--color-navy-primary), var(--color-purple-primary));
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
  }

  .logo-icon::before {
    content: '';
    position: absolute;
    width: 28px;
    height: 28px;
    border: 2.5px solid var(--color-white);
    border-radius: 50%;
  }

  .logo-icon::after {
    content: '+';
    position: absolute;
    color: var(--color-white);
    font-size: 20px;
    font-weight: 800;
  }

  .brand-name {
    font-size: 20px;
    font-weight: 800;
    color: var(--color-navy-primary);
    line-height: 1.1;
    letter-spacing: -0.3px;
  }

  .brand-name span {
    color: var(--color-purple-primary);
  }

  .brand-subtitle {
    font-size: 9.5px;
    color: var(--color-muted-text);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 2px;
  }

  .header-center {
    text-align: center;
    flex: 1;
    padding: 0 16px;
  }

  .form-title {
    font-size: 22px;
    font-weight: 900;
    color: var(--color-navy-primary);
    text-transform: uppercase;
    letter-spacing: 1.2px;
    line-height: 1.15;
    margin: 0;
  }

  .form-subtitle {
    font-size: 10.5px;
    color: var(--color-muted-text);
    font-weight: 600;
    margin-top: 4px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .qr-section {
    display: flex;
    align-items: center;
  }

  .qr-code {
    width: 60px;
    height: 60px;
    border: 1.5px solid var(--color-border);
    border-radius: 6px;
    padding: 3px;
    background: var(--color-white);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .qr-code img {
    width: 54px;
    height: 54px;
    display: block;
    object-fit: contain;
  }

  .qr-code-fallback {
    font-size: 8px;
    color: var(--color-muted-text);
    text-align: center;
  }

  .header-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
  }

  .header-buttons-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .print-button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    background: linear-gradient(135deg, var(--color-blue), var(--color-purple-primary));
    color: var(--color-white);
    border: none;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    transition: all 0.15s ease;
  }

  .print-button:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  .whatsapp-header-button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    background: linear-gradient(135deg, #059669, #10B981);
    color: var(--color-white);
    border: none;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(16, 185, 129, 0.25);
    transition: all 0.15s ease;
  }

  .whatsapp-header-button:hover {
    background: linear-gradient(135deg, #047857, #059669);
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.35);
    transform: translateY(-1px);
  }

  .email-header-button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    background: linear-gradient(135deg, #2563EB, #4F46E5);
    color: var(--color-white);
    border: none;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(37, 99, 235, 0.25);
    transition: all 0.15s ease;
  }

  .email-header-button:hover {
    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35);
    transform: translateY(-1px);
  }

  .datetime-section {
    font-size: 9.5px;
    color: var(--color-muted-text);
    font-weight: 600;
    text-align: right;
    line-height: 1.25;
  }

  /* ===== FORM BODY ===== */
  .form-body {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .form-section {
    padding: 10px 18px;
    border-bottom: 1.5px solid var(--color-border);
    background: var(--color-white);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .section-number {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
    color: var(--color-white);
    flex-shrink: 0;
  }

  .section-number.blue { background: var(--color-blue); }
  .section-number.purple { background: var(--color-purple-primary); }
  .section-number.orange { background: var(--color-orange); }
  .section-number.green { background: var(--color-green); }
  .section-number.teal { background: var(--color-teal); }
  .section-number.pink { background: var(--color-pink); }

  .section-title {
    font-size: 12px;
    font-weight: 800;
    color: var(--color-navy-primary);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    line-height: 1;
  }

  /* ===== DUAL SECTION (SIDE BY SIDE) ===== */
  .dual-section-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 1.5px solid var(--color-border);
    background: var(--color-white);
    width: 100%;
  }

  .dual-section-left {
    padding: 10px 18px;
    border-right: 1.5px solid var(--color-border);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .dual-section-right {
    padding: 10px 18px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  /* ===== FORM GRIDS ===== */
  .grid-4-col {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px 18px;
    width: 100%;
  }

  .grid-3-col {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px 18px;
    width: 100%;
  }

  .grid-2-col {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px 18px;
    width: 100%;
  }

  .col-span-2 {
    grid-column: span 2;
  }

  .col-span-3 {
    grid-column: span 3;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    min-width: 0;
    width: 100%;
    overflow: visible;
  }

  /* FIXED: No overflow:hidden, proper line-height so labels NEVER get cut/sliced in PDF */
  .field-label {
    font-size: 9.5px;
    font-weight: 700;
    color: #475569;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    overflow: visible !important;
    line-height: 1.2;
    min-height: 15px;
  }

  .field-required {
    color: var(--color-orange);
    font-weight: 800;
  }

  .field-icon {
    width: 11px;
    height: 11px;
    color: var(--color-blue);
    flex-shrink: 0;
    display: inline-block;
  }

  .field-value {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--color-primary-text);
    padding-bottom: 3px;
    border-bottom: 1.5px solid var(--color-border);
    min-height: 22px;
    line-height: 1.25;
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: visible !important;
    width: 100%;
  }

  .field-value.empty {
    color: #94a3b8;
    font-weight: 500;
  }

  /* ===== ADVANCED EMAIL INLINE BADGES & BUTTONS ===== */
  .email-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 1px 6px;
    background: #dcfce7;
    color: #15803d;
    border-radius: 10px;
    font-size: 8px;
    font-weight: 700;
    margin-left: 6px;
    text-transform: none;
    letter-spacing: 0;
  }

  .email-quick-action {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
    margin-left: auto;
  }

  .email-quick-action:hover {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
  }

  /* ===== NOTIFICATIONS & CONSENT ===== */
  .preferences-row {
    display: grid;
    grid-template-columns: 1fr 1fr 2fr;
    gap: 10px 18px;
    align-items: end;
    width: 100%;
  }

  .notification-list {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-bottom: 3px;
    min-height: 22px;
    width: 100%;
  }

  .notification-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 600;
    color: var(--color-primary-text);
    white-space: nowrap;
  }

  .notification-checkbox {
    width: 14px;
    height: 14px;
    border: 1.5px solid var(--color-border);
    border-radius: 3px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 800;
    line-height: 1;
    flex-shrink: 0;
  }

  .notification-checkbox.checked {
    background: var(--color-green);
    border-color: var(--color-green);
    color: var(--color-white);
  }

  .notification-checkbox.unchecked {
    background: var(--color-soft-background);
    border-color: var(--color-border);
    color: transparent;
  }

  .consent-box {
    background: #f0fdfa;
    border: 1.5px solid #ccfbf1;
    border-radius: 6px;
    padding: 7px 12px;
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    box-sizing: border-box;
  }

  .consent-checkbox {
    width: 15px;
    height: 15px;
    border: 1.5px solid var(--color-green);
    background: var(--color-green);
    color: var(--color-white);
    border-radius: 3px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 9.5px;
    font-weight: 800;
    line-height: 1;
    flex-shrink: 0;
  }

  .consent-checkbox.unchecked {
    background: var(--color-white);
    border-color: var(--color-border);
    color: transparent;
  }

  .consent-text {
    font-size: 9px;
    color: #0f766e;
    line-height: 1.35;
    font-weight: 500;
  }

  /* ===== SIGNATURE SECTION ===== */
  .signature-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 36px;
    padding: 12px 18px 10px 18px;
    background: var(--color-white);
    box-sizing: border-box;
    flex-shrink: 0;
    width: 100%;
  }

  .signature-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .signature-label {
    font-size: 9px;
    font-weight: 700;
    color: var(--color-muted-text);
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }

  .signature-line {
    height: 26px;
    border-bottom: 1.5px solid var(--color-primary-text);
    display: flex;
    align-items: flex-end;
    padding-bottom: 2px;
    font-size: 11px;
    font-weight: 600;
    color: var(--color-primary-text);
    width: 100%;
  }

  /* ===== FOOTER ===== */
  .footer {
    background: linear-gradient(135deg, var(--color-navy-primary), var(--color-blue), var(--color-purple-primary));
    padding: 10px 18px;
    color: var(--color-white);
    box-sizing: border-box;
    flex-shrink: 0;
    width: 100%;
  }

  .footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .footer-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
    font-weight: 600;
    color: var(--color-white);
  }

  .footer-icon {
    width: 12px;
    height: 12px;
    color: #4ade80;
    flex-shrink: 0;
  }

  .footer-divider {
    width: 1px;
    height: 13px;
    background: rgba(255, 255, 255, 0.35);
  }

  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 5px;
    margin-top: 5px;
    border-top: 1px solid rgba(255, 255, 255, 0.25);
    width: 100%;
  }

  .footer-security {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }

  .footer-logo-text {
    font-size: 9.5px;
    font-weight: 800;
    color: var(--color-white);
  }

  .footer-logo-subtext {
    font-size: 8px;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 500;
  }

  /* ===== ACTION BUTTONS (SCREEN ONLY) ===== */
  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 10px 18px;
    background: #f1f5f9;
    border-top: 1px solid var(--color-border);
    width: 100%;
    box-sizing: border-box;
  }

  .btn {
    padding: 7px 16px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .btn-secondary {
    background: var(--color-white);
    color: var(--color-primary-text);
    border: 1px solid var(--color-border);
  }

  .btn-secondary:hover {
    background: #e2e8f0;
  }

  .btn-whatsapp {
    background: linear-gradient(135deg, #059669, #10B981);
    color: var(--color-white);
  }

  .btn-whatsapp:hover {
    background: linear-gradient(135deg, #047857, #059669);
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
    transform: translateY(-1px);
  }

  .btn-email {
    background: linear-gradient(135deg, #2563eb, #4f46e5);
    color: var(--color-white);
  }

  .btn-email:hover {
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
    transform: translateY(-1px);
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--color-blue), var(--color-purple-primary));
    color: var(--color-white);
  }

  .btn-primary:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    transform: translateY(-1px);
  }

  /* ===== PRINT SPECIFIC CSS ===== */
  @media print {
    @page {
      size: A4 portrait;
      margin: 4mm 5mm;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      width: 100% !important;
      height: 100% !important;
    }

    .no-print,
    .action-buttons,
    .print-button,
    .email-header-button,
    .whatsapp-header-button,
    .email-quick-action,
    .email-status-pill,
    .datetime-section {
      display: none !important;
    }

    aside,
    nav,
    header:not(.form-header),
    [class*="sidebar"],
    [class*="Sidebar"],
    div[class*="fixed"][class*="inset-0"] > div > div[class*="bg-gradient"] {
      display: none !important;
    }

    .fixed.inset-0,
    div[class*="fixed"][class*="inset-0"] {
      position: static !important;
      background: transparent !important;
      padding: 0 !important;
      margin: 0 !important;
      display: block !important;
      width: 100% !important;
    }

    .fixed.inset-0 > div,
    div[class*="fixed"][class*="inset-0"] > div {
      position: static !important;
      max-width: 100% !important;
      width: 100% !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
    }

    .print-form-page {
      padding: 0 !important;
      margin: 0 !important;
      background: white !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }

    .print-form-container {
      max-width: 100% !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      display: block !important;
    }

    .form-body {
      display: block !important;
      width: 100% !important;
    }

    .form-section,
    .dual-section-row {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      width: 100% !important;
    }

    .footer {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      width: 100% !important;
    }
  }
`;

// =======================================================
// TYPES
// =======================================================

export interface PatientFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  maritalStatus: string;
  nationality: string;
  patientType: string;
  additionalInformation: string;

  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  emergencyContactAddress: string;

  allergies: string;
  medicalConditions: string;
  currentMedications: string;
  insuranceProvider: string;
  insuranceNumber: string;
  insuranceGroupNumber: string;
  insuranceExpiryDate: string;

  preferredLanguage: string;
  preferredCommunicationMethod: string;
  notificationPreferences: string[];
  privacyConsent: boolean;
}

interface PatientRegistrationPrintFormProps {
  patientData?: PatientFormData;
  patientId?: string;
  labInfo?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  onClose?: () => void;
  onSave?: (data: PatientFormData) => Promise<void>;
  onSendEmail?: (emailData: any) => Promise<void>;
  onSendWhatsApp?: (whatsAppData: any) => Promise<void>;
  autoOpenModal?: "whatsapp" | "email" | null;
}

// =======================================================
// UTILITY FUNCTIONS
// =======================================================

function formatDate(date?: string): string {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDisplayValue(value?: any): string {
  if (value === null || value === undefined || value === "" || value === "null" || value === "undefined") return "—";
  if (typeof value === "object") {
    if (value.name) return String(value.name);
    if (value.label) return String(value.label);
    if (value.title) return String(value.title);
    return "—";
  }
  return String(value);
}

function formatBloodGroupDisplay(bloodGroup?: string | null): string {
  if (!bloodGroup) return "—";
  const bloodGroupMap: { [key: string]: string } = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
  };
  return bloodGroupMap[bloodGroup] || bloodGroup;
}

// =======================================================
// MAIN COMPONENT
// =======================================================

export default function PatientRegistrationPrintForm({
  patientData,
  patientId,
  labInfo,
  onClose,
  onSave,
  onSendEmail,
  onSendWhatsApp,
  autoOpenModal,
}: PatientRegistrationPrintFormProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [qrCodeError, setQrCodeError] = useState(false);

  // Advanced View Modes & Multilingual State
  const [whatsappActiveTab, setWhatsappActiveTab] = useState<"editor" | "preview" | "history">("editor");
  const [emailActiveTab, setEmailActiveTab] = useState<"editor" | "preview" | "history">("editor");
  const [whatsappLanguage, setWhatsappLanguage] = useState<"en" | "hi" | "gu">("en");
  const [emailLanguage, setEmailLanguage] = useState<"en" | "hi" | "gu">("en");

  // Communication Delivery Tracking & History Logs State
  const [commLogs, setCommLogs] = useState<any[]>([]);
  const [loadingCommLogs, setLoadingCommLogs] = useState(false);
  const [recipientMode, setRecipientMode] = useState<"patient" | "emergency" | "custom">("patient");

  // Advanced WhatsApp Composer Modal State with Attached / Hosted PDF
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [whatsappTemplate, setWhatsappTemplate] = useState<"registration" | "welcome" | "test_instructions" | "summary">("registration");
  const [whatsappAttachPdf, setWhatsappAttachPdf] = useState(true);
  const [hostedPdfUrl, setHostedPdfUrl] = useState<string | null>(null);
  const [pdfHosting, setPdfHosting] = useState(false);
  const [whatsappSending, setWhatsappSending] = useState(false);
  const [whatsappSentSuccess, setWhatsappSentSuccess] = useState(false);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [whatsappStatusNotice, setWhatsappStatusNotice] = useState<string | null>(null);
  const [whatsappCopiedNotice, setWhatsappCopiedNotice] = useState(false);
  const [whatsappLinkCopiedNotice, setWhatsappLinkCopiedNotice] = useState(false);

  // WhatsApp API / Twilio inline configuration state
  const [showWhatsAppConfig, setShowWhatsAppConfig] = useState(false);
  const [whatsappProviderInput, setWhatsappProviderInput] = useState("twilio");
  const [whatsappApiKeyInput, setWhatsappApiKeyInput] = useState("");
  const [whatsappApiSecretInput, setWhatsappApiSecretInput] = useState("");
  const [whatsappSenderIdInput, setWhatsappSenderIdInput] = useState("whatsapp:+14155238886");
  const [whatsappTesting, setWhatsappTesting] = useState(false);
  const [whatsappTestStatus, setWhatsappTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Email Composer Modal State with Attached PDF
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailCc, setEmailCc] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailTemplate, setEmailTemplate] = useState<"registration" | "welcome" | "test_instructions" | "summary">("registration");
  const [attachPdf, setAttachPdf] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // SMTP Settings & Gmail App Password configuration state
  const [showSmtpConfig, setShowSmtpConfig] = useState(false);
  const [smtpPasswordInput, setSmtpPasswordInput] = useState("");
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestStatus, setSmtpTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const [formData, setFormData] = useState<PatientFormData>(
    patientData || {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      maritalStatus: "",
      nationality: "Indian",
      patientType: "Outpatient",
      additionalInformation: "",

      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",

      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      emergencyContactAddress: "",

      allergies: "",
      medicalConditions: "",
      currentMedications: "",
      insuranceProvider: "",
      insuranceNumber: "",
      insuranceGroupNumber: "",
      insuranceExpiryDate: "",

      preferredLanguage: "English",
      preferredCommunicationMethod: "Phone",
      notificationPreferences: [],
      privacyConsent: false,
    }
  );

  useEffect(() => {
    if (patientData) {
      setFormData((prev) => ({ ...prev, ...patientData }));
    }
  }, [patientData]);

  useEffect(() => {
    generateQRCode();
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    if (autoOpenModal === "whatsapp") {
      openWhatsAppComposer("registration");
    } else if (autoOpenModal === "email") {
      openEmailComposer("registration");
    }
  }, [autoOpenModal]);

  // Fetch communication history for patient
  const fetchCommunicationLogs = async () => {
    const effectivePatientId = patientId || formData.phone || "PAT-REG";
    setLoadingCommLogs(true);
    try {
      const res = await communicationApi.getHistory(effectivePatientId);
      if (res && res.success && res.data?.communications) {
        setCommLogs(res.data.communications);
      } else {
        setCommLogs([]);
      }
    } catch (e) {
      console.warn("Could not fetch communication history:", e);
      setCommLogs([]);
    } finally {
      setLoadingCommLogs(false);
    }
  };

  const laboratoryInfo = {
    name: labInfo?.name || "LabCore ELIS Laboratory Information System",
    address: labInfo?.address || "123 Health Avenue, Medical District, Ahmedabad, Gujarat - 380016, India",
    phone: labInfo?.phone || "+91 98765 43210",
    email: labInfo?.email || "info@labcore.in",
    website: labInfo?.website || "www.labcore.in",
  };

  // Helper to insert live patient variables into message text
  const insertVariable = (variableKey: string, target: "whatsapp" | "email") => {
    let valueToInsert = "";
    switch (variableKey) {
      case "patientName":
        valueToInsert = patientFullName;
        break;
      case "uhid":
        valueToInsert = patientId ? `PAT-${patientId.slice(0, 8)}` : "PAT-REG";
        break;
      case "bloodGroup":
        valueToInsert = formatBloodGroupDisplay(formData.bloodGroup);
        break;
      case "phone":
        valueToInsert = formData.phone || "N/A";
        break;
      case "datetime":
        valueToInsert = `${dt.date} at ${dt.time}`;
        break;
      case "helpline":
        valueToInsert = laboratoryInfo.phone;
        break;
      case "address":
        valueToInsert = laboratoryInfo.address;
        break;
      case "emergency":
        valueToInsert = `${formData.emergencyContactName || "N/A"} (${formData.emergencyContactPhone || "N/A"})`;
        break;
      case "pdfLink":
        valueToInsert = hostedPdfUrl || "[Registration Form PDF Link]";
        break;
      default:
        valueToInsert = "";
    }

    if (target === "whatsapp") {
      setWhatsappMessage((prev) => prev ? `${prev} ${valueToInsert}` : valueToInsert);
    } else {
      setEmailBody((prev) => prev ? `${prev} ${valueToInsert}` : valueToInsert);
    }
  };

  const generateQRCode = async () => {
    try {
      const qrData = patientId ? `PAT-${patientId.slice(0, 8)}` : `PAT-${Date.now()}`;
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 70,
        margin: 0,
        color: {
          dark: "#0B1F44",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      setQrCodeError(true);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const dt = getCurrentDateTime();
  const patientFullName = `${formData.firstName} ${formData.middleName ? formData.middleName + " " : ""}${formData.lastName}`.trim() || "Patient";
  const patientSafeFilename = `Patient_Registration_Form_${patientFullName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

  // High-Resolution PDF Generator with exact aspect ratio & zero label slicing
  const generateFormPdfBase64 = async (): Promise<string | null> => {
    if (!formRef.current) return null;
    setPdfGenerating(true);
    try {
      const formElement = formRef.current;

      const canvas = await html2canvas(formElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794, // Standard A4 width at 96 DPI
        onclone: (clonedDoc) => {
          // Fix html2canvas label clipping: ensure labels and values are fully unconstrained
          const allLabels = clonedDoc.querySelectorAll(".field-label, .field-value");
          allLabels.forEach((el: any) => {
            el.style.overflow = "visible";
            el.style.textOverflow = "clip";
            el.style.lineHeight = "1.3";
          });
          const formBody = clonedDoc.querySelector(".form-body") as HTMLElement;
          if (formBody) {
            formBody.style.justifyContent = "flex-start";
          }
        },
        ignoreElements: (el) => el.classList.contains("no-print"),
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      // Calculate true proportional height to prevent vertical stretching and gaps
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));

      const pdfDataUri = pdf.output("datauristring");
      const base64Data = pdfDataUri.split(",")[1];
      setPdfBase64(base64Data);
      return base64Data;
    } catch (err) {
      console.error("Failed to generate PDF for attachment:", err);
      return null;
    } finally {
      setPdfGenerating(false);
    }
  };

  // Direct PDF Download
  const handleDownloadPdf = async () => {
    if (!formRef.current) return;
    setPdfGenerating(true);
    try {
      const formElement = formRef.current;

      const canvas = await html2canvas(formElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794,
        onclone: (clonedDoc) => {
          const allLabels = clonedDoc.querySelectorAll(".field-label, .field-value");
          allLabels.forEach((el: any) => {
            el.style.overflow = "visible";
            el.style.textOverflow = "clip";
            el.style.lineHeight = "1.3";
          });
          const formBody = clonedDoc.querySelector(".form-body") as HTMLElement;
          if (formBody) {
            formBody.style.justifyContent = "flex-start";
          }
        },
        ignoreElements: (el) => el.classList.contains("no-print"),
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));
      pdf.save(patientSafeFilename);
    } catch (err) {
      console.error("Error downloading PDF:", err);
    } finally {
      setPdfGenerating(false);
    }
  };

  // Helper to normalize Indian and international WhatsApp phone numbers
  const normalizePhoneNumber = (rawPhone: string) => {
    let clean = (rawPhone || "").replace(/\D/g, "");
    if (clean.startsWith("0")) clean = clean.substring(1);
    if (clean.length === 10) clean = `91${clean}`;
    return clean;
  };

  // Advanced clinical WhatsApp templates generator with rich Markdown and Multilingual formatting
  const generateWhatsAppTemplateContent = (
    template: "registration" | "welcome" | "test_instructions" | "summary",
    patientName: string,
    phoneNum: string,
    existingHostedUrl?: string | null,
    lang: "en" | "hi" | "gu" = whatsappLanguage
  ) => {
    const pdfUrl = existingHostedUrl || hostedPdfUrl;
    
    // Multi-lingual PDF attachment label
    let pdfAttachmentSection = "";
    if (lang === "hi") {
      pdfAttachmentSection = pdfUrl
        ? `\n📄 *आधिकारिक पंजीकरण फॉर्म (PDF डाउनलोड करें):*\n${pdfUrl}\n`
        : `\n📄 *आधिकारिक पंजीकरण फॉर्म (PDF):* [लिंक तैयार हो रहा है...]\n`;
    } else if (lang === "gu") {
      pdfAttachmentSection = pdfUrl
        ? `\n📄 *સત્તાવાર દર્દી નોંધણી ફોર્મ (PDF ડાઉનલોડ):*\n${pdfUrl}\n`
        : `\n📄 *સત્તાવાર દર્દી નોંધણી ફોર્મ (PDF):* [લિંક તૈયાર થઈ રહી છે...]\n`;
    } else {
      pdfAttachmentSection = pdfUrl
        ? `\n📄 *Official Registration Document (PDF):*\n${pdfUrl}\n`
        : `\n📄 *Official Registration Document (PDF):* [Generating Secure Link...]\n`;
    }

    if (lang === "hi") {
      if (template === "welcome") {
        setWhatsappMessage(
          `🏥 *${laboratoryInfo.name.toUpperCase()}*\n` +
          `🌟 *मरीज़ डिजिटल अकाउंट एक्टिवेशन*\n\n` +
          `नमस्ते *${patientName}*,\n\n` +
          `${laboratoryInfo.name} में आपका स्वागत है! आपका डिजिटल स्वास्थ्य खाता ${dt.date} को ${dt.time} बजे सक्रिय हो गया है।\n\n` +
          `📋 *मरीज़ विवरण:*\n` +
          `• *नाम:* ${patientName}\n` +
          `• *UHID:* ${patientId ? `PAT-${patientId.slice(0, 8)}` : "PAT-REG"}\n` +
          `• *फोन:* ${formData.phone || phoneNum || "N/A"}\n` +
          `• *रक्त समूह:* ${formatBloodGroupDisplay(formData.bloodGroup)}\n` +
          pdfAttachmentSection +
          `\n✨ *डिजिटल अकाउंट के मुख्य लाभ:*\n` +
          `✓ अपनी सभी टेस्ट रिपोर्ट्स 24/7 ऑनलाइन देखें\n` +
          `✓ बारकोड और QR से प्राथमिकता सैंपल कलेक्शन\n` +
          `✓ WhatsApp और Email पर सीधे रिपोर्ट अलर्ट\n\n` +
          `📞 *हेल्पलाइन:* ${laboratoryInfo.phone}\n` +
          `📍 *पता:* ${laboratoryInfo.address}\n\n` +
          `_LabCore ELIS — उत्तम स्वास्थ्य हमारी प्राथमिकता._`
        );
      } else if (template === "test_instructions") {
        setWhatsappMessage(
          `🏥 *${laboratoryInfo.name.toUpperCase()}*\n` +
          `🧪 *जांच पूर्व महत्वपूर्ण दिशानिर्देश (Pre-Test Guidelines)*\n\n` +
          `नमस्ते *${patientName}*,\n\n` +
          `${laboratoryInfo.name} में पंजीकरण के लिए धन्यवाद। कृपया अपनी आगामी लैब जांच से पूर्व इन नियमों का पालन करें:\n\n` +
          `⚠️ *महत्वपूर्ण क्लिनिकल निर्देश:*\n` +
          `1️⃣ *फास्टिंग (खाली पेट):* शुगर फास्टिंग, लिपिड प्रोफाइल या LFT जांच के लिए 8–10 घंटे का उपवास अनिवार्य है (केवल पानी पी सकते हैं)।\n` +
          `2️⃣ *दवाइयां:* अपनी नियमित दवाएं डॉक्टर के निर्देशानुसार ही जारी रखें।\n` +
          `3️⃣ *समय:* सैंपल देने के निर्धारित समय से 10–15 मिनट पहले लैब पहुंचें।\n` +
          `4️⃣ *रिपोर्ट:* पैथोलॉजिस्ट द्वारा सत्यापित डिजिटल रिपोर्ट आपके WhatsApp पर भेजी जाएगी।\n` +
          pdfAttachmentSection +
          `\n📞 *पूछताछ व सहायता:* ${laboratoryInfo.phone}\n` +
          `_सटीक जांच • बेहतर देखभाल • सुरक्षित परिणाम_`
        );
      } else if (template === "summary") {
        setWhatsappMessage(
          `🏥 *${laboratoryInfo.name.toUpperCase()}*\n` +
          `🧾 *मरीज़ पंजीकरण रसीद व सारांश*\n\n` +
          `नमस्ते *${patientName}*,\n\n` +
          `आपके पंजीकरण का सत्यापित सारांश निम्नलिखित है:\n\n` +
          `• *नाम:* ${patientName}\n` +
          `• *UHID / टोकन:* ${patientId ? `PAT-${patientId.slice(0, 8)}` : "PAT-REG"}\n` +
          `• *दिनांक:* ${dt.date} • ${dt.time}\n` +
          `• *रक्त समूह:* ${formatBloodGroupDisplay(formData.bloodGroup)}\n` +
          `• *आपातकालीन संपर्क:* ${formData.emergencyContactName || "N/A"} (${formData.emergencyContactPhone || "N/A"})\n` +
          pdfAttachmentSection +
          `\n📞 *लैब हेल्पलाइन:* ${laboratoryInfo.phone}\n` +
          `_LabCore ELIS — Laboratory Information System_`
        );
      } else {
        setWhatsappMessage(
          `🏥 *${laboratoryInfo.name.toUpperCase()}*\n` +
          `📋 *मरीज़ पंजीकरण आधिकारिक पुष्टि (Official Confirmation)*\n\n` +
          `नमस्ते *${patientName}*,\n\n` +
          `*${laboratoryInfo.name}* में आपका आधिकारिक मरीज़ पंजीकरण सफलतापूर्वक संपन्न हो चुका है।\n\n` +
          `===================================\n` +
          `*मरीज़ क्लिनिकल प्रोफाइल (Summary)*\n` +
          `===================================\n` +
          `• *मरीज़ का नाम:* ${patientName}\n` +
          `• *UHID नंबर:* ${patientId ? `PAT-${patientId.slice(0, 8)}` : "PAT-REG"}\n` +
          `• *जन्म तिथि:* ${formatDate(formData.dateOfBirth)} (${formData.gender || "N/A"})\n` +
          `• *रक्त समूह (Blood Group):* ${formatBloodGroupDisplay(formData.bloodGroup)}\n` +
          `• *संपर्क मोबाइल:* ${formData.phone || phoneNum || "N/A"}\n` +
          `• *आवासीय पता:* ${formData.address || "N/A"}, ${formData.city || "Ahmedabad"}\n` +
          `• *आपातकालीन संपर्क:* ${formData.emergencyContactName || "N/A"} (${formData.emergencyContactPhone || "N/A"})\n` +
          `• *बीमा / इंश्योरेंस:* ${formData.insuranceProvider || "N/A"} (${formData.insuranceNumber || "N/A"})\n` +
          `• *पंजीकरण समय:* ${dt.date} at ${dt.time}\n` +
          `===================================\n` +
          pdfAttachmentSection +
          `\n🔒 *डेटा गोपनीयता:* आपका मेडिकल रिकॉर्ड 256-bit एन्क्रिप्शन और HIPAA मानकों के तहत पूर्णतः सुरक्षित है।\n\n` +
          `📞 *24/7 हेल्पलाइन व WhatsApp:* ${laboratoryInfo.phone}\n` +
          `📍 *लैब पता:* ${laboratoryInfo.address}`
        );
      }
    } else if (lang === "gu") {
      if (template === "welcome") {
        setWhatsappMessage(
          `🏥 *${laboratoryInfo.name.toUpperCase()}*\n` +
          `🌟 *દર્દી ડિજિટલ એકાઉન્ટ સક્રિયકરણ*\n\n` +
          `નમસ્તે *${patientName}*,\n\n` +
          `${laboratoryInfo.name} માં આપનું સ્વાગત છે! આપનું દર્દી ડિજિટલ એકાઉન્ટ ${dt.date} ના રોજ ${dt.time} કલાકે સક્રિય કરવામાં આવ્યું છે.\n\n` +
          `📋 *દર્દીની વિગત:*\n` +
          `• *નામ:* ${patientName}\n` +
          `• *UHID:* ${patientId ? `PAT-${patientId.slice(0, 8)}` : "PAT-REG"}\n` +
          `• *મોબાઇલ:* ${formData.phone || phoneNum || "N/A"}\n` +
          `• *બ્લડ ગ્રૂપ:* ${formatBloodGroupDisplay(formData.bloodGroup)}\n` +
          pdfAttachmentSection +
          `\n✨ *ડિજિટલ ખાતાના વિશેષ લાભો:*\n` +
          `✓ જૂના તમામ રિપોર્ટ્સ 24/7 ઓનલાઇન મેળવો\n` +
          `✓ ક્યૂઆર (QR) કોડ દ્વારા પ્રાથમિક સેમ્પલ કલેક્શન\n` +
          `✓ સીધા WhatsApp અને Email પર લેબ પરિણામો\n\n` +
          `📞 *સહાય હેલ્પલાઇન:* ${laboratoryInfo.phone}\n` +
          `📍 *સરનામું:* ${laboratoryInfo.address}\n\n` +
          `_LabCore ELIS — આપની સેવામાં સદાય તત્પર._`
        );
      } else if (template === "test_instructions") {
        setWhatsappMessage(
          `🏥 *${laboratoryInfo.name.toUpperCase()}*\n` +
          `🧪 *લેબ ટેસ્ટ પૂર્વે અગત્યની તબીબી સૂચનાઓ*\n\n` +
          `નમસ્તે *${patientName}*,\n\n` +
          `${laboratoryInfo.name} સાથે નોંધણી કરાવવા બદલ આભાર. આપના લેબ ટેસ્ટ અગાઉ નીચે મુજબ કાળજી રાખવા વિનંતી:\n\n` +
          `⚠️ *અગત્યની સૂચનાઓ:*\n` +
          `1️⃣ *ઉપવાસ (Fasting):* ફાસ્ટિંગ શુગર, લિપિડ પ્રોફાઇલ કે LFT માટે 8 થી 10 કલાક ભૂખ્યા રહેવું (માત્ર સાદું પાણી પી શકાય).\n` +
          `2️⃣ *દવાઓ:* નિયમિત દવાઓ ચાલુ રાખવી (જો ડોક્ટરે ખાસ મનાઈ ન કરી હોય તો).\n` +
          `3️⃣ *સમયપાલન:* આપના સેમ્પલ કલેક્શન સમય કરતાં 10–15 મિનિટ વહેલા પધારવું.\n` +
          `4️⃣ *રિપોર્ટ વિતરણ:* પેથોલોજિસ્ટ દ્વારા ચકાસાયેલ રિપોર્ટ સીધા આપના WhatsApp પર મળશે.\n` +
          pdfAttachmentSection +
          `\n📞 *લેબ હેલ્પલાઇન:* ${laboratoryInfo.phone}\n` +
          `_ચોક્કસ પરિણામ • શ્રેષ્ઠ તબીબી સેવા_`
        );
      } else if (template === "summary") {
        setWhatsappMessage(
          `🏥 *${laboratoryInfo.name.toUpperCase()}*\n` +
          `🧾 *દર્દી નોંધણી સારાંશ અને પહોંચ*\n\n` +
          `નમસ્તે *${patientName}*,\n\n` +
          `આપની લેબ નોંધણીનો સારાંશ નીચે મુજબ છે:\n\n` +
          `• *નામ:* ${patientName}\n` +
          `• *UHID:* ${patientId ? `PAT-${patientId.slice(0, 8)}` : "PAT-REG"}\n` +
          `• *તારીખ:* ${dt.date} • ${dt.time}\n` +
          `• *બ્લડ ગ્રૂપ:* ${formatBloodGroupDisplay(formData.bloodGroup)}\n` +
          `• *ઇમરજન્સી સંપર્ક:* ${formData.emergencyContactName || "N/A"} (${formData.emergencyContactPhone || "N/A"})\n` +
          pdfAttachmentSection +
          `\n📞 *લેબ હેલ્પલાઇન:* ${laboratoryInfo.phone}\n` +
          `_LabCore ELIS — Accurate Information • Better Care_`
        );
      } else {
        setWhatsappMessage(
          `🏥 *${laboratoryInfo.name.toUpperCase()}*\n` +
          `📋 *સત્તાવાર દર્દી નોંધણી પુષ્ટિકરણ (Official Confirmation)*\n\n` +
          `નમસ્તે *${patientName}*,\n\n` +
          `*${laboratoryInfo.name}* માં આપનું સત્તાવાર દર્દી રજીસ્ટ્રેશન સફળતાપૂર્વક પૂર્ણ થયેલ છે.\n\n` +
          `===================================\n` +
          `*દર્દી ક્લિનિકલ પ્રોફાઇલ (Summary)*\n` +
          `===================================\n` +
          `• *દર્દીનું પૂરું નામ:* ${patientName}\n` +
          `• *UHID નંબર:* ${patientId ? `PAT-${patientId.slice(0, 8)}` : "PAT-REG"}\n` +
          `• *જન્મ તારીખ:* ${formatDate(formData.dateOfBirth)} (${formData.gender || "N/A"})\n` +
          `• *બ્લડ ગ્રૂપ (Blood Group):* ${formatBloodGroupDisplay(formData.bloodGroup)}\n` +
          `• *મોબાઇલ નંબર:* ${formData.phone || phoneNum || "N/A"}\n` +
          `• *રહેઠાણનું સરનામું:* ${formData.address || "N/A"}, ${formData.city || "Ahmedabad"}\n` +
          `• *ઇમરજન્સી સંપર્ક:* ${formData.emergencyContactName || "N/A"} (${formData.emergencyContactPhone || "N/A"})\n` +
          `• *વીમા કંપની (Insurance):* ${formData.insuranceProvider || "N/A"} (${formData.insuranceNumber || "N/A"})\n` +
          `• *નોંધણી સમય:* ${dt.date} ના ${dt.time}\n` +
          `===================================\n` +
          pdfAttachmentSection +
          `\n🔒 *ડેટા સુરક્ષા:* આપની તમામ મેડિકલ માહિતી 256-bit એન્ક્રિપ્શન અને HIPAA સ્ટાન્ડર્ડ્સ હેઠળ સુરક્ષિત છે.\n\n` +
          `📞 *24/7 હેલ્પલાઇન & WhatsApp:* ${laboratoryInfo.phone}\n` +
          `📍 *લેબ સરનામું:* ${laboratoryInfo.address}`
        );
      }
    } else {
      // English (default)
      if (template === "welcome") {
        setWhatsappMessage(
          `🏥 *${laboratoryInfo.name.toUpperCase()}*\n` +
          `🌟 *PATIENT DIGITAL ACCOUNT CONFIRMATION*\n\n` +
          `Dear *${patientName}*,\n\n` +
          `Welcome to ${laboratoryInfo.name}! Your patient diagnostic account is now active as of ${dt.date} at ${dt.time}.\n\n` +
          `📋 *ACCOUNT OVERVIEW:*\n` +
          `• *Full Name:* ${patientName}\n` +
          `• *Patient UHID:* ${patientId ? `PAT-${patientId.slice(0, 8)}` : "PAT-REG"}\n` +
          `• *Registered Contact:* ${formData.phone || phoneNum || "N/A"}\n` +
          `• *Blood Group:* ${formatBloodGroupDisplay(formData.bloodGroup)}\n` +
          `• *Registration Time:* ${dt.date} at ${dt.time}\n` +
          pdfAttachmentSection +
          `\n✨ *KEY SERVICES & BENEFITS:*\n` +
          `✓ 24/7 Digital access to test results & receipts\n` +
          `✓ Fast-track sample collection with QR code\n` +
          `✓ Automated WhatsApp & Email report alerts\n\n` +
          `📞 *Helpline / Support:* ${laboratoryInfo.phone}\n` +
          `📍 *Address:* ${laboratoryInfo.address}\n\n` +
          `_Thank you for choosing ${laboratoryInfo.name}._`
        );
      } else if (template === "test_instructions") {
        setWhatsappMessage(
          `🏥 *${laboratoryInfo.name.toUpperCase()}*\n` +
          `🧪 *PRE-TEST CLINICAL INSTRUCTIONS & PREPARATION*\n\n` +
          `Dear *${patientName}*,\n\n` +
          `Thank you for completing your registration with ${laboratoryInfo.name}. Before your scheduled sample collection, please follow these guidelines:\n\n` +
          `⚠️ *IMPORTANT PREPARATION GUIDELINES:*\n` +
          `1️⃣ *Fasting Blood Tests:* Maintain 8–10 hours of overnight fasting for Glucose Fasting, Lipid Profile, or LFT (only water is permitted).\n` +
          `2️⃣ *Medications:* Continue regular medications unless advised otherwise by your attending physician.\n` +
          `3️⃣ *Collection Time:* Please arrive 10–15 minutes prior to scheduled collection, or keep your location ready for home phlebotomy.\n` +
          `4️⃣ *Report Verification:* Pathologist-verified reports will be delivered directly to your WhatsApp.\n` +
          pdfAttachmentSection +
          `\n📞 *Diagnostic Queries:* ${laboratoryInfo.phone}\n` +
          `_Your health and diagnostic precision are our top priorities._`
        );
      } else if (template === "summary") {
        setWhatsappMessage(
          `🏥 *${laboratoryInfo.name.toUpperCase()}*\n` +
          `🧾 *PATIENT REGISTRATION SUMMARY & RECEIPT*\n\n` +
          `Dear *${patientName}*,\n\n` +
          `Your patient registration summary has been verified in our system:\n\n` +
          `• *Patient Name:* ${patientName}\n` +
          `• *UHID / Token:* ${patientId ? `PAT-${patientId.slice(0, 8)}` : "PAT-REG"}\n` +
          `• *Registered Phone:* ${formData.phone || phoneNum || "N/A"}\n` +
          `• *Blood Group:* ${formatBloodGroupDisplay(formData.bloodGroup)}\n` +
          `• *Gender & DOB:* ${formData.gender || "N/A"} (${formatDate(formData.dateOfBirth)})\n` +
          `• *Emergency Contact:* ${formData.emergencyContactName || "N/A"} (${formData.emergencyContactPhone || "N/A"})\n` +
          `• *Registration Date:* ${dt.date} at ${dt.time}\n` +
          pdfAttachmentSection +
          `\n📞 *Laboratory Contact:* ${laboratoryInfo.phone} | ${laboratoryInfo.email}\n` +
          `_LabCore ELIS — Accurate Information • Better Care_`
        );
      } else {
        setWhatsappMessage(
          `🏥 *${laboratoryInfo.name.toUpperCase()}*\n` +
          `📋 *OFFICIAL PATIENT REGISTRATION CONFIRMATION*\n\n` +
          `Dear *${patientName}*,\n\n` +
          `Greetings! Your official registration with *${laboratoryInfo.name}* has been successfully processed and verified.\n\n` +
          `===================================\n` +
          `*PATIENT CLINICAL SUMMARY*\n` +
          `===================================\n` +
          `• *Full Name:* ${patientName}\n` +
          `• *UHID / File ID:* ${patientId ? `PAT-${patientId.slice(0, 8)}` : "PAT-REG"}\n` +
          `• *Date of Birth:* ${formatDate(formData.dateOfBirth)} (${formData.gender || "N/A"})\n` +
          `• *Blood Group:* ${formatBloodGroupDisplay(formData.bloodGroup)}\n` +
          `• *Contact Phone:* ${formData.phone || phoneNum || "N/A"}\n` +
          `• *Address:* ${formData.address || "N/A"}, ${formData.city || "Ahmedabad"}\n` +
          `• *Emergency Contact:* ${formData.emergencyContactName || "N/A"} (${formData.emergencyContactPhone || "N/A"})\n` +
          `• *Insurance:* ${formData.insuranceProvider || "N/A"} (${formData.insuranceNumber || "N/A"})\n` +
          `• *Registered Date & Time:* ${dt.date} at ${dt.time}\n` +
          `===================================\n` +
          pdfAttachmentSection +
          `\n🔒 *DATA PRIVACY:* Your diagnostic data is encrypted and protected under HIPAA & ISO 15189:2022 standards.\n\n` +
          `📞 *24/7 Helpline & WhatsApp:* ${laboratoryInfo.phone}\n` +
          `📍 *Location:* ${laboratoryInfo.address}`
        );
      }
    }
  };

  // Open WhatsApp Composer and prepare PDF hosting
  const openWhatsAppComposer = (initialTemplate: "registration" | "welcome" | "test_instructions" | "summary" = "registration") => {
    const rawPhone = formData.phone || "";
    const cleanPhone = normalizePhoneNumber(rawPhone);
    setWhatsappPhone(cleanPhone);
    setWhatsappTemplate(initialTemplate);
    setWhatsappActiveTab("editor");
    setRecipientMode("patient");
    setWhatsappError(null);
    setWhatsappStatusNotice(null);
    setWhatsappSentSuccess(false);
    setShowWhatsAppConfig(false);
    setWhatsappTestStatus(null);
    fetchCommunicationLogs();

    generateWhatsAppTemplateContent(initialTemplate, patientFullName, cleanPhone, hostedPdfUrl, whatsappLanguage);
    setShowWhatsAppModal(true);

    // Pre-generate and host PDF in background so link is live
    setTimeout(async () => {
      let b64 = pdfBase64;
      if (!b64) {
        b64 = await generateFormPdfBase64();
      }
      if (b64 && !hostedPdfUrl) {
        setPdfHosting(true);
        try {
          const uploadRes = await communicationApi.uploadPdf({
            filename: patientSafeFilename,
            content: b64,
          });
          if (uploadRes && uploadRes.success && uploadRes.data?.url) {
            const publicUrl = uploadRes.data.url;
            setHostedPdfUrl(publicUrl);
            generateWhatsAppTemplateContent(initialTemplate, patientFullName, cleanPhone, publicUrl);
          }
        } catch (e) {
          console.warn("Could not pre-host PDF:", e);
        } finally {
          setPdfHosting(false);
        }
      }
    }, 100);
  };

  // Open in WhatsApp Web or Desktop App with pre-filled text & hosted PDF link
  const handleOpenWhatsAppWeb = async () => {
    handleDownloadPdf();
    let targetPhone = normalizePhoneNumber(whatsappPhone);
    const encText = encodeURIComponent(whatsappMessage);
    const waUrl = targetPhone
      ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encText}`
      : `https://api.whatsapp.com/send?text=${encText}`;
    window.open(waUrl, "_blank");
    setWhatsappStatusNotice(
      `✓ WhatsApp opened with pre-filled message and document PDF link! The PDF form (${patientSafeFilename}) was also downloaded to your computer.`
    );
  };

  // Direct send WhatsApp via backend provider
  const handleSendDirectWhatsApp = async () => {
    const targetPhone = normalizePhoneNumber(whatsappPhone);
    if (!targetPhone || targetPhone.length < 10) {
      setWhatsappError("Please enter a valid 10-digit or international WhatsApp phone number.");
      return;
    }

    setWhatsappSending(true);
    setWhatsappError(null);
    setWhatsappStatusNotice(null);

    try {
      let currentPdf = pdfBase64;
      if (whatsappAttachPdf && !currentPdf) {
        currentPdf = await generateFormPdfBase64();
      }

      if (onSendWhatsApp) {
        await onSendWhatsApp({
          to: targetPhone,
          message: whatsappMessage.trim(),
          patientId: patientId || `pat-${Date.now()}`,
          pdfBase64: currentPdf || undefined,
          filename: patientSafeFilename,
          mediaUrl: hostedPdfUrl || undefined,
        });
        setWhatsappSentSuccess(true);
        setWhatsappStatusNotice(`WhatsApp message dispatched to +${targetPhone}!`);
        setTimeout(() => {
          setWhatsappSentSuccess(false);
          setShowWhatsAppModal(false);
        }, 2200);
      } else {
        const effectivePatientId = patientId || `pat-${Date.now()}`;
        const response = await communicationApi.sendWhatsApp({
          patientId: effectivePatientId,
          to: targetPhone,
          message: whatsappMessage.trim(),
          pdfBase64: whatsappAttachPdf ? currentPdf || undefined : undefined,
          filename: patientSafeFilename,
          mediaUrl: hostedPdfUrl || undefined,
        });

        if (response && response.success && response.data?.status !== "FAILED") {
          setWhatsappSentSuccess(true);
          const returnedUrl = response.data?.mediaUrl || hostedPdfUrl;
          if (returnedUrl) setHostedPdfUrl(returnedUrl);

          setWhatsappStatusNotice(`✓ WhatsApp message dispatched successfully to +${targetPhone} with Registration PDF!`);
          setTimeout(() => {
            setWhatsappSentSuccess(false);
            setShowWhatsAppModal(false);
          }, 2500);
        } else {
          const rawErr = response?.message || response?.data?.errorMessage || "WhatsApp API dispatch failed";
          setWhatsappError(rawErr);
          if (rawErr.includes("credentials") || rawErr.includes("not configured") || rawErr.includes("Twilio") || rawErr.includes("Provider")) {
            setShowWhatsAppConfig(true);
          }
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || "Error during WhatsApp dispatch";
      setWhatsappError(errMsg);
      if (errMsg.includes("credentials") || errMsg.includes("Twilio") || errMsg.includes("API")) {
        setShowWhatsAppConfig(true);
      }
    } finally {
      setWhatsappSending(false);
    }
  };

  // Test and save WhatsApp configuration (Twilio, etc.)
  const handleTestAndSaveWhatsApp = async () => {
    if (!whatsappApiKeyInput.trim() || !whatsappApiSecretInput.trim()) {
      setWhatsappTestStatus({ success: false, message: "Please enter Twilio Account SID and Auth Token." });
      return;
    }
    setWhatsappTesting(true);
    setWhatsappTestStatus(null);
    try {
      const res = await communicationApi.testWhatsApp({
        whatsappProvider: whatsappProviderInput,
        whatsappApiKey: whatsappApiKeyInput.trim(),
        whatsappApiSecret: whatsappApiSecretInput.trim(),
        whatsappSenderId: whatsappSenderIdInput.trim() || "whatsapp:+14155238886",
      });

      if (res && res.success) {
        await communicationApi.updateWhatsAppSettings({
          whatsappProvider: whatsappProviderInput,
          whatsappApiKey: whatsappApiKeyInput.trim(),
          whatsappApiSecret: whatsappApiSecretInput.trim(),
          whatsappSenderId: whatsappSenderIdInput.trim() || "whatsapp:+14155238886",
        });
        setWhatsappTestStatus({
          success: true,
          message: "✓ Twilio WhatsApp API verified and saved! Direct dispatch is active.",
        });
        setWhatsappError(null);
      } else {
        setWhatsappTestStatus({
          success: false,
          message: res?.message || "WhatsApp API verification failed. Please check credentials.",
        });
      }
    } catch (err: any) {
      setWhatsappTestStatus({
        success: false,
        message: err?.message || "Connection error during WhatsApp API test.",
      });
    } finally {
      setWhatsappTesting(false);
    }
  };

  const handleCopyWhatsAppMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setWhatsappCopiedNotice(true);
    setTimeout(() => setWhatsappCopiedNotice(false), 2000);
  };

  const handleCopyPdfLink = () => {
    if (hostedPdfUrl) {
      navigator.clipboard.writeText(hostedPdfUrl);
      setWhatsappLinkCopiedNotice(true);
      setTimeout(() => setWhatsappLinkCopiedNotice(false), 2000);
    }
  };

  // Open Email Composer and kick off background PDF attachment preparation
  const openEmailComposer = (initialTemplate: "registration" | "welcome" | "test_instructions" | "summary" = "registration") => {
    const recipient = formData.email || "";
    setEmailTo(recipient);
    setEmailTemplate(initialTemplate);
    setEmailError(null);
    setStatusNotice(null);
    setEmailSentSuccess(false);
    setShowSmtpConfig(false);
    setSmtpTestStatus(null);

    generateTemplateContent(initialTemplate, patientFullName, recipient);
    setShowEmailModal(true);

    // Trigger PDF generation in background so it's ready immediately
    setTimeout(() => {
      generateFormPdfBase64();
    }, 100);
  };

  // Modified and enriched professional clinical email templates
  const generateTemplateContent = (
    template: "registration" | "welcome" | "test_instructions" | "summary",
    patientName: string,
    recipient: string
  ) => {
    if (template === "welcome") {
      setEmailSubject(`Welcome to LabCore ELIS - Patient Account & Registration Record (${patientName})`);
      setEmailBody(
        `Dear ${patientName},\n\n` +
        `Greetings from ${laboratoryInfo.name}.\n\n` +
        `We are delighted to welcome you to our healthcare diagnostics network. Your patient registration account has been successfully set up on ${dt.date} at ${dt.time}.\n\n` +
        `Your official 1-Page Patient Registration Form has been generated and is attached to this email as a digital PDF copy.\n\n` +
        `============================================================\n` +
        `PATIENT ACCOUNT OVERVIEW\n` +
        `============================================================\n` +
        `• Full Name         : ${patientName}\n` +
        `• Registered Phone  : ${formData.phone || "N/A"}\n` +
        `• Registered Email  : ${recipient || "N/A"}\n` +
        `• Blood Group       : ${formatBloodGroupDisplay(formData.bloodGroup)}\n` +
        `• Patient Category  : ${formData.patientType || "Outpatient"}\n` +
        `• Address           : ${formData.address || "N/A"}, ${formData.city || "Ahmedabad"}\n` +
        `============================================================\n\n` +
        `KEY BENEFITS OF YOUR DIGITAL ACCOUNT:\n` +
        `✓ Access past test reports and digital invoices 24/7\n` +
        `✓ Fast-track sample collection and priority appointments\n` +
        `✓ Direct WhatsApp & Email report alerts\n\n` +
        `📎 ATTACHED FILE: ${patientSafeFilename}\n\n` +
        `If you need any assistance, our helpdesk is available at ${laboratoryInfo.phone} or email ${laboratoryInfo.email}.\n\n` +
        `Warm regards,\n` +
        `Patient Support & Customer Care Team\n` +
        `${laboratoryInfo.name}\n` +
        `${laboratoryInfo.address}`
      );
    } else if (template === "test_instructions") {
      setEmailSubject(`Diagnostic Test Preparation & Registration Notice - ${patientName}`);
      setEmailBody(
        `Dear ${patientName},\n\n` +
        `Thank you for completing your registration with ${laboratoryInfo.name}.\n\n` +
        `Your official registration document is attached herewith for your records. Below are important clinical preparation guidelines for your upcoming laboratory tests:\n\n` +
        `============================================================\n` +
        `PRE-TEST PREPARATION GUIDELINES\n` +
        `============================================================\n` +
        `1. Fasting Blood Tests: For Glucose Fasting, Lipid Profile, or LFT, please ensure 8 to 10 hours of overnight fasting (water is permitted).\n` +
        `2. Medications: Take regular prescribed medications unless your physician instructed otherwise.\n` +
        `3. Sample Collection: Please arrive 10-15 minutes before your scheduled collection time, or have your home collection phlebotomist visit ready.\n` +
        `4. Report Delivery: Once tests are verified by our pathologists, your official digital report will be sent to ${recipient}.\n\n` +
        `============================================================\n` +
        `PATIENT SUMMARY\n` +
        `• Patient Name  : ${patientName}\n` +
        `• Contact Phone : ${formData.phone || "N/A"}\n` +
        `• Date & Time   : ${dt.date} at ${dt.time}\n` +
        `• Attached File : ${patientSafeFilename}\n` +
        `============================================================\n\n` +
        `For questions or scheduling changes, please contact us at ${laboratoryInfo.phone}.\n\n` +
        `Best regards,\n` +
        `Clinical Pathology & Sample Collection Department\n` +
        `${laboratoryInfo.name}`
      );
    } else if (template === "summary") {
      setEmailSubject(`Registration Summary & Receipt - ${patientName} (UHID: ${patientId || "PAT-REG"})`);
      setEmailBody(
        `Dear ${patientName},\n\n` +
        `Thank you for visiting ${laboratoryInfo.name}.\n\n` +
        `Your patient registration summary has been confirmed. Below is a quick overview of your profile and registered details:\n\n` +
        `============================================================\n` +
        `PATIENT SUMMARY RECEIPT\n` +
        `============================================================\n` +
        `• Patient Name   : ${patientName}\n` +
        `• Contact Number : ${formData.phone || "N/A"}\n` +
        `• Email Address  : ${recipient || "N/A"}\n` +
        `• Blood Group    : ${formatBloodGroupDisplay(formData.bloodGroup)}\n` +
        `• Gender & Age   : ${formData.gender || "N/A"} (${formatDate(formData.dateOfBirth)})\n` +
        `• Registration   : ${dt.date} at ${dt.time}\n` +
        `• Attached Form  : ${patientSafeFilename}\n` +
        `============================================================\n\n` +
        `Your complete official 1-page clinical registration form is attached to this email as a PDF document for your records.\n\n` +
        `Helpline: ${laboratoryInfo.phone} | ${laboratoryInfo.email}\n` +
        `Warm regards,\n` +
        `${laboratoryInfo.name}`
      );
    } else {
      // "registration" - Default comprehensive official copy
      setEmailSubject(`Official Patient Registration Confirmation & Form Copy - ${patientName}`);
      setEmailBody(
        `Dear ${patientName},\n\n` +
        `Greetings from ${laboratoryInfo.name}.\n\n` +
        `Your official Patient Registration has been confirmed and recorded in our laboratory system. Please find your official 1-Page Patient Registration Form attached with this email as a PDF document for your records.\n\n` +
        `============================================================\n` +
        `OFFICIAL REGISTRATION DETAILS\n` +
        `============================================================\n` +
        `• Full Patient Name   : ${patientName}\n` +
        `• Date of Birth       : ${formatDate(formData.dateOfBirth)} (${formData.gender || "N/A"})\n` +
        `• Blood Group         : ${formatBloodGroupDisplay(formData.bloodGroup)}\n` +
        `• Registered Phone    : ${formData.phone || "N/A"}\n` +
        `• Registered Email    : ${recipient || "N/A"}\n` +
        `• Residential Address : ${formData.address || "N/A"}, ${formData.city || "Ahmedabad"}, ${formData.state || "Gujarat"} - ${formData.postalCode || "N/A"}\n` +
        `• Emergency Contact   : ${formData.emergencyContactName || "N/A"} (${formData.emergencyContactPhone || "N/A"})\n` +
        `• Insurance Provider  : ${formData.insuranceProvider || "N/A"} | Policy: ${formData.insuranceNumber || "N/A"}\n` +
        `• Registration Date   : ${dt.date} at ${dt.time}\n` +
        `============================================================\n\n` +
        `📎 ATTACHMENT NOTICE:\n` +
        `The complete official 1-Page Registration Document is attached: ${patientSafeFilename}\n\n` +
        `DATA PRIVACY & CONFIDENTIALITY:\n` +
        `This record contains protected medical health information secured under 256-bit SSL encryption and HIPAA compliance standards.\n\n` +
        `For appointments or inquiries, please contact our 24/7 Helpline at ${laboratoryInfo.phone} or reply directly to this email (${laboratoryInfo.email}).\n\n` +
        `Warm regards,\n` +
        `Patient Care & Registration Services\n` +
        `${laboratoryInfo.name}\n` +
        `${laboratoryInfo.address}`
      );
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo.trim()) {
      setEmailError("Please enter a valid recipient email address.");
      return;
    }

    setEmailSending(true);
    setEmailError(null);
    setStatusNotice(null);

    try {
      // Ensure PDF is generated before dispatching
      let currentPdf = pdfBase64;
      if (attachPdf && !currentPdf) {
        currentPdf = await generateFormPdfBase64();
      }

      const attachments = [];
      if (attachPdf && currentPdf) {
        attachments.push({
          filename: patientSafeFilename,
          content: currentPdf,
          contentType: "application/pdf",
        });
      }

      if (onSendEmail) {
        await onSendEmail({
          to: emailTo.trim(),
          cc: emailCc.trim() || undefined,
          subject: emailSubject.trim(),
          body: emailBody.trim(),
          patientId: patientId || `pat-${Date.now()}`,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
        setEmailSentSuccess(true);
        setStatusNotice(`Email sent to ${emailTo.trim()} with attached PDF.`);
        setTimeout(() => {
          setEmailSentSuccess(false);
          setShowEmailModal(false);
        }, 2200);
      } else {
        const effectivePatientId = patientId || `pat-${Date.now()}`;
        const response = await communicationApi.sendEmail({
          patientId: effectivePatientId,
          to: emailTo.trim(),
          subject: emailSubject.trim(),
          body: emailBody.trim(),
          attachments: attachments.length > 0 ? attachments : undefined,
        });

        if (response && response.success && response.data?.status !== "FAILED") {
          setEmailSentSuccess(true);
          setStatusNotice(`✓ Email delivered successfully to ${emailTo.trim()} with ${patientSafeFilename} attached!`);
          setTimeout(() => {
            setEmailSentSuccess(false);
            setShowEmailModal(false);
          }, 2500);
        } else {
          const rawErr = response?.message || response?.data?.errorMessage || "Email dispatch failed";
          setEmailError(rawErr);
          // If SMTP auth error (Gmail App Password missing), auto-reveal the config box!
          if (rawErr.includes("Application-specific password") || rawErr.includes("Invalid login") || rawErr.includes("534-5.7.9")) {
            setShowSmtpConfig(true);
          }
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || "Error during email dispatch";
      setEmailError(errMsg);
      if (errMsg.includes("Application-specific password") || errMsg.includes("Invalid login") || errMsg.includes("534-5.7.9") || errMsg.includes("SMTP")) {
        setShowSmtpConfig(true);
      }
    } finally {
      setEmailSending(false);
    }
  };

  // Live PDF preview in new window
  const handlePreviewPdf = async () => {
    if (!formRef.current) return;
    setPdfGenerating(true);
    try {
      const formElement = formRef.current;
      const canvas = await html2canvas(formElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794,
        onclone: (clonedDoc) => {
          const allLabels = clonedDoc.querySelectorAll(".field-label, .field-value");
          allLabels.forEach((el: any) => {
            el.style.overflow = "visible";
            el.style.textOverflow = "clip";
            el.style.lineHeight = "1.3";
          });
          const formBody = clonedDoc.querySelector(".form-body") as HTMLElement;
          if (formBody) {
            formBody.style.justifyContent = "flex-start";
          }
        },
        ignoreElements: (el) => el.classList.contains("no-print"),
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));

      const blob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error("Error previewing PDF:", err);
    } finally {
      setPdfGenerating(false);
    }
  };

  // Copy email body text
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(emailBody);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  // Web Gmail dispatch with downloaded PDF
  const handleSendViaWebGmail = async () => {
    await handleDownloadPdf();
    const encTo = encodeURIComponent(emailTo);
    const encSub = encodeURIComponent(emailSubject);
    const encBody = encodeURIComponent(emailBody);
    const encCc = emailCc ? `&cc=${encodeURIComponent(emailCc)}` : "";
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encTo}${encCc}&su=${encSub}&body=${encBody}`;
    window.open(gmailUrl, "_blank");
    setStatusNotice(`PDF (${patientSafeFilename}) was downloaded to your computer! Web Gmail composer opened. Drag & drop the PDF into the draft to attach it.`);
  };

  // WhatsApp dispatch with downloaded PDF
  const handleShareViaWhatsApp = async () => {
    await handleDownloadPdf();
    const cleanPhone = (formData.phone || "").replace(/[^0-9]/g, "");
    const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const waText = encodeURIComponent(
      `Hello ${patientFullName},\n\n` +
      `Your official Patient Registration with ${laboratoryInfo.name} has been processed.\n\n` +
      `• Registration Date: ${dt.date} at ${dt.time}\n` +
      `• Attached Form: ${patientSafeFilename}\n` +
      `• Helpline: ${laboratoryInfo.phone}\n\n` +
      `The official registration PDF has been generated and downloaded.`
    );
    const waUrl = waPhone
      ? `https://api.whatsapp.com/send?phone=${waPhone}&text=${waText}`
      : `https://api.whatsapp.com/send?text=${waText}`;
    window.open(waUrl, "_blank");
    setStatusNotice(`PDF (${patientSafeFilename}) downloaded! WhatsApp opened. You can now attach the file directly in the chat.`);
  };

  // Test and save Gmail App Password
  const handleTestAndSaveSmtp = async () => {
    if (!smtpPasswordInput.trim()) {
      setSmtpTestStatus({ success: false, message: "Please enter your 16-character Gmail App Password." });
      return;
    }
    setSmtpTesting(true);
    setSmtpTestStatus(null);
    try {
      const cleanPassword = smtpPasswordInput.trim().replace(/\s+/g, "");
      const res = await communicationApi.testSmtp({
        smtpPassword: cleanPassword,
        smtpUser: "nikilpanchal5@gmail.com",
        smtpHost: "smtp.gmail.com",
        smtpPort: 587,
      });

      if (res && res.success) {
        await communicationApi.updateSmtpSettings({
          smtpPassword: cleanPassword,
          smtpUser: "nikilpanchal5@gmail.com",
          smtpHost: "smtp.gmail.com",
          smtpPort: 587,
          emailFromEmail: "nikilpanchal5@gmail.com",
          emailFromName: "LabCore Enterprise LIS",
        });
        setSmtpTestStatus({
          success: true,
          message: "✓ Gmail App Password verified and saved! You can now send emails with attachments directly.",
        });
        setEmailError(null);
      } else {
        setSmtpTestStatus({
          success: false,
          message: res?.message || "Verification failed. Check your App Password.",
        });
      }
    } catch (err: any) {
      setSmtpTestStatus({
        success: false,
        message: err?.message || "Connection error during SMTP test.",
      });
    } finally {
      setSmtpTesting(false);
    }
  };

  // Enhanced fallback: Auto-downloads the PDF to patient/staff device and opens the pre-filled email draft
  const handleDirectMailClientFallback = () => {
    handleDownloadPdf();
    const encSubject = encodeURIComponent(emailSubject);
    const encBody = encodeURIComponent(emailBody);
    const ccParam = emailCc ? `&cc=${encodeURIComponent(emailCc)}` : "";
    window.open(`mailto:${emailTo}?subject=${encSubject}${ccParam}&body=${encBody}`, "_blank");

    setStatusNotice(
      `PDF form (${patientSafeFilename}) was downloaded to your computer! Note: mailto cannot auto-attach files, please drag the downloaded PDF into your email client draft.`
    );
  };

  const handlePrint = () => {
    const formEl = formRef.current;
    if (!formEl) {
      window.print();
      return;
    }

    let iframe = document.getElementById("print-form-iframe") as HTMLIFrameElement | null;
    if (iframe) {
      iframe.remove();
    }

    iframe = document.createElement("iframe");
    iframe.id = "print-form-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Patient Registration Form - ${formData.firstName} ${formData.lastName}</title>
          <style>
            ${printFormStyles}
            @page {
              size: A4 portrait;
              margin: 4mm 5mm;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              width: 100% !important;
              height: 100% !important;
              overflow: hidden !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print, .action-buttons, .print-button, .datetime-section, .email-header-button, .email-quick-action, .email-status-pill {
              display: none !important;
            }
            .print-form-container {
              box-shadow: none !important;
              border: none !important;
              max-width: 100% !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
            }
            .form-body {
              display: block !important;
              width: 100% !important;
            }
            .form-section,
            .dual-section-row {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              width: 100% !important;
            }
          </style>
        </head>
        <body>
          <div class="print-form-container">
            ${formEl.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe?.contentWindow?.focus();
        iframe?.contentWindow?.print();
      } catch (err) {
        console.error("Iframe print error, falling back to window.print():", err);
        window.print();
      }
    }, 250);
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave(formData);
      } catch (error) {
        console.error("Error saving form:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-xs text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{printFormStyles}</style>

      <div className="print-form-page">
        <div className="print-form-container" ref={formRef}>
          {/* HEADER */}
          <div className="form-header">
            <div className="header-left">
              <div className="logo-icon"></div>
              <div>
                <div className="brand-name">
                  LabCore <span>ELIS</span>
                </div>
                <div className="brand-subtitle">Laboratory Information System</div>
              </div>
            </div>

            <div className="header-center">
              <h1 className="form-title">PATIENT REGISTRATION FORM</h1>
              <div className="form-subtitle">Accurate Information • Better Care • Safer Results</div>
            </div>

            <div className="header-right">
              <div className="qr-section">
                <div className="qr-code">
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="Patient QR Code" />
                  ) : qrCodeError ? (
                    <div className="qr-code-fallback">QR Error</div>
                  ) : (
                    <div className="qr-code-fallback">...</div>
                  )}
                </div>
              </div>
              <div className="header-actions no-print">
                <div className="header-buttons-row">
                  <button
                    className="whatsapp-header-button"
                    onClick={() => openWhatsAppComposer("registration")}
                    type="button"
                    title="Send Registration Form & Attached PDF via WhatsApp"
                  >
                    <MessageCircle size={13} />
                    WHATSAPP FORM
                  </button>
                  <button
                    className="email-header-button"
                    onClick={() => openEmailComposer("registration")}
                    type="button"
                    title="Send Registration Form & Attached PDF via Email"
                  >
                    <Mail size={13} />
                    EMAIL FORM
                  </button>
                  <button className="print-button" onClick={handlePrint} type="button">
                    <Printer size={13} />
                    PRINT
                  </button>
                </div>
                <div className="datetime-section">
                  <div>{dt.date}</div>
                  <div>{dt.time}</div>
                </div>
              </div>
            </div>
          </div>

          {/* FORM BODY (NATURAL FLOW - ZERO ARTIFICIAL GAPS) */}
          <div className="form-body">
            {/* SECTION 1: PERSONAL INFORMATION */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-number blue">1</div>
                <div className="section-title">PERSONAL INFORMATION</div>
              </div>

              {/* Row 1: Name Details */}
              <div className="grid-3-col" style={{ marginBottom: "8px" }}>
                <div className="form-field">
                  <div className="field-label">
                    <User className="field-icon" />
                    First Name <span className="field-required">*</span>
                  </div>
                  <div className={`field-value ${!formData.firstName ? "empty" : ""}`}>
                    {formatDisplayValue(formData.firstName)}
                  </div>
                </div>

                <div className="form-field">
                  <div className="field-label">
                    <User className="field-icon" />
                    Middle Name
                  </div>
                  <div className={`field-value ${!formData.middleName ? "empty" : ""}`}>
                    {formatDisplayValue(formData.middleName)}
                  </div>
                </div>

                <div className="form-field">
                  <div className="field-label">
                    <User className="field-icon" />
                    Last Name <span className="field-required">*</span>
                  </div>
                  <div className={`field-value ${!formData.lastName ? "empty" : ""}`}>
                    {formatDisplayValue(formData.lastName)}
                  </div>
                </div>
              </div>

              {/* Row 2: Demographics */}
              <div className="grid-4-col" style={{ marginBottom: "8px" }}>
                <div className="form-field">
                  <div className="field-label">
                    <Calendar className="field-icon" />
                    Date of Birth <span className="field-required">*</span>
                  </div>
                  <div className={`field-value ${!formData.dateOfBirth ? "empty" : ""}`}>
                    {formatDate(formData.dateOfBirth)}
                  </div>
                </div>

                <div className="form-field">
                  <div className="field-label">
                    <User className="field-icon" />
                    Gender <span className="field-required">*</span>
                  </div>
                  <div className={`field-value ${!formData.gender ? "empty" : ""}`}>
                    {formatDisplayValue(formData.gender)}
                  </div>
                </div>

                <div className="form-field">
                  <div className="field-label">
                    <Heart className="field-icon" />
                    Blood Group
                  </div>
                  <div className={`field-value ${!formData.bloodGroup ? "empty" : ""}`}>
                    {formatBloodGroupDisplay(formData.bloodGroup)}
                  </div>
                </div>

                <div className="form-field">
                  <div className="field-label">
                    <User className="field-icon" />
                    Marital Status
                  </div>
                  <div className={`field-value ${!formData.maritalStatus ? "empty" : ""}`}>
                    {formatDisplayValue(formData.maritalStatus)}
                  </div>
                </div>
              </div>

              {/* Row 3: Nationality, Type, Additional Info */}
              <div className="grid-4-col">
                <div className="form-field">
                  <div className="field-label">
                    <Globe className="field-icon" />
                    Nationality
                  </div>
                  <div className={`field-value ${!formData.nationality ? "empty" : ""}`}>
                    {formatDisplayValue(formData.nationality)}
                  </div>
                </div>

                <div className="form-field">
                  <div className="field-label">
                    <User className="field-icon" />
                    Patient Type
                  </div>
                  <div className={`field-value ${!formData.patientType ? "empty" : ""}`}>
                    {formatDisplayValue(formData.patientType)}
                  </div>
                </div>

                <div className="form-field col-span-2">
                  <div className="field-label">
                    <User className="field-icon" />
                    Additional Information
                  </div>
                  <div className={`field-value ${!formData.additionalInformation ? "empty" : ""}`}>
                    {formatDisplayValue(formData.additionalInformation)}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: CONTACT & ADDRESS INFORMATION */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-number purple">2</div>
                <div className="section-title">CONTACT & ADDRESS INFORMATION</div>
              </div>

              {/* Row 1: Contact Details */}
              <div className="grid-3-col" style={{ marginBottom: "8px" }}>
                <div className="form-field">
                  <div className="field-label">
                    <Phone className="field-icon" />
                    Phone Number <span className="field-required">*</span>
                  </div>
                  <div className={`field-value ${!formData.phone ? "empty" : ""}`}>
                    {formatDisplayValue(formData.phone)}
                  </div>
                </div>

                <div className="form-field">
                  <div className="field-label" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Mail className="field-icon" />
                      Email Address
                    </span>
                    {formData.email && (
                      <span className="email-status-pill no-print" title="Verified Delivery Channel">
                        <CheckCircle size={8} /> Verified
                      </span>
                    )}
                  </div>
                  <div
                    className={`field-value ${!formData.email ? "empty" : ""}`}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <span>{formatDisplayValue(formData.email)}</span>
                    {formData.email && (
                      <button
                        type="button"
                        onClick={() => openEmailComposer("registration")}
                        className="email-quick-action no-print"
                        title="Send form with PDF attachment to patient"
                      >
                        <Mail size={10} /> Send Form PDF
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <div className="field-label">
                    <MapPin className="field-icon" />
                    Street Address <span className="field-required">*</span>
                  </div>
                  <div className={`field-value ${!formData.address ? "empty" : ""}`}>
                    {formatDisplayValue(formData.address)}
                  </div>
                </div>
              </div>

              {/* Row 2: Location Grid */}
              <div className="grid-4-col">
                <div className="form-field">
                  <div className="field-label">
                    <MapPin className="field-icon" />
                    City <span className="field-required">*</span>
                  </div>
                  <div className={`field-value ${!formData.city ? "empty" : ""}`}>
                    {formatDisplayValue(formData.city)}
                  </div>
                </div>

                <div className="form-field">
                  <div className="field-label">
                    <MapPin className="field-icon" />
                    State <span className="field-required">*</span>
                  </div>
                  <div className={`field-value ${!formData.state ? "empty" : ""}`}>
                    {formatDisplayValue(formData.state)}
                  </div>
                </div>

                <div className="form-field">
                  <div className="field-label">
                    <MapPin className="field-icon" />
                    Postal Code <span className="field-required">*</span>
                  </div>
                  <div className={`field-value ${!formData.postalCode ? "empty" : ""}`}>
                    {formatDisplayValue(formData.postalCode)}
                  </div>
                </div>

                <div className="form-field">
                  <div className="field-label">
                    <Globe className="field-icon" />
                    Country <span className="field-required">*</span>
                  </div>
                  <div className={`field-value ${!formData.country ? "empty" : ""}`}>
                    {formatDisplayValue(formData.country)}
                  </div>
                </div>
              </div>
            </div>

            {/* DUAL BALANCED SECTION: 3. EMERGENCY CONTACT & 4. INSURANCE INFORMATION */}
            <div className="dual-section-row">
              {/* LEFT: EMERGENCY CONTACT */}
              <div className="dual-section-left">
                <div className="section-header">
                  <div className="section-number orange">3</div>
                  <div className="section-title">EMERGENCY CONTACT</div>
                </div>

                <div className="grid-2-col" style={{ marginBottom: "8px" }}>
                  <div className="form-field">
                    <div className="field-label">
                      <User className="field-icon" />
                      Contact Name <span className="field-required">*</span>
                    </div>
                    <div className={`field-value ${!formData.emergencyContactName ? "empty" : ""}`}>
                      {formatDisplayValue(formData.emergencyContactName)}
                    </div>
                  </div>

                  <div className="form-field">
                    <div className="field-label">
                      <Phone className="field-icon" />
                      Emergency Phone <span className="field-required">*</span>
                    </div>
                    <div className={`field-value ${!formData.emergencyContactPhone ? "empty" : ""}`}>
                      {formatDisplayValue(formData.emergencyContactPhone)}
                    </div>
                  </div>
                </div>

                <div className="grid-2-col">
                  <div className="form-field">
                    <div className="field-label">
                      <User className="field-icon" />
                      Relationship
                    </div>
                    <div className={`field-value ${!formData.emergencyContactRelationship ? "empty" : ""}`}>
                      {formatDisplayValue(formData.emergencyContactRelationship)}
                    </div>
                  </div>

                  <div className="form-field">
                    <div className="field-label">
                      <MapPin className="field-icon" />
                      Contact Address
                    </div>
                    <div className={`field-value ${!formData.emergencyContactAddress ? "empty" : ""}`}>
                      {formatDisplayValue(formData.emergencyContactAddress)}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: INSURANCE INFORMATION */}
              <div className="dual-section-right">
                <div className="section-header">
                  <div className="section-number green">4</div>
                  <div className="section-title">INSURANCE INFORMATION</div>
                </div>

                <div className="grid-2-col" style={{ marginBottom: "8px" }}>
                  <div className="form-field">
                    <div className="field-label">
                      <CreditCard className="field-icon" />
                      Insurance Provider
                    </div>
                    <div className={`field-value ${!formData.insuranceProvider ? "empty" : ""}`}>
                      {formatDisplayValue(formData.insuranceProvider)}
                    </div>
                  </div>

                  <div className="form-field">
                    <div className="field-label">
                      <CreditCard className="field-icon" />
                      Insurance Number
                    </div>
                    <div className={`field-value ${!formData.insuranceNumber ? "empty" : ""}`}>
                      {formatDisplayValue(formData.insuranceNumber)}
                    </div>
                  </div>
                </div>

                <div className="grid-2-col">
                  <div className="form-field">
                    <div className="field-label">
                      <CreditCard className="field-icon" />
                      Group Number
                    </div>
                    <div className={`field-value ${!formData.insuranceGroupNumber ? "empty" : ""}`}>
                      {formatDisplayValue(formData.insuranceGroupNumber)}
                    </div>
                  </div>

                  <div className="form-field">
                    <div className="field-label">
                      <Calendar className="field-icon" />
                      Expiry Date
                    </div>
                    <div className={`field-value ${!formData.insuranceExpiryDate ? "empty" : ""}`}>
                      {formatDate(formData.insuranceExpiryDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: MEDICAL INFORMATION */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-number teal">5</div>
                <div className="section-title">MEDICAL INFORMATION</div>
              </div>

              <div className="grid-3-col">
                <div className="form-field">
                  <div className="field-label">
                    <Heart className="field-icon" />
                    Known Allergies
                  </div>
                  <div className={`field-value ${!formData.allergies ? "empty" : ""}`}>
                    {formatDisplayValue(formData.allergies)}
                  </div>
                </div>

                <div className="form-field">
                  <div className="field-label">
                    <Heart className="field-icon" />
                    Medical Conditions
                  </div>
                  <div className={`field-value ${!formData.medicalConditions ? "empty" : ""}`}>
                    {formatDisplayValue(formData.medicalConditions)}
                  </div>
                </div>

                <div className="form-field">
                  <div className="field-label">
                    <Heart className="field-icon" />
                    Current Medications
                  </div>
                  <div className={`field-value ${!formData.currentMedications ? "empty" : ""}`}>
                    {formatDisplayValue(formData.currentMedications)}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 6: COMMUNICATION PREFERENCES */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-number pink">6</div>
                <div className="section-title">COMMUNICATION PREFERENCES</div>
              </div>

              <div className="preferences-row">
                <div className="form-field">
                  <div className="field-label">
                    <Globe className="field-icon" />
                    Preferred Language
                  </div>
                  <div className={`field-value ${!formData.preferredLanguage ? "empty" : ""}`}>
                    {formatDisplayValue(formData.preferredLanguage)}
                  </div>
                </div>

                <div className="form-field">
                  <div className="field-label">
                    <MessageCircle className="field-icon" />
                    Preferred Method
                  </div>
                  <div className={`field-value ${!formData.preferredCommunicationMethod ? "empty" : ""}`}>
                    {formatDisplayValue(formData.preferredCommunicationMethod)}
                  </div>
                </div>

                <div className="form-field">
                  <div className="field-label">Notification Channels</div>
                  <div className="notification-list">
                    <div className="notification-item">
                      <span
                        className={`notification-checkbox ${
                          Array.isArray(formData.notificationPreferences) && (
                            formData.notificationPreferences.includes("SMS") ||
                            formData.notificationPreferences.includes("TEST_RESULTS")
                          )
                            ? "checked"
                            : "unchecked"
                        }`}
                      >
                        ✓
                      </span>
                      <span>SMS</span>
                    </div>

                    <div className="notification-item">
                      <span
                        className={`notification-checkbox ${
                          Array.isArray(formData.notificationPreferences) && formData.notificationPreferences.includes("EMAIL") || formData.email
                            ? "checked"
                            : "unchecked"
                        }`}
                      >
                        ✓
                      </span>
                      <span>Email</span>
                    </div>

                    <div className="notification-item">
                      <span
                        className={`notification-checkbox ${
                          Array.isArray(formData.notificationPreferences) && formData.notificationPreferences.includes("PHONE") ? "checked" : "unchecked"
                        }`}
                      >
                        ✓
                      </span>
                      <span>Phone Call</span>
                    </div>

                    <div className="notification-item">
                      <span
                        className={`notification-checkbox ${
                          Array.isArray(formData.notificationPreferences) && formData.notificationPreferences.includes("POSTAL") ? "checked" : "unchecked"
                        }`}
                      >
                        ✓
                      </span>
                      <span>Postal Mail</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="consent-box">
                <span className={`consent-checkbox ${formData.privacyConsent ? "checked" : "unchecked"}`}>
                  ✓
                </span>
                <span className="consent-text">
                  I consent to the collection and processing of my personal data for medical purposes and understand my rights regarding data privacy and confidentiality.
                </span>
              </div>
            </div>
          </div>

          {/* SIGNATURE SECTION */}
          <div className="signature-section">
            <div className="signature-field">
              <div className="signature-label">Patient / Guardian Signature</div>
              <div className="signature-line"></div>
            </div>
            <div className="signature-field">
              <div className="signature-label">Registration Date & Time</div>
              <div className="signature-line">
                {dt.date} • {dt.time}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS (SCREEN ONLY) */}
          <div className="action-buttons no-print">
            {onClose && (
              <button onClick={onClose} className="btn btn-secondary" type="button">
                <X size={15} />
                Close
              </button>
            )}
            <button
              onClick={() => openWhatsAppComposer("registration")}
              className="btn btn-whatsapp"
              type="button"
              title="Compose and dispatch patient WhatsApp message with PDF"
            >
              <MessageCircle size={15} />
              WhatsApp Form
            </button>
            <button
              onClick={() => openEmailComposer("registration")}
              className="btn btn-email"
              type="button"
              title="Compose and send patient email with PDF attached"
            >
              <Mail size={15} />
              Email Form
            </button>
            {onSave && (
              <button onClick={handleSave} className="btn btn-secondary" type="button">
                <FileText size={15} />
                Save Draft
              </button>
            )}
            <button onClick={handlePrint} className="btn btn-primary" type="button">
              <Printer size={15} />
              Print Form
            </button>
          </div>

          {/* FOOTER */}
          <div className="footer">
            <div className="footer-row">
              <div className="footer-item">
                <Shield className="footer-icon" />
                <span>Your data is secure and encrypted</span>
              </div>
              <div className="footer-divider"></div>
              <div className="footer-item">
                <CheckCircle className="footer-icon" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="footer-divider"></div>
              <div className="footer-item">
                <Mail className="footer-icon" />
                <span>{laboratoryInfo.email}</span>
              </div>
              <div className="footer-divider"></div>
              <div className="footer-item">
                <Phone className="footer-icon" />
                <span>{laboratoryInfo.phone}</span>
              </div>
            </div>

            <div className="footer-bottom">
              <div className="footer-security">
                <Shield className="footer-icon" />
                <span>ISO 15189:2022 Recognized • 256-bit SSL Encryption • Patient Data Protected</span>
              </div>
              <div className="footer-logo">
                <span className="footer-logo-text">LabCore ELIS</span>
                <span className="footer-logo-subtext"> — Laboratory Information System</span>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================
            ADVANCED EMAIL COMPOSER MODAL WITH ATTACHED FORM PDF
            ======================================================= */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 no-print animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 px-6 py-4 text-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold tracking-tight">Patient Email Dispatcher</h3>
                    <p className="text-xs text-blue-100 font-medium">
                      Sending registration document & PDF to <span className="font-semibold text-white">{patientFullName}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSmtpConfig(!showSmtpConfig)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      showSmtpConfig
                        ? "bg-white text-blue-900 shadow-sm"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                    title="Configure SMTP / Gmail App Password"
                  >
                    <Key size={13} />
                    <span>SMTP Setup</span>
                  </button>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {/* Template Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Email Template
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">4 Ready-to-Send Formats</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmailTemplate("registration");
                        generateTemplateContent("registration", patientFullName, emailTo);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        emailTemplate === "registration"
                          ? "border-blue-600 bg-blue-50 text-blue-900 shadow-xs ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <FileText size={13} className="text-blue-600" />
                        Registration
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Official form copy</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEmailTemplate("welcome");
                        generateTemplateContent("welcome", patientFullName, emailTo);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        emailTemplate === "welcome"
                          ? "border-purple-600 bg-purple-50 text-purple-900 shadow-xs ring-2 ring-purple-500/20"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <Sparkles size={13} className="text-purple-600" />
                        Portal
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Welcome & portal</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEmailTemplate("test_instructions");
                        generateTemplateContent("test_instructions", patientFullName, emailTo);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        emailTemplate === "test_instructions"
                          ? "border-teal-600 bg-teal-50 text-teal-900 shadow-xs ring-2 ring-teal-500/20"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <Heart size={13} className="text-teal-600" />
                        Pre-Test
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Fasting instructions</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEmailTemplate("summary");
                        generateTemplateContent("summary", patientFullName, emailTo);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        emailTemplate === "summary"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs ring-2 ring-indigo-500/20"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle size={13} className="text-indigo-600" />
                        Summary
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Quick receipt</div>
                    </button>
                  </div>
                </div>

                {/* Recipient Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Recipient Email (To) <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={emailTo}
                        onChange={(e) => setEmailTo(e.target.value)}
                        placeholder="patient@example.com"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      CC (Optional - Doctor / Guardian)
                    </label>
                    <input
                      type="email"
                      value={emailCc}
                      onChange={(e) => setEmailCc(e.target.value)}
                      placeholder="doctor@hospital.in"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Subject Line */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Email Subject Line <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Email Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email Message Content
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                    >
                      {copiedNotice ? (
                        <>
                          <Check size={12} className="text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Message</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-mono text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none leading-relaxed resize-none"
                  ></textarea>
                </div>

                {/* =======================================================
                    ATTACHMENT CARD (PATIENT REGISTRATION PDF)
                    ======================================================= */}
                <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={attachPdf}
                        onChange={(e) => setAttachPdf(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        Attach Patient Registration Form PDF
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      {pdfGenerating ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full animate-pulse">
                          <Loader2 size={10} className="animate-spin" /> Rendering Crisp PDF...
                        </span>
                      ) : pdfBase64 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          <FileCheck size={11} /> PDF Ready & Attached ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => generateFormPdfBase64()}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline"
                        >
                          Generate PDF
                        </button>
                      )}
                    </div>
                  </div>

                  {attachPdf && (
                    <div className="flex items-center justify-between bg-white border border-blue-200/90 rounded-lg p-2.5 shadow-xs">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0 font-black text-[10px] border border-red-200">
                          PDF
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-slate-800 truncate" title={patientSafeFilename}>
                            {patientSafeFilename}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            A4 Medical Document • 1-Page Layout • Uncut Headers & Labels
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={handlePreviewPdf}
                          disabled={pdfGenerating}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                          title="Preview the exact rendered PDF in a new tab"
                        >
                          <Eye size={12} />
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadPdf}
                          disabled={pdfGenerating}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors shadow-xs"
                          title="Download copy of this PDF to your computer"
                        >
                          <Download size={12} />
                          Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* =======================================================
                    INLINE SMTP & GMAIL APP PASSWORD SETUP DRAWER
                    ======================================================= */}
                {showSmtpConfig && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span className="text-xs font-bold text-amber-900">
                          Gmail SMTP Setup (App Password Required)
                        </span>
                      </div>
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                      >
                        Generate Google App Password ↗
                      </a>
                    </div>

                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Google requires a <strong>16-character App Password</strong> (e.g. <code className="bg-amber-100 px-1 rounded">abcd efgh ijkl mnop</code>) to send emails with attachments from software. Standard account passwords are blocked by Google.
                    </p>

                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={smtpPasswordInput}
                        onChange={(e) => setSmtpPasswordInput(e.target.value)}
                        placeholder="Paste 16-character App Password"
                        className="flex-1 px-3 py-1.5 border border-amber-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleTestAndSaveSmtp}
                        disabled={smtpTesting || !smtpPasswordInput.trim()}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-xs"
                      >
                        {smtpTesting ? (
                          <>
                            <Loader2 size={12} className="animate-spin" /> Verifying...
                          </>
                        ) : (
                          <>
                            <Check size={12} /> Verify & Save
                          </>
                        )}
                      </button>
                    </div>

                    {smtpTestStatus && (
                      <div
                        className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                          smtpTestStatus.success
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-red-100 text-red-800 border border-red-300"
                        }`}
                      >
                        {smtpTestStatus.success ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                        <span>{smtpTestStatus.message}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* =======================================================
                    MULTI-CHANNEL QUICK DISPATCH OPTIONS
                    ======================================================= */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Quick Sharing Channels
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={handleSendViaWebGmail}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50/60 text-slate-700 flex items-center justify-between transition-all group"
                      title="Downloads PDF & opens Web Gmail with recipient, subject, and body ready"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                          M
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-800">Web Gmail</div>
                          <div className="text-[10px] text-slate-500">Opens in browser</div>
                        </div>
                      </div>
                      <ExternalLink size={12} className="text-slate-400 group-hover:text-red-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailModal(false);
                        openWhatsAppComposer(emailTemplate);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/60 text-slate-700 flex items-center justify-between transition-all group"
                      title="Open Advanced WhatsApp Dispatcher with PDF"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <MessageCircle size={15} />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-800">WhatsApp</div>
                          <div className="text-[10px] text-slate-500">Advanced Dispatcher</div>
                        </div>
                      </div>
                      <ExternalLink size={12} className="text-slate-400 group-hover:text-emerald-600" />
                    </button>

                    <button
                      type="button"
                      onClick={handleDirectMailClientFallback}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/60 text-slate-700 flex items-center justify-between transition-all group"
                      title="Downloads PDF & opens Outlook or desktop default mail client"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Mail size={15} />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-800">Mail Client</div>
                          <div className="text-[10px] text-slate-500">Outlook / Desktop</div>
                        </div>
                      </div>
                      <ExternalLink size={12} className="text-slate-400 group-hover:text-blue-600" />
                    </button>
                  </div>
                </div>

                {/* Status Notices */}
                {statusNotice && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-medium flex items-start gap-2 animate-in fade-in">
                    <AlertCircle size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{statusNotice}</span>
                  </div>
                )}

                {emailError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium space-y-2 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <X size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold">Email Dispatch Error: </span>
                        <span>{emailError}</span>
                      </div>
                    </div>
                    {emailError.includes("Application-specific password") || emailError.includes("Invalid login") ? (
                      <div className="bg-white/80 p-2.5 rounded-lg border border-red-200 text-[11px] text-red-800 flex items-center justify-between">
                        <span>Click <strong>SMTP Setup</strong> above to enter your Gmail 16-character App Password.</span>
                        <button
                          type="button"
                          onClick={() => setShowSmtpConfig(true)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[10px] transition-colors"
                        >
                          Setup Password
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                {emailSentSuccess && !statusNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-2 animate-in zoom-in-95">
                    <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>Registration Form & PDF successfully sent to {emailTo}!</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePreviewPdf}
                  disabled={pdfGenerating}
                  className="text-xs text-slate-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Eye size={13} />
                  Preview Form PDF
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    disabled={emailSending}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={emailSending || !emailTo.trim() || pdfGenerating}
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 inline-flex items-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {emailSending ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Sending Email with Attached PDF...
                      </>
                    ) : emailSentSuccess ? (
                      <>
                        <Check size={14} />
                        Dispatched with PDF!
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        Send Email with Form PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            ADVANCED WHATSAPP DISPATCHER MODAL WITH DIRECT PDF
            ======================================================= */}
        {showWhatsAppModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 no-print animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 px-6 py-4 text-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner relative">
                    <MessageCircle className="w-5 h-5 text-white" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold tracking-tight">Patient WhatsApp Dispatcher (Advanced)</h3>
                    <p className="text-xs text-emerald-100 font-medium">
                      Direct send with Registration PDF to <span className="font-semibold text-white">{patientFullName}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWhatsAppConfig(!showWhatsAppConfig)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      showWhatsAppConfig
                        ? "bg-white text-emerald-900 shadow-sm"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                    title="Configure Twilio / WhatsApp Business API"
                  >
                    <Key size={13} />
                    <span>API Setup</span>
                  </button>
                  <button
                    onClick={() => setShowWhatsAppModal(false)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {/* Template Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select WhatsApp Template
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">4 Ready-to-Send Formats</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setWhatsappTemplate("registration");
                        generateWhatsAppTemplateContent("registration", patientFullName, whatsappPhone, hostedPdfUrl);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        whatsappTemplate === "registration"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <FileText size={13} className="text-emerald-600" />
                        Registration
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Official form & PDF</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setWhatsappTemplate("welcome");
                        generateWhatsAppTemplateContent("welcome", patientFullName, whatsappPhone, hostedPdfUrl);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        whatsappTemplate === "welcome"
                          ? "border-teal-600 bg-teal-50 text-teal-900 shadow-xs ring-2 ring-teal-500/20"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <Sparkles size={13} className="text-teal-600" />
                        Portal
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Welcome & portal</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setWhatsappTemplate("test_instructions");
                        generateWhatsAppTemplateContent("test_instructions", patientFullName, whatsappPhone, hostedPdfUrl);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        whatsappTemplate === "test_instructions"
                          ? "border-cyan-600 bg-cyan-50 text-cyan-900 shadow-xs ring-2 ring-cyan-500/20"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <Heart size={13} className="text-cyan-600" />
                        Pre-Test
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Fasting guidelines</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setWhatsappTemplate("summary");
                        generateWhatsAppTemplateContent("summary", patientFullName, whatsappPhone, hostedPdfUrl);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        whatsappTemplate === "summary"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle size={13} className="text-emerald-600" />
                        Summary
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Quick receipt</div>
                    </button>
                  </div>
                </div>

                {/* Recipient Phone Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Recipient WhatsApp Phone Number <span className="text-orange-500">*</span>
                    </label>
                    {whatsappPhone && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle size={11} /> +{normalizePhoneNumber(whatsappPhone)}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => {
                        setWhatsappPhone(e.target.value);
                        generateWhatsAppTemplateContent(whatsappTemplate, patientFullName, e.target.value, hostedPdfUrl);
                      }}
                      placeholder="e.g. 917202885030 or 9876543210"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    10-digit Indian numbers auto-prefix with country code 91. Enter international numbers with country code.
                  </p>
                </div>

                {/* WhatsApp Message Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      WhatsApp Message Content
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {whatsappMessage.length} characters
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyWhatsAppMessage}
                        className="text-[11px] text-emerald-600 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                      >
                        {whatsappCopiedNotice ? (
                          <>
                            <Check size={12} className="text-emerald-600" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={6}
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-mono text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none leading-relaxed resize-none"
                  ></textarea>
                </div>

                {/* =======================================================
                    ATTACHMENT CARD (PATIENT REGISTRATION PDF & HOSTED LINK)
                    ======================================================= */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={whatsappAttachPdf}
                        onChange={(e) => setWhatsappAttachPdf(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        Include Official Registration Form PDF & Direct Link
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      {pdfGenerating || pdfHosting ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded-full animate-pulse">
                          <Loader2 size={10} className="animate-spin" /> Rendering & Hosting PDF...
                        </span>
                      ) : (pdfBase64 || hostedPdfUrl) ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          <FileCheck size={11} /> PDF Ready & Hosted ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            const b64 = await generateFormPdfBase64();
                            if (b64) {
                              setPdfHosting(true);
                              try {
                                const up = await communicationApi.uploadPdf({ filename: patientSafeFilename, content: b64 });
                                if (up?.data?.url) {
                                  setHostedPdfUrl(up.data.url);
                                  generateWhatsAppTemplateContent(whatsappTemplate, patientFullName, whatsappPhone, up.data.url);
                                }
                              } finally {
                                setPdfHosting(false);
                              }
                            }
                          }}
                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                        >
                          Generate PDF
                        </button>
                      )}
                    </div>
                  </div>

                  {whatsappAttachPdf && (
                    <div className="flex items-center justify-between bg-white border border-emerald-200/90 rounded-lg p-2.5 shadow-xs">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0 font-black text-[10px] border border-red-200">
                          PDF
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-slate-800 truncate" title={patientSafeFilename}>
                            {patientSafeFilename}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            A4 Medical Document • 1-Page Layout • Hosted on LabCore Secure Server
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={handlePreviewPdf}
                          disabled={pdfGenerating}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                          title="Preview the exact rendered PDF in a new tab"
                        >
                          <Eye size={12} />
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadPdf}
                          disabled={pdfGenerating}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors shadow-xs"
                          title="Download copy of this PDF to your computer"
                        >
                          <Download size={12} />
                          Download
                        </button>
                        {hostedPdfUrl && (
                          <button
                            type="button"
                            onClick={handleCopyPdfLink}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200 transition-colors shadow-xs"
                            title="Copy direct permanent link to the hosted PDF document"
                          >
                            <Copy size={12} />
                            {whatsappLinkCopiedNotice ? "Copied!" : "Link"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* =======================================================
                    INLINE TWILIO / WHATSAPP API SETUP DRAWER
                    ======================================================= */}
                {showWhatsAppConfig && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-xs font-bold text-emerald-900">
                          WhatsApp Provider API Configuration (Twilio / Meta Cloud)
                        </span>
                      </div>
                      <a
                        href="https://www.twilio.com/console"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        Twilio Console ↗
                      </a>
                    </div>

                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      For automated background API dispatch, enter your Twilio Account SID and Auth Token. (Alternatively, you can always click <strong>Open in WhatsApp Web</strong> below to send instantly with zero configuration!)
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={whatsappApiKeyInput}
                        onChange={(e) => setWhatsappApiKeyInput(e.target.value)}
                        placeholder="Twilio Account SID (e.g. AC...)"
                        className="px-3 py-1.5 border border-emerald-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <input
                        type="password"
                        value={whatsappApiSecretInput}
                        onChange={(e) => setWhatsappApiSecretInput(e.target.value)}
                        placeholder="Twilio Auth Token"
                        className="px-3 py-1.5 border border-emerald-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={whatsappSenderIdInput}
                        onChange={(e) => setWhatsappSenderIdInput(e.target.value)}
                        placeholder="Sender Number (e.g. whatsapp:+14155238886)"
                        className="flex-1 px-3 py-1.5 border border-emerald-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleTestAndSaveWhatsApp}
                        disabled={whatsappTesting || !whatsappApiKeyInput.trim() || !whatsappApiSecretInput.trim()}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-xs"
                      >
                        {whatsappTesting ? (
                          <>
                            <Loader2 size={12} className="animate-spin" /> Verifying...
                          </>
                        ) : (
                          <>
                            <Check size={12} /> Verify & Save
                          </>
                        )}
                      </button>
                    </div>

                    {whatsappTestStatus && (
                      <div
                        className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                          whatsappTestStatus.success
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-red-100 text-red-800 border border-red-300"
                        }`}
                      >
                        {whatsappTestStatus.success ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                        <span>{whatsappTestStatus.message}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Notices */}
                {whatsappStatusNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-start gap-2 animate-in fade-in">
                    <CheckCircle size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{whatsappStatusNotice}</span>
                  </div>
                )}

                {whatsappError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium space-y-2 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold">WhatsApp Dispatch Notice: </span>
                        <span>{whatsappError}</span>
                      </div>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-lg border border-red-200 text-[11px] text-slate-700 flex items-center justify-between">
                      <span>No API credentials? You can send immediately via <strong>Open in WhatsApp Web</strong> without setup.</span>
                      <button
                        type="button"
                        onClick={handleOpenWhatsAppWeb}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] transition-colors inline-flex items-center gap-1"
                      >
                        <ExternalLink size={11} /> Open WhatsApp Web
                      </button>
                    </div>
                  </div>
                )}

                {whatsappSentSuccess && !whatsappStatusNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-2 animate-in zoom-in-95">
                    <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>Registration Form & PDF link successfully sent via WhatsApp!</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePreviewPdf}
                  disabled={pdfGenerating}
                  className="text-xs text-slate-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Eye size={13} />
                  Preview Form PDF
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowWhatsAppModal(false)}
                    disabled={whatsappSending}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenWhatsAppWeb}
                    className="px-3.5 py-2 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-xs"
                    title="Opens WhatsApp Web or mobile app directly with preloaded text & hosted PDF link"
                  >
                    <ExternalLink size={13} />
                    Open in WhatsApp Web
                  </button>

                  <button
                    type="button"
                    onClick={handleSendDirectWhatsApp}
                    disabled={whatsappSending || !whatsappPhone.trim() || pdfGenerating}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20 inline-flex items-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {whatsappSending ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Dispatching via WhatsApp...
                      </>
                    ) : whatsappSentSuccess ? (
                      <>
                        <Check size={14} />
                        Dispatched with PDF!
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        Send Direct (API)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}