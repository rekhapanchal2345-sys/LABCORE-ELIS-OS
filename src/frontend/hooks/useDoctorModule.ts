import { useState, useEffect, useCallback } from 'react';
import { Doctor, ReportVerificationItem, Prescription, ReferralTransaction, PatientEMR } from '../types/doctor.types';
import { DoctorApiClient } from '../api/doctorApiClient';

export function useDoctorModule() {
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'prescriptions' | 'referrals' | 'emr' | 'doctors'>('overview');
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [reports, setReports] = useState<ReportVerificationItem[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [referrals, setReferrals] = useState<ReferralTransaction[]>([]);
  const [emrs, setEmrs] = useState<PatientEMR[]>([]);
  
  const [selectedReport, setSelectedReport] = useState<ReportVerificationItem | null>(null);
  const [selectedEMR, setSelectedEMR] = useState<PatientEMR | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Logged In Doctor Context
  const currentDoctor = {
    id: "DOC-001",
    name: "Dr. Rohit Deshmukh",
    title: "Chief Pathologist & Lab Director",
    qualification: "MBBS, MD (Pathology), FICP",
    regNo: "MCI-48920/2012",
    department: "Pathology & Laboratory Medicine"
  };

  const refreshAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [docs, reps, rxs, refs, emrList] = await Promise.all([
        DoctorApiClient.getDoctors().catch(() => []),
        DoctorApiClient.getVerificationQueue().catch(() => []),
        DoctorApiClient.getPrescriptions().catch(() => []),
        DoctorApiClient.getReferralLedger().catch(() => []),
        DoctorApiClient.getAllPatientEMRs().catch(() => [])
      ]);

      setDoctors(docs);
      setReports(reps);
      setPrescriptions(rxs);
      setReferrals(refs);
      setEmrs(emrList);
      if (emrList.length > 0 && !selectedEMR) {
        setSelectedEMR(emrList[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch doctor module data');
    } finally {
      setLoading(false);
    }
  }, [selectedEMR]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Sign off a lab report
  const handleSignOffReport = async (reportId: string, doctorRemarks: string) => {
    try {
      const updated = await DoctorApiClient.signOffReport(reportId, {
        doctorId: currentDoctor.id,
        doctorName: currentDoctor.name,
        designation: currentDoctor.title,
        medicalRegNo: currentDoctor.regNo,
        doctorRemarks
      });

      setReports(prev => prev.map(r => r.reportId === reportId ? updated : r));
      setSelectedReport(null);
      return { success: true, message: `Report ${reportId} authorized successfully!` };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  // Re-run test
  const handleOrderReRun = async (reportId: string, reason: string) => {
    try {
      const updated = await DoctorApiClient.orderReportReRun(reportId, reason, currentDoctor.name);
      setReports(prev => prev.map(r => r.reportId === reportId ? updated : r));
      setSelectedReport(null);
      return { success: true, message: 'Re-run order issued to lab technologist.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  // Create new Prescription
  const handleCreatePrescription = async (prescriptionData: Partial<Prescription>) => {
    try {
      const newRx = await DoctorApiClient.createPrescription({
        doctor: {
          doctorId: currentDoctor.id,
          doctorName: currentDoctor.name,
          specialization: currentDoctor.title,
          councilRegNo: currentDoctor.regNo,
          department: currentDoctor.department
        },
        ...prescriptionData
      });

      setPrescriptions(prev => [newRx, ...prev]);
      return { success: true, data: newRx };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  // Settle Referral Payout
  const handleSettlePayout = async (transactionId: string, utr: string) => {
    try {
      const updated = await DoctorApiClient.settleReferralPayout(transactionId, {
        paymentMode: 'NEFT / IMPS / RTGS',
        paymentReferenceNumber: utr,
        settledByAdmin: currentDoctor.name
      });

      setReferrals(prev => prev.map(t => t.transactionId === transactionId ? updated : t));
      return { success: true, message: `Payout for ${transactionId} settled with UTR: ${utr}` };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  // Statistics calculation
  const stats = {
    pendingReports: reports.filter(r => r.status.includes('Pending') || r.status.includes('Panic')).length,
    panicReports: reports.filter(r => r.panicAlertAudit?.isPanicReport).length,
    totalDoctors: doctors.length,
    totalReferralPayout: referrals.reduce((sum, r) => sum + r.netCommissionPayable, 0),
    totalGrossReferral: referrals.reduce((sum, r) => sum + r.totalGrossCommission, 0),
    totalTdsDeductions: referrals.reduce((sum, r) => sum + r.tdsAmount, 0),
    pendingPayoutAmount: referrals.filter(r => r.payoutStatus !== 'Paid & Settled').reduce((sum, r) => sum + r.netCommissionPayable, 0)
  };

  return {
    activeTab,
    setActiveTab,
    doctors,
    reports,
    prescriptions,
    referrals,
    emrs,
    selectedReport,
    setSelectedReport,
    selectedEMR,
    setSelectedEMR,
    loading,
    error,
    currentDoctor,
    stats,
    refreshAllData,
    handleSignOffReport,
    handleOrderReRun,
    handleCreatePrescription,
    handleSettlePayout
  };
}
