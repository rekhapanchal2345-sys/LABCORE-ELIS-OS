"use client";

import React, { useState } from "react";
import { CheckCircle, X, Printer, Download, AlertCircle } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkVerify?: () => void;
  onBulkApprove?: () => void;
  onBulkPrint?: () => void;
  onBulkExport?: () => void;
  onClearSelection: () => void;
  loading?: boolean;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onBulkVerify,
  onBulkApprove,
  onBulkPrint,
  onBulkExport,
  onClearSelection,
  loading = false,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const handleAction = (action: string) => {
    setPendingAction(action);
    setShowConfirmation(true);
  };

  const confirmAction = () => {
    setShowConfirmation(false);
    
    switch (pendingAction) {
      case "verify":
        onBulkVerify?.();
        break;
      case "approve":
        onBulkApprove?.();
        break;
      case "print":
        onBulkPrint?.();
        break;
      case "export":
        onBulkExport?.();
        break;
    }
    
    setPendingAction(null);
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case "verify":
        return `Verify ${selectedCount} selected results`;
      case "approve":
        return `Approve ${selectedCount} selected results`;
      case "print":
        return `Print reports for ${selectedCount} selected results`;
      case "export":
        return `Export data for ${selectedCount} selected results`;
      default:
        return "";
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-600">{selectedCount}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">selected</span>
          </div>

          <div className="h-6 w-px bg-gray-200" />

          <div className="flex items-center gap-2">
            {onBulkVerify && (
              <button
                onClick={() => handleAction("verify")}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Verify
              </button>
            )}

            {onBulkApprove && (
              <button
                onClick={() => handleAction("approve")}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            )}

            {onBulkPrint && (
              <button
                onClick={() => handleAction("print")}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            )}

            {onBulkExport && (
              <button
                onClick={() => handleAction("export")}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-gray-200" />

          <button
            onClick={onClearSelection}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Bulk Action
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  You are about to {getActionDescription(pendingAction || "").toLowerCase()}. 
                  This action will be applied to all selected results.
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  This action cannot be undone. Please confirm you want to proceed.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setPendingAction(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};