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
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
        title="More actions"
      >
        {isOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl bg-white shadow-2xl border border-gray-200 py-2 origin-top-right">
          {/* Print Section */}
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Print</p>
            <div className="space-y-1">
              <button
                onClick={() => handleAction(onPrintThermal)}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Receipt className="w-4 h-4 text-amber-600" />
                <span>Thermal Receipt</span>
              </button>
              <button
                onClick={() => handleAction(onPrintA4)}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>A4 GST Invoice</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 my-2" />

          {/* Payment Section */}
          {hasDue && (
            <>
              <div className="p-2">
                <div className="flex items-center justify-between px-2 mb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Due Settlement</p>
                  <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <button
                  onClick={() => handleAction(onCollectPayment)}
                  className="group flex items-center justify-between w-full px-2.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/25 hover:border-emerald-500/60 hover:bg-emerald-500/15 text-emerald-900 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <span className="block font-black text-slate-900 text-xs leading-none">Collect Due</span>
                      <span className="text-[10px] text-emerald-700 font-medium">Settle Balance</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-900 ring-1 ring-amber-500/20">
                    ₹{dueAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </button>
              </div>
              <div className="border-t border-slate-100 my-1" />
            </>
          )}

          {/* Share Section */}
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Share</p>
            <div className="space-y-1">
              <button
                onClick={() => handleAction(onSendWhatsApp)}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span>Send via WhatsApp</span>
              </button>
              <button
                onClick={() => handleAction(onSendEmail)}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Send via Email</span>
              </button>
            </div>
          </div>

          {/* Other Actions */}
          {(onDelete || onRefund) && (
            <>
              <div className="border-t border-gray-100 my-2" />
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Other</p>
                <div className="space-y-1">
                  {hasPaid && onRefund && (
                    <button
                      onClick={() => handleAction(onRefund)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <ArrowRightLeft className="w-4 h-4 text-orange-600" />
                      <span>Process Refund</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => handleAction(onDelete)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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