"use client";

import React, { useState } from "react";
import { CheckCircle, Clock, User, Calendar } from "lucide-react";

interface WorkflowStep {
  stage: string;
  label: string;
  status: "completed" | "current" | "pending";
  user?: {
    name: string;
    employeeCode?: string;
  };
  timestamp?: string;
}

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  currentStage: string;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  steps,
  currentStage,
}) => {
  const currentIndex = steps.findIndex(step => step.stage === currentStage);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <React.Fragment key={step.stage}>
              {/* Step */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted
                      ? "bg-green-50 border-green-500 text-green-600"
                      : isCurrent
                      ? "bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-gray-50 border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Clock className="w-5 h-5 animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  )}
                </div>

                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.user && (isCompleted || isCurrent) && (
                    <div className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>{step.user.name}</span>
                    </div>
                  )}
                  {step.timestamp && (isCompleted || isCurrent) && (
                    <div className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(step.timestamp).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    index < currentIndex
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

interface QuickActionPanelProps {
  currentStatus: string;
  onVerify?: () => void;
  onApprove?: () => void;
  onReject?: (reason: string) => void;
  onSendForRecollection?: (reason: string) => void;
  loading?: boolean;
}

export const QuickActionPanel: React.FC<QuickActionPanelProps> = ({
  currentStatus,
  onVerify,
  onApprove,
  onReject,
  onSendForRecollection,
  loading = false,
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRecollectionModal, setShowRecollectionModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [recollectionReason, setRecollectionReason] = useState("");

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject?.(rejectReason);
      setShowRejectModal(false);
      setRejectReason("");
    }
  };

  const handleRecollection = () => {
    if (recollectionReason.trim()) {
      onSendForRecollection?.(recollectionReason);
      setShowRecollectionModal(false);
      setRecollectionReason("");
    }
  };

  return (
    <div className="space-y-3">
      {/* Primary Actions */}
      <div className="flex gap-2">
        {currentStatus === "ENTERED" && onVerify && (
          <button
            onClick={onVerify}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Verify Result
          </button>
        )}

        {currentStatus === "VERIFIED" && onApprove && (
          <button
            onClick={onApprove}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Approve Result
          </button>
        )}
      </div>

      {/* Secondary Actions */}
      <div className="flex gap-2">
        {(currentStatus === "ENTERED" || currentStatus === "VERIFIED") && (
          <>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={() => setShowRecollectionModal(true)}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50"
            >
              Request Recollection
            </button>
          </>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Result
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Please provide a reason for rejection..."
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recollection Modal */}
      {showRecollectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Request Sample Recollection
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Recollection *
              </label>
              <textarea
                value={recollectionReason}
                onChange={(e) => setRecollectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={3}
                placeholder="Please explain why recollection is needed..."
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRecollectionModal(false);
                  setRecollectionReason("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRecollection}
                disabled={!recollectionReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                Request Recollection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};