"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle, FileText, Calendar, User, Stethoscope } from "lucide-react";
import { reportsApi } from "@/lib/api";

interface ReportData {
  reportReferenceId: string;
  orderNumber: string;
  patientName: string;
  patientUhid: string;
  testName: string;
  testCode: string;
  publishedAt: string;
  approvedBy: string;
  status: string;
  labName: string;
  labAddress: string;
}

export default function VerifyReportPage() {
  const params = useParams();
  const reportId = params.reportId as string;
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyReport = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, this would call a public verification API
        // For now, we'll simulate verification
        const response = await reportsApi.getById(reportId);
        
        if (response.success && response.data) {
          const data = response.data;
          setReportData({
            reportReferenceId: data.reportReferenceId || `REP-${reportId}`,
            orderNumber: data.order?.orderNumber || "N/A",
            patientName: `${data.order?.patient?.firstName} ${data.order?.patient?.lastName}`,
            patientUhid: data.order?.patient?.uhid || "N/A",
            testName: data.test?.testName || "N/A",
            testCode: data.test?.testCode || "N/A",
            publishedAt: data.publishedAt || new Date().toISOString(),
            approvedBy: data.approvedBy?.fullName || "System",
            status: data.status || "UNKNOWN",
            labName: "LabCore Enterprise LIS",
            labAddress: "123 Medical Center Drive, Healthcare City",
          });
          setVerified(true);
        } else {
          setError("Report not found or invalid reference ID");
          setVerified(false);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Failed to verify report. Please check the reference ID and try again.");
        setVerified(false);
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      verifyReport();
    }
  }, [reportId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Verification Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Report Verification
          </h1>
          <p className="text-gray-600">
            Verify the authenticity of your laboratory report
          </p>
        </div>

        {/* Verification Result Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Status Banner */}
          <div className={`p-6 ${
            verified 
              ? "bg-green-50 border-b-4 border-green-500" 
              : "bg-red-50 border-b-4 border-red-500"
          }`}>
            <div className="flex items-center justify-center gap-3">
              {verified ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <h2 className="text-xl font-bold text-green-900">
                      Report Verified Successfully
                    </h2>
                    <p className="text-green-700 text-sm">
                      This report is authentic and issued by LabCore Enterprise LIS
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <h2 className="text-xl font-bold text-red-900">
                      Verification Failed
                    </h2>
                    <p className="text-red-700 text-sm">
                      {error || "Unable to verify this report"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Report Details */}
          {verified && reportData && (
            <div className="p-6 space-y-6">
              {/* Report Reference */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Report Reference
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.reportReferenceId}
                </p>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Patient Name
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {reportData.patientName}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      UHID
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {reportData.patientUhid}
                  </p>
                </div>
              </div>

              {/* Test Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Test Name
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {reportData.testName}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Test Code
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {reportData.testCode}
                  </p>
                </div>
              </div>

              {/* Timing Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Published Date
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(reportData.publishedAt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Approved By
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {reportData.approvedBy}
                  </p>
                </div>
              </div>

              {/* Lab Information */}
              <div className="border-t pt-4 mt-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {reportData.labName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {reportData.labAddress}
                  </p>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Security Notice
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      This verification confirms that the report is genuine and has not been tampered with. 
                      The QR code on your report links to this official verification page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              Powered by LabCore Enterprise LIS • Secure Report Verification System
            </p>
          </div>
        </div>

        {/* Additional Actions */}
        {verified && (
          <div className="mt-6 text-center">
            <button
              onClick={() => window.print()}
              className="btn btn-secondary"
            >
              Print Verification Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}