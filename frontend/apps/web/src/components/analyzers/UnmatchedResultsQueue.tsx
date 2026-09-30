"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  Search,
  Link as LinkIcon,
  CheckCircle2,
  Trash2,
  FileQuestion,
  UserCheck,
  Plus,
  Clock,
  ArrowRight,
  ShieldAlert
} from "lucide-react";

export interface UnmatchedResult {
  id: string;
  analyzerId: string;
  analyzerName: string;
  unmatchedBarcode: string;
  testCode: string;
  testName: string;
  resultValue: string;
  unit: string;
  timestamp: Date;
  rawPayload: string;
  flag?: string;
}

interface UnmatchedResultsQueueProps {
  isOpen: boolean;
  onClose: () => void;
  onResolved?: () => void;
}

export default function UnmatchedResultsQueue({
  isOpen,
  onClose,
  onResolved,
}: UnmatchedResultsQueueProps) {
  const [orphanList, setOrphanList] = useState<UnmatchedResult[]>([
    {
      id: "orph-1",
      analyzerId: "SYS-001",
      analyzerName: "Sysmex XN-1000",
      unmatchedBarcode: "UNKNOWN-99210",
      testCode: "WBC",
      testName: "White Blood Cell Count",
      resultValue: "14.2",
      unit: "10^3/µL",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      rawPayload: "R|1|^^^^UNKNOWN-99210|WBC^White Blood Cells|14.2|10*3/uL|4.0-11.0|H||F|||20260906",
      flag: "HIGH",
    },
    {
      id: "orph-2",
      analyzerId: "ROC-001",
      analyzerName: "Roche Cobas c311",
      unmatchedBarcode: "SMP-BARCODE-MISMATCH",
      testCode: "GLU",
      testName: "Fasting Blood Glucose",
      resultValue: "340",
      unit: "mg/dL",
      timestamp: new Date(Date.now() - 34 * 60 * 1000),
      rawPayload: "OBX|1|NM|GLU^Glucose||340|mg/dL|70-100|CH|||F",
      flag: "CRITICAL",
    },
    {
      id: "orph-3",
      analyzerId: "SYS-001",
      analyzerName: "Sysmex XN-1000",
      unmatchedBarcode: "BC-SMUDGED-004",
      testCode: "PLT",
      testName: "Platelet Count",
      resultValue: "245",
      unit: "10^3/µL",
      timestamp: new Date(Date.now() - 70 * 60 * 1000),
      rawPayload: "R|3|^^^^BC-SMUDGED-004|PLT^Platelets|245|10*3/uL|150-450|N||F",
      flag: "NORMAL",
    },
  ]);

  const [resolvingItem, setResolvingItem] = useState<UnmatchedResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [discardReason, setDiscardReason] = useState("");
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Mock active patient orders available for linking
  const sampleActiveOrders = [
    { orderNumber: "ORD-2026-0895", uhid: "UHID-2026-005", patientName: "Aarav Sharma", age: 42, gender: "Male", test: "Complete Blood Count (CBC)" },
    { orderNumber: "ORD-2026-0896", uhid: "UHID-2026-006", patientName: "Priyanka Verma", age: 29, gender: "Female", test: "Lipid Profile & Glucose" },
    { orderNumber: "ORD-2026-0897", uhid: "UHID-2026-007", patientName: "Vikram Malhotra", age: 61, gender: "Male", test: "Renal Function Panel" },
  ];

  const filteredOrders = sampleActiveOrders.filter(
    (o) =>
      o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLinkOrder = () => {
    if (!resolvingItem || !selectedOrder) return;
    setOrphanList((prev) => prev.filter((item) => item.id !== resolvingItem.id));
    setActionSuccess(`Successfully linked ${resolvingItem.unmatchedBarcode} to order ${selectedOrder.orderNumber} (${selectedOrder.patientName})`);
    setResolvingItem(null);
    setSelectedOrder(null);
    onResolved?.();
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleDiscard = () => {
    if (!resolvingItem || !discardReason.trim()) return;
    setOrphanList((prev) => prev.filter((item) => item.id !== resolvingItem.id));
    setActionSuccess(`Discarded orphan result for ${resolvingItem.unmatchedBarcode}. Reason recorded: "${discardReason}"`);
    setShowDiscardModal(false);
    setResolvingItem(null);
    setDiscardReason("");
    onResolved?.();
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base">Unmatched / Orphan Results Queue</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                  {orphanList.length} Pending
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Instrument transmitted results whose sample barcodes do not match active patient orders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {actionSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {orphanList.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-900">Queue is Clear</p>
              <p className="text-xs text-gray-500 mt-1">All transmitted instrument results have been matched to patient orders.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orphanList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-gray-200 hover:border-amber-300 bg-white transition-all shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {item.unmatchedBarcode}
                        </span>
                        <span className="text-xs text-gray-500">• from {item.analyzerName}</span>
                        <span className="text-xs text-gray-400">
                          ({item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="font-semibold text-gray-800">{item.testName} ({item.testCode}):</span>
                        <span className="font-mono font-bold text-gray-900">{item.resultValue} {item.unit}</span>
                        {item.flag && (
                          <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                            item.flag === "CRITICAL" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {item.flag}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setResolvingItem(item);
                          setShowDiscardModal(false);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm transition-colors"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        Match to Order
                      </button>
                      <button
                        onClick={() => {
                          setResolvingItem(item);
                          setShowDiscardModal(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Discard result"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Raw frame snippet */}
                  <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-2.5 rounded-lg overflow-x-auto border border-slate-800">
                    <span className="text-slate-500 select-none mr-2">&gt; Raw Frame:</span>
                    {item.rawPayload}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Sub-flow: Match to Order Dialog */}
        {resolvingItem && !showDiscardModal && (
          <div className="border-t border-gray-200 bg-slate-50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  Assign Barcode {resolvingItem.unmatchedBarcode} to Active Patient Order
                </h4>
                <p className="text-xs text-gray-500">
                  Search patient name or UHID to attach this {resolvingItem.testName} result ({resolvingItem.resultValue} {resolvingItem.unit})
                </p>
              </div>
              <button
                onClick={() => setResolvingItem(null)}
                className="text-xs text-gray-500 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient by name, UHID, or order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto">
              {filteredOrders.map((o) => (
                <div
                  key={o.orderNumber}
                  onClick={() => setSelectedOrder(o)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedOrder?.orderNumber === o.orderNumber
                      ? "bg-blue-50/80 border-blue-500 ring-1 ring-blue-500"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span>{o.patientName}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{o.uhid}</span>
                  </div>
                  <p className="text-gray-500 text-[11px] mt-0.5">{o.age}y • {o.gender}</p>
                  <p className="text-blue-700 font-medium text-[11px] mt-1">{o.test}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResolvingItem(null)}
                className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium bg-white hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkOrder}
                disabled={!selectedOrder}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-sm"
              >
                Confirm Match & Post Result
              </button>
            </div>
          </div>
        )}

        {/* Modal Sub-flow: Discard Reason Dialog */}
        {resolvingItem && showDiscardModal && (
          <div className="border-t border-gray-200 bg-rose-50/50 p-6 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Reject / Discard Orphan Result ({resolvingItem.unmatchedBarcode})
              </h4>
              <p className="text-xs text-gray-600">
                A regulatory audit reason is required when discarding transmitted instrument results.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Audit Reason for Discard *
              </label>
              <select
                value={discardReason}
                onChange={(e) => setDiscardReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white mb-2"
              >
                <option value="">Select reason...</option>
                <option value="Clotted / hemolyzed sample re-run">Clotted or hemolyzed sample re-run</option>
                <option value="Duplicate machine test transmission">Duplicate machine test transmission</option>
                <option value="Unidentifiable specimen tube / missing requisition">Unidentifiable specimen tube / missing requisition</option>
                <option value="Machine calibration blank test run">Machine calibration blank test run</option>
              </select>

              <input
                type="text"
                placeholder="Or enter specific technician justification..."
                value={discardReason}
                onChange={(e) => setDiscardReason(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDiscardModal(false);
                  setResolvingItem(null);
                }}
                className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDiscard}
                disabled={!discardReason.trim()}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 disabled:opacity-50"
              >
                Permanently Discard Result
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Unmatched results are retained in audit logs for 90 days.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-semibold hover:bg-gray-900 transition-colors"
          >
            Close Queue
          </button>
        </div>
      </div>
    </div>
  );
}
