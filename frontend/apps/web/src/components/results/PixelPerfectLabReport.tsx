"use client";

import React, { useRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import { 
  Printer, Download, X, Phone, Mail, Globe, User, Beaker, 
  ShieldCheck, FileText, Building, Lock, MessageCircle, 
  Quote, CheckCircle, AlertCircle 
} from "lucide-react";

// =======================================================
// CSS VARIABLES - EXACT COLORS FROM SPECIFICATION
// =======================================================

const labReportStyles = `
  :root {
    --color-navy-primary: #0F2D52;
    --color-navy-secondary: #1B3A5C;
    --color-navy-darker: #0A2240;
    --color-gold-accent: #D98A3D;
    --color-success-bg: #E7F7EC;
    --color-success-text: #1F9D55;
    --color-warning-bg: #FFF4E5;
    --color-warning-text: #C77700;
    --color-danger-bg: #FDEAEA;
    --color-danger-text: #C0392B;
    --color-card-bg: #FFFFFF;
    --color-table-header-bg: #EEF2F7;
    --color-page-bg: #FFFFFF;
    --color-label-text: #6B7280;
    --color-value-text: #1F2937;
    --color-border: #E2E6EC;
    --color-footer-text: #FFFFFF;
    --color-footer-muted: #C9D3E0;
    --color-footer-divider: #2A4A70;
  }

  .lab-report-page {
    font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--color-page-bg);
    color: var(--color-value-text);
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .lab-report-container {
    max-width: 210mm;
    margin: 0 auto;
    padding: 20px 20px 24px;
    background: var(--color-page-bg);
  }

  /* Header Row */
  .header-row {
    display: grid;
    grid-template-columns: 1.1fr 1.2fr .9fr;
    gap: 24px;
    min-height: 112px;
    margin: 0 -20px 0;
    padding: 22px 28px 26px;
    border-radius: 0;
    background: linear-gradient(120deg, #142f52 0%, #0b2544 62%, #112e50 100%);
    position: relative;
    overflow: hidden;
  }

  .header-row::after {
    content: "";
    position: absolute;
    right: -50px;
    top: -70px;
    width: 190px;
    height: 150px;
    border-radius: 50%;
    background: #2dd4bf;
    opacity: 0.9;
  }

  .header-row::before {
    content: "";
    position: absolute;
    left: -55px;
    bottom: -80px;
    width: 190px;
    height: 150px;
    border-radius: 50%;
    background: #7c3aed;
    opacity: 0.85;
  }

  .logo-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
    z-index: 1;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #20c6c2, #4f46e5);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
  }

  .logo-text {
    font-size: 24px;
    font-weight: 700;
    color: white;
    letter-spacing: -0.5px;
  }

  .logo-subtext {
    font-size: 10px;
    font-weight: 600;
    color: #5eead4;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .logo-tagline {
    font-size: 11px;
    font-style: italic;
    color: #c7d2fe;
    margin-top: 4px;
  }

  .company-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
    z-index: 1;
  }

  .company-name {
    font-size: 16px;
    font-weight: 700;
    color: white;
  }

  .company-address {
    font-size: 11px;
    color: #cbd5e1;
  }

  .company-contact {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #cbd5e1;
  }

  .company-contact svg {
    width: 14px;
    height: 14px;
    color: #67e8f9;
  }

  .report-box {
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    z-index: 1;
    align-self: center;
  }

  .report-header {
    background: transparent;
    padding: 12px;
    text-align: center;
  }

  .report-title {
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .report-details {
    background: rgba(255,255,255,0.96);
    padding: 12px;
    border: 1px solid var(--color-navy-primary);
  }

  .report-detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .report-detail-row:last-child {
    margin-bottom: 0;
  }

  .report-detail-label {
    font-size: 10px;
    color: var(--color-label-text);
    text-transform: uppercase;
  }

  .report-detail-value {
    font-size: 11px;
    font-weight: 600;
    color: var(--color-navy-primary);
  }

  /* Three Card Row */
  .three-card-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .three-card-row .info-card:first-child {
    grid-column: span 2;
  }

  .info-card {
    background: var(--color-card-bg);
    border: 1px solid var(--color-border);
    border-radius: 14px;
    padding: 14px;
    box-shadow: 0 10px 28px rgba(15, 45, 82, 0.06);
  }

  .three-card-row .info-card:first-child .avatar-placeholder {
    display: none;
  }

  .three-card-row .info-card:first-child .card-header {
    margin-bottom: 10px;
  }

  .three-card-row .info-card:first-child {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 18px;
  }

  .three-card-row .info-card:first-child .card-header {
    grid-column: 1 / -1;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--color-border);
  }

  .card-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-icon.user {
    background: var(--color-navy-primary);
    color: white;
  }

  .card-icon.flask {
    background: var(--color-gold-accent);
    color: white;
  }

  .card-icon.shield {
    background: var(--color-success-text);
    color: white;
  }

  .card-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--color-navy-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .info-row:last-child {
    margin-bottom: 0;
  }

  .info-row-label {
    font-size: 11px;
    color: var(--color-label-text);
    font-weight: 500;
  }

  .info-row-value {
    font-size: 11px;
    color: var(--color-value-text);
    font-weight: 600;
  }

  .avatar-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--color-table-header-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin: 0 auto 12px;
  }

  .qr-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .qr-code {
    width: 80px;
    height: 80px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
  }

  .qr-code canvas,
  .qr-code img {
    width: 100%;
    height: 100%;
    border-radius: 6px;
  }

  .qr-code-fallback {
    font-size: 10px;
    color: var(--color-label-text);
  }

  .qr-text {
    font-size: 10px;
    color: var(--color-label-text);
    font-weight: 500;
  }

  .qr-link {
    font-size: 9px;
    color: var(--color-navy-primary);
    font-weight: 600;
  }

  .code-badge {
    background: var(--color-navy-primary);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 600;
  }

  /* Critical Values Banner */
  .critical-values-banner {
    background: var(--color-danger-bg);
    border: 1px solid var(--color-danger-text);
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 24px;
  }

  .critical-values-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .critical-values-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--color-danger-text);
    text-transform: uppercase;
  }

  .critical-values-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .critical-value-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
  }

  .critical-value-name {
    font-weight: 600;
    color: var(--color-danger-text);
  }

  .critical-value-info {
    color: var(--color-label-text);
  }

  /* Test Results Table */
  .table-section {
    margin-bottom: 24px;
  }

  .results-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }

  .results-table thead {
    background: #f0f4fa;
  }

  .results-table th {
    padding: 10px 12px;
    text-align: left;
    font-weight: 700;
    color: var(--color-navy-primary);
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #284c78;
  }

  .results-table td {
    padding: 11px 12px;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-value-text);
  }

  .results-table tr:hover {
    background: var(--color-table-header-bg);
  }

  .result-value {
    font-weight: 600;
    color: var(--color-navy-primary);
  }

  .report-status-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 0 0 20px;
    padding: 10px 2px 4px;
    border-top: 1px solid #e6edf5;
  }

  .report-status-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .report-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 999px;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .5px;
    text-transform: uppercase;
  }

  .report-status-pill.final {
    color: #087f5b;
    background: #d9f8ec;
  }

  .report-status-pill.verified {
    color: #4338ca;
    background: #e0e7ff;
  }

  .tat-label {
    color: #078a61;
    font-size: 10px;
    font-weight: 700;
  }

  .pathologist-note {
    margin: 18px 0 28px;
    padding: 13px 16px;
    border: 1px solid #dbe4f0;
    border-left: 4px solid #7657e8;
    border-radius: 9px;
    background: #f4f7fc;
  }

  .pathologist-note-title {
    margin-bottom: 5px;
    color: #172b4d;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .8px;
    text-transform: uppercase;
  }

  .pathologist-note-text {
    color: #334155;
    font-size: 10px;
    line-height: 1.45;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .status-badge.normal {
    background: var(--color-success-bg);
    color: var(--color-success-text);
  }

  .status-badge.abnormal {
    background: var(--color-warning-bg);
    color: var(--color-warning-text);
  }

  .status-badge.critical {
    background: var(--color-danger-bg);
    color: var(--color-danger-text);
  }

  /* Signature Row */
  .signature-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 24px;
    margin-bottom: 22px;
    padding: 8px 0 14px;
    border-top: 1px dashed #cbd5e1;
  }

  .signature-section {
    text-align: center;
  }

  .signature-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--color-navy-primary);
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .signature-image {
    height: 40px;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: var(--color-label-text);
    font-style: italic;
  }

  .signature-name {
    font-size: 12px;
    font-weight: 700;
    color: var(--color-value-text);
    margin-bottom: 4px;
  }

  .signature-details {
    font-size: 10px;
    color: var(--color-label-text);
  }

  .quote-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: var(--color-navy-primary);
    border-radius: 8px;
    color: white;
  }

  .quote-icon {
    width: 24px;
    height: 24px;
    color: var(--color-gold-accent);
    margin-bottom: 8px;
  }

  .quote-text {
    font-size: 12px;
    font-weight: 600;
    text-align: center;
  }

  .quote-subtext {
    font-size: 10px;
    opacity: 0.9;
    text-align: center;
  }

  /* Footer */
  .footer {
    background: var(--color-navy-primary);
    border-radius: 0;
    padding: 15px 24px;
    color: white;
  }

  .footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-footer-divider);
  }

  .footer-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 600;
  }

  .footer-item svg {
    width: 14px;
    height: 14px;
  }

  .footer-divider {
    width: 1px;
    height: 16px;
    background: var(--color-footer-divider);
  }

  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .footer-security {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    opacity: 0.9;
  }

  .footer-logo {
    text-align: right;
  }

  .footer-logo-text {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-gold-accent);
  }

  .footer-logo-subtext {
    font-size: 8px;
    color: var(--color-footer-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* Print Styles */
  @media print {
    .lab-report-page {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .no-print {
      display: none !important;
    }

    .lab-report-container {
      box-shadow: none;
      margin: 0;
      padding: 0;
      max-width: 100%;
      padding: 0;
    }

    .header-row { break-inside: avoid; }
    .info-card, .results-table, .pathologist-note { break-inside: avoid; }
  }
`;

// =======================================================
// LABORATORY INFO
// =======================================================

const laboratoryInfo = {
  name: "LabCore Diagnostics",
  address: "123 Healthcare Avenue, Medical District, Mumbai - 400001",
  phone: "+91-22-1234-5678",
  email: "info@labcore.in",
  website: "www.labcore.in",
  nablAccredited: "NABL-2023-001",
  isoCertified: "ISO 9001:2015",
  hipaaCompliant: "HIPAA-2023-001",
  gstin: "27AABCU9603R1ZM",
  licenseNumber: "LAB-MH-2023-001"
};

// =======================================================
// UTILITY FUNCTIONS
// =======================================================

function formatDate(date: string | undefined): string {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: string | undefined): string {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculateAge(dateOfBirth?: string): string {
  if (!dateOfBirth) return "—";
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return `${age}y`;
}

function getStatusBadgeClass(flag?: string): string {
  switch (flag?.toLowerCase()) {
    case "critical":
      return "critical";
    case "high":
    case "low":
      return "abnormal";
    case "normal":
    default:
      return "normal";
  }
}

function generateVerifyCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// =======================================================
// INTERFACES
// =======================================================

interface LabReportData {
  reportNumber: string;
  reportDate: string;
  reportTime: string;
  reportStatus: string;
  verifiedBy: string;
  verifierQualification?: string;
  verifierRegNo?: string;
  patientName: string;
  patientId: string;
  age?: string;
  gender?: string;
  phone?: string;
  address?: string;
  collectedBy?: string;
  collectionDate?: string;
  collectionTime?: string;
  sampleType?: string;
  refDoctor?: string;
  refDoctorQualification?: string;
  labBranch?: string;
  testName: string;
  testCode?: string;
  method?: string;
  results: Array<{
    id: string;
    parameterName: string;
    result: string;
    unit?: string;
    referenceRange?: string;
    flag?: string;
  }>;
  labManager?: string;
  criticalValues?: Array<{
    parameterName: string;
    value: string;
    note?: string;
  }>;
}

interface PixelPerfectLabReportProps {
  report: LabReportData;
  onClose?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

// =======================================================
// MAIN COMPONENT
// =======================================================

export default function PixelPerfectLabReport({
  report,
  onClose,
  onPrint,
  onDownload,
}: PixelPerfectLabReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [qrCodeError, setQrCodeError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifyCode] = useState(generateVerifyCode());
  const [previewMode, setPreviewMode] = useState(true);

  useEffect(() => {
    // Auto-open preview mode on mount
    setPreviewMode(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const generateQRCodeSafe = async () => {
      try {
        const verifyUrl = `https://www.labcore.in/verify/${verifyCode}`;
        const qrCodeDataURL = await QRCode.toDataURL(verifyUrl, {
          width: 200,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        
        if (isMounted) {
          setQrCodeDataUrl(qrCodeDataURL);
          setQrCodeError(false);
        }
      } catch (error) {
        console.error("QR Code error:", error);
        if (isMounted) {
          setQrCodeDataUrl(null);
          setQrCodeError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    generateQRCodeSafe();
    
    return () => {
      isMounted = false;
    };
  }, [verifyCode]);

  const handlePreviewPrint = () => {
    setPreviewMode(false);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const handlePrint = () => {
    const printContent = reportRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the report');
      return;
    }

    const printDocument = printWindow.document;
    printDocument.open();
    printDocument.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lab Report ${report.reportNumber}</title>
        <style>
          ${labReportStyles}
          @media print {
            body { margin: 0; padding: 0; }
            .lab-report-container { box-shadow: none; border: none; }
          }
        </style>
      </head>
      <body class="lab-report-page">
        <div class="lab-report-container">
          ${printContent.innerHTML}
        </div>
      </body>
      </html>
    `);
    printDocument.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
          onPrint?.();
        };
      }, 250);
    };
  };

  const handleDownloadPDF = () => {
    // Simple PDF download using window.print for now
    // In production, you'd use html2canvas + jsPDF for better control
    window.print();
    onDownload?.();
  };

  const hasCriticalValues = report.criticalValues && report.criticalValues.length > 0;

  if (!previewMode) {
    return null; // Will be handled by print function
  }

  return (
    <>
      <style>{labReportStyles}</style>
      
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
          {/* Action Buttons */}
          <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-gray-200 p-4 no-print">
            <h2 className="text-lg font-bold text-gray-900">Laboratory Report Preview</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePreviewPrint}
                className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Report Content */}
          <div className="lab-report-page">
            <div className="lab-report-container" ref={reportRef}>
              
              {/* HEADER ROW */}
              <div className="header-row">
                {/* Logo & Company Info */}
                <div className="logo-section">
                  <div className="logo-icon">🔬</div>
                  <div className="logo-text">LabCore</div>
                  <div className="logo-subtext">Diagnostics</div>
                  <div className="logo-tagline">Precision Medicine, Trusted Results</div>
                  
                  <div className="company-info mt-4">
                    <div className="company-name">{laboratoryInfo.name}</div>
                    <div className="company-address">{laboratoryInfo.address}</div>
                    <div className="company-contact">
                      <Phone className="w-4 h-4" />
                      {laboratoryInfo.phone}
                    </div>
                    <div className="company-contact">
                      <Mail className="w-4 h-4" />
                      {laboratoryInfo.email}
                    </div>
                    <div className="company-contact">
                      <Globe className="w-4 h-4" />
                      {laboratoryInfo.website}
                    </div>
                  </div>
                </div>

                {/* Laboratory Report Box */}
                <div className="report-box">
                  <div className="report-header">
                    <div className="report-title">Laboratory Report</div>
                  </div>
                  <div className="report-details">
                    <div className="report-detail-row">
                      <span className="report-detail-label">Report No.</span>
                      <span className="report-detail-value">{report.reportNumber}</span>
                    </div>
                    <div className="report-detail-row">
                      <span className="report-detail-label">Report Date</span>
                      <span className="report-detail-value">{formatDate(report.reportDate)}</span>
                    </div>
                    <div className="report-detail-row">
                      <span className="report-detail-label">Report Time</span>
                      <span className="report-detail-value">{formatTime(report.reportTime)}</span>
                    </div>
                    <div className="report-detail-row">
                      <span className="report-detail-label">Verified By</span>
                      <span className="report-detail-value">{report.verifiedBy}</span>
                    </div>
                    <div className="report-detail-row">
                      <span className="report-detail-label">Report Status</span>
                      <span className="report-detail-value">{report.reportStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Lab Info */}
                <div className="company-info">
                  <div className="company-name">Lab Information</div>
                  <div className="info-row">
                    <span className="info-row-label">GSTIN</span>
                    <span className="info-row-value">{laboratoryInfo.gstin}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">License No.</span>
                    <span className="info-row-value">{laboratoryInfo.licenseNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">Branch</span>
                    <span className="info-row-value">{report.labBranch || "Main Branch"}</span>
                  </div>
                </div>
              </div>

              {/* CRITICAL VALUES BANNER */}
              {hasCriticalValues && (
                <div className="critical-values-banner">
                  <div className="critical-values-header">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="critical-values-title">Critical Values Alert</span>
                  </div>
                  <div className="critical-values-list">
                    {report.criticalValues?.map((cv, index) => (
                      <div key={index} className="critical-value-item">
                        <span className="critical-value-name">{cv.parameterName}: {cv.value}</span>
                        <span className="critical-value-info">{cv.note || "Physician notified"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* THREE CARD ROW */}
              <div className="three-card-row">
                {/* Patient Information */}
                <div className="info-card">
                  <div className="card-header">
                    <div className="card-icon user">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="card-title">Patient Information</div>
                  </div>
                  <div className="avatar-placeholder">👤</div>
                  <div className="info-row">
                    <span className="info-row-label">Patient Name</span>
                    <span className="info-row-value">{report.patientName || '—'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">Patient ID</span>
                    <span className="info-row-value">{report.patientId || '—'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">Age/Gender</span>
                    <span className="info-row-value">
                      {(() => {
                        if (report.age && report.gender) {
                          return `${report.age}/${report.gender}`;
                        }
                        return '—';
                      })()}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">Phone</span>
                    <span className="info-row-value">{report.phone || '—'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">Address</span>
                    <span className="info-row-value">{report.address || '—'}</span>
                  </div>
                </div>

                {/* Collection Information */}
                <div className="info-card">
                  <div className="card-header">
                    <div className="card-icon flask">
                      <Beaker className="w-4 h-4" />
                    </div>
                    <div className="card-title">Collection Information</div>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">Collected By</span>
                    <span className="info-row-value">{report.collectedBy || '—'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">Collection Date</span>
                    <span className="info-row-value">{formatDate(report.collectionDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">Collection Time</span>
                    <span className="info-row-value">{formatTime(report.collectionTime)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">Sample Type</span>
                    <span className="info-row-value">{report.sampleType || '—'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">Ref. Doctor</span>
                    <span className="info-row-value">
                      {report.refDoctor && report.refDoctorQualification 
                        ? `${report.refDoctor} (${report.refDoctorQualification})` 
                        : report.refDoctor || '—'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">Lab Branch</span>
                    <span className="info-row-value">{report.labBranch || '—'}</span>
                  </div>
                </div>

                {/* Verify Report */}
                <div className="info-card">
                  <div className="card-header">
                    <div className="card-icon shield">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="card-title">Verify Report</div>
                  </div>
                  <div className="qr-section">
                    <div className="qr-code">
                      {qrCodeDataUrl && (
                        <img 
                          src={qrCodeDataUrl} 
                          alt="Verification QR Code"
                          className="w-[72px] h-[72px] block mx-auto border border-[#E2E6EC] rounded p-1 bg-white object-contain"
                        />
                      )}
                      {!qrCodeDataUrl && loading && (
                        <div className="qr-code-fallback">Loading...</div>
                      )}
                      {!qrCodeDataUrl && !loading && (
                        <div className="qr-code-fallback">QR Error</div>
                      )}
                    </div>
                    <div className="qr-text">Scan QR Code</div>
                    <div className="qr-link">or visit www.labcore.in/verify</div>
                    <div className="code-badge">Enter Code: {verifyCode}</div>
                  </div>
                </div>
              </div>

              <div className="report-status-strip">
                <div className="report-status-pills">
                  <span className="report-status-pill final">
                    <CheckCircle className="w-3 h-3" /> {report.reportStatus || "Final"} report
                  </span>
                  <span className="report-status-pill verified">
                    <ShieldCheck className="w-3 h-3" /> Pathologist verified
                  </span>
                </div>
                <span className="tat-label">TAT On Time · {formatDate(report.reportDate)} {formatTime(report.reportTime)}</span>
              </div>

              {/* TEST RESULTS TABLE */}
              <div className="table-section">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{report.testName}</h3>
                  {report.testCode && (
                    <p className="text-sm text-gray-600">Test Code: {report.testCode}</p>
                  )}
                  {report.method && (
                    <p className="text-sm text-gray-600">Method: {report.method}</p>
                  )}
                </div>
                
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Test Name</th>
                      <th>Result</th>
                      <th>Unit</th>
                      <th>Reference Range</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.results && report.results.length > 0 ? (
                      report.results.map((result, index) => (
                        <tr key={result.id || index}>
                          <td>{index + 1}</td>
                          <td>{result.parameterName || '—'}</td>
                          <td className="result-value">{result.result || '—'}</td>
                          <td>{result.unit || '—'}</td>
                          <td>{result.referenceRange || '—'}</td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(result.flag)}`}>
                              {result.flag || 'NORMAL'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center text-gray-500 py-8">
                          No test results available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pathologist-note">
                <div className="pathologist-note-title">Pathologist&apos;s note</div>
                <div className="pathologist-note-text">
                  {hasCriticalValues
                    ? "Abnormal or critical values require clinical correlation. The reviewing pathologist has highlighted the flagged parameters for physician attention."
                    : "Results have been reviewed against the applicable reference intervals. Clinical correlation is recommended where appropriate."}
                </div>
              </div>

              {/* SIGNATURE ROW */}
              <div className="signature-row">
                {/* Verified By */}
                <div className="signature-section">
                  <div className="signature-label">Verified By</div>
                  <div className="signature-image">Signature</div>
                  <div className="signature-name">{report.verifiedBy || 'Dr. Pathologist'}</div>
                  <div className="signature-details">{report.verifierQualification || 'MD Pathology'}</div>
                  <div className="signature-details">Reg. No: {report.verifierRegNo || '—'}</div>
                </div>

                {/* Quote */}
                <div className="quote-box">
                  <Quote className="quote-icon" />
                  <div className="quote-text">Thank you for trusting LabCore.</div>
                  <div className="quote-subtext">We care for your health.</div>
                </div>

                {/* Authorized Signatory */}
                <div className="signature-section">
                  <div className="signature-label">Authorized Signatory</div>
                  <div className="signature-image">Signature</div>
                  <div className="signature-name">{report.labManager || 'Lab Manager'}</div>
                  <div className="signature-details">{laboratoryInfo.name}</div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="footer">
                <div className="footer-row">
                  <div className="footer-item">
                    <ShieldCheck className="w-4 h-4" />
                    NABL ACCREDITED ({laboratoryInfo.nablAccredited})
                  </div>
                  <div className="footer-divider"></div>
                  <div className="footer-item">
                    <ShieldCheck className="w-4 h-4" />
                    ISO CERTIFIED ({laboratoryInfo.isoCertified})
                  </div>
                  <div className="footer-divider"></div>
                  <div className="footer-item">
                    <Lock className="w-4 h-4" />
                    HIPAA COMPLIANT ({laboratoryInfo.hipaaCompliant})
                  </div>
                  <div className="footer-divider"></div>
                  <div className="footer-item">
                    <Phone className="w-4 h-4" />
                    NEED HELP? {laboratoryInfo.phone} | {laboratoryInfo.email}
                  </div>
                </div>
                <div className="footer-bottom">
                  <div className="footer-security">
                    <Lock className="w-4 h-4" />
                    Your Health. Our Priority. Secure · Accurate · Reliable
                  </div>
                  <div className="footer-logo">
                    <div className="footer-logo-text">LabCore</div>
                    <div className="footer-logo-subtext">ENTERPRISE LIS</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}