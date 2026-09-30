"use client";

import React, { useState } from "react";

interface PaymentCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string | number;
    invoiceNumber?: string;
    patientName?: string;
    pendingAmount?: number;
    netPayable?: number;
  } | null;
  onPaymentSubmit: (data: {
    amount: number;
    paymentMethod: string;
    transactionId?: string;
    remarks?: string;
  }) => Promise<void>;
}

export default function PaymentCollectionModal({
  isOpen,
  onClose,
  invoice,
  onPaymentSubmit,
}: PaymentCollectionModalProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !invoice) return null;

  const dueAmount = invoice.pendingAmount || invoice.netPayable || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (paymentAmount > dueAmount) {
      setError(`Amount cannot exceed due amount of ₹${dueAmount}`);
      return;
    }

    if (paymentMethod !== "CASH" && !transactionId.trim()) {
      setError("Transaction ID is required for this payment method");
      return;
    }

    try {
      setLoading(true);
      await onPaymentSubmit({
        amount: paymentAmount,
        paymentMethod,
        transactionId: transactionId.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });
      onClose();
      // Reset form
      setAmount("");
      setPaymentMethod("CASH");
      setTransactionId("");
      setRemarks("");
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Failed to process payment. Please try again.");
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
            <h2 className="text-lg font-semibold text-gray-900">Collect Due Payment</h2>
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
            <div className="mt-1 text-lg font-bold text-red-600">Due: ₹{dueAmount.toLocaleString("en-IN")}</div>
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
              <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                step="0.01"
                min="0.01"
                max={dueAmount}
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickAmount(dueAmount)}
                  className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Full: ₹{dueAmount}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(Math.ceil(dueAmount / 2))}
                  className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Half: ₹{Math.ceil(dueAmount / 2)}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Credit/Debit Card</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="CHEQUE">Cheque</option>
                <option value="INSURANCE">Insurance / TPA</option>
              </select>
            </div>

            {paymentMethod !== "CASH" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Transaction ID / Reference</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required={paymentMethod !== "CASH"}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Remarks (Optional)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any notes about this payment"
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
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
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? "Processing..." : "Collect Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
