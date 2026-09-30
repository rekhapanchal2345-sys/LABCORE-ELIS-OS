"use client";

import React, { useState } from "react";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string | number;
    invoiceNumber?: string;
    patientName?: string;
    totalAmount?: number;
    paidAmount?: number;
    netPayable?: number;
  } | null;
  onRefundSubmit: (data: {
    amount: number;
    reason: string;
    refundMethod: string;
    transactionId?: string;
  }) => Promise<void>;
}

export default function RefundModal({
  isOpen,
  onClose,
  invoice,
  onRefundSubmit,
}: RefundModalProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("CASH");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !invoice) return null;

  const maxRefundAmount = invoice.paidAmount || invoice.netPayable || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const refundAmount = Number(amount);

    if (!refundAmount || refundAmount <= 0) {
      setError("Please enter a valid refund amount");
      return;
    }

    if (refundAmount > maxRefundAmount) {
      setError(`Refund amount cannot exceed paid amount of ₹${maxRefundAmount}`);
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a reason for the refund");
      return;
    }

    if (refundMethod !== "CASH" && !transactionId.trim()) {
      setError("Transaction ID is required for this refund method");
      return;
    }

    try {
      setLoading(true);
      await onRefundSubmit({
        amount: refundAmount,
        reason: reason.trim(),
        refundMethod,
        transactionId: transactionId.trim() || undefined,
      });
      onClose();
      // Reset form
      setAmount("");
      setReason("");
      setRefundMethod("CASH");
      setTransactionId("");
    } catch (err) {
      console.error("Error processing refund:", err);
      setError("Failed to process refund. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Process Refund</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <div className="font-medium">{invoice.invoiceNumber}</div>
            <div>Patient: {invoice.patientName}</div>
            <div className="mt-1">
              <span className="text-gray-600">Paid Amount: </span>
              <span className="font-semibold text-green-600">₹{maxRefundAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Refund Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter refund amount"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                step="0.01"
                min="0.01"
                max={maxRefundAmount}
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickAmount(maxRefundAmount)}
                  className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Full: ₹{maxRefundAmount}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(Math.ceil(maxRefundAmount / 2))}
                  className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Half: ₹{Math.ceil(maxRefundAmount / 2)}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Refund Method</label>
              <select
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Credit/Debit Card</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            {refundMethod !== "CASH" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Transaction ID / Reference</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required={refundMethod !== "CASH"}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Reason for Refund *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this refund is being processed (e.g., duplicate payment, service cancellation, etc.)"
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> This will generate a credit note and update the invoice status. This action will be logged in the audit trail.
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-400"
              disabled={loading}
            >
              {loading ? "Processing..." : "Process Refund"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
