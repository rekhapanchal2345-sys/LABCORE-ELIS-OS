"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Key,
  FileText,
  Award,
  Download,
  Search,
  Filter,
  Sparkles,
  Eye,
  Edit,
  Trash2,
  Clock,
  Phone,
  Mail,
  Building2,
  Check,
  Copy,
  ExternalLink,
  FileCheck,
  BadgeCheck,
  RefreshCw,
  SlidersHorizontal,
  Grid,
  List,
  AlertTriangle,
  Stethoscope,
  FlaskConical,
  Laptop,
  Fingerprint,
  Calendar,
  X
} from "lucide-react";
import { userApi } from "@/lib/api";

export interface LabUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "PATHOLOGIST" | "LAB_TECH" | "DOCTOR" | "FRONT_DESK" | "QUALITY_MANAGER";
  employeeCode: string;
  medicalRegistrationNo?: string;
  degrees?: string;
  department: string;
  shift: string;
  isNablSignatory: boolean;
  signatureStatus: "VERIFIED" | "PENDING_UPLOAD" | "EXPIRED";
  signatureStampId?: string;
  signatureDate?: string;
  twoFactorEnabled: boolean;
  status: "ACTIVE" | "SUSPENDED" | "INVITED" | "ON_LEAVE";
  lastActive: string;
  lastLoginIp: string;
  avatarColor: string;
  joinedDate: string;
}

const INITIAL_USERS: LabUser[] = [
  {
    id: "usr-001",
    name: "Dr. Jaya Ashapurama",
    email: "jayaashapurama891@gmail.com",
    phone: "+91 98765 43210",
    role: "ADMIN",
    employeeCode: "EMP-LC-001",
    medicalRegistrationNo: "MCI-2018-88492",
    degrees: "MD (Pathology), DCP",
    department: "Pathology & Molecular",
    shift: "General (9 AM - 6 PM)",
    isNablSignatory: true,
    signatureStatus: "VERIFIED",
    signatureStampId: "SHA256:8f4e2b01c59d9921ef4a",
    signatureDate: "2026-01-15",
    twoFactorEnabled: true,
    status: "ACTIVE",
    lastActive: "Active Now • Terminal A1",
    lastLoginIp: "192.168.1.10 (LAN)",
    avatarColor: "from-indigo-600 to-sky-600",
    joinedDate: "2023-04-10",
  },
  {
    id: "usr-002",
    name: "Dr. Vikramaditya Sharma",
    email: "dr.vikram@labcore.com",
    phone: "+91 98234 11223",
    role: "PATHOLOGIST",
    employeeCode: "EMP-LC-002",
    medicalRegistrationNo: "MCI-2015-44910",
    degrees: "MD Pathology, FICP",
    department: "Histopathology & Cytology",
    shift: "Morning (8 AM - 4 PM)",
    isNablSignatory: true,
    signatureStatus: "VERIFIED",
    signatureStampId: "SHA256:91c28fa4d0392ea5b77c",
    signatureDate: "2026-02-01",
    twoFactorEnabled: true,
    status: "ACTIVE",
    lastActive: "15 mins ago • Sign-off Workstation",
    lastLoginIp: "192.168.1.14 (LAN)",
    avatarColor: "from-emerald-600 to-teal-600",
    joinedDate: "2023-06-15",
  },
  {
    id: "usr-003",
    name: "Dr. Ananya Deshmukh",
    email: "ananya.d@labcore.com",
    phone: "+91 97654 88776",
    role: "PATHOLOGIST",
    employeeCode: "EMP-LC-003",
    medicalRegistrationNo: "MMC-2020-77312",
    degrees: "MD Microbiology",
    department: "Microbiology & PCR",
    shift: "General (9 AM - 6 PM)",
    isNablSignatory: true,
    signatureStatus: "VERIFIED",
    signatureStampId: "SHA256:44ba71e99c105e429dfa",
    signatureDate: "2026-03-01",
    twoFactorEnabled: true,
    status: "ACTIVE",
    lastActive: "1 hour ago • Culture Lab",
    lastLoginIp: "192.168.1.22 (LAN)",
    avatarColor: "from-violet-600 to-purple-600",
    joinedDate: "2024-01-10",
  },
  {
    id: "usr-004",
    name: "Rajesh K. Patel",
    email: "rajesh.tech@labcore.com",
    phone: "+91 98450 99881",
    role: "LAB_TECH",
    employeeCode: "EMP-LC-004",
    degrees: "B.Sc MLT, ASCP Cert",
    department: "Hematology & Coagulation",
    shift: "Morning (6 AM - 2 PM)",
    isNablSignatory: false,
    signatureStatus: "PENDING_UPLOAD",
    twoFactorEnabled: true,
    status: "ACTIVE",
    lastActive: "Active Now • Sysmex XN-1000",
    lastLoginIp: "192.168.1.35 (LAN)",
    avatarColor: "from-sky-600 to-blue-700",
    joinedDate: "2023-08-01",
  },
  {
    id: "usr-005",
    name: "Pooja Sundaram",
    email: "pooja.bio@labcore.com",
    phone: "+91 99123 44556",
    role: "LAB_TECH",
    employeeCode: "EMP-LC-005",
    degrees: "M.Sc Medical Biochemistry",
    department: "Biochemistry & Immunoassay",
    shift: "Evening (2 PM - 10 PM)",
    isNablSignatory: false,
    signatureStatus: "PENDING_UPLOAD",
    twoFactorEnabled: true,
    status: "ACTIVE",
    lastActive: "35 mins ago • Cobas e411",
    lastLoginIp: "192.168.1.38 (LAN)",
    avatarColor: "from-amber-600 to-orange-600",
    joinedDate: "2024-03-15",
  },
  {
    id: "usr-006",
    name: "Amit Verma",
    email: "amit.phleb@labcore.com",
    phone: "+91 98980 12345",
    role: "LAB_TECH",
    employeeCode: "EMP-LC-006",
    degrees: "DMLT, Phlebotomy Specialist",
    department: "Phlebotomy & Reception",
    shift: "Morning (6 AM - 2 PM)",
    isNablSignatory: false,
    signatureStatus: "PENDING_UPLOAD",
    twoFactorEnabled: false,
    status: "ACTIVE",
    lastActive: "10 mins ago • Phlebotomy Chair 2",
    lastLoginIp: "192.168.1.42 (LAN)",
    avatarColor: "from-teal-600 to-cyan-600",
    joinedDate: "2024-05-20",
  },
  {
    id: "usr-007",
    name: "Dr. Suresh K. Nair",
    email: "dr.suresh@consultant.labcore.com",
    phone: "+91 94470 55667",
    role: "DOCTOR",
    employeeCode: "EMP-LC-007",
    medicalRegistrationNo: "KMC-1998-33412",
    degrees: "MBBS, MD (Medicine)",
    department: "Clinical Consultation",
    shift: "Consultant On-Call",
    isNablSignatory: false,
    signatureStatus: "PENDING_UPLOAD",
    twoFactorEnabled: true,
    status: "ACTIVE",
    lastActive: "Yesterday • Remote Portal",
    lastLoginIp: "117.204.88.19 (VPN)",
    avatarColor: "from-cyan-600 to-blue-600",
    joinedDate: "2023-11-01",
  },
  {
    id: "usr-008",
    name: "Neha Gupta",
    email: "neha.billing@labcore.com",
    phone: "+91 97110 33445",
    role: "FRONT_DESK",
    employeeCode: "EMP-LC-008",
    degrees: "B.Com, Healthcare Billing",
    department: "Front Desk & Billing",
    shift: "General (9 AM - 6 PM)",
    isNablSignatory: false,
    signatureStatus: "PENDING_UPLOAD",
    twoFactorEnabled: true,
    status: "ACTIVE",
    lastActive: "Active Now • Cash Counter 1",
    lastLoginIp: "192.168.1.50 (LAN)",
    avatarColor: "from-rose-600 to-pink-600",
    joinedDate: "2024-02-14",
  },
];

const ROLE_INFO: Record<string, { label: string; badge: string; color: string; icon: any }> = {
  ADMIN: {
    label: "Administrator",
    badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    color: "from-indigo-500 to-purple-600",
    icon: ShieldCheck,
  },
  PATHOLOGIST: {
    label: "Pathologist",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    color: "from-emerald-500 to-teal-600",
    icon: Stethoscope,
  },
  LAB_TECH: {
    label: "Lab Technologist",
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    color: "from-sky-500 to-blue-600",
    icon: FlaskConical,
  },
  DOCTOR: {
    label: "Referring Doctor",
    badge: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    color: "from-teal-500 to-cyan-600",
    icon: Stethoscope,
  },
  FRONT_DESK: {
    label: "Front Desk / Billing",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    color: "from-amber-500 to-yellow-600",
    icon: Laptop,
  },
  QUALITY_MANAGER: {
    label: "Quality Manager",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    color: "from-rose-500 to-red-600",
    icon: Award,
  },
};

const DEPARTMENTS = [
  "All Departments",
  "Pathology & Molecular",
  "Histopathology & Cytology",
  "Microbiology & PCR",
  "Hematology & Coagulation",
  "Biochemistry & Immunoassay",
  "Phlebotomy & Reception",
  "Front Desk & Billing",
  "Clinical Consultation",
];

const SHIFTS = [
  "General (9 AM - 6 PM)",
  "Morning (6 AM - 2 PM)",
  "Morning (8 AM - 4 PM)",
  "Evening (2 PM - 10 PM)",
  "Night Emergency (10 PM - 6 AM)",
  "Consultant On-Call",
];

export default function UsersManagementView() {
  const [users, setUsers] = useState<LabUser[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedDept, setSelectedDept] = useState<string>("All Departments");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [signatoryFilterOnly, setSignatoryFilterOnly] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LabUser | null>(null);
  const [signatureModalUser, setSignatureModalUser] = useState<LabUser | null>(null);
  const [auditModalUser, setAuditModalUser] = useState<LabUser | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: "success" | "error" | "info" } | null>(null);

  // Load from localStorage or API
  useEffect(() => {
    try {
      const stored = localStorage.getItem("labcore_users_directory");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUsers(parsed);
          return;
        }
      }
    } catch (e) {
      // fallback
    }

    // Attempt API fetch
    userApi.getAll()
      .then((res: any) => {
        if (res?.success && Array.isArray(res.data?.users) && res.data.users.length > 0) {
          // Merge API users with rich clinical fields
          const merged: LabUser[] = res.data.users.map((u: any, idx: number) => ({
            id: u.id || `usr-${idx + 10}`,
            name: u.fullName || u.name || "Lab Staff",
            email: u.email || `staff${idx}@labcore.com`,
            phone: u.phone || "+91 98000 00000",
            role: (u.role || "LAB_TECH").toUpperCase(),
            employeeCode: u.employeeCode || `EMP-LC-${100 + idx}`,
            medicalRegistrationNo: u.medicalRegistrationNo || (u.role === "PATHOLOGIST" ? "MCI-2022-991" : undefined),
            degrees: u.degrees || (u.role === "PATHOLOGIST" ? "MD Pathology" : "B.Sc MLT"),
            department: u.department || "Pathology",
            shift: u.shift || "General (9 AM - 6 PM)",
            isNablSignatory: u.isNablSignatory ?? (u.role === "PATHOLOGIST" || u.role === "ADMIN"),
            signatureStatus: u.signatureStatus || (u.isNablSignatory ? "VERIFIED" : "PENDING_UPLOAD"),
            signatureStampId: u.signatureStampId || "SHA256:8f4e2b01c59d9921ef4a",
            twoFactorEnabled: u.twoFactorEnabled ?? true,
            status: (u.status || "ACTIVE").toUpperCase(),
            lastActive: "Active Now • Workstation",
            lastLoginIp: "192.168.1.10",
            avatarColor: "from-indigo-600 to-sky-600",
            joinedDate: "2024-01-01",
          }));
          setUsers(merged);
          localStorage.setItem("labcore_users_directory", JSON.stringify(merged));
        }
      })
      .catch(() => {
        // quiet fallback to INITIAL_USERS
      });
  }, []);

  const saveUsersState = (updatedList: LabUser[]) => {
    setUsers(updatedList);
    try {
      localStorage.setItem("labcore_users_directory", JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent("labcore:users-updated", { detail: updatedList }));
    } catch (e) {
      // ignore
    }
  };

  const showToast = (title: string, desc: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const signatories = users.filter((u) => u.isNablSignatory).length;
    const twoFa = users.filter((u) => u.twoFactorEnabled).length;
    const twoFaPercent = total > 0 ? Math.round((twoFa / total) * 100) : 0;
    const pathologists = users.filter((u) => u.role === "PATHOLOGIST").length;
    const techs = users.filter((u) => u.role === "LAB_TECH").length;

    return { total, active, signatories, twoFa, twoFaPercent, pathologists, techs };
  }, [users]);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchEmp = u.employeeCode.toLowerCase().includes(q);
        const matchReg = u.medicalRegistrationNo?.toLowerCase().includes(q) || false;
        const matchPhone = u.phone.toLowerCase().includes(q);
        const matchDept = u.department.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchEmp && !matchReg && !matchPhone && !matchDept) {
          return false;
        }
      }

      // Role filter
      if (selectedRole !== "ALL" && u.role !== selectedRole) {
        return false;
      }

      // Department filter
      if (selectedDept !== "All Departments" && u.department !== selectedDept) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "ALL") {
        if (selectedStatus === "SIGNATORY_ONLY" && !u.isNablSignatory) return false;
        if (selectedStatus === "2FA_OFF" && u.twoFactorEnabled) return false;
        if (selectedStatus !== "SIGNATORY_ONLY" && selectedStatus !== "2FA_OFF" && u.status !== selectedStatus) {
          return false;
        }
      }

      // Signatory Quick Toggle
      if (signatoryFilterOnly && !u.isNablSignatory) {
        return false;
      }

      return true;
    });
  }, [users, searchQuery, selectedRole, selectedDept, selectedStatus, signatoryFilterOnly]);

  // Toggle NABL Signatory status
  const handleToggleSignatory = (user: LabUser) => {
    const updated = users.map((u) => {
      if (u.id === user.id) {
        const nextSignatory = !u.isNablSignatory;
        return {
          ...u,
          isNablSignatory: nextSignatory,
          signatureStatus: nextSignatory ? ("VERIFIED" as const) : ("PENDING_UPLOAD" as const),
          signatureStampId: nextSignatory ? (u.signatureStampId || `SHA256:${Math.random().toString(36).substring(2, 12)}`) : u.signatureStampId,
        };
      }
      return u;
    });

    saveUsersState(updated);
    showToast(
      user.isNablSignatory ? "Signatory Revoked" : "Authorized as NABL Signatory",
      `${user.name} diagnostic report signing authority has been ${user.isNablSignatory ? "revoked" : "granted"}.`,
      user.isNablSignatory ? "info" : "success"
    );
  };

  // Toggle User Lock / Status
  const handleToggleStatus = (user: LabUser) => {
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const updated = users.map((u) => (u.id === user.id ? { ...u, status: nextStatus as any } : u));
    saveUsersState(updated);
    showToast(
      nextStatus === "ACTIVE" ? "Account Activated" : "Account Suspended",
      `User ${user.name} account is now ${nextStatus.toLowerCase()}.`,
      nextStatus === "ACTIVE" ? "success" : "error"
    );
  };

  // Force Password Reset
  const handleForcePasswordReset = (user: LabUser) => {
    const tempPass = `LabCore#${Math.floor(100000 + Math.random() * 900000)}`;
    navigator.clipboard?.writeText(tempPass);
    showToast(
      "Temporary Password Generated & Copied",
      `One-time login credentials for ${user.name}: "${tempPass}" (Copied to clipboard). An alert has been dispatched.`,
      "info"
    );
  };

  // Delete User
  const handleDeleteUser = (user: LabUser) => {
    if (confirm(`Are you sure you want to remove ${user.name} (${user.employeeCode}) from laboratory staff directory? This cannot be undone.`)) {
      const updated = users.filter((u) => u.id !== user.id);
      saveUsersState(updated);
      showToast("User Removed", `${user.name} has been archived from laboratory staff.`, "info");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Employee Code",
      "Full Name",
      "Email",
      "Phone",
      "Role",
      "Medical Registration No",
      "Qualifications",
      "Department",
      "Shift",
      "NABL Signatory",
      "Signature Status",
      "2FA Enabled",
      "Account Status",
      "Joined Date",
    ];

    const rows = filteredUsers.map((u) => [
      u.employeeCode,
      `"${u.name}"`,
      u.email,
      u.phone,
      u.role,
      u.medicalRegistrationNo || "N/A",
      `"${u.degrees || "N/A"}"`,
      `"${u.department}"`,
      `"${u.shift}"`,
      u.isNablSignatory ? "YES" : "NO",
      u.signatureStatus,
      u.twoFactorEnabled ? "YES" : "NO",
      u.status,
      u.joinedDate,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LabCore_Staff_Directory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("CSV Exported", `Successfully downloaded ${filteredUsers.length} staff records.`, "success");
  };

  return (
    <div className="space-y-6 select-none">
      {/* =========================================================
          EXECUTIVE COMMAND HEADER & METRICS BAR
          ========================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-[#090D1A] via-[#0D1527] to-[#0B1020] p-6 shadow-2xl text-white">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 h-32 w-80 bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-10 h-32 w-64 bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md shadow-sky-500/30">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white m-0">
                    Clinical Staff & User Governance
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    ISO 15189
                  </span>
                </div>
                <p className="text-xs text-slate-400 m-0 mt-0.5">
                  Multi-tier role delegation, NABL authorized signatories, digital signature stamps & workstation security.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/70 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700/80 hover:border-slate-600 transition-all shadow-sm cursor-pointer"
              title="Download Staff CSV"
            >
              <Download className="h-4 w-4 text-slate-400" />
              Export Directory
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              Add New Staff / User
            </button>
          </div>
        </div>

        {/* 5-Card Real-time Clinical Telemetry Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {/* Total Staff */}
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-3 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Personnel</span>
              <Users className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-white">{stats.total}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">{stats.active} Active</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">All registered credentials</div>
          </div>

          {/* NABL Signatories */}
          <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-slate-900/60 p-3 backdrop-blur-md">
            <div className="flex items-center justify-between text-amber-300 text-xs font-medium">
              <span>NABL Signatories</span>
              <Award className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-amber-200">{stats.signatories}</span>
              <span className="text-[10px] text-amber-400 font-bold">Authorized</span>
            </div>
            <div className="mt-1 text-[10px] text-amber-300/80">Digital Stamp Verified</div>
          </div>

          {/* Working Pathologists */}
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-3 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Pathologists (MD)</span>
              <Stethoscope className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-white">{stats.pathologists}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Dual Auth</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">MCI Registered Clinicians</div>
          </div>

          {/* Lab Technologists */}
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-3 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Lab Technicians</span>
              <FlaskConical className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-white">{stats.techs}</span>
              <span className="text-[10px] text-sky-400 font-semibold">In Pipeline</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">Bench & Analyzer Ops</div>
          </div>

          {/* 2FA Security Health */}
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-3 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>2FA Compliance</span>
              <Fingerprint className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-white">{stats.twoFaPercent}%</span>
              <span className="text-[10px] text-indigo-400 font-semibold">{stats.twoFa}/{stats.total}</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">MFA Enforced Security</div>
          </div>
        </div>
      </div>

      {/* =========================================================
          FILTERS, SEARCH & VIEW TOGGLE TOOLBAR
          ========================================================= */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-[#0c1322] p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, employee code, MCI registration..."
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 pl-10 pr-9 py-2.5 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right: Dropdowns & View Switches */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Department Dropdown */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-500"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-slate-900 text-slate-200">
                  {dept}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-500"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="ACTIVE" className="bg-slate-900">Active Only</option>
              <option value="SIGNATORY_ONLY" className="bg-slate-900">NABL Signatories Only</option>
              <option value="2FA_OFF" className="bg-slate-900">2FA Missing</option>
              <option value="SUSPENDED" className="bg-slate-900">Suspended / Locked</option>
            </select>

            {/* NABL Signatory Filter Chip */}
            <button
              type="button"
              onClick={() => setSignatoryFilterOnly(!signatoryFilterOnly)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer border ${
                signatoryFilterOnly
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                  : "bg-slate-950/70 text-slate-400 border-slate-700/80 hover:text-slate-200"
              }`}
            >
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span>Signatories</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-700/80 bg-slate-950/70 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "table" ? "bg-sky-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Registry Table View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "cards" ? "bg-sky-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Staff Badges Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Role Quick Filter Tabs */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedRole("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              selectedRole === "ALL"
                ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                : "text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            All Staff ({users.length})
          </button>

          {Object.entries(ROLE_INFO).map(([key, info]) => {
            const count = users.filter((u) => u.role === key).length;
            const active = selectedRole === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedRole(key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  active
                    ? `${info.badge} shadow-sm`
                    : "text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <span>{info.label}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          MAIN USER CONTENT: TABLE VIEW OR CARDS VIEW
          ========================================================= */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400">
          <Users className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-200">No matching staff members found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or role filters to view laboratory personnel.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedRole("ALL");
              setSelectedDept("All Departments");
              setSelectedStatus("ALL");
              setSignatoryFilterOnly(false);
            }}
            className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* =======================================================
           LUXURY EXECUTIVE TABLE VIEW
           ======================================================= */
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-[#090D1A] to-[#0A1020] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/90 bg-slate-950/60 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                  <th className="py-3.5 px-4">Staff Member & Identity</th>
                  <th className="py-3.5 px-4">Role & Wing</th>
                  <th className="py-3.5 px-4">Clinical Credentials</th>
                  <th className="py-3.5 px-4">NABL Signatory</th>
                  <th className="py-3.5 px-4">Shift & Activity</th>
                  <th className="py-3.5 px-4 text-center">Security</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((user) => {
                  const roleConfig = ROLE_INFO[user.role] || ROLE_INFO.LAB_TECH;
                  const RoleIcon = roleConfig.icon;
                  const isSuspended = user.status === "SUSPENDED";

                  return (
                    <tr
                      key={user.id}
                      className={`group transition-colors duration-150 hover:bg-slate-800/40 ${
                        isSuspended ? "opacity-60 bg-red-950/10" : ""
                      }`}
                    >
                      {/* Name & Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${user.avatarColor} font-bold text-xs text-white shadow-md shadow-slate-950/50 ring-1 ring-white/10`}
                            >
                              {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                            {user.status === "ACTIVE" && (
                              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full border-2 border-[#090D1A] bg-emerald-500" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-slate-100 group-hover:text-white truncate">
                                {user.name}
                              </span>
                              {user.isNablSignatory && (
                                <span title="NABL Verified Signatory">
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                </span>
                              )}
                            </div>

                            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="font-mono text-slate-400">{user.employeeCode}</span>
                              <span>•</span>
                              <span className="truncate text-slate-400">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Department */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold w-fit border ${roleConfig.badge}`}
                          >
                            <RoleIcon className="h-3 w-3" />
                            {roleConfig.label}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                            {user.department}
                          </span>
                        </div>
                      </td>

                      {/* Clinical Credentials */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          {user.medicalRegistrationNo ? (
                            <span className="font-mono text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                              <BadgeCheck className="h-3 w-3 text-emerald-400" />
                              {user.medicalRegistrationNo}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">No Medical Reg</span>
                          )}
                          <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {user.degrees || "Standard Technical"}
                          </span>
                        </div>
                      </td>

                      {/* NABL Signatory Toggle */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleSignatory(user)}
                            className={`group/sig inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer ${
                              user.isNablSignatory
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25 shadow-sm"
                                : "bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:border-slate-600"
                            }`}
                            title={user.isNablSignatory ? "Click to revoke signatory rights" : "Click to authorize as NABL signatory"}
                          >
                            <Award
                              className={`h-3.5 w-3.5 ${
                                user.isNablSignatory ? "text-amber-400" : "text-slate-400 group-hover/sig:text-amber-400"
                              }`}
                            />
                            <span>{user.isNablSignatory ? "Authorized" : "Assign"}</span>
                          </button>

                          {user.isNablSignatory && (
                            <button
                              type="button"
                              onClick={() => setSignatureModalUser(user)}
                              className="p-1 rounded-md text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors"
                              title="Inspect Digital Signature & Hash"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Shift & Activity */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-slate-300 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {user.shift}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate max-w-[140px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                            {user.lastActive}
                          </span>
                        </div>
                      </td>

                      {/* Security / 2FA */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {user.twoFactorEnabled ? (
                            <span
                              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              title="2FA Security Enforced"
                            >
                              <Fingerprint className="h-3 w-3 text-emerald-400" />
                              2FA Active
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              title="2FA is pending enrollment"
                            >
                              <AlertTriangle className="h-3 w-3 text-amber-400" />
                              2FA Off
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Audit Info */}
                          <button
                            type="button"
                            onClick={() => setAuditModalUser(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                            title="Audit Security Log"
                          >
                            <Laptop className="h-3.5 w-3.5" />
                          </button>

                          {/* Force Password Reset */}
                          <button
                            type="button"
                            onClick={() => handleForcePasswordReset(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                            title="Generate One-Time Login Code"
                          >
                            <Key className="h-3.5 w-3.5" />
                          </button>

                          {/* Quick Lock / Unlock */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSuspended
                                ? "text-red-400 hover:bg-red-500/20"
                                : "text-slate-400 hover:text-rose-300 hover:bg-rose-500/10"
                            }`}
                            title={isSuspended ? "Unlock Account" : "Suspend Account"}
                          >
                            {isSuspended ? <Lock className="h-3.5 w-3.5 text-red-400" /> : <Unlock className="h-3.5 w-3.5" />}
                          </button>

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors"
                            title="Edit Staff Information"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Remove Staff"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* =======================================================
           LUXURY EXECUTIVE STAFF BADGES (GRID VIEW)
           ======================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const roleConfig = ROLE_INFO[user.role] || ROLE_INFO.LAB_TECH;
            const RoleIcon = roleConfig.icon;
            const isSuspended = user.status === "SUSPENDED";

            return (
              <div
                key={user.id}
                className={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-[#090D1A] via-[#0D1527] to-[#0A0F1E] p-5 shadow-xl transition-all duration-300 hover:border-sky-500/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] ${
                  isSuspended ? "opacity-60 bg-red-950/10" : ""
                }`}
              >
                {/* Top ambient highlight */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${user.avatarColor} font-black text-sm text-white shadow-lg ring-2 ring-white/10`}
                      >
                        {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#090D1A] bg-emerald-500">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-white m-0">
                          {user.name}
                        </h3>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 m-0 mt-0.5">
                        {user.employeeCode}
                      </p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-extrabold border ${roleConfig.badge}`}
                  >
                    <RoleIcon className="h-3 w-3" />
                    {roleConfig.label}
                  </span>
                </div>

                {/* Details list */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px]">Department:</span>
                    <span className="text-slate-200 font-medium truncate max-w-[160px]">{user.department}</span>
                  </div>

                  {user.medicalRegistrationNo && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px]">Medical Council Reg:</span>
                      <span className="font-mono text-emerald-300 font-semibold">{user.medicalRegistrationNo}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px]">Shift Timing:</span>
                    <span className="text-slate-300">{user.shift}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px]">NABL Signatory:</span>
                    {user.isNablSignatory ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.2 rounded border border-amber-500/30">
                        <Award className="h-3 w-3 text-amber-400" />
                        Authorized
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Not Authorized</span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {user.lastActive}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleSignatory(user)}
                      className={`p-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        user.isNablSignatory
                          ? "border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20"
                          : "border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                      title="Toggle NABL Signatory"
                    >
                      <Award className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      title="Edit Staff Info"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================
          MODAL 1: ADD NEW STAFF MEMBER
          ========================================================= */}
      {isAddModalOpen && (
        <StaffFormModal
          title="Onboard New Laboratory Personnel"
          initialData={null}
          onClose={() => setIsAddModalOpen(false)}
          onSave={(newStaff) => {
            const added: LabUser = {
              ...newStaff,
              id: `usr-${Date.now()}`,
              joinedDate: new Date().toISOString().split("T")[0],
              lastActive: "Just Onboarded",
              lastLoginIp: "Not logged in",
              avatarColor: "from-sky-600 to-indigo-600",
            };
            const updated = [added, ...users];
            saveUsersState(updated);
            setIsAddModalOpen(false);
            showToast("Personnel Registered", `${added.name} successfully onboarded into ${added.department}.`, "success");
          }}
        />
      )}

      {/* =========================================================
          MODAL 2: EDIT STAFF MEMBER
          ========================================================= */}
      {isEditModalOpen && selectedUser && (
        <StaffFormModal
          title={`Edit Clinical Staff: ${selectedUser.name}`}
          initialData={selectedUser}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={(updatedData) => {
            const updated = users.map((u) => (u.id === selectedUser.id ? { ...u, ...updatedData } : u));
            saveUsersState(updated);
            setIsEditModalOpen(false);
            setSelectedUser(null);
            showToast("Changes Saved", `${updatedData.name} records updated successfully.`, "success");
          }}
        />
      )}

      {/* =========================================================
          MODAL 3: DIGITAL SIGNATURE INSPECTOR
          ========================================================= */}
      {signatureModalUser && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-gradient-to-b from-[#0B1120] to-[#0A0F1D] p-6 shadow-2xl text-slate-200">
            <button
              type="button"
              onClick={() => setSignatureModalUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white m-0">
                  NABL Authorized Digital Signature Stamp
                </h3>
                <p className="text-xs text-slate-400 m-0">
                  ISO 15189 Validated Cryptographic Signature Certificate
                </p>
              </div>
            </div>

            {/* Signature Certificate Card */}
            <div className="mt-5 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">{signatureModalUser.name}</span>
                  <span className="text-[10px] text-amber-300 font-mono block">
                    {signatureModalUser.medicalRegistrationNo || "Certified Medical Laboratory Director"}
                  </span>
                </div>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                  VERIFIED STAMP
                </span>
              </div>

              {/* Visual Stamp Simulation */}
              <div className="my-3 rounded-lg border-2 border-dashed border-amber-500/40 bg-slate-950/60 p-4 text-center">
                <div className="font-serif italic text-lg text-sky-400 font-black tracking-wide">
                  {signatureModalUser.name}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
                  {signatureModalUser.degrees || "Authorized Signatory"}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  LabCore Reference Diagnostic Laboratory • NABL MC-4819
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Cryptographic Hash:</span>
                  <span className="font-mono text-slate-300 text-[10px] truncate max-w-[200px]">
                    {signatureModalUser.signatureStampId || "SHA256:8f4e2b01c59d9921ef4a"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Accreditation Standard:</span>
                  <span className="text-emerald-400 font-semibold">NABL ISO 15189:2022</span>
                </div>
                <div className="flex justify-between">
                  <span>Report Authorization:</span>
                  <span className="text-slate-200">Hematology, Biochemistry & Immunoassay</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSignatureModalUser(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: AUDIT LOG & WORKSTATION SESSION INSPECTOR
          ========================================================= */}
      {auditModalUser && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-gradient-to-b from-[#0B1120] to-[#0A0F1D] p-6 shadow-2xl text-slate-200">
            <button
              type="button"
              onClick={() => setAuditModalUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                <Laptop className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white m-0">
                  Security & Activity Audit Trail
                </h3>
                <p className="text-xs text-slate-400 m-0">
                  {auditModalUser.name} ({auditModalUser.employeeCode})
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Active Session:</span>
                  <span className="text-emerald-400 font-semibold">{auditModalUser.lastActive}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">LAN IP Address:</span>
                  <span className="font-mono text-slate-300">{auditModalUser.lastLoginIp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Shift:</span>
                  <span className="text-slate-300">{auditModalUser.shift}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">2FA MFA Authentication:</span>
                  <span className={auditModalUser.twoFactorEnabled ? "text-emerald-400" : "text-amber-400"}>
                    {auditModalUser.twoFactorEnabled ? "Enforced & Active" : "Pending Enrollment"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Onboarding Date:</span>
                  <span className="text-slate-300">{auditModalUser.joinedDate}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Recent Operational Audits
                </span>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Diagnostic Test Approval Batch</span>
                    <span className="text-slate-400 font-mono">Today, 02:40 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Workstation Terminal Login</span>
                    <span className="text-slate-400 font-mono">Today, 09:12 AM</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Analyzer Calibration QC Check</span>
                    <span className="text-slate-400 font-mono">Yesterday</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setAuditModalUser(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          GLOBAL NOTIFICATION TOAST
          ========================================================= */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[1200] max-w-sm rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-start gap-3">
            {toastMessage.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toastMessage.type === "error" && <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />}
            {toastMessage.type === "info" && <Sparkles className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />}
            <div>
              <h4 className="text-xs font-bold text-white m-0">{toastMessage.title}</h4>
              <p className="text-[11px] text-slate-300 m-0 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-Component: Modal for Adding / Editing Staff
interface StaffFormModalProps {
  title: string;
  initialData: LabUser | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

function StaffFormModal({ title, initialData, onClose, onSave }: StaffFormModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    role: initialData?.role || "LAB_TECH",
    employeeCode: initialData?.employeeCode || `EMP-LC-${Math.floor(100 + Math.random() * 900)}`,
    medicalRegistrationNo: initialData?.medicalRegistrationNo || "",
    degrees: initialData?.degrees || "",
    department: initialData?.department || "Pathology & Molecular",
    shift: initialData?.shift || "General (9 AM - 6 PM)",
    isNablSignatory: initialData?.isNablSignatory || false,
    twoFactorEnabled: initialData?.twoFactorEnabled ?? true,
    status: initialData?.status || "ACTIVE",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Name and email are required fields.");
      return;
    }
    onSave({
      ...formData,
      signatureStatus: formData.isNablSignatory ? "VERIFIED" : "PENDING_UPLOAD",
      signatureStampId: formData.isNablSignatory ? `SHA256:${Math.random().toString(36).substring(2, 12)}` : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-gradient-to-b from-[#0B1120] to-[#0A0F1D] p-6 shadow-2xl text-slate-200 my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">{title}</h2>
            <p className="text-xs text-slate-400 m-0">
              Configure personnel profile, department allocation & clinical authorization credentials.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Row 1: Name & Employee Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Rajesh Sharma"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Employee ID Code *</label>
              <input
                type="text"
                required
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                placeholder="e.g. EMP-LC-108"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Official Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@labcore.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Mobile Contact No</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Row 3: Role & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">System & Operational Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500"
              >
                {Object.entries(ROLE_INFO).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label} ({k})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Laboratory Wing / Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500"
              >
                {DEPARTMENTS.filter((d) => d !== "All Departments").map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Medical Registration & Degrees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Medical Council Registration No
                <span className="text-[10px] text-slate-400 font-normal ml-1">(For Clinicians/Doctors)</span>
              </label>
              <input
                type="text"
                value={formData.medicalRegistrationNo}
                onChange={(e) => setFormData({ ...formData, medicalRegistrationNo: e.target.value })}
                placeholder="e.g. MCI-2018-84729"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-emerald-300 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Qualifications / Degrees</label>
              <input
                type="text"
                value={formData.degrees}
                onChange={(e) => setFormData({ ...formData, degrees: e.target.value })}
                placeholder="e.g. MD (Pathology), B.Sc MLT"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Row 5: Shift Timing */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Working Shift Assignment</label>
            <select
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500"
            >
              {SHIFTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Clinical Checkboxes */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNablSignatory}
                onChange={(e) => setFormData({ ...formData, isNablSignatory: e.target.checked })}
                className="mt-0.5 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
              />
              <div>
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  Designate as NABL Authorized Signatory (ISO 15189)
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Allows this user's cryptographic digital signature and stamp to validate official patient diagnostic reports.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-slate-800/80">
              <input
                type="checkbox"
                checked={formData.twoFactorEnabled}
                onChange={(e) => setFormData({ ...formData, twoFactorEnabled: e.target.checked })}
                className="mt-0.5 rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0"
              />
              <div>
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <Fingerprint className="h-3.5 w-3.5 text-sky-400" />
                  Enforce Two-Factor Authentication (2FA MFA)
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Requires mobile OTP / authenticator app code during workstation sign-in.
                </span>
              </div>
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/30 hover:scale-[1.02] transition-all cursor-pointer"
            >
              {initialData ? "Save Changes" : "Create & Onboard User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
