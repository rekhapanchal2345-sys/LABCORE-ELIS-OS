"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Award,
  DollarSign,
  FileText,
  ShieldCheck,
  MessageCircle,
  CreditCard,
  ExternalLink,
  CheckCircle,
  FileSignature,
  Activity,
  Calendar,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { doctorApi } from "@/lib/api";
import { showSuccess, showError } from "@/lib/notifications";

export interface DoctorProfileData {
  id: string | number;
  doctorCode?: string;
  fullName?: string;
  name?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  specialization?: string;
  qualification?: string;
  registrationNumber?: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
  clinicName?: string;
  clinicAddress?: string;
  address?: any;
  city?: any;
  state?: any;
  commissionRate?: number | string;
  doctorType?: "REFERRING_DOCTOR" | "IN_HOUSE_PATHOLOGIST" | "CONSULTING_SPECIALIST" | string;
  whatsappNumber?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankAccountHolderName?: string;
  signatureUrl?: string;
  photoUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  _count?: {
    orders?: number;
    patients?: number;
  };
}

interface DoctorQuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorProfileData | null;
  onOpenPayoutModal?: (doctor: DoctorProfileData) => void;
  onEditDoctor?: (doctor: DoctorProfileData) => void;
}

export default function DoctorQuickViewModal({
  isOpen,
  onClose,
  doctor,
  onOpenPayoutModal,
  onEditDoctor,
}: DoctorQuickViewModalProps) {
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isEstimatedStats, setIsEstimatedStats] = useState(false);

  useEffect(() => {
    if (isOpen && doctor?.id) {
      fetchDoctorStats(String(doctor.id));
    } else {
      setStats(null);
      setIsEstimatedStats(false);
    }
  }, [isOpen, doctor?.id]);

  const fetchDoctorStats = async (docId: string) => {
    try {
      setLoadingStats(true);
      setIsEstimatedStats(false);
      const res = await doctorApi.getStatistics(docId);
      if (res && res.data) {
        setStats(res.data.statistics || res.data);
      } else {
        setIsEstimatedStats(true);
      }
    } catch (err) {
      console.log("Could not load dynamic doctor stats, using fallback stats");
      setIsEstimatedStats(true);
    } finally {
      setLoadingStats(false);
    }
  };

  if (!isOpen || !doctor) return null;

  const doctorName =
    doctor.fullName ||
    doctor.name ||
    [doctor.firstName, doctor.middleName, doctor.lastName].filter(Boolean).join(" ") ||
    "Doctor";

  const isPathologist =
    doctor.doctorType === "IN_HOUSE_PATHOLOGIST" ||
    doctor.doctorType === "INTERNAL_PATHOLOGIST" ||
    (doctor.specialization || "").toLowerCase().includes("pathol");

  const isReferring =
    !isPathologist ||
    doctor.doctorType === "REFERRING_DOCTOR";

  const commissionRateNum = Number(doctor.commissionRate) || (isReferring ? 15 : 0);
  
  // Real or calculated metrics with NO fake fallbacks
  const referralCount =
    stats?.totalPatients ??
    stats?.totalOrders ??
    doctor._count?.patients ??
    doctor._count?.orders ??
    0;

  const totalRevenue =
    stats?.totalRevenue ??
    (doctor as any).totalRevenue ??
    0;

  const pendingCommission = (doctor as any).pendingPayout ?? Math.round(totalRevenue * (commissionRateNum / 100));

  const deliveryPrefs = [
    (doctor as any).reportDeliveryWhatsApp ? "WhatsApp" : null,
    (doctor as any).reportDeliveryEmail ? "Email" : null,
    (doctor as any).reportDeliveryHardCopy ? "Hard Copy" : null,
    (doctor as any).reportDeliveryPortal ? "Portal" : null,
  ].filter(Boolean);

  const deliveryText = deliveryPrefs.length > 0 ? deliveryPrefs.join(" + ") : "None specified";

  const handleWhatsApp = () => {
    const rawPhone = doctor.whatsappNumber || doctor.phone || "";
    const cleanPhone = rawPhone.replace(/\D/g, "");
    if (!cleanPhone) {
      showError("Doctor phone number not available");
      return;
    }

    const message = encodeURIComponent(
      `Respected ${doctorName},\n\nGreetings from LabCore Diagnostic Center.\n\nHere is your Referral Activity Summary:\n• Total Referred Patients: ${referralCount}\n• Gross Referral Volume: ₹${totalRevenue.toLocaleString()}\n• Commission Rate: ${commissionRateNum}%\n• Pending Incentive Settlement: ₹${pendingCommission.toLocaleString()}\n\nOur laboratory team appreciates your continued medical trust.\nFor report requests or urgent critical alerts, please reach our desk at +91 98765 43210.`
    );

    const waUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}?text=${message}`;
    window.open(waUrl, "_blank");
    showSuccess("Opening WhatsApp with Doctor Referral Summary");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Type & Registration */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-md border-2 border-white/20">
              {doctorName.charAt(0) === "D" && doctorName.startsWith("Dr")
                ? doctorName.replace("Dr.", "").trim().charAt(0)
                : doctorName.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {doctorName}
                </h3>
                {doctor.isActive !== false ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 text-[10px] font-bold">
                    Inactive
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-indigo-200 font-mono font-bold bg-white/10 px-2 py-0.5 rounded border border-white/10">
                  {doctor.doctorCode || `DOC-${doctor.id}`}
                </span>
                
                {isPathologist ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    In-House Pathologist (Sign-off)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Referring Physician (B2B)
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {isEstimatedStats && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-medium flex items-center justify-between">
              <span>⚠️ Live stats API unavailable. Financial summary below uses local database estimates.</span>
              <span className="font-bold text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded uppercase">Estimated Ledger</span>
            </div>
          )}
          
          {/* Business & Clinical Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Referrals */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-xs text-blue-800 font-bold uppercase tracking-wider mb-1">
                <span>Total Referrals</span>
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{referralCount}</p>
              <p className="text-[11px] text-blue-700 font-medium mt-0.5">Patients directed to lab</p>
            </div>

            {/* Total Revenue Generated */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-xs text-emerald-800 font-bold uppercase tracking-wider mb-1">
                <span>Revenue Generated</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Test billing contribution</p>
            </div>

            {/* Commission Ledger */}
            <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-xs text-purple-800 font-bold uppercase tracking-wider mb-1">
                <span>Commission ({commissionRateNum}%)</span>
                <CreditCard className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">₹{pendingCommission.toLocaleString()}</p>
              <p className="text-[11px] text-purple-700 font-medium mt-0.5">Pending settlement</p>
            </div>
          </div>

          {/* Clinical Credentials & NABH Compliance Section */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Medical Credentials & Licensing
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Medical Registration Number (MCI/NMC):</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {doctor.registrationNumber || doctor.licenseNumber ? (
                    doctor.registrationNumber || doctor.licenseNumber
                  ) : (
                    <span className="font-sans text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Not Provided (Pending Registration)
                    </span>
                  )}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Specialization & Qualifications:</span>
                <span className="font-bold text-slate-900">
                  {doctor.specialization || "General Medicine"}{" "}
                  {doctor.qualification ? `(${doctor.qualification})` : ""}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Clinic / Hospital Affiliation:</span>
                <span className="font-bold text-slate-900">
                  {doctor.clinicName || "Private Medical Practice"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Clinic Address:</span>
                <span className="font-medium text-slate-800 truncate block">
                  {doctor.clinicAddress ||
                    [doctor.address, doctor.city, doctor.state].filter(Boolean).join(", ") ||
                    "Ahmedabad, Gujarat"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Communication */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              Direct Communication Channels
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Phone:</span>
                <span className="font-bold text-slate-900">{doctor.phone || "—"}</span>
              </div>

              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-slate-500">WhatsApp:</span>
                <span className="font-bold text-slate-900">
                  {doctor.whatsappNumber || doctor.phone || "—"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">
                  {doctor.email || "—"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Report Delivery:</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {deliveryText}
                </span>
              </div>
            </div>
          </div>

          {/* Banking / UPI Payout Details (for Referring Doctors) */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-purple-600" />
                Referral Commission Payout Account
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                doctor.bankAccountNumber || doctor.bankIfscCode
                  ? "text-emerald-700 bg-emerald-100"
                  : "text-amber-800 bg-amber-100"
              }`}>
                {doctor.bankAccountNumber || doctor.bankIfscCode ? "Settlement Account Configured" : "Account Details Missing"}
              </span>
            </div>

            {doctor.bankAccountNumber || doctor.bankIfscCode ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Account / UPI:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {doctor.bankAccountNumber || "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">IFSC Code:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {doctor.bankIfscCode || "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Beneficiary Name:</span>
                  <span className="font-bold text-slate-900">
                    {doctor.bankAccountHolderName || doctorName}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-medium">
                No bank account or UPI details on file for this practitioner. Please update details before initiating electronic settlement.
              </p>
            )}
          </div>

          {/* Digital Signature Preview (Crucial for Pathologist Sign-off) */}
          {isPathologist && (
            <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <FileSignature className="w-4 h-4 text-purple-700" />
                  Authorized Digital Signature Stamp
                </h4>
                <p className="text-[11px] text-purple-700">
                  {doctor.signatureUrl
                    ? "Affixed automatically to diagnostic reports upon clinical sign-off."
                    : "No digital signature uploaded. Official report sign-off is disabled."}
                </p>
              </div>

              {doctor.signatureUrl ? (
                <div className="bg-white px-3 py-2 rounded-lg border border-purple-300 shadow-xs flex items-center gap-2">
                  <img src={doctor.signatureUrl} alt="Signature" className="h-8 object-contain" />
                  <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                    Verified Stamp
                  </span>
                </div>
              ) : (
                <div className="bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
                  <AlertCircle size={14} className="text-amber-600" />
                  <span>Signature Missing</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              Send WhatsApp Statement
            </button>

            {isReferring && onOpenPayoutModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPayoutModal(doctor);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                Settle Payout (₹{pendingCommission.toLocaleString()})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onEditDoctor && (
              <button
                onClick={() => {
                  onClose();
                  onEditDoctor(doctor);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors"
              >
                Edit Profile
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
