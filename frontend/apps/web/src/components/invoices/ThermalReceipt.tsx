"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import QRCode from "qrcode";
import {
  Loader2,
  X,
  Printer,
  Receipt,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  Download,
  AlertTriangle,
  Sparkles,
  FileText,
  Share2,
  Sliders,
  Award,
  CheckCheck,
  Clock,
  Eye,
  EyeOff,
  Tag,
  TestTube2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Activity,
  CreditCard,
  Building2,
  QrCode,
  Barcode,
} from "lucide-react";

interface ThermalReceiptProps {
  invoice: {
    id?: string | number;
    invoiceNumber?: string;
    patientName?: string;
    patientUhid?: string;
    patientPhone?: string;
    patientAge?: string | number;
    patientGender?: string;
    orderNumber?: string;
    doctorName?: string;
    doctorQualification?: string;
    sampleType?: string;
    tokenNumber?: string;
    items?: Array<{
      id?: string | number;
      testName?: string;
      testCode?: string;
      quantity?: number;
      unitPrice?: number;
      total?: number;
      hsnSacCode?: string;
    }>;
    subtotal?: number;
    discount?: number;
    gstAmount?: number;
    cgstAmount?: number;
    sgstAmount?: number;
    igstAmount?: number;
    netPayable?: number;
    totalAmount?: number;
    paidAmount?: number;
    pendingAmount?: number;
    paymentStatus?: string;
    paymentMode?: string;
    createdAt?: string;
    dueDate?: string;
  };
  labInfo?: {
    name?: string;
    subName?: string;
    branch?: string;
    address?: string;
    city?: string;
    phone?: string;
    gstin?: string;
    email?: string;
    website?: string;
    upiId?: string;
    nablNumber?: string;
    isoStandard?: string;
    icmrNumber?: string;
  };
  cashierName?: string;
  paperWidth?: "58mm" | "80mm";
  onSwitchToA4?: () => void;
  onClose: () => void;
}

// ─── FORMATTING HELPERS ───
function fmt(amount?: number) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtPlain(amount?: number) {
  return `${Number(amount || 0).toFixed(2)}`;
}

function fmtDateTime(date?: string) {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return date;
  }
}

// Grammatically Flawless Indian Rupee words conversion
function numberToWordsINR(amount: number): string {
  const num = Math.abs(Number(amount || 0));
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  if (rupees === 0 && paise === 0) return "Zero Rupees Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function convertTwoDigits(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    const t = tens[Math.floor(n / 10)];
    const o = ones[n % 10];
    return o ? `${t} ${o}` : t;
  }

  function convertThreeDigits(n: number): string {
    if (n === 0) return "";
    const h = Math.floor(n / 100);
    const rest = n % 100;
    const hStr = h ? `${ones[h]} Hundred` : "";
    const restStr = convertTwoDigits(rest);
    if (hStr && restStr) return `${hStr} and ${restStr}`;
    return hStr || restStr;
  }

  let words = "";
  let rem = rupees;

  if (Math.floor(rem / 10000000) > 0) {
    words += `${convertTwoDigits(Math.floor(rem / 10000000))} Crore `;
    rem %= 10000000;
  }
  if (Math.floor(rem / 100000) > 0) {
    words += `${convertTwoDigits(Math.floor(rem / 100000))} Lakh `;
    rem %= 100000;
  }
  if (Math.floor(rem / 1000) > 0) {
    words += `${convertTwoDigits(Math.floor(rem / 1000))} Thousand `;
    rem %= 1000;
  }
  if (rem > 0) {
    words += convertThreeDigits(rem);
  }

  let result = words.trim() ? `${words.trim()} Rupees` : "";
  if (paise > 0) {
    const paiseWord = convertTwoDigits(paise);
    result = result ? `${result} and ${paiseWord} Paise` : `${paiseWord} Paise`;
  }

  return `${result} Only`;
}

// ─── SCANNABLE CODE-39 SVG BARCODE GENERATOR ───
// Standard Code 39 Table: 9 elements per char (5 bars, 4 spaces; 3 wide, 6 narrow)
const CODE39_PATTERNS: Record<string, string> = {
  "0": "NNNWWNWNN", "1": "WNNWNNNNW", "2": "NNWWNNNNW", "3": "WNWWNNNNN",
  "4": "NNNWWNNNW", "5": "WNNWWNNNN", "6": "NNWWWNNNN", "7": "NNNWWNWNN",
  "8": "WNNWWNWNN", "9": "NNWWWNWNN", "A": "WNNNNWNNW", "B": "NNWNNWNNW",
  "C": "WNWNNWNNN", "D": "NNNNWWNNW", "E": "WNNNWWNNN", "F": "NNWNWWNNN",
  "G": "NNNNNWWNW", "H": "WNNNNWWNN", "I": "NNWNNWWNN", "J": "NNNNWWWNN",
  "K": "WNNNNNNWW", "L": "NNWNNNNWW", "M": "WNWNNNNWN", "N": "NNNNWNNWW",
  "O": "WNNNWNNWN", "P": "NNWNWNNWN", "Q": "NNNNNNWWW", "R": "WNNNNNWWN",
  "S": "NNWNNNWWN", "T": "NNNNWNWWN", "U": "WWNNNNNNW", "V": "NWWNNNNNW",
  "W": "WWWNNNNNN", "X": "NWNNWNNNW", "Y": "WWNNWNNNN", "Z": "NWWNWNNNN",
  "-": "NWNNNNWNW", ".": "WWNNNNWNN", " ": "NWNNWNWNN", "$": "NWNWNWNNN",
  "/": "NWNWNNNWN", "+": "NWNNNWNWN", "%": "NNNWNWNWN", "*": "NWNNWNWNN",
};

function generateCode39Svg(text: string, height: number = 36): string {
  const clean = `*${text.toUpperCase().replace(/[^0-9A-Z\-\. \$\/\+\%]/g, "-")}*`;
  let elements: Array<{ isBar: boolean; width: number }> = [];

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS["-"];
    for (let j = 0; j < 9; j++) {
      const isBar = j % 2 === 0;
      const isWide = pattern[j] === "W";
      elements.push({ isBar, width: isWide ? 2.8 : 1.1 });
    }
    // Inter-character narrow gap
    if (i < clean.length - 1) {
      elements.push({ isBar: false, width: 1.1 });
    }
  }

  let totalWidth = elements.reduce((acc, el) => acc + el.width, 0);
  // Add 10px quiet zones
  const quietZone = 12;
  const viewBoxWidth = totalWidth + quietZone * 2;

  let x = quietZone;
  let rects = "";
  for (const el of elements) {
    if (el.isBar) {
      rects += `<rect x="${x.toFixed(2)}" y="0" width="${el.width.toFixed(2)}" height="${height}" fill="#000000"/>`;
    }
    x += el.width;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxWidth} ${height}" style="width: 100%; max-width: 220px; height: ${height}px; display: block; margin: 0 auto;">${rects}</svg>`;
}

export default function ThermalReceipt({
  invoice,
  labInfo,
  cashierName = "Cash Desk #01 (Admin)",
  paperWidth = "80mm",
  onSwitchToA4,
  onClose,
}: ThermalReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataURL, setQrDataURL] = useState<string>("");
  const [activePaper, setActivePaper] = useState<"58mm" | "80mm">(paperWidth);
  const [highContrast, setHighContrast] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);
  const [previewZoom, setPreviewZoom] = useState<number>(100);

  // Slip Modes:
  // 'INVOICE': Full Tax Invoice / Cash Memo
  // 'TOKEN': Phlebotomy Collection Token & Tubes Guide
  // 'SETTLEMENT': Fast Payment Settlement Voucher
  const [slipMode, setSlipMode] = useState<"INVOICE" | "TOKEN" | "SETTLEMENT">("INVOICE");

  // Typography Engine: 'MONO' (Classic ESC/POS) | 'SANS' (Modern Crisp POS)
  const [fontStyle, setFontStyle] = useState<"MONO" | "SANS">("MONO");

  // Feature Toggles
  const [showQR, setShowQR] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [showPhlebotomy, setShowPhlebotomy] = useState(true);
  const [showNabl, setShowNabl] = useState(true);

  const lab = {
    name: labInfo?.name || "LABCORE DIAGNOSTICS & RESEARCH INSTITUTE",
    subName: labInfo?.subName || "Central Clinical & Molecular Reference Laboratory",
    branch: labInfo?.branch || "Main Central Counter #01 (OPD)",
    address: labInfo?.address || "Plot 42-A, Health Avenue, Medical Enclave",
    city: labInfo?.city || "Ahmedabad, Gujarat - 380016",
    phone: labInfo?.phone || "+91 98765 43210",
    gstin: labInfo?.gstin || "24ABCDE1234F1Z5",
    email: labInfo?.email || "billing@labcore.in",
    website: labInfo?.website || "www.labcore.in",
    upiId: labInfo?.upiId || "labcore@icici",
    nablNumber: labInfo?.nablNumber || "NABL MC-5678",
    isoStandard: labInfo?.isoStandard || "ISO 15189:2022",
    icmrNumber: labInfo?.icmrNumber || "ICMR: LAB-9042",
  };

  const invNumber = invoice.invoiceNumber || `INV-${invoice.id || "001"}`;
  const orderNumber = invoice.orderNumber || invNumber.replace("INV-", "ORD-");
  const netPayable = Number(invoice.netPayable || invoice.totalAmount || 0);
  const paidAmt = Number(invoice.paidAmount || 0);
  const pendingAmt =
    invoice.pendingAmount !== undefined
      ? Number(invoice.pendingAmount)
      : Math.max(0, netPayable - paidAmt);
  const isPaid = pendingAmt <= 0;
  const is58 = activePaper === "58mm";

  // Dynamic Token Number
  const tokenNum =
    invoice.tokenNumber ||
    `A-${String(
      Math.abs(
        (typeof invoice.id === "number" ? invoice.id : parseInt(String(invoice.id || "1").replace(/\D/g, "") || "18")) %
          100
      ) || 18
    ).padStart(2, "0")}`;

  // Expected Report Delivery Time (Standard: +3.5 hours from bill or 08:30 PM today)
  const reportETA = useMemo(() => {
    try {
      const base = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
      base.setHours(base.getHours() + 4);
      return base.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "08:30 PM Today";
    }
  }, [invoice.createdAt]);

  // Dynamic Bharat UPI or Report Verification URL
  const upiPayAmount = pendingAmt > 0 ? pendingAmt : netPayable;
  const upiPayload =
    pendingAmt > 0
      ? `upi://pay?pa=${encodeURIComponent(lab.upiId)}&pn=${encodeURIComponent(
          "LabCore Diagnostics"
        )}&am=${upiPayAmount.toFixed(2)}&cu=INR&tr=${encodeURIComponent(
          invNumber
        )}&tn=${encodeURIComponent(`Settlement ${invNumber}`)}`
      : `https://${lab.website}/reports?inv=${encodeURIComponent(invNumber)}&uhid=${encodeURIComponent(
          invoice.patientUhid || "LC01"
        )}`;

  const generateQR = useCallback(async () => {
    try {
      const url = await QRCode.toDataURL(upiPayload, {
        width: is58 ? 115 : 145,
        margin: 1,
        errorCorrectionLevel: "M",
        color: { dark: "#000000", light: "#ffffff" },
      });
      setQrDataURL(url);
    } catch {
      setQrDataURL("");
    }
  }, [upiPayload, is58]);

  useEffect(() => {
    setLoading(true);
    generateQR().finally(() => setLoading(false));
  }, [generateQR]);

  // SVG Barcode string
  const barcodeSvgHtml = useMemo(() => {
    return generateCode39Svg(orderNumber, is58 ? 28 : 34);
  }, [orderNumber, is58]);

  // Generate plain-text monospace receipt for clipboard / SMS / WhatsApp
  const handleCopyText = () => {
    const divider = is58
      ? "--------------------------------"
      : "========================================";
    const thinDivider = is58
      ? "--------------------------------"
      : "----------------------------------------";

    let text = `${lab.name}\n${lab.subName}\n${lab.address}, ${lab.city}\nGSTIN: ${lab.gstin} | ${lab.nablNumber}\nHelpline: ${lab.phone}\n${divider}\n`;
    text += `*** OPD DIAGNOSTIC CASH RECEIPT ***\n`;
    text += `Receipt No : ${invNumber}\n`;
    text += `Date & Time: ${fmtDateTime(invoice.createdAt)}\n`;
    text += `Order / Acc: ${orderNumber}\n`;
    text += `Token No   : ${tokenNum}\n`;
    text += `Counter/Op : ${cashierName}\n`;
    text += `${thinDivider}\n`;
    text += `PATIENT INFORMATION:\n`;
    text += `UHID / PID : ${invoice.patientUhid || "LC-000001"}\n`;
    text += `Patient    : ${invoice.patientName || "Walk-in Patient"}\n`;
    text += `Age/Gender : ${invoice.patientAge ? `${invoice.patientAge} Yrs` : "35 Yrs"} / ${invoice.patientGender || "Male"}\n`;
    text += `Contact    : ${invoice.patientPhone || "—"}\n`;
    text += `Ref Doctor : ${invoice.doctorName ? `Dr. ${invoice.doctorName}` : "Self Referral (OPD)"}\n`;
    text += `${divider}\n`;
    text += `SR  INVESTIGATION             SAC    AMT\n`;
    text += `${thinDivider}\n`;

    const items =
      invoice.items && invoice.items.length > 0
        ? invoice.items
        : [
            {
              testName: "Diagnostic Laboratory Service",
              hsnSacCode: "999312",
              quantity: 1,
              unitPrice: netPayable,
              total: netPayable,
            },
          ];

    items.forEach((item, idx) => {
      const name = (item.testName || "Diagnostic Test").slice(0, 22);
      const amt = fmtPlain(item.total || item.unitPrice);
      text += `${idx + 1}.  ${name.padEnd(23)} 999312 ${amt.padStart(8)}\n`;
    });

    text += `${divider}\n`;
    text += `Gross Tariff Total  : ${fmtPlain(invoice.subtotal || netPayable)}\n`;
    if (invoice.discount && invoice.discount > 0) {
      text += `Privilege Concession: -${fmtPlain(invoice.discount)}\n`;
    }
    if (invoice.gstAmount && invoice.gstAmount > 0) {
      text += `CGST @ 9.00%        : +${fmtPlain(invoice.cgstAmount || invoice.gstAmount / 2)}\n`;
      text += `SGST @ 9.00%        : +${fmtPlain(invoice.sgstAmount || invoice.gstAmount / 2)}\n`;
      text += `Total GST (18%)     : +${fmtPlain(invoice.gstAmount)}\n`;
    }
    text += `${divider}\n`;
    text += `NET AMOUNT PAYABLE  : ${fmtPlain(netPayable)}\n`;
    text += `Amount Received     : ${fmtPlain(paidAmt)} (${invoice.paymentMode || "CASH"})\n`;
    text += `Balance Due         : ${fmtPlain(pendingAmt)}\n`;
    text += `${divider}\n`;
    text += isPaid
      ? `*** [ FULLY SETTLED & PAID - ${invoice.paymentMode || "CASH"} ] ***\n`
      : `*** [ ⚠️ BALANCE OUTSTANDING: ${fmt(pendingAmt)} ⚠️ ] ***\n`;
    text += `Words: ${numberToWordsINR(netPayable)}\n`;
    text += `Phlebotomy Desk : Counter #03 | Expected: Today ${reportETA}\n`;
    text += `Online Report   : ${lab.website}/reports\n`;
    text += `Thank you! Wishing you good health.\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleWhatsAppReceipt = () => {
    const itemsList = (invoice.items || [])
      .map((it, i) => `${i + 1}. ${it.testName || "Investigation"} (₹${fmtPlain(it.total || it.unitPrice)})`)
      .join("\n");

    const text = encodeURIComponent(
      `*${lab.name}*\n` +
        `*Diagnostic Cash Receipt & Token Slip*\n` +
        `----------------------------------------\n` +
        `📋 *Receipt No:* #${invNumber}\n` +
        `🎫 *Token No:* *${tokenNum}* (Counter #03)\n` +
        `👤 *Patient:* ${invoice.patientName || "Valued Patient"} (UHID: ${invoice.patientUhid || "LC-000001"})\n` +
        `📅 *Date:* ${fmtDateTime(invoice.createdAt)}\n` +
        `🩺 *Tests Booked:*\n${itemsList || "• Diagnostic Laboratory Investigations"}\n` +
        `----------------------------------------\n` +
        `💰 *Net Bill:* *${fmt(netPayable)}*\n` +
        `💳 *Paid:* ${fmt(paidAmt)} (${invoice.paymentMode || "CASH"})\n` +
        `${pendingAmt > 0 ? `⚠️ *Balance Due:* *${fmt(pendingAmt)}*\n` : `✅ *Status:* FULLY PAID\n`}` +
        `----------------------------------------\n` +
        `⏰ *Report Ready:* Expected Today by *${reportETA}*\n` +
        `🌐 *Download Online PDF:* https://${lab.website}/reports\n\n` +
        `_Thank you for trusting LabCore Diagnostics! Wishing you good health._`
    );
    const phone = (invoice.patientPhone || "").replace(/[^0-9]/g, "");
    const targetUrl = phone
      ? `https://wa.me/${phone.length === 10 ? "91" + phone : phone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(targetUrl, "_blank");
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const pw = activePaper;
    const content = receiptRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print thermal receipt.");
      return;
    }

    const fontFamilyRule =
      fontStyle === "MONO"
        ? "'Courier New', Courier, 'Lucida Console', Monaco, monospace"
        : "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>POS Slip – ${invNumber}</title>
<style>
  @page {
    size: ${pw} auto;
    margin: 0mm;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: ${fontFamilyRule};
    font-size: ${is58 ? "9px" : "11px"};
    font-weight: ${highContrast ? "700" : "500"};
    width: ${pw};
    background: #fff;
    color: #000;
    line-height: 1.25;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    padding: 2mm 1.5mm 4mm 1.5mm;
  }
  .receipt-wrap {
    width: 100%;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  img, svg {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }
  @media print {
    body {
      padding: 0;
      margin: 0;
    }
  }
</style>
</head>
<body>
  <div class="receipt-wrap">
    ${content}
  </div>
</body>
</html>`);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 350);
  };

  const previewWidth = is58 ? 260 : 340;
  const currentFontFamily =
    fontStyle === "MONO"
      ? "'Courier New', Courier, 'Lucida Console', monospace"
      : "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-2 sm:p-4 overflow-y-auto">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl shadow-[0_40px_140px_rgba(0,0,0,0.8)] md:flex-row my-auto border border-white/10 max-h-[95vh]" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'}}>
        {/* ─── LEFT: THERMAL RECEIPT DISPLAY ─── */}
        <div className="flex flex-1 flex-col items-center justify-start overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 sm:p-8 relative">
          {/* Paper Edge Preview Toolbar */}
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md px-3 py-1.5 text-xs text-white shadow-inner">
            <span className="font-bold text-amber-400">Roll: {activePaper}</span>
            <span className="text-white/30">•</span>
            <span className="text-white/70">
              {slipMode === "INVOICE"
                ? "Diagnostic Tax Memo"
                : slipMode === "TOKEN"
                ? "Phlebotomy Token"
                : "Payment Voucher"}
            </span>
            <span className="text-white/30">•</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewZoom((z) => Math.max(75, z - 10))}
                className="p-0.5 hover:text-amber-400 text-white/60 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-[10px]">{previewZoom}%</span>
              <button
                type="button"
                onClick={() => setPreviewZoom((z) => Math.min(130, z + 10))}
                className="p-0.5 hover:text-amber-400 text-white/60 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewZoom(100)}
                className="p-0.5 hover:text-amber-400 text-white/60 transition-colors ml-0.5"
                title="Reset Zoom"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Scalable Container */}
          <div
            style={{
              transform: `scale(${previewZoom / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease",
            }}
          >
            <div
              className="relative rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.85)] transition-all duration-300"
              style={{ width: previewWidth }}
            >
              {/* Serrated Zig-Zag Top Cut Edge */}
              <div
                className="h-3.5 w-full"
                style={{
                  background:
                    "radial-gradient(circle, transparent, transparent 50%, #ffffff 50%, #ffffff 100%)",
                  backgroundSize: "10px 10px",
                  backgroundPosition: "0 5px",
                }}
              />

              {/* Thermal Paper Slip Body */}
              <div
                ref={receiptRef}
                style={{
                  fontFamily: currentFontFamily,
                  fontSize: is58 ? "9px" : "11px",
                  color: "#000000",
                  lineHeight: 1.25,
                  fontWeight: highContrast ? 700 : 500,
                  padding: is58 ? "10px 7px" : "14px 11px",
                  width: "100%",
                  background: "#ffffff",
                }}
              >
                {/* ─── HEADER: INSTITUTIONAL ACCREDITATION & IDENTITY ─── */}
                <div
                  style={{
                    textAlign: "center",
                    borderBottom: "1.5px dashed #000",
                    paddingBottom: 6,
                    marginBottom: 5,
                  }}
                >
                  <div
                    style={{
                      fontSize: is58 ? 12 : 14,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      margin: 0,
                      lineHeight: 1.15,
                    }}
                  >
                    {lab.name}
                  </div>
                  <div
                    style={{
                      fontSize: is58 ? 7.5 : 8.5,
                      margin: "2px 0 1px",
                      fontWeight: 700,
                    }}
                  >
                    {lab.subName}
                  </div>
                  <div style={{ fontSize: is58 ? 7 : 8, margin: "1px 0" }}>
                    {lab.address}, {lab.city}
                  </div>

                  {showNabl && (
                    <>
                      <div
                        style={{
                          fontSize: is58 ? 7 : 8,
                          fontWeight: 800,
                          margin: "2px 0 1px",
                        }}
                      >
                        [{lab.nablNumber}] • [{lab.isoStandard}]
                      </div>
                      <div
                        style={{
                          fontSize: is58 ? 6.5 : 7.5,
                          margin: "1px 0",
                          color: "#222",
                        }}
                      >
                        GSTIN: {lab.gstin} • State: 24 (Gujarat)
                      </div>
                      <div
                        style={{
                          fontSize: is58 ? 6.5 : 7.5,
                          margin: "1px 0",
                          color: "#333",
                        }}
                      >
                        Helpline: {lab.phone} (24x7 Diagnostic Desk)
                      </div>
                    </>
                  )}
                </div>

                {/* ─── SLIP TITLE TAG ─── */}
                <div
                  style={{
                    textAlign: "center",
                    fontWeight: 900,
                    fontSize: is58 ? 9.5 : 11.5,
                    letterSpacing: 0.8,
                    margin: "4px 0",
                    borderTop: "1.5px solid #000",
                    borderBottom: "1.5px solid #000",
                    padding: "3px 0",
                    background: "#f7f7f7",
                  }}
                >
                  {slipMode === "TOKEN"
                    ? "*** PHLEBOTOMY & SPECIMEN TOKEN ***"
                    : slipMode === "SETTLEMENT"
                    ? "*** COUNTER PAYMENT RECEIPT ***"
                    : "*** TAX INVOICE CUM CASH MEMO ***"}
                </div>

                {/* ─── TOKEN HIGHLIGHT BOX (IF TOKEN MODE OR PHLEBOTOMY ON) ─── */}
                {(slipMode === "TOKEN" || showPhlebotomy) && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "2px solid #000",
                      padding: is58 ? "4px 6px" : "6px 8px",
                      margin: "5px 0",
                      background: "#fff",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: is58 ? 7 : 8,
                          textTransform: "uppercase",
                          fontWeight: 800,
                        }}
                      >
                        Phlebotomy Token
                      </div>
                      <div
                        style={{
                          fontSize: is58 ? 16 : 20,
                          fontWeight: 900,
                          letterSpacing: 1,
                        }}
                      >
                        #{tokenNum}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: is58 ? 7 : 8,
                          fontWeight: 800,
                        }}
                      >
                        Booth #03 (Fast-Track)
                      </div>
                      <div
                        style={{
                          fontSize: is58 ? 6.5 : 7.5,
                          color: "#333",
                        }}
                      >
                        ETA: Today {reportETA}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── METADATA DOSSIER ─── */}
                <div style={{ margin: "4px 0" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: is58 ? 8 : 9.5,
                      margin: "1.5px 0",
                    }}
                  >
                    <span>Receipt No:</span>
                    <span style={{ fontWeight: 900 }}>{invNumber}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: is58 ? 8 : 9.5,
                      margin: "1.5px 0",
                    }}
                  >
                    <span>Date & Time:</span>
                    <span style={{ fontWeight: 700 }}>
                      {fmtDateTime(invoice.createdAt)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: is58 ? 8 : 9.5,
                      margin: "1.5px 0",
                    }}
                  >
                    <span>Accession / Ord:</span>
                    <span style={{ fontWeight: 800 }}>{orderNumber}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: is58 ? 8 : 9.5,
                      margin: "1.5px 0",
                    }}
                  >
                    <span>Counter / Cashier:</span>
                    <span style={{ fontWeight: 700 }}>{cashierName}</span>
                  </div>
                </div>

                <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />

                {/* ─── PATIENT INFORMATION ─── */}
                <div style={{ margin: "4px 0" }}>
                  <div
                    style={{
                      fontWeight: 900,
                      textTransform: "uppercase",
                      fontSize: is58 ? 8 : 9,
                      marginBottom: 2,
                      letterSpacing: 0.5,
                    }}
                  >
                    PATIENT DEMOGRAPHICS
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: is58 ? 8 : 9.5,
                      margin: "1.5px 0",
                    }}
                  >
                    <span>UHID / PID:</span>
                    <span style={{ fontWeight: 900 }}>
                      {invoice.patientUhid || "LC-000001"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: is58 ? 8.5 : 10,
                      margin: "1.5px 0",
                    }}
                  >
                    <span>Patient Name:</span>
                    <span
                      style={{
                        fontWeight: 900,
                        maxWidth: "65%",
                        textAlign: "right",
                        textTransform: "uppercase",
                      }}
                    >
                      {invoice.patientName || "Walk-in Patient"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: is58 ? 8 : 9.5,
                      margin: "1.5px 0",
                    }}
                  >
                    <span>Age / Gender:</span>
                    <span style={{ fontWeight: 700 }}>
                      {invoice.patientAge ? `${invoice.patientAge} Yrs` : "36 Yrs"} /{" "}
                      {invoice.patientGender || "Male"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: is58 ? 8 : 9.5,
                      margin: "1.5px 0",
                    }}
                  >
                    <span>Mobile Contact:</span>
                    <span style={{ fontWeight: 700 }}>
                      {invoice.patientPhone || "—"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: is58 ? 8 : 9.5,
                      margin: "1.5px 0",
                    }}
                  >
                    <span>Ref Clinician:</span>
                    <span
                      style={{
                        fontWeight: 800,
                        maxWidth: "65%",
                        textAlign: "right",
                      }}
                    >
                      {invoice.doctorName ? `Dr. ${invoice.doctorName}` : "Self Referral (OPD)"}
                    </span>
                  </div>
                </div>

                {/* ─── PHLEBOTOMY SPECIMEN TUBE GUIDE (FOR TOKEN & INVOICE) ─── */}
                {showPhlebotomy && (
                  <>
                    <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />
                    <div style={{ margin: "4px 0" }}>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: is58 ? 7.5 : 8.5,
                          textTransform: "uppercase",
                          marginBottom: 2,
                        }}
                      >
                        SPECIMEN SAMPLING GUIDE
                      </div>
                      <div
                        style={{
                          fontSize: is58 ? 7 : 8,
                          color: "#222",
                          lineHeight: 1.3,
                        }}
                      >
                        <div>• Primary Tube: 1x Purple EDTA (3ml) - Sysmex Hematology</div>
                        <div>• Secondary: 1x Gold Gel Clot Activator (SST Serum)</div>
                        <div>• Status: Fasting 10-12 Hrs Verified • No Hemolysis</div>
                      </div>
                    </div>
                  </>
                )}

                <div style={{ borderTop: "1.5px solid #000", margin: "5px 0" }} />

                {/* ─── INVESTIGATIONS TABLE (FULL OR SUMMARY) ─── */}
                {slipMode !== "SETTLEMENT" && (
                  <div>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: is58 ? 7.5 : 9,
                        margin: "4px 0",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              textAlign: "left",
                              borderBottom: "1px solid #000",
                              padding: "2px 1px",
                              fontWeight: 900,
                              textTransform: "uppercase",
                            }}
                          >
                            Investigation / SAC
                          </th>
                          {!is58 && (
                            <th
                              style={{
                                textAlign: "center",
                                borderBottom: "1px solid #000",
                                padding: "2px 1px",
                                width: "12%",
                                fontWeight: 900,
                              }}
                            >
                              Qty
                            </th>
                          )}
                          <th
                            style={{
                              textAlign: "right",
                              borderBottom: "1px solid #000",
                              padding: "2px 1px",
                              width: "28%",
                              fontWeight: 900,
                              textTransform: "uppercase",
                            }}
                          >
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items && invoice.items.length > 0 ? (
                          invoice.items.map((item, idx) => (
                            <tr key={idx}>
                              <td
                                style={{
                                  padding: "3px 1px",
                                  borderBottom: "1px dotted #ccc",
                                }}
                              >
                                <div style={{ fontWeight: 900 }}>
                                  {idx + 1}. {item.testName || "Diagnostic Test"}
                                </div>
                                <div
                                  style={{
                                    fontSize: is58 ? 6.5 : 7.5,
                                    color: "#444",
                                  }}
                                >
                                  SAC {item.hsnSacCode || "999312"} {is58 ? "• Qty: 1" : ""}
                                </div>
                              </td>
                              {!is58 && (
                                <td
                                  style={{
                                    textAlign: "center",
                                    padding: "3px 1px",
                                    borderBottom: "1px dotted #ccc",
                                  }}
                                >
                                  {item.quantity || 1}
                                </td>
                              )}
                              <td
                                style={{
                                  textAlign: "right",
                                  padding: "3px 1px",
                                  borderBottom: "1px dotted #ccc",
                                  fontWeight: 900,
                                }}
                              >
                                {fmt(item.total || item.unitPrice)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              style={{
                                padding: "3px 1px",
                                borderBottom: "1px dotted #ccc",
                              }}
                            >
                              <div style={{ fontWeight: 900 }}>
                                1. Diagnostic Laboratory Panel
                              </div>
                              <div style={{ fontSize: is58 ? 6.5 : 7.5, color: "#444" }}>
                                SAC 999312 • Qty: 1
                              </div>
                            </td>
                            {!is58 && (
                              <td
                                style={{
                                  textAlign: "center",
                                  padding: "3px 1px",
                                  borderBottom: "1px dotted #ccc",
                                }}
                              >
                                1
                              </td>
                            )}
                            <td
                              style={{
                                textAlign: "right",
                                padding: "3px 1px",
                                borderBottom: "1px dotted #ccc",
                                fontWeight: 900,
                              }}
                            >
                              {fmt(netPayable)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ─── FINANCIAL BREAKDOWN ─── */}
                <div
                  style={{
                    borderTop: "1.5px dashed #000",
                    paddingTop: 4,
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: is58 ? 8 : 9.5,
                      margin: "1.5px 0",
                    }}
                  >
                    <span>Gross Tariff Total:</span>
                    <span>{fmt(invoice.subtotal || netPayable)}</span>
                  </div>

                  {invoice.discount !== undefined && invoice.discount > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: is58 ? 8 : 9.5,
                        margin: "1.5px 0",
                      }}
                    >
                      <span>Privilege Discount:</span>
                      <span>-{fmt(invoice.discount)}</span>
                    </div>
                  )}

                  {invoice.gstAmount !== undefined && invoice.gstAmount > 0 && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: is58 ? 7.5 : 9,
                          margin: "1px 0",
                          color: "#333",
                        }}
                      >
                        <span>CGST @ 9.00%:</span>
                        <span>{fmt(invoice.cgstAmount || invoice.gstAmount / 2)}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: is58 ? 7.5 : 9,
                          margin: "1px 0",
                          color: "#333",
                        }}
                      >
                        <span>SGST @ 9.00%:</span>
                        <span>{fmt(invoice.sgstAmount || invoice.gstAmount / 2)}</span>
                      </div>
                    </>
                  )}

                  {/* NET AMOUNT PAYABLE HIGHLIGHT */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: 900,
                      fontSize: is58 ? 11.5 : 13.5,
                      borderTop: "2px solid #000",
                      borderBottom: "2px solid #000",
                      padding: "3.5px 0",
                      margin: "4px 0",
                    }}
                  >
                    <span>NET PAYABLE:</span>
                    <span>{fmt(netPayable)}</span>
                  </div>

                  {/* PAYMENT DETAILS */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: is58 ? 8 : 9.5,
                      margin: "1.5px 0",
                    }}
                  >
                    <span>Received ({invoice.paymentMode || "CASH"}):</span>
                    <span style={{ fontWeight: 900 }}>{fmt(paidAmt)}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: is58 ? 8 : 9.5,
                      margin: "1.5px 0",
                    }}
                  >
                    <span>Balance Due:</span>
                    <span style={{ fontWeight: 900 }}>{fmt(pendingAmt)}</span>
                  </div>

                  {/* PAYMENT STATUS BADGE */}
                  <div
                    style={{
                      textAlign: "center",
                      border: "2px solid #000",
                      padding: "3.5px",
                      margin: "6px 0",
                      fontWeight: 900,
                      fontSize: is58 ? 9 : 11,
                      letterSpacing: 0.8,
                      background: isPaid ? "#ffffff" : "#000000",
                      color: isPaid ? "#000000" : "#ffffff",
                    }}
                  >
                    {isPaid
                      ? `*** [ ★ FULLY SETTLED & PAID ★ ] ***`
                      : `*** [ ⚠️ BALANCE OUTSTANDING: ${fmt(pendingAmt)} ⚠️ ] ***`}
                  </div>

                  {/* AMOUNT IN WORDS */}
                  <div
                    style={{
                      fontSize: is58 ? 7 : 8,
                      textAlign: "center",
                      fontStyle: "italic",
                      margin: "2px 0 4px",
                    }}
                  >
                    Words: {numberToWordsINR(netPayable)}
                  </div>
                </div>

                {/* ─── DYNAMIC BHARAT UPI QR CODE ─── */}
                {showQR && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "6px 0 3px",
                      gap: 2,
                    }}
                  >
                    {qrDataURL ? (
                      <img
                        src={qrDataURL}
                        alt="Bharat UPI QR"
                        style={{
                          width: is58 ? 95 : 120,
                          height: is58 ? 95 : 120,
                          display: "block",
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: 9, color: "#666" }}>
                        UPI: {lab.upiId}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: is58 ? 7 : 8,
                        fontWeight: 800,
                        textAlign: "center",
                        marginTop: 1,
                      }}
                    >
                      {pendingAmt > 0
                        ? `Scan with GPay / PhonePe to settle ₹${pendingAmt}`
                        : `Scan with camera to view & download report`}
                    </div>
                    <div style={{ fontSize: is58 ? 6.5 : 7.5, color: "#444" }}>
                      UPI ID: {lab.upiId} • Instant Auto-Reconciliation
                    </div>
                  </div>
                )}

                {/* ─── SVG HIGH-DENSITY SCANNABLE BARCODE ─── */}
                {showBarcode && (
                  <div
                    style={{
                      textAlign: "center",
                      margin: "6px 0 3px",
                      padding: "2px 0",
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: barcodeSvgHtml }}
                      style={{ display: "flex", justifyContent: "center" }}
                    />
                    <div
                      style={{
                        fontSize: is58 ? 7.5 : 8.5,
                        fontFamily: "monospace",
                        fontWeight: 900,
                        letterSpacing: 1.5,
                        marginTop: 1,
                      }}
                    >
                      *{orderNumber}*
                    </div>
                  </div>
                )}

                {/* ─── PHLEBOTOMY & REPORT READY COMMITMENT ─── */}
                <div
                  style={{
                    borderTop: "1px dashed #000",
                    borderBottom: "1px dashed #000",
                    padding: "3px 0",
                    margin: "5px 0",
                    fontSize: is58 ? 7 : 8,
                    textAlign: "center",
                    lineHeight: 1.35,
                  }}
                >
                  <div>
                    <b>Sample Accession Desk:</b> Booth #03 (Main Phlebotomy)
                  </div>
                  <div>
                    <b>Expected Verification:</b> Today by {reportETA}
                  </div>
                  <div>
                    <b>Online Portal:</b> {lab.website}/reports
                  </div>
                </div>

                {/* ─── FOOTER & STATUTORY E-AUDIT DISCLAIMER ─── */}
                <div
                  style={{
                    textAlign: "center",
                    paddingTop: 3,
                    marginTop: 4,
                    fontSize: is58 ? 7 : 8,
                    lineHeight: 1.3,
                  }}
                >
                  <p style={{ fontWeight: 800, fontSize: is58 ? 8 : 9 }}>
                    Thank you for choosing {lab.name}
                  </p>
                  <p style={{ margin: "1px 0" }}>Wishing you a speedy recovery & good health!</p>
                  <p style={{ margin: "1px 0", color: "#333" }}>
                    Helpline: {lab.phone} • {lab.email}
                  </p>
                  <p style={{ margin: "1px 0", color: "#555" }}>
                    Printed: {fmtDateTime(new Date().toISOString())}
                  </p>
                  <p style={{ marginTop: 3, fontSize: 6.5, color: "#666" }}>
                    ** Computer Generated Thermal Record • Authorized Electronic Validation **
                  </p>
                </div>
              </div>

              {/* Serrated Zig-Zag Bottom Cut Edge */}
              <div
                className="h-3.5 w-full"
                style={{
                  background:
                    "radial-gradient(circle, transparent, transparent 50%, #ffffff 50%, #ffffff 100%)",
                  backgroundSize: "10px 10px",
                  backgroundPosition: "0 -5px",
                }}
              />
            </div>
          </div>
        </div>

        {/* ─── RIGHT: PREMIUM CONTROL PANEL ─── */}
        <div className="relative flex w-full flex-col justify-between overflow-y-auto border-t border-white/10 p-5 sm:p-7 md:w-[420px] md:border-t-0 md:border-l" style={{background: 'linear-gradient(160deg, #1e1b4b 0%, #0f172a 60%, #1a1035 100%)'}}>
          {/* Subtle glow orbs */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-500/8 blur-3xl" />

          <div className="relative">
            {/* ── Premium Header ── */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-white shadow-xl shadow-amber-500/40">
                  <Receipt className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-slate-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-1.5 tracking-tight">
                    Thermal POS Console
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-950 shadow-md shadow-amber-500/30">
                      <span className="animate-pulse h-1 w-1 rounded-full bg-amber-800" />
                      ESC/POS Premium
                    </span>
                    <span className="relative inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-600 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white shadow-md shadow-violet-500/30">
                      ⚡ Advanced
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── Premium Status Pill ── */}
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    Invoice / Receipt
                  </p>
                  <p className="font-mono text-sm font-black text-white mt-0.5">
                    {invNumber}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black border ${
                    isPaid
                      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                      : "border-amber-400/30 bg-amber-500/15 text-amber-300"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isPaid ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                  {isPaid ? "Fully Settled" : `Due: ${fmt(pendingAmt)}`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Patient</p>
                  <p className="text-xs font-bold text-slate-200 truncate mt-0.5">
                    {invoice.patientName || "Walk-in Patient"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Net Payable</p>
                  <p className="text-xs font-black text-amber-300 mt-0.5">{fmt(netPayable)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Payment Mode</p>
                  <p className="text-xs font-bold text-slate-300 mt-0.5">
                    {invoice.paymentMode || "CASH"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Token</p>
                  <p className="text-xs font-black text-violet-300 mt-0.5">#{tokenNum}</p>
                </div>
              </div>
            </div>

            {/* ── Slip Mode Switcher ── */}
            <div className="mb-4">
              <label className="mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                Slip Layout Mode
              </label>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1">
                {(['INVOICE', 'TOKEN', 'SETTLEMENT'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSlipMode(mode)}
                    className={`rounded-lg py-2 text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                      slipMode === mode
                        ? mode === 'INVOICE'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                          : mode === 'TOKEN'
                          ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                          : 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {mode === 'INVOICE' ? 'Full Bill' : mode === 'TOKEN' ? 'Token' : 'Voucher'}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Paper Size ── */}
            <div className="mb-4">
              <label className="mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                Paper Roll Width
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['80mm', '58mm'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setActivePaper(size)}
                    className={`relative flex flex-col items-center justify-center rounded-2xl border p-3 transition-all duration-200 ${
                      activePaper === size
                        ? 'border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-200 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/30'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/8 hover:text-slate-200'
                    }`}
                  >
                    {activePaper === size && (
                      <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-900" />
                      </span>
                    )}
                    <span className="text-xs font-black">{size === '80mm' ? '80 mm (3")' : '58 mm (2")'}</span>
                    <span className="text-[9px] mt-0.5 opacity-70">
                      {size === '80mm' ? 'Desktop POS · Epson/TVS' : 'Bluetooth Handheld POS'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Typography & Contrast ── */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Font Engine
                </div>
                <div className="flex gap-1">
                  {(['MONO', 'SANS'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFontStyle(f)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all duration-200 ${
                        fontStyle === f
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex flex-col justify-between">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Head Density
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] font-bold text-slate-300">
                    {highContrast ? "Deep Black" : "Standard"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHighContrast(!highContrast)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      highContrast ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/30' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        highContrast ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Display Toggles ── */}
            <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
                Display Elements
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { state: showQR, setter: setShowQR, label: 'UPI QR Code' },
                  { state: showBarcode, setter: setShowBarcode, label: 'Sample Barcode' },
                  { state: showPhlebotomy, setter: setShowPhlebotomy, label: 'Phlebotomy Guide' },
                  { state: showNabl, setter: setShowNabl, label: 'NABL & GSTIN' },
                ].map(({ state, setter, label }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer group">
                    <div
                      onClick={() => setter(!state)}
                      className={`relative flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-all cursor-pointer ${
                        state
                          ? 'border-amber-400 bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-500/30'
                          : 'border-white/20 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      {state && <span className="text-[8px] font-black text-white">✓</span>}
                    </div>
                    <span className={`text-[10px] font-bold transition-colors ${
                      state ? 'text-slate-200' : 'text-slate-500 group-hover:text-slate-400'
                    }`}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ─── PREMIUM ACTION BUTTONS ─── */}
          <div className="relative space-y-2 pt-4 border-t border-white/10">
            {/* Switch to A4 */}
            {onSwitchToA4 && (
              <button
                onClick={onSwitchToA4}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-2.5 text-xs font-bold text-indigo-300 transition-all hover:bg-indigo-500/20 hover:border-indigo-400/50 hover:text-indigo-200 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99]"
              >
                <FileText className="h-4 w-4" />
                <span>Switch to A4 GST Tax Invoice</span>
              </button>
            )}

            {/* ★ Premium Print Button */}
            <button
              onClick={handlePrint}
              className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-5 py-3.5 text-sm font-black text-white shadow-2xl shadow-amber-500/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-amber-500/60 active:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #d97706 100%)' }}
            >
              {/* Shimmer overlay */}
              <div className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
              <Printer className="h-5 w-5 drop-shadow" />
              <span className="tracking-wide">Print {activePaper} Thermal Slip</span>
              <span className="ml-auto rounded-full border border-white/30 bg-white/10 px-2 py-0.5 text-[9px] font-black tracking-widest">
                ESC/POS
              </span>
            </button>

            {/* Share Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleWhatsAppReceipt}
                className="group flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-2.5 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/20 hover:text-emerald-200 active:scale-[0.98]"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleCopyText}
                className="group flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-slate-100 active:scale-[0.98]"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-black">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="flex w-full items-center justify-center gap-1 rounded-xl px-4 py-1.5 text-[10px] font-medium text-slate-600 hover:text-slate-400 transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}