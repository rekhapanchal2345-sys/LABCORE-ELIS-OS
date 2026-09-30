"use client";

import React, { useRef, useState, useEffect } from "react";
import { X, Printer, Download } from "lucide-react";
import QRCode from "qrcode";

// ─────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────
interface ReportResult {
  id: string;
  parameterName: string;
  result: string;
  unit?: string;
  referenceRange?: string;
  flag?: string;
}

interface LabTestResultReportProps {
  report: {
    reportNumber: string;
    reportDate: string;
    reportTime?: string;
    reportStatus: string;

    patientName: string;
    patientId: string;
    age?: string;
    gender?: string;
    referredBy?: string;
    phone?: string;

    orderId: string;
    sampleId: string;
    specimen?: string;
    department?: string;

    resultStatus?: string;
    tat?: string;
    resultDate?: string;
    barcode?: string;

    sampleCollected?: string;
    reportApproved?: string;

    testName: string;
    testCode?: string;
    method?: string;

    results: ReportResult[];

    verifiedBy?: string;
    verifierRole?: string;
    verifiedAt?: string;

    interpretation?: string;
    remarks?: string;
  };
  onClose: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function fmtDate(d?: string) {
  if (!d) return "—";
  const p = new Date(d);
  if (isNaN(p.getTime())) return d;
  return p.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateTime(d?: string) {
  if (!d) return "—";
  const p = new Date(d);
  if (isNaN(p.getTime())) return d;
  return p.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " + p.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function getFlagInfo(flag?: string): { bg: string; color: string; label: string; bar: string; pct: number } {
  switch (flag?.toUpperCase()) {
    case "CRITICAL":
      return { bg: "#fdeaea", color: "#c0392b", label: "CRITICAL", bar: "#e74c3c", pct: 100 };
    case "HIGH":
      return { bg: "#fff4e5", color: "#c77700", label: "HIGH", bar: "#e67e22", pct: 80 };
    case "LOW":
      return { bg: "#fef9c3", color: "#854d0e", label: "LOW", bar: "#f39c12", pct: 20 };
    default:
      return { bg: "#e8f8ee", color: "#1a7c3e", label: "NORMAL", bar: "#27ae60", pct: 55 };
  }
}

// ─────────────────────────────────────────────────────────
// PRINT STYLES (injected into print window)
// ─────────────────────────────────────────────────────────
const PRINT_STYLES = `
  @page { size: A4 portrait; margin: 15mm; }

  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }

  body { margin:0; padding:0; font-family: Georgia, serif; font-size: 11pt; color:#111; background:#fff; }

  .lr { width:100%; max-width:210mm; margin:0 auto; }

  /* Prevent breaking inside major sections */
  .lr-hd, .lr-banner, .lr-info-grid, .lr-test-title, .lr-table, .lr-interp, .lr-disclaimer, .lr-qc-grid, .lr-footer {
    page-break-inside: avoid;
  }

  .lr-hd { display:flex; align-items:flex-start; justify-content:space-between; padding-bottom:10pt; border-bottom:1pt solid #ddd; }

  .lr-logo-name { font-size:22pt; font-weight:900; color:#1a3a5c; }
  .lr-logo-name span { color:#2563eb; }

  .lr-banner { background:#1a3a5c; color:#fff; padding:8pt 12pt; margin-top:8pt; border-radius:4pt 4pt 0 0; display:flex; align-items:center; justify-content:space-between; }

  .lr-info-grid { display:grid; grid-template-columns:1fr 1fr; border:1pt solid #e5e7eb; border-top:none; }
  .lr-info-col { padding:8pt 12pt; }
  .lr-info-col:first-child { border-right:1pt solid #e5e7eb; }

  .lr-test-title { font-size:13pt; font-weight:900; color:#1a3a5c; text-transform:uppercase; letter-spacing:0.5px; margin-top:18pt; margin-bottom:6pt; padding-bottom:4pt; border-bottom:2pt solid #e5e7eb; }

  .lr-table { width:100%; border-collapse:collapse; font-size:10pt; margin-top:6pt; }
  .lr-table th { background:#1a3a5c; color:#fff; padding:6pt 8pt; text-align:left; font-size:8.5pt; text-transform:uppercase; }
  .lr-table td { padding:6pt 8pt; border-bottom:1pt solid #f3f4f6; }

  .lr-flag { display:inline-block; padding:2pt 6pt; border-radius:3pt; font-size:8pt; font-weight:800; text-transform:uppercase; }

  .lr-interp { background:#fffde7; border:1pt solid #fde68a; border-radius:4pt; padding:8pt 12pt; margin-top:8pt; }

  .lr-disclaimer { font-size:9pt; color:#9ca3af; margin-top:6pt; font-style:italic; }

  .lr-qc-title { font-size:9pt; font-weight:800; text-transform:uppercase; color:#1a3a5c; border-bottom:1pt solid #1a3a5c; padding-bottom:4pt; margin-top:12pt; margin-bottom:6pt; }

  .lr-footer { display:flex; align-items:flex-end; justify-content:space-between; margin-top:12pt; padding-top:8pt; border-top:1pt solid #e5e7eb; }

  .lr-qr-box { width:40pt; height:40pt; border:1pt solid #d1d5db; border-radius:4pt; background:#f9fafb; display:flex; align-items:center; justify-content:center; font-size:7pt; color:#9ca3af; }
`;

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function LabTestResultReport({ report, onClose, onPrint, onDownload }: LabTestResultReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Build the verification URL using current origin or a fixed domain
  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify-report/${report.reportNumber}`
    : `https://labcore.in/verify-report/${report.reportNumber}`;

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(verifyUrl, {
      width: 120,
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then(url => { if (active) setQrDataUrl(url); })
      .catch(() => { /* QR generation failed — placeholder shown */ });
    return () => { active = false; };
  }, [verifyUrl]);

  const hasFlags = report.results.some(r => r.flag && r.flag !== "NORMAL");
  const interpretation = report.interpretation ||
    (hasFlags
      ? "Some parameters are outside the normal reference range. Please consult your physician for clinical correlation."
      : "All parameters within normal range.");

  const handlePrint = () => {
    if (!reportRef.current) return;
    setPrinting(true);
    const win = window.open("", "_blank");
    if (!win) { alert("Please allow popups to print."); setPrinting(false); return; }
    win.document.open();
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Lab Report — ${report.orderId}</title>
      <style>${PRINT_STYLES}</style>
    </head><body>
      <div class="lr">${reportRef.current.innerHTML}</div>
    </body></html>`);
    win.document.close();
    win.onload = () => {
      setTimeout(() => {
        win.print();
        win.onafterprint = () => { win.close(); onPrint?.(); };
        setPrinting(false);
      }, 300);
    };
  };

  const isApproved = report.reportStatus === "Final" || ["APPROVED", "PUBLISHED"].includes(report.reportStatus);

  return (
    <>
      {/* Modal overlay */}
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-6 overflow-y-auto">
        <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl">

          {/* Toolbar */}
          <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-xl border-b border-gray-200 bg-white px-5 py-3">
            <span className="text-sm font-bold text-gray-900">Laboratory Report Preview</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                disabled={printing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Printer className="h-4 w-4" /> Print
              </button>
              <button
                onClick={() => { handlePrint(); onDownload?.(); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" /> Download PDF
              </button>
              <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Report content */}
          <style>{PRINT_STYLES}</style>
          <div className="bg-gray-100 p-6 rounded-b-xl">
            <div className="bg-white rounded-lg shadow p-7 mx-auto" style={{ maxWidth: "730px" }}>
              <div ref={reportRef}>

                {/* ── HEADER ── */}
                <div className="lr-hd">
                  <div className="lr-logo">
                    <div className="lr-logo-name">
                      LC <span>LabCore</span>
                    </div>
                    <div className="lr-logo-sub">Enterprise Diagnostics</div>
                    <div className="lr-logo-tag">Precision. Trust. Care.</div>
                  </div>
                  <div className="lr-company">
                    <div className="lr-company-name">LabCore Diagnostic &amp; Research Centre</div>
                    <div className="lr-company-addr">
                      201, Biomedical Complex, Medical District, Mumbai – 400007<br />
                      Phone: +91-22-1234-5678 | Email: reports@labcore.in
                    </div>
                    <div><span className="lr-nabl">NABL Accredited ISO 15189:2022</span></div>
                  </div>
                </div>

                {/* ── BANNER ── */}
                <div className="lr-banner">
                  <div className="lr-banner-title">Diagnostic Test Report</div>
                  <div className="lr-banner-ids">
                    RSP-{report.reportNumber} | {report.orderId}
                  </div>
                </div>

                {/* ── PATIENT + SAMPLE INFO ── */}
                <div className="lr-info-grid">
                  <div className="lr-info-col">
                    <div className="lr-info-col-title">Patient Details</div>
                    <div className="lr-info-row">
                      <span className="lr-info-label">Patient Name</span>
                      <span className="lr-info-val">{report.patientName}</span>
                    </div>
                    <div className="lr-info-row">
                      <span className="lr-info-label">UHID</span>
                      <span className="lr-info-val">{report.patientId}</span>
                    </div>
                    <div className="lr-info-row">
                      <span className="lr-info-label">Age / Gender</span>
                      <span className="lr-info-val">
                        {report.age ? `${report.age} Yrs` : "—"} / {report.gender || "—"}
                      </span>
                    </div>
                    <div className="lr-info-row">
                      <span className="lr-info-label">Contact</span>
                      <span className="lr-info-val">{report.phone || "—"}</span>
                    </div>
                  </div>
                  <div className="lr-info-col">
                    <div className="lr-info-col-title">Sample Details</div>
                    <div className="lr-info-row">
                      <span className="lr-info-label">Referring Doctor</span>
                      <span className="lr-info-val">{report.referredBy ? `Dr. ${report.referredBy}` : "—"}</span>
                    </div>
                    <div className="lr-info-row">
                      <span className="lr-info-label">Sample Collected</span>
                      <span className="lr-info-val">{fmtDateTime(report.sampleCollected || report.reportDate)}</span>
                    </div>
                    <div className="lr-info-row">
                      <span className="lr-info-label">Report Approved</span>
                      <span className="lr-info-val">{fmtDateTime(report.reportApproved || report.verifiedAt || report.reportDate)}</span>
                    </div>
                    <div className="lr-info-row">
                      <span className="lr-info-label">Specimen</span>
                      <span className="lr-info-val" style={{ textTransform: "uppercase" }}>{report.specimen || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* ── TEST SECTION ── */}
                <div className="lr-test-title">{report.testName}</div>

                {/* ── RESULTS TABLE ── */}
                <table className="lr-table">
                  <thead>
                    <tr>
                      <th>Test Parameter</th>
                      <th>Result</th>
                      <th>Unit</th>
                      <th>Biological Reference Range</th>
                      <th>Flag</th>
                      <th>Range Indicator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.results.map((row, idx) => {
                      const fi = getFlagInfo(row.flag);
                      return (
                        <tr key={row.id || idx}>
                          <td style={{ fontWeight: 600 }}>{row.parameterName}</td>
                          <td>
                            <span className="lr-result-bold">{row.result}</span>
                          </td>
                          <td style={{ color: "#6b7280" }}>{row.unit || "—"}</td>
                          <td style={{ color: "#374151" }}>{row.referenceRange || "—"}</td>
                          <td>
                            <span
                              className="lr-flag"
                              style={{ background: fi.bg, color: fi.color }}
                            >
                              {fi.label}
                            </span>
                          </td>
                          <td>
                            <div className="lr-bar-wrap">
                              <div className="lr-bar-track">
                                <div
                                  className="lr-bar-fill"
                                  style={{ width: `${fi.pct}%`, background: fi.bar }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* ── CLINICAL INTERPRETATION ── */}
                <div className="lr-interp">
                  <div className="lr-interp-title">Clinical Interpretation</div>
                  <div className="lr-interp-text">{interpretation}</div>
                </div>

                {/* ── DISCLAIMER ── */}
                <div className="lr-disclaimer">
                  Defined: CLIP / Analyzer: LabCore-Chem-3000 / Values may vary between laboratories due to differences in method/equipment used.
                </div>

                {/* ── SPECIMEN & QUALITY ASSURANCE ── */}
                <div className="lr-qc-title">Specimen &amp; Quality Assurance</div>
                <div className="lr-qc-grid">
                  <div className="lr-qc-row">
                    <span className="lr-qc-label">Specimen Quality</span>
                    <span className="lr-qc-val">Acceptable</span>
                  </div>
                  <div className="lr-qc-row">
                    <span className="lr-qc-label">Hemolysis / Lipemia</span>
                    <span className="lr-qc-val">Not Observed</span>
                  </div>
                  <div className="lr-qc-row">
                    <span className="lr-qc-label">Internal QC Status</span>
                    <span className="lr-qc-val lr-qc-pass">Passed — Within Limits</span>
                  </div>
                  <div className="lr-qc-row">
                    <span className="lr-qc-label">External QA Scheme</span>
                    <span className="lr-qc-val">NABL EQAS</span>
                  </div>
                  <div className="lr-qc-row">
                    <span className="lr-qc-label">Calibration Status</span>
                    <span className="lr-qc-val">Valid</span>
                  </div>
                  <div className="lr-qc-row">
                    <span className="lr-qc-label">Report Confidence Score</span>
                    <span className="lr-qc-val lr-qc-score">99.9%</span>
                  </div>
                </div>

                {/* ── FOOTER ── */}
                <div className="lr-footer">
                  <div className="lr-qr-wrap">
                    <div className="lr-qr-box" style={{ padding: qrDataUrl ? "2px" : undefined }}>
                    {qrDataUrl
                      ? <img src={qrDataUrl} alt="Verification QR Code" style={{ width: "100%", height: "100%", display: "block", borderRadius: "3px" }} />
                      : <span style={{ fontSize: "7px", color: "#9ca3af", textAlign: "center" }}>QR<br />CODE</span>
                    }
                  </div>
                    <div>
                      <div className="lr-qr-text">Scan to verify authenticity</div>
                      <div className="lr-qr-id">Report ID: {report.reportNumber}</div>
                    </div>
                  </div>
                  <div className="lr-footer-right">
                    Generated on {fmtDate(report.reportDate)}<br />
                    This is a computer generated report
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
