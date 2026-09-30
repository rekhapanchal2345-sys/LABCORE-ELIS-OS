"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboardlayout";
import DoctorTable, { Doctor } from "@/components/doctors/DoctorTable";
import DoctorQuickViewModal, { DoctorProfileData } from "@/components/doctors/DoctorQuickViewModal";
import DoctorCommissionPayoutModal from "@/components/doctors/DoctorCommissionPayoutModal";
import DoctorModalForm from "@/components/doctors/DoctorModalForm";
import { doctorApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { showSuccess, showError } from "@/lib/notifications";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Users,
  Award,
  DollarSign,
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Building,
  ShieldCheck,
  CheckCircle,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

export default function DoctorsPage() {
  const { hasAnyRole } = useAuth();
  
  // Role permissions
  const canAddDoctor = hasAnyRole(["ADMIN", "SUPER_ADMIN", "FRONT_DESK"]);
  const canEditDoctor = hasAnyRole(["ADMIN", "SUPER_ADMIN", "FRONT_DESK"]);
  const canDeleteDoctor = hasAnyRole(["ADMIN", "SUPER_ADMIN"]);
  const canPayoutDoctor = hasAnyRole(["ADMIN", "SUPER_ADMIN", "FRONT_DESK"]);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search, Filters & Tabs
  const [activeTab, setActiveTab] = useState<"all" | "referring" | "pathologists" | "pending_payouts">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modals state
  const [selectedDoctorForView, setSelectedDoctorForView] = useState<DoctorProfileData | null>(null);
  const [selectedDoctorForPayout, setSelectedDoctorForPayout] = useState<DoctorProfileData | null>(null);
  const [doctorToEdit, setDoctorToEdit] = useState<DoctorProfileData | null>(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch doctors on parameter change
  useEffect(() => {
    fetchDoctors();
  }, [page, limit, activeTab, filterSpecialization, filterStatus, debouncedSearch]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, any> = {
        page,
        limit,
      };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (filterSpecialization) params.specialization = filterSpecialization;
      if (filterStatus) params.isActive = filterStatus === "active" ? "true" : "false";

      if (activeTab === "referring") {
        params.doctorType = "REFERRING_DOCTOR";
      } else if (activeTab === "pathologists") {
        params.doctorType = "PATHOLOGIST";
      }

      const response = await doctorApi.getAll(params);

      if (response && response.success !== false) {
        const docs = response.data?.doctors || response.data || [];
        const pagination = response.data?.pagination || response.pagination;

        setDoctors(docs);
        if (pagination) {
          setTotalCount(pagination.total || docs.length);
          setTotalPages(pagination.totalPages || 1);
        } else {
          setTotalCount(docs.length);
          setTotalPages(1);
        }
      } else {
        setError(response?.message || "Failed to fetch doctors from server");
        setDoctors([]);
      }
    } catch (err: any) {
      console.error("Error fetching doctors:", err);
      setError(err?.message || "Network error while connecting to server");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtering & Sorting Logic
  const getFilteredDoctors = () => {
    let list = [...doctors];

    if (activeTab === "pending_payouts") {
      list = list.filter(
        (d) =>
          d.doctorType !== "IN_HOUSE_PATHOLOGIST" &&
          d.doctorType !== "INTERNAL_PATHOLOGIST" &&
          d.doctorType !== "CONSULTANT_PATHOLOGIST" &&
          (((d as any).pendingPayout || 0) > 0 || (Number(d.commissionRate) || 0) > 0)
      );
    }

    // Sorting
    list.sort((a, b) => {
      let comp = 0;
      switch (sortBy) {
        case "name":
          const nameA = (a.fullName || a.name || "").toLowerCase();
          const nameB = (b.fullName || b.name || "").toLowerCase();
          comp = nameA.localeCompare(nameB);
          break;
        case "specialization":
          comp = (a.specialization || "").localeCompare(b.specialization || "");
          break;
        case "doctorCode":
          comp = (a.doctorCode || "").localeCompare(b.doctorCode || "");
          break;
        case "referrals":
          const refA = a._count?.orders || a._count?.patients || 0;
          const refB = b._count?.orders || b._count?.patients || 0;
          comp = refB - refA;
          break;
        default:
          comp = 0;
      }
      return sortOrder === "asc" ? comp : -comp;
    });

    return list;
  };

  const filteredDoctors = getFilteredDoctors();

  // Dynamic Real Financial & Clinical KPIs
  const totalDoctors = totalCount || doctors.length;
  const activeDoctors = doctors.filter((d) => d.isActive !== false).length;
  const referringCount = doctors.filter(
    (d) =>
      d.doctorType === "REFERRING_DOCTOR" ||
      (!d.doctorType && !(d.specialization || "").toLowerCase().includes("pathol"))
  ).length;
  const pathologistCount = doctors.filter(
    (d) =>
      d.doctorType === "IN_HOUSE_PATHOLOGIST" ||
      d.doctorType === "INTERNAL_PATHOLOGIST" ||
      d.doctorType === "CONSULTANT_PATHOLOGIST" ||
      (d.specialization || "").toLowerCase().includes("pathol")
  ).length;

  const totalReferrals = doctors.reduce(
    (acc, d) => acc + (d._count?.orders || d._count?.patients || 0),
    0
  );
  const monthlyReferrals = doctors.reduce(
    (acc, d) => acc + ((d as any).monthlyOrders || 0),
    0
  );
  const totalReferralRevenue = doctors.reduce(
    (acc, d) => acc + ((d as any).totalRevenue || 0),
    0
  );
  const totalPendingPayout = doctors.reduce(
    (acc, d) => acc + ((d as any).pendingPayout || 0),
    0
  );

  const specializationsList = Array.from(
    new Set(doctors.map((d) => d.specialization).filter(Boolean))
  ).sort();

  const handleDeleteDoctor = async (doctor: Doctor) => {
    const name = doctor.fullName || doctor.name || "this doctor";
    if (!confirm(`Are you sure you want to remove ${name} from your doctor directory?`)) {
      return;
    }

    try {
      const res = await doctorApi.delete(String(doctor.id));
      if (res && res.success === false) {
        showError(res.message || res.error || `Failed to remove Doctor ${name}`);
        return;
      }
      showSuccess(`Doctor ${name} removed successfully`);
      fetchDoctors();
    } catch (err: any) {
      console.error("Error deleting doctor:", err);
      showError(err?.message || err?.error || `Failed to remove Doctor ${name}`);
    }
  };

  const handleExportCSV = () => {
    if (filteredDoctors.length === 0) {
      showError("No doctor data to export");
      return;
    }

    const headers = [
      "Doctor Code",
      "Full Name",
      "Type",
      "Specialization",
      "Qualifications",
      "MCI/NMC Reg No",
      "Phone",
      "Email",
      "Clinic Name",
      "Commission Rate %",
      "Status",
    ];

    const rows = filteredDoctors.map((d) => [
      d.doctorCode || "",
      `"${d.fullName || d.name || ""}"`,
      d.doctorType || "REFERRING_DOCTOR",
      `"${d.specialization || ""}"`,
      `"${d.qualification || ""}"`,
      `"${d.registrationNumber || d.licenseNumber || ""}"`,
      `"${d.phone || ""}"`,
      `"${d.email || ""}"`,
      `"${d.clinicName || ""}"`,
      d.commissionRate || 0,
      d.isActive !== false ? "Active" : "Inactive",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `doctors_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showSuccess("Doctors Directory CSV exported successfully");
  };

  return (
    <ProtectedRoute requiredRoles={["ADMIN", "FRONT_DESK", "LAB_TECH", "PATHOLOGIST", "DOCTOR"]}>
      <DashboardLayout title="Doctors & Referral Management">
        <div className="space-y-6">
          
          {/* Modern Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 shadow-md">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner flex-shrink-0">
                  <Users className="w-7 h-7 text-indigo-100" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      Doctors & Referral Management
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm border border-white/20">
                      LIS B2B Portal
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-indigo-100">
                    Clinical practitioners, referring physician commissions, and pathologist digital authorizations
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-sm border border-white/20 transition-all active:scale-95"
                  title="Export Doctors to CSV"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>

                {canAddDoctor && (
                  <button
                    onClick={() => {
                      setDoctorToEdit(null);
                      setShowAddEditModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-lg transition-all active:scale-95 transform hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4 text-indigo-700" />
                    Add New Doctor
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold">Database Communication Notice</p>
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={fetchDoctors}
                className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          )}

          {/* Business & Clinical KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Total Doctors */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {activeDoctors} Active
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">{totalDoctors}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>Referring: <strong>{referringCount}</strong></span>
                <span>Pathologists: <strong>{pathologistCount}</strong></span>
              </div>
            </div>

            {/* KPI 2: Monthly Patient Referrals */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  This Month
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">{monthlyReferrals}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Patients referred this month (Total: {totalReferrals})</p>
            </div>

            {/* KPI 3: Referral Business Revenue */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Paid Revenue
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">₹{totalReferralRevenue.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Actual billing from paid orders</p>
            </div>

            {/* KPI 4: Pending Commission Payouts */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setActiveTab("pending_payouts")}
                  className="text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-2 py-0.5 rounded-full transition-colors"
                >
                  View Payouts
                </button>
              </div>
              <p className="text-2xl font-black text-purple-900">₹{totalPendingPayout.toLocaleString()}</p>
              <p className="text-xs text-purple-700 font-medium mt-1">Unsettled referral incentives</p>
            </div>

          </div>

          {/* Interactive Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-1">
            <button
              onClick={() => { setActiveTab("all"); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              All Practitioners ({totalDoctors})
            </button>

            <button
              onClick={() => { setActiveTab("referring"); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "referring"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Referring Physicians ({referringCount})
            </button>

            <button
              onClick={() => { setActiveTab("pathologists"); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "pathologists"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              In-House Pathologists ({pathologistCount})
            </button>

            <button
              onClick={() => { setActiveTab("pending_payouts"); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "pending_payouts"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Pending Commission Payouts (₹{totalPendingPayout.toLocaleString()})
            </button>
          </div>

          {/* Search, Specialization & Multi-Criteria Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search doctor across entire database by name, clinic, specialization, phone, code or MCI reg..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-medium placeholder-slate-400 focus:border-indigo-600 focus:outline-none"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filters & Sorters */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Specialization Select */}
                <select
                  value={filterSpecialization}
                  onChange={(e) => { setFilterSpecialization(e.target.value); setPage(1); }}
                  className="rounded-xl border border-slate-200 py-2 px-3 text-xs font-semibold text-slate-700 focus:border-indigo-600 focus:outline-none bg-white"
                >
                  <option value="">All Specializations</option>
                  {specializationsList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {/* Status Select */}
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                  className="rounded-xl border border-slate-200 py-2 px-3 text-xs font-semibold text-slate-700 focus:border-indigo-600 focus:outline-none bg-white"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {/* Sort By Select */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order as "asc" | "desc");
                  }}
                  className="rounded-xl border border-slate-200 py-2 px-3 text-xs font-semibold text-slate-700 focus:border-indigo-600 focus:outline-none bg-white"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="referrals-desc">Highest Referrals</option>
                  <option value="specialization-asc">Specialization</option>
                  <option value="doctorCode-asc">Doctor Code</option>
                </select>

                {(searchTerm || filterSpecialization || filterStatus) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterSpecialization("");
                      setFilterStatus("");
                      setPage(1);
                    }}
                    className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Reset Filters
                  </button>
                )}

              </div>
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span>
              Showing <strong className="text-slate-900">{filteredDoctors.length}</strong> doctors on Page {page} of {totalPages} (Total: {totalCount})
            </span>
            <span className="text-[11px] text-slate-400">
              Real server-side database pagination & search active
            </span>
          </div>

          {/* Clinical Doctor Directory Table */}
          <DoctorTable
            doctors={filteredDoctors}
            loading={loading}
            canEdit={canEditDoctor}
            canDelete={canDeleteDoctor}
            canPayout={canPayoutDoctor}
            onDelete={handleDeleteDoctor}
            onQuickView={(doc) => setSelectedDoctorForView(doc as DoctorProfileData)}
            onPayout={(doc) => setSelectedDoctorForPayout(doc as DoctorProfileData)}
            onEdit={(doc) => {
              setDoctorToEdit(doc as DoctorProfileData);
              setShowAddEditModal(true);
            }}
          />

          {/* Server Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">
                Page <strong className="text-slate-900">{page}</strong> of <strong>{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* MODAL 1: DOCTOR QUICK VIEW PROFILE DRAWER */}
        <DoctorQuickViewModal
          isOpen={Boolean(selectedDoctorForView)}
          onClose={() => setSelectedDoctorForView(null)}
          doctor={selectedDoctorForView}
          onOpenPayoutModal={(doc) => setSelectedDoctorForPayout(doc)}
          onEditDoctor={(doc) => {
            setDoctorToEdit(doc);
            setShowAddEditModal(true);
          }}
        />

        {/* MODAL 2: REFERRAL COMMISSION PAYOUT SETTLEMENT MODAL */}
        <DoctorCommissionPayoutModal
          isOpen={Boolean(selectedDoctorForPayout)}
          onClose={() => setSelectedDoctorForPayout(null)}
          doctor={selectedDoctorForPayout}
          onPayoutSuccess={() => fetchDoctors()}
        />

        {/* MODAL 3: IN-PAGE FAST ADD / EDIT DOCTOR MODAL */}
        <DoctorModalForm
          isOpen={showAddEditModal}
          onClose={() => setShowAddEditModal(false)}
          doctor={doctorToEdit}
          onSuccess={() => fetchDoctors()}
        />

      </DashboardLayout>
    </ProtectedRoute>
  );
}
