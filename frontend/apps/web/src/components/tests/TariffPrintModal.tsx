"use client";

import React, { useState } from "react";

interface TariffPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  tests: any[];
  categories: any[];
}

export default function TariffPrintModal({
  isOpen,
  onClose,
  tests,
  categories,
}: TariffPrintModalProps) {
  const [selectedDept, setSelectedDept] = useState<string>("ALL");

  if (!isOpen) return null;

  const filteredTests = tests.filter((t) => {
    if (selectedDept === "ALL") return true;
    return t.categoryId === selectedDept || t.category?.name === selectedDept || t.category?.department === selectedDept;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      "Sr No",
      "Test Code",
      "Test Name",
      "Short Name",
      "Category / Department",
      "Sample Type",
      "Container / Vial",
      "Turnaround Time (TAT)",
      "Standard MRP (INR)",
      "Offer Price (INR)",
      "B2B Rate (INR)",
      "Status",
    ];

    const rows = filteredTests.map((t, index) => [
      index + 1,
      `"${t.testCode || t.code || ''}"`,
      `"${(t.testName || t.name || '').replace(/"/g, '""')}"`,
      `"${(t.shortName || '').replace(/"/g, '""')}"`,
      `"${t.category?.name || t.category || 'General'}"`,
      `"${t.sampleType || ''}"`,
      `"${t.sampleContainer || ''}"`,
      `"${t.tatDisplay || (t.tatHours ? `${t.tatHours}h` : '24 hours')}"`,
      t.price || 0,
      t.offerPrice || t.price || 0,
      t.b2bRate || 0,
      t.isActive !== false ? "Active" : "Inactive",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LabCore_Test_Tariff_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100 print:max-w-none print:m-0 print:border-none print:shadow-none print:h-auto print:max-h-none print:overflow-visible">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 print:hidden gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>📋</span> Laboratory Tariff & Diagnostic Rate Card
            </h2>
            <p className="text-xs text-gray-500">Preview rate sheet formatted for front-desk, referring doctors, and print export</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Departments ({tests.length} tests)</option>
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.id || c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition shadow-xs"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-xs"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Tariff Card
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-8 bg-white print:p-0 print:overflow-visible">
          {/* Diagnostic Laboratory Formal Header */}
          <div className="border-b-2 border-blue-600 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    LC
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">LabCore Enterprise LIS</h1>
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Advanced Diagnostic Reference Laboratory & Pathology Services</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">ISO 15189:2022 Certified | NABL Accredited Medical Testing Laboratory</p>
              </div>

              <div className="text-right text-xs text-gray-600 space-y-0.5">
                <p className="font-bold text-gray-900 text-sm">OFFICIAL TARIFF CARD</p>
                <p>Effective Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                <p>Tariff Ref: <span className="font-mono font-semibold">LC-TAR-{new Date().getFullYear()}-01</span></p>
              </div>
            </div>
          </div>

          {/* Rate Card Table */}
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-y border-gray-300 bg-gray-50 text-gray-700">
                <th className="py-2.5 px-3 font-semibold w-10 text-center">#</th>
                <th className="py-2.5 px-3 font-semibold w-24">Test Code</th>
                <th className="py-2.5 px-3 font-semibold">Test Name / Description</th>
                <th className="py-2.5 px-3 font-semibold">Department</th>
                <th className="py-2.5 px-3 font-semibold">Specimen / Tube</th>
                <th className="py-2.5 px-3 font-semibold text-center">TAT</th>
                <th className="py-2.5 px-3 font-semibold text-right">MRP (₹)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Offer Rate (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTests.map((test, idx) => {
                const basePrice = Number(test.price) || 0;
                const offerPrice = test.offerPrice ? Number(test.offerPrice) : null;
                const hasDiscount = offerPrice && offerPrice < basePrice;

                return (
                  <tr key={test.id || idx} className="hover:bg-gray-50/70">
                    <td className="py-2 px-3 text-center text-gray-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">{test.testCode || test.code}</td>
                    <td className="py-2 px-3 font-medium text-gray-900">
                      <div>{test.testName || test.name}</div>
                      {test.shortName && <div className="text-[11px] text-gray-400 font-normal">{test.shortName}</div>}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {test.category?.name || test.category || "General"}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                        {test.sampleContainer || test.sampleType}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center text-gray-600">
                      {test.tatDisplay || (test.tatHours ? `${test.tatHours}h` : "24h")}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-gray-900">
                      ₹{basePrice.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-green-700">
                      {hasDiscount ? (
                        <span>₹{offerPrice?.toLocaleString("en-IN")}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTests.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-sm">
              No tests in this department.
            </div>
          )}

          {/* Tariff Footer Note */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-[11px] text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700">Diagnostic Billing Policies:</p>
            <p>• Routine turnaround times (TAT) apply to samples received at central processing lab by 2:00 PM.</p>
            <p>• Urgent / STAT investigations available on select profiles with prior notification.</p>
            <p>• Prices include standard reporting and digital report access via QR code.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
