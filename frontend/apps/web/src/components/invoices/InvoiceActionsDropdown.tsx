"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Printer, 
  FileText, 
  CreditCard, 
  MessageCircle, 
  Mail, 
  Trash2, 
  ArrowRightLeft,
  MoreVertical,
  X,
  Receipt,
  Download
} from "lucide-react";

interface InvoiceActionsDropdownProps {
  invoice: {
    id: string | number;
    invoiceNumber?: string;
    patientName?: string;
    pendingAmount?: number;
    netPayable?: number;
    paidAmount?: number;
    paymentStatus?: string;
  };
  onPrintThermal: () => void;
  onPrintA4: () => void;
  onCollectPayment: () => void;
  onSendWhatsApp: () => void;
  onSendEmail: () => void;
  onDelete?: () => void;
  onRefund?: () => void;
  disabled?: boolean;
}

export default function InvoiceActionsDropdown({
  invoice,
  onPrintThermal,
  onPrintA4,
  onCollectPayment,
  onSendWhatsApp,
  onSendEmail,
  onDelete,
  onRefund,
  disabled = false,
}: InvoiceActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dueAmount = invoice.pendingAmount || invoice.netPayable || 0;
  const paidAmount = invoice.paidAmount || 0;
  const hasDue = dueAmount > 0;
  const hasPaid = paidAmount > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  if (disabled) {
    return (
      <div className="flex items-center justify-center text-gray-400">
        <MoreVertical className="w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shadow-sm"
        title="More actions"
      >
        {isOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl bg-slate-950/95 backdrop-blur-md shadow-2xl border border-slate-800 py-2 origin-top-right text-slate-200 animate-in fade-in zoom-in-95">
          {/* Print Section */}
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Print Documents</p>
            <div className="space-y-1">
              <button
                onClick={() => handleAction(onPrintThermal)}
                className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-amber-400 rounded-xl transition-colors"
              >
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>Thermal Receipt</span>
              </button>
              <button
                onClick={() => handleAction(onPrintA4)}
                className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-cyan-400 rounded-xl transition-colors"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>A4 GST Invoice</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 my-1" />

          {/* Payment Section */}
          {hasDue && (
            <>
              <div className="p-2">
                <div className="flex items-center justify-between px-2 mb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Due Settlement</p>
                  <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                </div>
                <button
                  onClick={() => handleAction(onCollectPayment)}
                  className="group flex items-center justify-between w-full px-2.5 py-2 text-xs font-bold rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-900/40 text-emerald-300 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <span className="block font-black text-white text-xs leading-none">Collect Due</span>
                      <span className="text-[10px] text-emerald-400 font-medium">Settle Balance</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-md border border-amber-500/30 bg-amber-950/60 px-2 py-0.5 text-xs font-black text-amber-300">
                    ₹{dueAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </button>
              </div>
              <div className="border-t border-slate-800 my-1" />
            </>
          )}

          {/* Share Section */}
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Share</p>
            <div className="space-y-1">
              <button
                onClick={() => handleAction(onSendWhatsApp)}
                className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-emerald-400 rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Send via WhatsApp</span>
              </button>
              <button
                onClick={() => handleAction(onSendEmail)}
                className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-cyan-400 rounded-xl transition-colors"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Send via Email</span>
              </button>
            </div>
          </div>

          {/* Other Actions */}
          {(onDelete || onRefund) && (
            <>
              <div className="border-t border-slate-800 my-1" />
              <div className="px-3 py-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Other</p>
                <div className="space-y-1">
                  {hasPaid && onRefund && (
                    <button
                      onClick={() => handleAction(onRefund)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-amber-400 rounded-xl transition-colors"
                    >
                      <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                      <span>Process Refund</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => handleAction(onDelete)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Invoice</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}