import { Doctor, ReportVerificationItem, Prescription, ReferralTransaction, PatientEMR } from '../types/doctor.types';

const BASE_URL = process.env.REACT_APP_API_URL || '/api/v1/doctor-module';

export const DoctorApiClient = {
  // 1. Doctor Management
  async getDoctors(params?: { department?: string; doctorType?: string; search?: string }): Promise<Doctor[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/doctors?${query}`);
    const json = await res.json();
    return json.data || [];
  },

  async getDoctorById(id: string): Promise<Doctor | null> {
    const res = await fetch(`${BASE_URL}/doctors/${id}`);
    const json = await res.json();
    return json.data || null;
  },

  async createDoctor(data: Partial<Doctor>): Promise<Doctor> {
    const res = await fetch(`${BASE_URL}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  // 2. Report Verification
  async getVerificationQueue(params?: { panicOnly?: boolean; department?: string; status?: string }): Promise<ReportVerificationItem[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/reports/verification-queue?${query}`);
    const json = await res.json();
    return json.data || [];
  },

  async signOffReport(reportId: string, payload: {
    doctorId: string;
    doctorName: string;
    designation: string;
    medicalRegNo?: string;
    doctorRemarks: string;
  }): Promise<ReportVerificationItem> {
    const res = await fetch(`${BASE_URL}/reports/${reportId}/sign-off`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async orderReportReRun(reportId: string, reason: string, doctorName: string): Promise<ReportVerificationItem> {
    const res = await fetch(`${BASE_URL}/reports/${reportId}/re-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, doctorName })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  // 3. E-Prescription & CPOE
  async getPrescriptions(params?: { doctorId?: string; patientUhid?: string }): Promise<Prescription[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/prescriptions?${query}`);
    const json = await res.json();
    return json.data || [];
  },

  async createPrescription(data: Partial<Prescription>): Promise<Prescription> {
    const res = await fetch(`${BASE_URL}/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  // 4. Referral Ledger & Settlements
  async getReferralLedger(params?: { doctorId?: string; payoutStatus?: string }): Promise<ReferralTransaction[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/referrals/ledger?${query}`);
    const json = await res.json();
    return json.data || [];
  },

  async settleReferralPayout(transactionId: string, settlementInfo: {
    paymentMode?: string;
    paymentReferenceNumber?: string;
    remarks?: string;
    settledByAdmin?: string;
  }): Promise<ReferralTransaction> {
    const res = await fetch(`${BASE_URL}/referrals/payout/${transactionId}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settlementInfo)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  // 5. Patient EMR & Longitudinal Trends
  async getPatientEMR(uhid: string): Promise<PatientEMR | null> {
    const res = await fetch(`${BASE_URL}/emr/patient/${uhid}`);
    const json = await res.json();
    return json.data || null;
  },

  async getAllPatientEMRs(): Promise<PatientEMR[]> {
    const res = await fetch(`${BASE_URL}/emr/patients`);
    const json = await res.json();
    return json.data || [];
  }
};
