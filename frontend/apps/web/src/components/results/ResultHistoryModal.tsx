"use client";

import React from "react";
import { X, Clock, User, Edit3, CheckCircle, AlertCircle } from "lucide-react";

interface HistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
}

interface ResultHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultId: string;
  history: HistoryEntry[];
}

export default function ResultHistoryModal({
  isOpen,
  onClose,
  resultId,
  history,
}: ResultHistoryModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "created":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "updated":
      case "edited":
        return <Edit3 className="h-4 w-4 text-blue-600" />;
      case "verified":
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "created":
        return "bg-green-50 text-green-700 border-green-200";
      case "updated":
      case "edited":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "verified":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-gray-200 p-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Result History & Audit Trail</h2>
            <p className="text-sm text-gray-600">Result ID: {resultId}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* History Content */}
        <div className="p-6">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No history available for this result</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={entry.id}
                  className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-0 w-4 h-4 -translate-x-1/2 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  </div>

                  {/* History Card */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getActionIcon(entry.action)}
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getActionColor(entry.action)}`}>
                          {entry.action}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {entry.performedBy}
                      </span>
                    </div>

                    {entry.details && (
                      <p className="text-sm text-gray-600 mb-2">{entry.details}</p>
                    )}

                    {(entry.oldValue || entry.newValue) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                          {entry.oldValue && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Previous Value</p>
                              <p className="text-sm text-gray-700 line-through">{entry.oldValue}</p>
                            </div>
                          )}
                          {entry.newValue && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">New Value</p>
                              <p className="text-sm text-gray-900 font-medium">{entry.newValue}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Total entries: {history.length}</span>
            <span>Audit trail enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}