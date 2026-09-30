"use client";

import React from "react";
import Link from "next/link";
import type { Approval } from "./ApprovalTable";

interface ApprovalDetailsProps {
  approval: Approval;
  resultValue?: string | number;
  unit?: string;
  referenceRange?: string;
  interpretation?: string;
  comments?: string;
  criticalValue?: boolean;
  laboratoryInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    accreditation?: string;
  };
  orderInfo?: {
    orderId: string;
    accessionNumber: string;
    orderDate: string;
    priority: string;
    referringDoctor: string;
  };
  sampleInfo?: {
    sampleId: string;
    sampleType: string;
    collectionDate: string;
    receivedDate: string;
    sampleStatus: string;
  };
  resultParameters?: Array<{
    parameterName: string;
    result: string;
    unit: string;
    referenceRange: string;
    flag: string;
  }>;

  onApprove?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  onPrint?: () => void;
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status?: string) {
  const value = status?.toLowerCase();

  if (
    value === "approved" ||
    value === "completed"
  ) {
    return "bg-green-50 text-green-700";
  }

  if (
    value === "rejected" ||
    value === "cancelled"
  ) {
    return "bg-red-50 text-red-700";
  }

  if (
    value === "pending" ||
    value === "submitted" ||
    value === "under_review"
  ) {
    return "bg-yellow-50 text-yellow-700";
  }

  return "bg-gray-100 text-gray-600";
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </dt>

      <dd className="mt-1 text-sm font-medium text-gray-800">
        {value || "—"}
      </dd>
    </div>
  );
}

export default function ApprovalDetails({
  approval,
  resultValue,
  unit,
  referenceRange,
  interpretation,
  comments,
  criticalValue = false,
  laboratoryInfo,
  orderInfo,
  sampleInfo,
  resultParameters,
  onApprove,
  onReject,
  onEdit,
  onPrint,
}: ApprovalDetailsProps) {
  const status =
    approval.status?.toLowerCase() || "pending";

  const canReview = [
    "pending",
    "submitted",
    "under_review",
  ].includes(status);

  return (
    <div className="space-y-6">
      {/* Laboratory Information */}
      {laboratoryInfo && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Laboratory Information
            </h2>
          </div>

          <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Laboratory Name"
              value={laboratoryInfo.name}
            />
            <InfoItem
              label="Address"
              value={laboratoryInfo.address}
            />
            <InfoItem
              label="Phone"
              value={laboratoryInfo.phone}
            />
            <InfoItem
              label="Email"
              value={laboratoryInfo.email}
            />
            <InfoItem
              label="Accreditation"
              value={laboratoryInfo.accreditation}
            />
          </dl>
        </section>
      )}

      {/* Header */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">
                  Approval Review
                </h1>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                    approval.status
                  )}`}
                >
                  {approval.status || "Pending"}
                </span>

                {criticalValue && (
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                    Critical Result
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-gray-500">
                {approval.resultNumber ||
                  `RES-${approval.resultId || approval.id}`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {canReview && onApprove && (
                <button
                  type="button"
                  onClick={onApprove}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Approve Result
                </button>
              )}

              {canReview && onReject && (
                <button
                  type="button"
                  onClick={onReject}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Reject Result
                </button>
              )}

              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
              )}

              <button
                type="button"
                onClick={
                  onPrint || (() => window.print())
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Approval Information */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Approval Information
          </h2>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Approval ID"
            value={approval.id}
          />
          <InfoItem
            label="Approval Status"
            value={approval.status}
          />
          <InfoItem
            label="Submitted At"
            value={formatDate(approval.submittedAt)}
          />
          <InfoItem
            label="Approved At"
            value={formatDate(approval.approvedAt)}
          />
          <InfoItem
            label="Submitted By"
            value={approval.submittedBy}
          />
          <InfoItem
            label="Approved By"
            value={approval.approvedBy}
          />
        </dl>
      </section>

      {/* Patient Information */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Patient Information
          </h2>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Patient"
            value={
              approval.patientId ? (
                <Link
                  href={`/patients/${approval.patientId}`}
                  className="hover:underline"
                >
                  {approval.patientName ||
                    `Patient #${approval.patientId}`}
                </Link>
              ) : (
                approval.patientName
              )
            }
          />

          <InfoItem
            label="Patient ID"
            value={approval.patientId}
          />

          <InfoItem
            label="Test"
            value={approval.testName}
          />

          <InfoItem
            label="Test Code"
            value={approval.testCode}
          />
        </dl>
      </section>

      {/* Order Information */}
      {orderInfo && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Order Information
            </h2>
          </div>

          <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              label="Order ID"
              value={orderInfo.orderId}
            />
            <InfoItem
              label="Accession Number"
              value={orderInfo.accessionNumber}
            />
            <InfoItem
              label="Order Date"
              value={formatDate(orderInfo.orderDate)}
            />
            <InfoItem
              label="Priority"
              value={orderInfo.priority}
            />
            <InfoItem
              label="Referring Doctor"
              value={orderInfo.referringDoctor}
            />
          </dl>
        </section>
      )}

      {/* Sample Information */}
      {sampleInfo && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Sample Information
            </h2>
          </div>

          <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              label="Sample ID"
              value={sampleInfo.sampleId}
            />
            <InfoItem
              label="Sample Type"
              value={sampleInfo.sampleType}
            />
            <InfoItem
              label="Collection Date"
              value={formatDate(sampleInfo.collectionDate)}
            />
            <InfoItem
              label="Received Date"
              value={formatDate(sampleInfo.receivedDate)}
            />
            <InfoItem
              label="Sample Status"
              value={sampleInfo.sampleStatus}
            />
          </dl>
        </section>
      )}

      {/* Test Information */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Test Information
          </h2>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Test Name"
            value={approval.testName}
          />
          <InfoItem
            label="Test Code"
            value={approval.testCode}
          />
        </dl>
      </section>

      {/* Result Information */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Result Information
          </h2>
        </div>

        {resultParameters && resultParameters.length > 0 ? (
          <div className="p-5">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Parameter
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Result
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Unit
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Reference Range
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Flag
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resultParameters.map((param, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {param.parameterName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {param.result}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {param.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {param.referenceRange}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        param.flag === 'CRITICAL' ? 'bg-red-50 text-red-700' :
                        param.flag === 'HIGH' ? 'bg-orange-50 text-orange-700' :
                        param.flag === 'LOW' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-green-50 text-green-700'
                      }`}>
                        {param.flag}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <div
              className={`rounded-xl border p-6 ${
                criticalValue
                  ? "border-red-200 bg-red-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Observed Value
              </p>

              <div className="mt-3 flex flex-wrap items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  {resultValue ?? "—"}
                </span>

                {unit && (
                  <span className="text-base font-medium text-gray-500">
                    {unit}
                  </span>
                )}
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Reference Range
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {referenceRange || "Not specified"}
                </p>
              </div>

              {criticalValue && (
                <div className="mt-5 rounded-lg border border-red-200 bg-white p-4">
                  <p className="font-semibold text-red-800">
                    Critical Result
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    Review this result carefully before
                    approving it.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Clinical Review */}

      {(interpretation || comments) && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Clinical Review
            </h2>
          </div>

          <div className="space-y-5 p-5">
            {interpretation && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Interpretation
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {interpretation}
                </p>
              </div>
            )}

            {comments && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Comments
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {comments}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Approval History */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Approval History
          </h2>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Submitted By"
            value={approval.submittedBy}
          />

          <InfoItem
            label="Submitted At"
            value={formatDate(
              approval.submittedAt
            )}
          />

          <InfoItem
            label="Approved By"
            value={approval.approvedBy}
          />

          <InfoItem
            label="Approved At"
            value={formatDate(
              approval.approvedAt
            )}
          />
        </dl>

        {approval.rejectedBy && (
          <div className="border-t border-gray-100 p-5">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                Rejection Information
              </p>

              <p className="mt-2 text-sm font-medium text-red-800">
                Rejected by:{" "}
                {approval.rejectedBy}
              </p>

              <p className="mt-1 text-sm text-red-700">
                Rejected at:{" "}
                {formatDate(
                  approval.rejectedAt
                )}
              </p>

              {approval.rejectionReason && (
                <p className="mt-2 text-sm text-red-700">
                  Reason:{" "}
                  {approval.rejectionReason}
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Review Actions */}

      {canReview && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Review Decision
            </h2>
          </div>

          <div className="flex flex-col gap-3 p-5 sm:flex-row">
            {onApprove && (
              <button
                type="button"
                onClick={onApprove}
                className="flex-1 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
              >
                ✓ Approve Result
              </button>
            )}

            {onReject && (
              <button
                type="button"
                onClick={onReject}
                className="flex-1 rounded-lg border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Reject Result
              </button>
            )}
          </div>
        </section>
      )}

      {/* Navigation */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-3 p-5">
          {approval.resultId && (
            <Link
              href={`/results/${approval.resultId}`}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Result
            </Link>
          )}

          {approval.patientId && (
            <Link
              href={`/patients/${approval.patientId}`}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Patient
            </Link>
          )}

          <Link
            href="/approvals"
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            All Approvals
          </Link>
        </div>
      </section>
    </div>
  );
}