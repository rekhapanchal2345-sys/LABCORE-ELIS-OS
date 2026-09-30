"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import {
  Printer,
  Download,
  Share2,
  Copy,
  Check,
  X,
  Smartphone,
  FileText,
  Receipt as ReceiptIcon,
  ShieldCheck,
  ExternalLink,
  QrCode as QrIcon,
  Building2,
  User,
  Phone,
  Calendar,
  CreditCard,
  Clock,
  Sparkles,
  Info,
  Mail,
  SlidersHorizontal,
  Send,
  ZoomIn,
  ZoomOut,
  Maximize2,
  BadgeCheck,
  Eye,
  EyeOff,
  ChevronDown,
  MessageSquare,
  Scissors,
  CheckCircle2,
  Hash,
} from "lucide-react";

export type ReceiptItem = {
  name: string;
  code?: string;
  department?: string;
  sampleType?: string;
  tubeColor?: string;
  tubeName?: string;
  sacCode?: string;
  price: number;
  discount?: number;
  taxGst?: number;
  netPrice?: number;
};

export type ReceiptPayment = {
  id: string;
  receiptNumber: string;
  orderId?: string;
  orderNumber?: string;
  patientId?: string;
  patientName: string;
  patientUhid?: string;
  patientPhone?: string | null;
  patientEmail?: string | null;
  patientAge?: number | null;
  patientGender?: string | null;
  patientAddress?: string | null;
  patientBloodGroup?: string | null;
  invoiceId?: string;
  invoiceNumber?: string;
  invoiceTotal?: number;
  invoicePaid?: number;
  invoiceBalance?: number;
  amount: number;
  method: "CASH" | "CARD" | "UPI" | "NET_BANKING" | "CHEQUE" | "OTHER";
  status:
    | "PENDING"
    | "PARTIAL"
    | "PARTIALLY_PAID"
    | "PAID"
    | "REFUNDED"
    | "FAILED"
    | "CANCELLED";
  transactionId?: string | null;
  remarks?: string | null;
  paidAt: string;
  createdAt?: string;
  collectedBy?: string;
  counter?: string;
  settlement?: string;
  terminalId?: string;
  bankRrn?: string;
  receivedBy?: {
    id: string;
    fullName: string;
    employeeCode: string;
    role?: string;
  } | null;
  doctorName?: string | null;
  doctorQualification?: string | null;
  doctorRegistrationNo?: string | null;
  branchName?: string | null;
  items?: ReceiptItem[];
  splitDetails?: Array<{
    method: string;
    amount: number;
    transactionId?: string;
  }>;
};

interface PaymentReceiptProps {
  payment: ReceiptPayment;
  onClose?: () => void;
  onOpenViewDetails?: () => void;
}

export function formatCurrency(amount: number) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: string | number) {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return String(date || "—");
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | number) {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return String(date || "—");
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getMethodIcon(method: string) {
  switch (method) {
    case "CASH":
      return "💵";
    case "CARD":
      return "💳";
    case "UPI":
      return "📱";
    case "NET_BANKING":
      return "🏦";
    case "CHEQUE":
      return "🧾";
    default:
      return "💰";
  }
}

// Convert numbers into Indian English Words (Lakhs & Crores)
export function numberToWordsINR(num: number): string {
  if (!num || isNaN(num) || num <= 0) return "Zero Rupees Only";
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const formatTens = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
  };

  const formatHundreds = (n: number): string => {
    if (n === 0) return "";
    let str = "";
    if (Math.floor(n / 100) > 0) {
      str += a[Math.floor(n / 100)] + " Hundred";
      if (n % 100 !== 0) str += " and ";
    }
    str += formatTens(n % 100);
    return str;
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  const crore = Math.floor(integerPart / 10000000);
  let remainder = integerPart % 10000000;
  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  const thousand = Math.floor(remainder / 1000);
  const hundred = remainder % 1000;

  let words = "";
  if (crore > 0) words += formatHundreds(crore) + " Crore ";
  if (lakh > 0) words += formatHundreds(lakh) + " Lakh ";
  if (thousand > 0) words += formatHundreds(thousand) + " Thousand ";
  if (hundred > 0) words += formatHundreds(hundred) + " ";

  words = words.trim();
  if (!words) words = "Zero";

  let result = words + " Rupees";
  if (decimalPart > 0) {
    result += " and " + formatHundreds(decimalPart) + " Paise";
  }
  return result + " Only";
}

// Generate deterministic crisp SVG barcode bars
function BarcodeSvg({ value, height = 36 }: { value: string; height?: number }) {
  const bars = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    const widths: number[] = [];
    let state = Math.abs(hash) || 1234567;
    for (let i = 0; i < 34; i++) {
      state = (state * 1664525 + 1013904223) % 4294967296;
      widths.push((state % 3) + 1);
    }
    return widths;
  }, [value]);

  return (
    <div className="flex flex-col items-center select-none">
      <div className="flex items-center gap-[1.5px] bg-white px-1 py-0.5 rounded" style={{ height }}>
        {bars.map((w, i) => (
          <span
            key={i}
            className="bg-slate-900 h-full inline-block"
            style={{ width: `${w}px` }}
          />
        ))}
      </div>
      <span className="text-[9px] font-mono tracking-widest text-slate-600 mt-0.5">
        *{value.toUpperCase()}*
      </span>
    </div>
  );
}

export default function PaymentReceipt({
  payment,
  onClose,
  onOpenViewDetails,
}: PaymentReceiptProps) {
  const [activeFormat, setActiveFormat] = useState<
    "A4" | "THERMAL" | "WHATSAPP" | "EMAIL" | "SMS"
  >("A4");
  const [thermalWidth, setThermalWidth] = useState<"80mm" | "58mm">("80mm");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [upiQrCodeDataUrl, setUpiQrCodeDataUrl] = useState<string>("");
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Customization Toggles
  const [showItemRates, setShowItemRates] = useState(true);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(true);
  const [showWatermarkStamp, setShowWatermarkStamp] = useState(true);
  const [showBarcodes, setShowBarcodes] = useState(true);
  const [showAmountInWords, setShowAmountInWords] = useState(true);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Email state
  const [recipientEmail, setRecipientEmail] = useState(
    payment.patientEmail || "patient@example.com"
  );
  const [emailSubject, setEmailSubject] = useState(
    `LabCore Diagnostics Receipt #${payment.receiptNumber} - Payment Confirmation`
  );
  const [emailSending, setEmailSending] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  // Thermal Cut Animation simulation
  const [isSimulatingCut, setIsSimulatingCut] = useState(false);

  const a4Ref = useRef<HTMLDivElement>(null);
  const thermalRef = useRef<HTMLDivElement>(null);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Fallback / default items if not provided by backend
  const displayItems: ReceiptItem[] =
    payment.items && payment.items.length > 0
      ? payment.items
      : [
          {
            name: "Complete Blood Count (CBC) with 5-Part Differential",
            code: "HEM-01",
            department: "Hematology",
            sampleType: "Whole Blood EDTA",
            tubeColor: "#8b5cf6",
            tubeName: "Lavender EDTA",
            sacCode: "999312",
            price: payment.amount >= 1500 ? 550 : payment.amount,
            discount: 0,
            taxGst: 0,
            netPrice: payment.amount >= 1500 ? 550 : payment.amount,
          },
          ...(payment.amount > 600
            ? [
                {
                  name: "HbA1c (Glycosylated Hemoglobin) by HPLC Gold Standard",
                  code: "BIO-04",
                  department: "Biochemistry",
                  sampleType: "Fluoride Plasma",
                  tubeColor: "#64748b",
                  tubeName: "Grey Fluoride",
                  sacCode: "999312",
                  price: Math.min(650, Math.max(0, payment.amount - 550)),
                  discount: 0,
                  taxGst: 0,
                  netPrice: Math.min(650, Math.max(0, payment.amount - 550)),
                },
              ]
            : []),
          ...(payment.amount > 1400
            ? [
                {
                  name: "Comprehensive Lipid Profile with Cardiac Risk Ratios",
                  code: "BIO-08",
                  department: "Biochemistry",
                  sampleType: "Serum Gel SST",
                  tubeColor: "#eab308",
                  tubeName: "Gold Gel SST",
                  sacCode: "999312",
                  price: Math.max(0, payment.amount - 1200),
                  discount: 0,
                  taxGst: 0,
                  netPrice: Math.max(0, payment.amount - 1200),
                },
              ]
            : []),
        ];

  const cashierName =
    payment.receivedBy?.fullName || payment.collectedBy || "Jaya Ashapurama";
  const cashierCode = payment.receivedBy?.employeeCode || "EMP-104";
  const counterName = payment.counter || "Counter 01";
  const branchLocation =
    payment.branchName || "Main Diagnostic Center • Indiranagar, Bengaluru";
  const doctorReferral = payment.doctorName || "Self / Direct Walk-in";
  const doctorReg = payment.doctorRegistrationNo || "MCI-48291";

  // Balance computation
  const invoiceTotal = payment.invoiceTotal || payment.amount;
  const balanceDue = payment.invoiceBalance ?? Math.max(0, invoiceTotal - payment.amount);

  // Generate Verification QR and Dynamic UPI QR
  useEffect(() => {
    let isMounted = true;

    const generateQRs = async () => {
      try {
        // Verification QR (Audit traceability)
        const verifyData = `https://labcore-elis.cloud/verify-receipt?rec=${encodeURIComponent(
          payment.receiptNumber
        )}&tx=${encodeURIComponent(payment.transactionId || payment.id)}&amt=${payment.amount}`;
        const verifyUrl = await QRCode.toDataURL(verifyData, {
          width: 140,
          margin: 1,
          color: { dark: "#0f2d52", light: "#ffffff" },
        });

        // UPI Payment QR (for remaining balance clearance or payment verification)
        const upiPayAmount = balanceDue > 0 ? balanceDue : payment.amount;
        const upiPayString = `upi://pay?pa=labcore@icici&pn=LabCore%20Diagnostics&am=${upiPayAmount}&cu=INR&tn=REC-${encodeURIComponent(
          payment.receiptNumber
        )}`;
        const upiUrl = await QRCode.toDataURL(upiPayString, {
          width: 160,
          margin: 1,
          color: { dark: "#0f2d52", light: "#ffffff" },
        });

        if (isMounted) {
          setQrCodeDataUrl(verifyUrl);
          setUpiQrCodeDataUrl(upiUrl);
        }
      } catch (err) {
        console.error("Error generating receipt QR codes:", err);
      }
    };

    generateQRs();
    return () => {
      isMounted = false;
    };
  }, [payment, balanceDue]);

  // Copy receipt summary text
  const handleCopyText = async () => {
    const summaryText = `*LabCore Diagnostics - Official Tax Receipt*
----------------------------------------
Receipt No: ${payment.receiptNumber}
Date & Time: ${formatDateTime(payment.paidAt)}
Patient Name: ${payment.patientName}
UHID: ${payment.patientUhid || "UHID-N/A"}
Order No: ${payment.orderNumber || "ORD-N/A"}
Invoice No: ${payment.invoiceNumber || "INV-N/A"}
Amount Paid: ${formatCurrency(payment.amount)} (${numberToWordsINR(payment.amount)})
Balance Due: ${balanceDue > 0 ? formatCurrency(balanceDue) : "PAID IN FULL"}
Payment Mode: ${payment.method}
Status: ${payment.status}
Cashier: ${cashierName} (${counterName})
Ref Doctor: ${doctorReferral}
Branch: ${branchLocation}
----------------------------------------
Track Online & Download Reports: https://labcore-elis.cloud/verify-receipt?rec=${payment.receiptNumber}`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Receipt text copied to clipboard!");
    }
  };

  // Copy share link
  const handleCopyLink = async () => {
    const link = `https://labcore-elis.cloud/verify-receipt?rec=${payment.receiptNumber}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      alert("Receipt link copied!");
    }
  };

  // WhatsApp Share Action
  const handleShareWhatsApp = () => {
    const rawPhone = (payment.patientPhone || "").replace(/\D/g, "");
    const phoneWithCountry =
      rawPhone.length === 10
        ? `91${rawPhone}`
        : rawPhone.length === 12
        ? rawPhone
        : "";

    const message = encodeURIComponent(
      `*Hello ${payment.patientName},*\n\nThank you for choosing *LabCore Enterprise Diagnostics*.\nYour payment of *${formatCurrency(
        payment.amount
      )}* (${numberToWordsINR(payment.amount)}) has been successfully confirmed.\n\n📄 *Receipt No:* ${payment.receiptNumber}\n🔢 *Transaction ID:* ${
        payment.transactionId || payment.id
      }\n📅 *Date & Time:* ${formatDateTime(payment.paidAt)}\n💳 *Payment Mode:* ${payment.method}\n🏥 *Order No:* ${
        payment.orderNumber || "N/A"
      }\n💰 *Balance Due:* ${balanceDue > 0 ? formatCurrency(balanceDue) : "₹0.00 (PAID IN FULL)"}\n\n🔗 *Download Official PDF Receipt & Track Reports:* \nhttps://labcore-elis.cloud/verify-receipt?rec=${
        payment.receiptNumber
      }\n\n_LabCore Diagnostics • NABL ISO 15189 Accredited_`
    );

    const whatsappUrl = phoneWithCountry
      ? `https://wa.me/${phoneWithCountry}?text=${message}`
      : `https://wa.me/?text=${message}`;

    window.open(whatsappUrl, "_blank");
  };

  // Simulate Email Receipt send
  const handleSendEmail = () => {
    if (!recipientEmail) {
      alert("Please enter a valid recipient email.");
      return;
    }
    setEmailSending(true);
    setTimeout(() => {
      setEmailSending(false);
      setEmailSentSuccess(true);
      setTimeout(() => setEmailSentSuccess(false), 4000);
    }, 1200);
  };

  // Trigger Thermal Paper Cut simulation
  const handleSimulateCut = () => {
    setIsSimulatingCut(true);
    setTimeout(() => setIsSimulatingCut(false), 1500);
  };

  // Browser Print handler
  const handlePrint = () => {
    const targetEl =
      activeFormat === "THERMAL" ? thermalRef.current : a4Ref.current;
    if (!targetEl) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print receipt.");
      return;
    }

    const isThermal = activeFormat === "THERMAL";
    const rollWidth = thermalWidth === "58mm" ? "58mm" : "80mm";
    const printableWidth = thermalWidth === "58mm" ? "54mm" : "76mm";

    const cssStyles = `
      @page {
        size: ${isThermal ? `${rollWidth} auto` : "A4 portrait"};
        margin: ${isThermal ? "1mm" : "8mm"};
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        margin: 0;
        padding: ${isThermal ? "2px" : "12px"};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #0f172a;
        background: #ffffff;
      }
      .no-print { display: none !important; }
      ${isThermal ? `.thermal-slip { width: ${printableWidth} !important; margin: 0 auto; font-family: monospace !important; }` : ""}
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt_${payment.receiptNumber}</title>
          <style>${cssStyles}</style>
        </head>
        <body>
          <div class="${isThermal ? "thermal-slip" : "a4-container"}">
            ${targetEl.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 350);
  };

  // High-Resolution jsPDF Vector PDF Download
  const handleDownloadPDF = async () => {
    try {
      setLoadingPdf(true);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Top Navy Header Banner
      pdf.setFillColor(15, 45, 82);
      pdf.rect(0, 0, pageWidth, 40, "F");

      // Brand Logo & Name
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.text("LABCORE DIAGNOSTICS", 14, 16);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(200, 220, 245);
      pdf.text(
        "NABL ACCREDITED LAB (ISO 15189:2022) • GSTIN: 24AABCL8891C1Z4",
        14,
        23
      );
      pdf.text(
        "Indiranagar, Bengaluru • Helplines: 1800-419-5222 • contact@labcore.com",
        14,
        29
      );

      // Top Right Document Title Box
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(pageWidth - 68, 8, 54, 24, 2, 2, "F");
      pdf.setTextColor(15, 45, 82);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("OFFICIAL TAX RECEIPT", pageWidth - 41, 15, { align: "center" });

      pdf.setFontSize(8.5);
      pdf.setTextColor(100, 116, 139);
      pdf.setFont("helvetica", "normal");
      pdf.text(payment.receiptNumber, pageWidth - 41, 21, { align: "center" });
      pdf.setFontSize(7.5);
      pdf.text(formatDate(payment.paidAt), pageWidth - 41, 27, { align: "center" });

      // Demographics Section
      let yPos = 48;
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(14, yPos, pageWidth - 28, 30, 2, 2, "FD");

      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 45, 82);
      pdf.text("PATIENT & INVOICE DETAILS", 18, yPos + 6);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);

      // Left Column
      pdf.text(`Patient Name: ${payment.patientName}`, 18, yPos + 12);
      pdf.text(`UHID: ${payment.patientUhid || "—"}`, 18, yPos + 17);
      pdf.text(
        `Age / Gender: ${payment.patientAge ? `${payment.patientAge} Yrs` : "—"} / ${payment.patientGender || "—"}`,
        18,
        yPos + 22
      );
      pdf.text(`Phone: ${payment.patientPhone || "—"}`, 18, yPos + 27);

      // Right Column
      const rCol = pageWidth / 2 + 8;
      pdf.text(`Order Number: ${payment.orderNumber || "—"}`, rCol, yPos + 12);
      pdf.text(`Invoice Ref: ${payment.invoiceNumber || "—"}`, rCol, yPos + 17);
      pdf.text(`Ref Doctor: ${doctorReferral}`, rCol, yPos + 22);
      pdf.text(
        `Payment Mode: ${payment.method} (${payment.status})`,
        rCol,
        yPos + 27
      );

      // Items Table Header
      yPos += 36;
      pdf.setFillColor(241, 245, 249);
      pdf.rect(14, yPos, pageWidth - 28, 8, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(30, 41, 59);

      pdf.text("#", 18, yPos + 5.5);
      pdf.text("Investigation / Clinical Test Name", 26, yPos + 5.5);
      pdf.text("SAC Code", 108, yPos + 5.5);
      pdf.text("Department", 132, yPos + 5.5);
      pdf.text("Amount (INR)", pageWidth - 18, yPos + 5.5, { align: "right" });

      // Items Table Rows
      yPos += 8;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);

      displayItems.forEach((item, index) => {
        if (index % 2 === 1) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(14, yPos, pageWidth - 28, 8, "F");
        }

        pdf.setTextColor(100, 116, 139);
        pdf.text(String(index + 1), 18, yPos + 5.5);

        pdf.setTextColor(15, 23, 42);
        pdf.setFont("helvetica", "bold");
        pdf.text(item.name.slice(0, 48), 26, yPos + 5.5);

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 116, 139);
        pdf.text(item.sacCode || "999312", 108, yPos + 5.5);
        pdf.text(item.department || "Pathology", 132, yPos + 5.5);

        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(15, 23, 42);
        pdf.text(formatCurrency(item.price), pageWidth - 18, yPos + 5.5, {
          align: "right",
        });

        yPos += 8;
      });

      yPos += 6;

      // Amount in Words
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(14, yPos, pageWidth - 28, 12, 1.5, 1.5, "FD");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(15, 45, 82);
      pdf.text("Amount in Words:", 18, yPos + 5);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(51, 65, 85);
      pdf.text(numberToWordsINR(payment.amount), 18, yPos + 9);

      yPos += 18;

      // Financial Calculation Block
      const calcBoxWidth = 85;
      const calcBoxX = pageWidth - 14 - calcBoxWidth;
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(calcBoxX, yPos, calcBoxWidth, 38, 2, 2, "FD");

      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 116, 139);
      pdf.text("Order Grand Total:", calcBoxX + 6, yPos + 8);
      pdf.setTextColor(15, 23, 42);
      pdf.setFont("helvetica", "bold");
      pdf.text(formatCurrency(invoiceTotal), pageWidth - 20, yPos + 8, {
        align: "right",
      });

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 116, 139);
      pdf.text("Amount Received (This Receipt):", calcBoxX + 6, yPos + 17);
      pdf.setTextColor(16, 149, 83);
      pdf.setFont("helvetica", "bold");
      pdf.text(formatCurrency(payment.amount), pageWidth - 20, yPos + 17, {
        align: "right",
      });

      pdf.setDrawColor(203, 213, 225);
      pdf.line(calcBoxX + 6, yPos + 22, pageWidth - 20, yPos + 22);

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(
        balanceDue > 0 ? 220 : 16,
        balanceDue > 0 ? 38 : 149,
        balanceDue > 0 ? 38 : 83
      );
      pdf.text(
        balanceDue > 0 ? "Outstanding Balance Due:" : "Balance Due: PAID IN FULL",
        calcBoxX + 6,
        yPos + 30
      );
      pdf.text(formatCurrency(balanceDue), pageWidth - 20, yPos + 30, {
        align: "right",
      });

      // Verification QR Code on Left
      if (qrCodeDataUrl) {
        try {
          pdf.addImage(qrCodeDataUrl, "PNG", 18, yPos, 34, 34);
          pdf.setFontSize(7.5);
          pdf.setTextColor(100, 116, 139);
          pdf.setFont("helvetica", "normal");
          pdf.text("Scan QR Code to verify clinical", 18, yPos + 39);
          pdf.text("authenticity & download digital report", 18, yPos + 43);
        } catch {
          // ignore qr image issue
        }
      }

      // Bottom Digital Signatures & Stamp
      yPos = pageHeight - 35;
      pdf.setDrawColor(226, 232, 240);
      pdf.line(14, yPos, pageWidth - 14, yPos);

      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "Services exempt from GST under Notification No. 12/2017 - Central Tax (Health Care Services).",
        14,
        yPos + 5
      );
      pdf.text(
        `Authorized Cashier: ${cashierName} (${cashierCode})  •  Counter: ${counterName}`,
        14,
        yPos + 10
      );

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 45, 82);
      pdf.text("LABCORE CLINICAL REVENUE SEAL", pageWidth - 14, yPos + 10, {
        align: "right",
      });
      pdf.setFont("helvetica", "normal");
      pdf.text("Digitally Verified at Point of Sale", pageWidth - 14, yPos + 15, {
        align: "right",
      });

      pdf.save(`LabCore_Receipt_${payment.receiptNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[95vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 sm:px-6 py-3">
          {/* Format Tabs Switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-200/80 p-1 text-xs font-semibold text-slate-700">
            <button
              type="button"
              onClick={() => setActiveFormat("A4")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                activeFormat === "A4"
                  ? "bg-white text-blue-950 shadow-sm font-bold"
                  : "hover:text-slate-950"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Clinical A4</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormat("THERMAL")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                activeFormat === "THERMAL"
                  ? "bg-white text-blue-950 shadow-sm font-bold"
                  : "hover:text-slate-950"
              }`}
            >
              <ReceiptIcon className="h-3.5 w-3.5" />
              <span>Thermal POS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormat("WHATSAPP")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                activeFormat === "WHATSAPP"
                  ? "bg-white text-emerald-700 shadow-sm font-bold"
                  : "hover:text-slate-950"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormat("EMAIL")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                activeFormat === "EMAIL"
                  ? "bg-white text-blue-700 shadow-sm font-bold"
                  : "hover:text-slate-950"
              }`}
            >
              <Mail className="h-3.5 w-3.5 text-blue-600" />
              <span>Email</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormat("SMS")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                activeFormat === "SMS"
                  ? "bg-white text-indigo-700 shadow-sm font-bold"
                  : "hover:text-slate-950"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
              <span>SMS</span>
            </button>
          </div>

          {/* Action Tools & Customizer Toggle */}
          <div className="flex items-center gap-2">
            {onOpenViewDetails && (
              <button
                type="button"
                onClick={onOpenViewDetails}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100 transition"
                title="Inspect transaction audit & ledger"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>View Details</span>
              </button>
            )}

            {activeFormat === "THERMAL" && (
              <div className="flex items-center rounded-xl bg-slate-200/80 p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setThermalWidth("80mm")}
                  className={`px-2 py-1 rounded-lg ${
                    thermalWidth === "80mm"
                      ? "bg-white font-bold text-slate-900 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  80mm
                </button>
                <button
                  type="button"
                  onClick={() => setThermalWidth("58mm")}
                  className={`px-2 py-1 rounded-lg ${
                    thermalWidth === "58mm"
                      ? "bg-white font-bold text-slate-900 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  58mm
                </button>
              </div>
            )}

            {activeFormat === "A4" && (
              <button
                type="button"
                onClick={() => setShowCustomizer(!showCustomizer)}
                className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
                  showCustomizer
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                title="Toggle receipt display fields"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Customize</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-900 hover:bg-blue-100 active:scale-95 transition"
              title="Print receipt directly"
            >
              <Printer className="h-3.5 w-3.5 text-blue-700" />
              Print
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={loadingPdf}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f2d52] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-900 disabled:opacity-50 active:scale-95 transition"
            >
              <Download className="h-3.5 w-3.5" />
              {loadingPdf ? "PDF..." : "PDF"}
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 active:scale-95 transition"
              title="Send to patient via WhatsApp"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 active:scale-95 transition"
              title="Copy receipt summary text"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95 transition"
                title="Close (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Customization Toolbar */}
        {showCustomizer && activeFormat === "A4" && (
          <div className="flex flex-wrap items-center gap-4 px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 text-xs text-slate-700 animate-in slide-in-from-top-2">
            <span className="font-bold text-blue-950 uppercase text-[10px] tracking-wider flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3 text-blue-700" /> Display Controls:
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showItemRates}
                onChange={(e) => setShowItemRates(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0"
              />
              <span>Test Item Rates</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showTaxBreakdown}
                onChange={(e) => setShowTaxBreakdown(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0"
              />
              <span>SAC & Tax Summary</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showAmountInWords}
                onChange={(e) => setShowAmountInWords(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0"
              />
              <span>Amount in Words</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showWatermarkStamp}
                onChange={(e) => setShowWatermarkStamp(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0"
              />
              <span>Verification Stamp</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showBarcodes}
                onChange={(e) => setShowBarcodes(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0"
              />
              <span>Accession Barcode</span>
            </label>
          </div>
        )}

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto bg-slate-100/70 p-4 sm:p-6">
          {/* FORMAT 1: CLINICAL A4 INVOICE */}
          {activeFormat === "A4" && (
            <div
              ref={a4Ref}
              style={{
                transform: zoomLevel === 85 ? "scale(0.88)" : "scale(1)",
                transformOrigin: "top center",
                transition: "transform 0.2s ease",
              }}
              className="relative mx-auto max-w-3xl rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-slate-200 text-slate-800"
            >
              {/* LabCore Clinical Letterhead */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-[#0f2d52] pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2d52] to-[#1e5a9a] text-white shadow-md">
                    <span className="text-2xl font-black">🔬</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black tracking-tight text-[#0f2d52]">
                        LabCore Diagnostics
                      </h1>
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                        NABL ISO 15189
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                      Enterprise Pathology & Molecular Research LIS
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      GSTIN: 24AABCL8891C1Z4 • Emergency Helpdesk: 1800-419-5222 • {branchLocation}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#0f2d52] ring-1 ring-blue-200">
                    Official Tax Receipt
                  </span>
                  <div className="mt-2 text-sm font-bold font-mono text-slate-900">
                    {payment.receiptNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {formatDateTime(payment.paidAt)}
                  </div>

                  {/* Accession Barcode */}
                  {showBarcodes && (
                    <div className="mt-2 flex flex-col items-start sm:items-end">
                      <BarcodeSvg value={payment.receiptNumber} height={30} />
                    </div>
                  )}
                </div>
              </div>

              {/* Patient & Billing Information Card */}
              <div className="mt-5 grid gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2 text-xs">
                {/* Left: Patient Details */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-900 flex items-center justify-between">
                    <span>Patient Demographics</span>
                    <span className="font-mono text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                      {payment.patientUhid || "UHID-N/A"}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {payment.patientName}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span>
                      {payment.patientAge ? `${payment.patientAge} Years` : "—"} /{" "}
                      {payment.patientGender || "—"}
                    </span>
                    {payment.patientBloodGroup && (
                      <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded ring-1 ring-rose-200">
                        {payment.patientBloodGroup}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{payment.patientPhone || "No Phone Registered"}</span>
                  </div>
                  <div className="text-slate-600 pt-1">
                    Ref Doctor:{" "}
                    <strong className="text-slate-900">
                      {doctorReferral}
                    </strong>
                    {payment.doctorQualification && (
                      <span className="text-slate-500 text-[11px] block">
                        {payment.doctorQualification} • Reg: {doctorReg}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Invoice & Billing Details */}
                <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                    Billing Specifications
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order Number:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {payment.orderNumber || "ORD-N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invoice Number:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {payment.invoiceNumber || "INV-N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction ID / UTR:</span>
                    <span className="font-mono text-slate-800 truncate max-w-[150px]">
                      {payment.transactionId || payment.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="inline-flex items-center gap-1 rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-bold text-slate-800">
                      <span>{getMethodIcon(payment.method)}</span>
                      {payment.method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cashier Desk:</span>
                    <span className="text-slate-800">
                      {cashierName} ({counterName})
                    </span>
                  </div>
                </div>
              </div>

              {/* Itemized Investigations Table */}
              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Diagnostic Investigation</th>
                      {showTaxBreakdown && <th className="py-2.5 px-3">SAC Code</th>}
                      <th className="py-2.5 px-3">Department & Specimen</th>
                      {showItemRates && (
                        <th className="py-2.5 px-3 text-right">Standard Rate</th>
                      )}
                      <th className="py-2.5 px-3 text-right">Net Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">
                            {item.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            Code: {item.code || "LAB-01"}
                          </div>
                        </td>
                        {showTaxBreakdown && (
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {item.sacCode || "999312"}
                          </td>
                        )}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            {item.tubeColor && (
                              <span
                                className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10 shrink-0"
                                style={{ backgroundColor: item.tubeColor }}
                                title={item.tubeName || item.sampleType}
                              />
                            )}
                            <span className="font-medium text-slate-700">
                              {item.department || "Pathology"}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            {item.sampleType || "Blood"}
                          </span>
                        </td>
                        {showItemRates && (
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                            {formatCurrency(item.price)}
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(item.netPrice || item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Amount In Words */}
              {showAmountInWords && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/80 p-2.5 text-xs text-slate-700 flex items-start gap-2">
                  <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider shrink-0 mt-0.5">
                    Amount In Words:
                  </span>
                  <span className="font-semibold italic text-blue-950">
                    {numberToWordsINR(payment.amount)}
                  </span>
                </div>
              )}

              {/* Financial Calculation & Verification QR Block */}
              <div className="mt-5 grid gap-4 sm:grid-cols-2 items-center">
                {/* Left: Dynamic Verification / UPI QR Code */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 flex items-center gap-3.5">
                  {qrCodeDataUrl ? (
                    <img
                      src={balanceDue > 0 && upiQrCodeDataUrl ? upiQrCodeDataUrl : qrCodeDataUrl}
                      alt="Receipt QR"
                      className="h-20 w-20 rounded-lg border border-white bg-white p-1 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-slate-200 animate-pulse shrink-0" />
                  )}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1 font-bold text-[#0f2d52]">
                      <ShieldCheck className="h-4 w-4 text-blue-700" />
                      <span>
                        {balanceDue > 0 ? "Instant UPI Pay QR" : "NABL Digital Traceability"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {balanceDue > 0
                        ? `Scan with GPay/PhonePe to clear pending balance of ${formatCurrency(balanceDue)}.`
                        : "Scan this QR code to authenticate clinical records and download diagnostic test reports."}
                    </p>
                    <div className="pt-0.5 font-mono text-[10px] text-blue-800">
                      Auth Code: {payment.transactionId || `AUTH-${payment.id.slice(-6)}`}
                    </div>
                  </div>
                </div>

                {/* Right: Financial Reconciliation Card */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Order Grand Total:</span>
                    <strong className="font-mono text-slate-900 text-sm">
                      {formatCurrency(invoiceTotal)}
                    </strong>
                  </div>

                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Amount Received (This Receipt):</span>
                    <span className="font-mono text-base text-emerald-700">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-1.5 flex justify-between font-extrabold text-sm">
                    <span className="text-slate-700">Balance Due:</span>
                    <span
                      className={
                        balanceDue > 0 ? "text-rose-600 font-mono" : "text-emerald-700 font-mono"
                      }
                    >
                      {balanceDue > 0 ? formatCurrency(balanceDue) : "₹0.00 (PAID IN FULL)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Official Rubber Stamp Watermark */}
              {showWatermarkStamp && (
                <div className="my-6 flex items-center justify-center">
                  <div className="relative inline-flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-600/70 bg-emerald-50/40 px-6 py-2.5 text-center text-emerald-800 shadow-sm rotate-[-2deg]">
                    <div className="flex items-center gap-1.5 text-xs font-black tracking-widest uppercase text-emerald-900">
                      <BadgeCheck className="h-4 w-4 text-emerald-700" />
                      LABCORE REVENUE RECOGNIZED • PAID
                    </div>
                    <div className="text-[10px] font-mono text-emerald-700">
                      NABL ACCREDITED MC-2849 • DATE: {formatDate(payment.paidAt)} • {counterName}
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Terms & Signatures */}
              <div className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-[11px] text-center sm:text-left">
                  <p>• Healthcare and clinical diagnostic services are exempt under GST Notification No. 12/2017.</p>
                  <p>• Turnaround time for reports is subject to testing methodology. Reports accessible at portal.</p>
                  <p className="text-[10px] text-slate-400">
                    Authorized Cashier: {cashierName} ({cashierCode}) • Computer Generated Receipt
                  </p>
                </div>

                <div className="text-center sm:text-right shrink-0 space-y-1">
                  <div className="font-serif italic text-base text-blue-950 font-bold">
                    Dr. Rajesh Vora
                  </div>
                  <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    Chief Pathologist & Authorized Signatory
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    Reg No: {doctorReg} • LabCore LIS
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FORMAT 2: THERMAL POS RECEIPT */}
          {activeFormat === "THERMAL" && (
            <div className="flex flex-col items-center justify-center">
              {/* Width & Action bar for Thermal */}
              <div className="mb-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateCut}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition"
                >
                  <Scissors className="h-3.5 w-3.5 text-slate-500" />
                  <span>Simulate Paper Cut</span>
                </button>
              </div>

              {/* Thermal Slip */}
              <div
                ref={thermalRef}
                style={{
                  width: thermalWidth === "58mm" ? "260px" : "340px",
                  transition: "all 0.3s ease",
                }}
                className={`relative rounded-lg bg-white p-4 shadow-2xl border border-slate-300 font-mono text-xs text-slate-900 ${
                  isSimulatingCut ? "translate-y-2 opacity-90" : ""
                }`}
              >
                {/* Thermal Header */}
                <div className="text-center space-y-1 border-b border-dashed border-slate-400 pb-3">
                  <div className="font-black text-sm tracking-tight">
                    LABCORE DIAGNOSTICS
                  </div>
                  <div className="text-[10px] leading-tight text-slate-600">
                    ISO 15189:2022 • NABL ACCREDITED
                    <br />
                    Indiranagar, Bengaluru
                    <br />
                    Helpline: 1800-419-5222
                  </div>
                  <div className="pt-1 text-[11px] font-bold">
                    ** PAYMENT RECEIPT **
                  </div>
                </div>

                {/* Info Block */}
                <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Receipt:</span>
                    <span className="font-bold">{payment.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formatDateTime(payment.paidAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Patient:</span>
                    <span className="font-bold truncate max-w-[170px]">
                      {payment.patientName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>UHID:</span>
                    <span>{payment.patientUhid || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order #:</span>
                    <span>{payment.orderNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span>{cashierName}</span>
                  </div>
                </div>

                {/* Items Mini Table */}
                <div className="py-2 border-b border-dashed border-slate-400">
                  <div className="flex justify-between font-bold text-[10px] pb-1">
                    <span>ITEM / TEST</span>
                    <span>AMOUNT</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    {displayItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-start gap-2">
                        <span className="truncate max-w-[190px]">
                          {i + 1}. {item.name}
                        </span>
                        <span className="font-bold shrink-0">
                          {formatCurrency(item.netPrice || item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(invoiceTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm">
                    <span>PAID ({payment.method}):</span>
                    <span>{formatCurrency(payment.amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[11px]">
                    <span>Balance Due:</span>
                    <span>{balanceDue > 0 ? formatCurrency(balanceDue) : "₹0.00"}</span>
                  </div>
                </div>

                {/* QR Code in Thermal */}
                <div className="py-3 flex flex-col items-center justify-center text-center">
                  {upiQrCodeDataUrl && (
                    <img
                      src={balanceDue > 0 ? upiQrCodeDataUrl : qrCodeDataUrl}
                      alt="QR"
                      className="h-24 w-24 p-1"
                    />
                  )}
                  <span className="text-[9px] text-slate-500 mt-1">
                    {balanceDue > 0 ? "Scan to Pay Balance" : "Scan to Download Report"}
                  </span>
                </div>

                {/* Barcode in Thermal */}
                <div className="pt-1 pb-3 flex flex-col items-center">
                  <BarcodeSvg value={payment.receiptNumber} height={26} />
                </div>

                {/* Thermal Footer */}
                <div className="text-center text-[10px] text-slate-500 space-y-1 border-t border-dashed border-slate-400 pt-2">
                  <p>*** THANK YOU ***</p>
                  <p>For inquiries: support@labcore.com</p>
                  <p>Reports: labcore-elis.cloud</p>
                  <div className="pt-2 text-[9px] text-slate-400">
                    - - - - - - - - - - - - - - - ✂ - - - - - - - - - - - - - - -
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FORMAT 3: WHATSAPP SHARE PREVIEW & SENDER */}
          {activeFormat === "WHATSAPP" && (
            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-3xl bg-slate-900 p-4 shadow-2xl border-4 border-slate-800">
                {/* Smartphone Screen Mockup */}
                <div className="rounded-2xl bg-[#0b141a] p-3 text-white">
                  {/* WhatsApp Top Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                        LC
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          <span>LabCore Diagnostics</span>
                          <BadgeCheck className="h-3 w-3 text-emerald-400" />
                        </div>
                        <div className="text-[10px] text-emerald-400">
                          Official Business Account
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400">9:41 AM</div>
                  </div>

                  {/* WhatsApp Message Bubble */}
                  <div className="mt-3 rounded-2xl rounded-tl-none bg-[#202c33] p-3.5 text-xs text-slate-200 space-y-2 shadow-md">
                    <p>
                      Hello <strong>{payment.patientName}</strong>, 👋
                    </p>
                    <p>
                      Your payment of{" "}
                      <strong className="text-emerald-400 font-bold">
                        {formatCurrency(payment.amount)}
                      </strong>{" "}
                      has been confirmed at <strong>LabCore Diagnostics</strong>.
                    </p>

                    <div className="rounded-xl bg-[#111b21] p-2.5 border border-white/5 space-y-1 font-mono text-[11px]">
                      <div>📄 Receipt No: {payment.receiptNumber}</div>
                      <div>🏥 Order No: {payment.orderNumber || "ORD-N/A"}</div>
                      <div>💳 Payment Mode: {payment.method}</div>
                      <div>
                        💰 Balance:{" "}
                        <span className={balanceDue > 0 ? "text-amber-400" : "text-emerald-400"}>
                          {balanceDue > 0 ? formatCurrency(balanceDue) : "₹0.00 (PAID)"}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-emerald-950/50 border border-emerald-800/40 p-2.5 text-[11px] text-emerald-300">
                      <strong>🔗 Download Official Tax Receipt & Reports:</strong>
                      <div className="truncate text-emerald-400 underline font-medium">
                        https://labcore-elis.cloud/verify-receipt?rec={payment.receiptNumber}
                      </div>
                    </div>

                    <div className="text-right text-[10px] text-slate-400 flex items-center justify-end gap-1">
                      <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="text-blue-400 font-bold">✓✓</span>
                    </div>
                  </div>

                  {/* Direct Actions */}
                  <div className="mt-4 space-y-2">
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 active:scale-95 transition"
                    >
                      <Share2 className="h-4 w-4" />
                      Send to Patient WhatsApp ({payment.patientPhone || "Now"})
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      Copy Formatted Message Text
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FORMAT 4: EMAIL RECEIPT DISPATCH */}
          {activeFormat === "EMAIL" && (
            <div className="flex justify-center">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Email Official Tax Receipt</h3>
                    <p className="text-[11px] text-slate-500">
                      Dispatches high-resolution PDF and verified download credentials
                    </p>
                  </div>
                </div>

                {emailSentSuccess && (
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Official Tax Receipt successfully emailed to <strong>{recipientEmail}</strong>!</span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Recipient Email Address
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600 space-y-1.5">
                    <div className="font-bold text-slate-800">Dispatch Package Components:</div>
                    <p>• High-Resolution Vector PDF: <code>LabCore_Receipt_{payment.receiptNumber}.pdf</code></p>
                    <p>• Verified Patient UHID: <code>{payment.patientUhid || "UHID-N/A"}</code></p>
                    <p>• Live Online Report Tracking & NABL Verification Link</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={emailSending}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-700 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-600 disabled:opacity-50 transition active:scale-95"
                  >
                    {emailSending ? (
                      <>
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Dispatching PDF...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Send Receipt Email
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FORMAT 5: SMS TRANSACTIONAL ALERT PREVIEW */}
          {activeFormat === "SMS" && (
            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Transactional SMS Alert</h3>
                    <p className="text-[11px] text-slate-500">
                      TRAI DLT compliant billing notification template
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 font-mono text-xs text-slate-800 space-y-2">
                  <div className="flex justify-between text-[10px] text-indigo-900 font-bold uppercase">
                    <span>Sender: VK-LABCOR</span>
                    <span>DLT Header Approved</span>
                  </div>
                  <p className="leading-relaxed">
                    Dear {payment.patientName}, received {formatCurrency(payment.amount)} for Order {payment.orderNumber || "ORD-N/A"} via {payment.method}. Receipt: {payment.receiptNumber}. View receipt & test updates at: https://labcore-elis.cloud/r/{payment.receiptNumber} - LabCore Diagnostics
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyText}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 active:scale-95 transition"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy SMS Text
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}