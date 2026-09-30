"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Copy,
  Download,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Sliders,
  Check,
  Sparkles,
  Info,
  Clock,
  Laptop,
  Fingerprint,
  FileCheck,
  Stethoscope,
  FlaskConical,
  CreditCard,
  Settings,
  Database,
  Eye,
  RefreshCw,
  X,
  FileText
} from "lucide-react";

export interface PermissionItem {
  id: string;
  name: string;
  description: string;
  category: "patients" | "orders" | "laboratory" | "approvals" | "billing" | "admin";
  isCritical?: boolean;
}

export interface LabRole {
  id: string;
  code: string;
  name: string;
  description: string;
  color: string;
  badgeStyle: string;
  icon: any;
  userCount: number;
  isSystem: boolean; // Cannot delete core roles
  isNablSignatory: boolean;
  requiresMfa: boolean;
  sessionTimeoutMin: number;
  permissions: string[]; // List of permission IDs
  updatedAt: string;
}

// 6 Core Clinical Permission Domains
export const CLINICAL_PERMISSIONS: PermissionItem[] = [
  // 1. Patients & Demographics
  { id: "patient.view", name: "View Patient Directory", description: "Access patient profiles, history, and medical records", category: "patients" },
  { id: "patient.create", name: "Register New Patients", description: "Create patient records and generate system UHID", category: "patients" },
  { id: "patient.edit", name: "Edit Demographics", description: "Modify patient contact, age, gender, and clinical history", category: "patients" },
  { id: "patient.delete", name: "Delete & Merge Patients", description: "Merge duplicate records or archive patient profiles", category: "patients", isCritical: true },
  { id: "patient.export", name: "Export Patient Index", description: "Download patient master directory in CSV / Excel", category: "patients" },

  // 2. Orders & Accessioning
  { id: "orders.view", name: "View Workorders Queue", description: "Inspect sample accessioning and active orders", category: "orders" },
  { id: "orders.create", name: "Create & Bill Orders", description: "Order lab tests, assign sample barcodes, and bill", category: "orders" },
  { id: "orders.cancel", name: "Cancel Orders & Reversal", description: "Cancel registered test orders and void billings", category: "orders", isCritical: true },
  { id: "orders.discount", name: "Apply Billing Discounts", description: "Grant tariff discounts, fee waivers, or credit approval", category: "orders", isCritical: true },
  { id: "samples.accession", name: "Phlebotomy & Barcoding", description: "Receive specimens, print tube barcodes, and scan", category: "orders" },
  { id: "samples.reject", name: "Reject Compromised Samples", description: "Mark specimens hemolyzed, lipemic, or insufficient volume", category: "orders" },

  // 3. Lab Pipeline & Analyzers
  { id: "results.enter", name: "Technical Result Entry", description: "Input parameter values, flags, and technical notes", category: "laboratory" },
  { id: "results.import", name: "ASTM / HL7 Analyzer Pull", description: "Directly import automated analyzer results via LIS interface", category: "laboratory" },
  { id: "analyzers.control", name: "QC Calibration & LJ Charts", description: "Run daily controls, calibrations, and plot Levey-Jennings", category: "laboratory" },
  { id: "analyzers.config", name: "Hardware Interfacing Config", description: "Configure analyzer COM ports, baud rates, and ASTM mappings", category: "laboratory", isCritical: true },
  { id: "qc.override", name: "Override Westgard QC Violations", description: "Force assay progression despite control flags (Audited)", category: "laboratory", isCritical: true },

  // 4. Clinical Verification & Sign-Off (Highest Medical Privilege)
  { id: "approvals.sign", name: "NABL Pathologist Sign-Off", description: "Digitally sign & authorize patient diagnostic test reports", category: "approvals", isCritical: true },
  { id: "approvals.critical", name: "Panic Value Release", description: "Verify life-critical abnormal values & trigger emergency alerts", category: "approvals", isCritical: true },
  { id: "approvals.delta", name: "Delta Check Override", description: "Authorize acute variance compared to patient historical baseline", category: "approvals", isCritical: true },
  { id: "approvals.batch", name: "Clean Fast-Track Batch Sign", description: "1-click auto-release of 100% normal verified tests", category: "approvals" },
  { id: "reports.dispatch", name: "Dispatch WhatsApp & Dossier", description: "Release PDF reports to patients and referring clinicians", category: "approvals" },

  // 5. Billing, Ledger & Cash Counter
  { id: "billing.pos", name: "Front Desk POS Collection", description: "Collect payments via UPI, Cash, Card, and issue receipts", category: "billing" },
  { id: "billing.daybook", name: "Shift Day Book & Ledger", description: "Inspect daily collection tallies and close register shifts", category: "billing" },
  { id: "billing.settlement", name: "B2B & Referral Settlements", description: "Reconcile physician referral and hospital billing cuts", category: "billing", isCritical: true },
  { id: "billing.credit", name: "Corporate Credit Ledger", description: "Manage insurer TPA, corporate accounts, and aging credit", category: "billing" },

  // 6. System Governance & Accreditation
  { id: "admin.users", name: "Manage Staff Personnel", description: "Create, modify, lock, and assign shifts to staff users", category: "admin", isCritical: true },
  { id: "admin.roles", name: "Edit Permissions Matrix", description: "Configure system roles, access policies, and security caps", category: "admin", isCritical: true },
  { id: "admin.audit", name: "Forensic Audit Log Trail", description: "Inspect immutable system events, logins, and overrides", category: "admin" },
  { id: "admin.backup", name: "Cloud Backup & System Sync", description: "Trigger full database snapshots and disaster recovery", category: "admin", isCritical: true },
  { id: "admin.nabl", name: "NABL Compliance Dossier", description: "Generate ISO 15189 compliance documentation and IQC audits", category: "admin" },
];

export const PERMISSION_CATEGORIES: { id: PermissionItem["category"]; label: string; icon: any; color: string }[] = [
  { id: "patients", label: "Patients & Demographics", icon: Users, color: "text-indigo-400" },
  { id: "orders", label: "Orders, Phlebotomy & Accession", icon: FlaskConical, color: "text-blue-400" },
  { id: "laboratory", label: "Lab Assays, Analyzers & QC", icon: Sliders, color: "text-cyan-400" },
  { id: "approvals", label: "Clinical Verification & Sign-Off", icon: Stethoscope, color: "text-emerald-400" },
  { id: "billing", label: "Billing, POS & Cash Ledger", icon: CreditCard, color: "text-amber-400" },
  { id: "admin", label: "System Security & NABL Audit", icon: ShieldCheck, color: "text-rose-400" },
];

const INITIAL_ROLES: LabRole[] = [
  {
    id: "role-admin",
    code: "ADMIN",
    name: "Laboratory Director & Administrator",
    description: "Sovereign root administrative authority over laboratory operations, staff credentials, accreditation policies, and audit governance.",
    color: "from-indigo-600 to-purple-700",
    badgeStyle: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    icon: ShieldCheck,
    userCount: 1,
    isSystem: true,
    isNablSignatory: true,
    requiresMfa: true,
    sessionTimeoutMin: 60,
    permissions: CLINICAL_PERMISSIONS.map((p) => p.id), // All permissions
    updatedAt: "2026-03-10",
  },
  {
    id: "role-pathologist",
    code: "PATHOLOGIST",
    name: "Consultant Pathologist (Signatory)",
    description: "NABL Authorized Signatory with clinical sign-off privilege, panic value clearance, delta check overrides, and diagnostic report release.",
    color: "from-emerald-600 to-teal-700",
    badgeStyle: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    icon: Stethoscope,
    userCount: 2,
    isSystem: true,
    isNablSignatory: true,
    requiresMfa: true,
    sessionTimeoutMin: 30,
    permissions: [
      "patient.view",
      "orders.view",
      "results.enter",
      "results.import",
      "analyzers.control",
      "qc.override",
      "approvals.sign",
      "approvals.critical",
      "approvals.delta",
      "approvals.batch",
      "reports.dispatch",
      "admin.audit",
      "admin.nabl",
    ],
    updatedAt: "2026-03-12",
  },
  {
    id: "role-labtech",
    code: "LAB_TECH",
    name: "Senior Medical Lab Technologist",
    description: "Bench operations specialist handling sample accessioning, automated analyzer runs, technical result entry, and daily calibration QC.",
    color: "from-sky-600 to-blue-700",
    badgeStyle: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    icon: FlaskConical,
    userCount: 3,
    isSystem: true,
    isNablSignatory: false,
    requiresMfa: false,
    sessionTimeoutMin: 120,
    permissions: [
      "patient.view",
      "orders.view",
      "samples.accession",
      "samples.reject",
      "results.enter",
      "results.import",
      "analyzers.control",
    ],
    updatedAt: "2026-03-08",
  },
  {
    id: "role-doctor",
    code: "DOCTOR",
    name: "Referring Clinician / Consultant",
    description: "External or hospital physician portal to register patient referrals, view real-time diagnostic progress, and download signed dossiers.",
    color: "from-teal-600 to-cyan-700",
    badgeStyle: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    icon: Stethoscope,
    userCount: 1,
    isSystem: true,
    isNablSignatory: false,
    requiresMfa: true,
    sessionTimeoutMin: 30,
    permissions: [
      "patient.view",
      "patient.create",
      "orders.view",
      "orders.create",
      "reports.dispatch",
    ],
    updatedAt: "2026-02-28",
  },
  {
    id: "role-frontdesk",
    code: "FRONT_DESK",
    name: "Patient Reception & POS Billing",
    description: "Front desk officer managing patient intake, barcode sticker printing, invoice generation, day book tally, and receipt settlement.",
    color: "from-amber-600 to-orange-700",
    badgeStyle: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: CreditCard,
    userCount: 1,
    isSystem: true,
    isNablSignatory: false,
    requiresMfa: false,
    sessionTimeoutMin: 480,
    permissions: [
      "patient.view",
      "patient.create",
      "patient.edit",
      "orders.view",
      "orders.create",
      "samples.accession",
      "billing.pos",
      "billing.daybook",
      "reports.dispatch",
    ],
    updatedAt: "2026-03-05",
  },
  {
    id: "role-quality",
    code: "QUALITY_MANAGER",
    name: "Quality & ISO 15189 Manager",
    description: "Dedicated officer overseeing NABL ISO accreditation compliance, analyzer IQC/EQAS records, incident investigations, and audit logs.",
    color: "from-rose-600 to-pink-700",
    badgeStyle: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    icon: Award,
    userCount: 1,
    isSystem: false,
    isNablSignatory: false,
    requiresMfa: true,
    sessionTimeoutMin: 60,
    permissions: [
      "patient.view",
      "orders.view",
      "analyzers.control",
      "analyzers.config",
      "qc.override",
      "admin.audit",
      "admin.nabl",
      "admin.backup",
    ],
    updatedAt: "2026-03-11",
  },
];

export default function RolesManagementView() {
  const [roles, setRoles] = useState<LabRole[]>(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("role-pathologist");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; desc: string; type: "success" | "info" | "error" } | null>(null);

  // Compliance policy toggles
  const [dualAuthEnabled, setDualAuthEnabled] = useState(true);
  const [breakGlassEnabled, setBreakGlassEnabled] = useState(true);
  const [terminalLockEnabled, setTerminalLockEnabled] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("labcore_roles_permissions");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRoles(parsed);
          return;
        }
      }
    } catch (e) {
      // fallback
    }
  }, []);

  const saveRoles = (updatedRoles: LabRole[]) => {
    setRoles(updatedRoles);
    try {
      localStorage.setItem("labcore_roles_permissions", JSON.stringify(updatedRoles));
      window.dispatchEvent(new CustomEvent("labcore:roles-updated", { detail: updatedRoles }));
    } catch (e) {
      // ignore
    }
  };

  const showToast = (title: string, desc: string, type: "success" | "info" | "error" = "success") => {
    setToast({ title, desc, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Selected Role Object
  const selectedRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || roles[0];
  }, [roles, selectedRoleId]);

  // Toggle specific permission for the selected role
  const handleTogglePermission = (permissionId: string) => {
    if (selectedRole.code === "ADMIN") {
      showToast("Administrator Root Policy", "Administrator possesses universal sovereignty. Permissions cannot be stripped.", "info");
      return;
    }

    const hasPerm = selectedRole.permissions.includes(permissionId);
    const nextPerms = hasPerm
      ? selectedRole.permissions.filter((p) => p !== permissionId)
      : [...selectedRole.permissions, permissionId];

    const updated = roles.map((r) =>
      r.id === selectedRole.id ? { ...r, permissions: nextPerms, updatedAt: new Date().toISOString().split("T")[0] } : r
    );

    saveRoles(updated);
    showToast(
      hasPerm ? "Permission Revoked" : "Permission Granted",
      `${permissionId} ${hasPerm ? "removed from" : "granted to"} ${selectedRole.name}.`,
      "success"
    );
  };

  // Grant or Revoke all permissions in a category
  const handleCategoryBulkToggle = (categoryId: PermissionItem["category"], grant: boolean) => {
    if (selectedRole.code === "ADMIN") return;

    const catPermIds = CLINICAL_PERMISSIONS.filter((p) => p.category === categoryId).map((p) => p.id);
    let nextPerms: string[];

    if (grant) {
      nextPerms = Array.from(new Set([...selectedRole.permissions, ...catPermIds]));
    } else {
      nextPerms = selectedRole.permissions.filter((p) => !catPermIds.includes(p));
    }

    const updated = roles.map((r) =>
      r.id === selectedRole.id ? { ...r, permissions: nextPerms, updatedAt: new Date().toISOString().split("T")[0] } : r
    );

    saveRoles(updated);
    showToast(
      grant ? "Category Granted" : "Category Revoked",
      `${catPermIds.length} permissions ${grant ? "assigned to" : "revoked from"} ${selectedRole.name}.`,
      "success"
    );
  };

  // Clone Role
  const handleCloneRole = (role: LabRole) => {
    const newId = `role-${Date.now()}`;
    const clonedRole: LabRole = {
      ...role,
      id: newId,
      code: `${role.code}_COPY`,
      name: `${role.name} (Custom Copy)`,
      isSystem: false,
      userCount: 0,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    const updated = [...roles, clonedRole];
    saveRoles(updated);
    setSelectedRoleId(newId);
    showToast("Role Cloned Successfully", `Created custom template from ${role.name}.`, "success");
  };

  // Delete Custom Role
  const handleDeleteRole = (role: LabRole) => {
    if (role.isSystem) {
      showToast("Protected System Role", "Standard clinical core roles cannot be deleted to preserve LIS stability.", "error");
      return;
    }

    if (confirm(`Are you sure you want to permanently delete custom role "${role.name}"?`)) {
      const updated = roles.filter((r) => r.id !== role.id);
      saveRoles(updated);
      setSelectedRoleId(updated[0].id);
      showToast("Role Deleted", `${role.name} has been purged from access control.`, "info");
    }
  };

  // Toggle NABL Signatory status for role
  const handleToggleSignatory = () => {
    const nextVal = !selectedRole.isNablSignatory;
    const updated = roles.map((r) => (r.id === selectedRole.id ? { ...r, isNablSignatory: nextVal } : r));
    saveRoles(updated);
    showToast("Accreditation Policy Updated", `NABL diagnostic signing requirement is now ${nextVal ? "ENABLED" : "DISABLED"} for ${selectedRole.name}.`, "success");
  };

  // Toggle MFA requirement for role
  const handleToggleMfa = () => {
    const nextVal = !selectedRole.requiresMfa;
    const updated = roles.map((r) => (r.id === selectedRole.id ? { ...r, requiresMfa: nextVal } : r));
    saveRoles(updated);
    showToast("MFA Security Policy", `Two-Factor Authentication is now ${nextVal ? "ENFORCED" : "OPTIONAL"} for ${selectedRole.name}.`, "success");
  };

  // Update session timeout
  const handleTimeoutChange = (timeoutMin: number) => {
    const updated = roles.map((r) => (r.id === selectedRole.id ? { ...r, sessionTimeoutMin: timeoutMin } : r));
    saveRoles(updated);
    showToast("Session Timeout Updated", `Workstation auto-lock set to ${timeoutMin} minutes for ${selectedRole.name}.`, "success");
  };

  // Filter permissions
  const filteredPermissions = useMemo(() => {
    return CLINICAL_PERMISSIONS.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchId = p.id.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchId) return false;
      }
      if (activeCategoryFilter !== "ALL" && p.category !== activeCategoryFilter) {
        return false;
      }
      if (showCriticalOnly && !p.isCritical) {
        return false;
      }
      return true;
    });
  }, [searchQuery, activeCategoryFilter, showCriticalOnly]);

  // Export Audit Matrix as CSV
  const handleExportMatrixCSV = () => {
    const header = ["Permission ID", "Permission Name", "Domain Category", "Critical Medical Privilege", ...roles.map((r) => r.name)];
    const rows = CLINICAL_PERMISSIONS.map((perm) => {
      return [
        perm.id,
        `"${perm.name}"`,
        perm.category,
        perm.isCritical ? "HIGH RISK" : "STANDARD",
        ...roles.map((r) => (r.permissions.includes(perm.id) ? "AUTHORIZED" : "RESTRICTED")),
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [header.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LabCore_Clinical_RBAC_Matrix_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Compliance Matrix Exported", "Downloaded complete NABL ISO 15189 Role-Based Access Matrix.", "success");
  };

  return (
    <div className="space-y-6 select-none">
      {/* =========================================================
          EXECUTIVE RBAC COMMAND HEADER
          ========================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-[#090D1A] via-[#0D1527] to-[#0B1020] p-6 shadow-2xl text-white">
        <div className="absolute top-0 right-1/4 h-32 w-80 bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-10 h-32 w-64 bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-600 to-teal-500 shadow-lg shadow-indigo-900/40">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-white m-0">
                  Role-Based Access Control & Clinical Permissions Matrix
                </h1>
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/20 px-2 py-0.5 text-[10px] font-extrabold text-sky-300 border border-sky-500/30">
                  <Award className="h-3 w-3 text-sky-400" />
                  NABL ISO 15189:2022
                </span>
              </div>
              <p className="text-xs text-slate-400 m-0 mt-0.5">
                Granular medical powers, four-eyes dual authorization, diagnostic sign-off sovereignty, and workstation session security.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleExportMatrixCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/70 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700/80 hover:border-slate-600 transition-all shadow-sm cursor-pointer"
              title="Download Audit Matrix for NABL Assessors"
            >
              <Download className="h-4 w-4 text-slate-400" />
              Audit Matrix (CSV)
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Create Custom Role
            </button>
          </div>
        </div>

        {/* 4 Clinical Compliance Policy Pills */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Dual Auth Policy */}
          <div
            onClick={() => {
              setDualAuthEnabled(!dualAuthEnabled);
              showToast("Four-Eyes Policy", `Dual authorization for critical panic values is now ${!dualAuthEnabled ? "ENFORCED" : "BYPASSED"}.`, "info");
            }}
            className={`rounded-xl border p-3 cursor-pointer transition-all ${
              dualAuthEnabled
                ? "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">Four-Eyes Dual Sign-off</span>
              <span className={`h-2 w-2 rounded-full ${dualAuthEnabled ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
            </div>
            <div className="mt-1 text-[10px] text-slate-400">
              {dualAuthEnabled ? "Mandatory 2 Pathologists for panic reports" : "Single pathologist sign-off active"}
            </div>
          </div>

          {/* Emergency Break-Glass Policy */}
          <div
            onClick={() => {
              setBreakGlassEnabled(!breakGlassEnabled);
              showToast("Emergency Override", `Break-Glass emergency override protocol is now ${!breakGlassEnabled ? "ENABLED" : "DISABLED"}.`, "info");
            }}
            className={`rounded-xl border p-3 cursor-pointer transition-all ${
              breakGlassEnabled
                ? "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/15"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-200">Break-Glass Emergency</span>
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="mt-1 text-[10px] text-slate-400">
              {breakGlassEnabled ? "Audited night-shift emergency elevation ON" : "Strict role lock only"}
            </div>
          </div>

          {/* Total System Roles */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Active Roles in LIS</span>
              <Shield className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">{roles.length} Roles</span>
              <span className="text-[10px] text-sky-300 font-semibold">{CLINICAL_PERMISSIONS.length} Powers</span>
            </div>
          </div>

          {/* NABL Signatories Enforced */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Signatory Roles</span>
              <Award className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold text-amber-300">{roles.filter((r) => r.isNablSignatory).length} Signatory Roles</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN WORKSPACE: ROLE SELECTOR SIDEBAR + PERMISSION MATRIX
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =======================================================
            LEFT: ROLE SELECTOR COLUMN (4 COLS)
            ======================================================= */}
        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-[#090D1A] to-[#0B1222] p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Diagnostic Roles Directory
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {roles.length} Available
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {roles.map((role) => {
                const isSelected = selectedRoleId === role.id;
                const RoleIcon = role.icon || Shield;
                const permCoverage = Math.round((role.permissions.length / CLINICAL_PERMISSIONS.length) * 100);

                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`group relative rounded-xl p-3.5 border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-sky-500/50 bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-transparent shadow-md shadow-sky-500/10 text-white"
                        : "border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/50 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    {/* Left Active Glow Pill */}
                    {isSelected && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-sky-400 to-blue-500 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr ${role.color} text-white shadow-sm shrink-0`}
                        >
                          <RoleIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold truncate text-slate-100 group-hover:text-white m-0">
                              {role.name}
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            {role.code} • {role.userCount} Assigned Personnel
                          </span>
                        </div>
                      </div>

                      {role.isNablSignatory && (
                        <span title="NABL Authorized Signatory Role">
                          <Award className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {role.description}
                    </p>

                    {/* Progress Bar for Permissions Coverage */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Coverage:</span>
                        <span className="font-bold text-sky-400">{role.permissions.length} / {CLINICAL_PERMISSIONS.length} ({permCoverage}%)</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloneRole(role);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors"
                          title="Clone as Template"
                        >
                          <Copy className="h-3 w-3" />
                        </button>

                        {!role.isSystem && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRole(role);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Custom Role"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =======================================================
            RIGHT: ROLE DETAILS & PERMISSIONS MATRIX (8 COLS)
            ======================================================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* Selected Role Executive Card */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-[#090D1A] via-[#0D1527] to-[#0A0F1E] p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${selectedRole.color} text-white shadow-lg shrink-0`}
                >
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-white m-0">{selectedRole.name}</h2>
                    <span className={`rounded px-1.5 py-0.2 text-[9px] font-extrabold border ${selectedRole.badgeStyle}`}>
                      {selectedRole.code}
                    </span>
                    {selectedRole.isSystem ? (
                      <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-mono text-slate-400">
                        CORE SYSTEM
                      </span>
                    ) : (
                      <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-bold text-indigo-300 border border-indigo-500/30">
                        CUSTOM ROLE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 m-0">{selectedRole.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit Role Spec
                </button>
              </div>
            </div>

            {/* Role Policy Controls (NABL Signatory, MFA, Timeout) */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* NABL Signatory Toggle */}
              <div
                onClick={handleToggleSignatory}
                className={`rounded-xl border p-3 cursor-pointer transition-all ${
                  selectedRole.isNablSignatory
                    ? "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/15"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">NABL Signatory</span>
                  <Award className={`h-4 w-4 ${selectedRole.isNablSignatory ? "text-amber-400" : "text-slate-400"}`} />
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                  {selectedRole.isNablSignatory ? "Authorized to release test dossiers" : "Standard staff, no signing stamp"}
                </div>
              </div>

              {/* MFA / 2FA Toggle */}
              <div
                onClick={handleToggleMfa}
                className={`rounded-xl border p-3 cursor-pointer transition-all ${
                  selectedRole.requiresMfa
                    ? "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">MFA Enforced</span>
                  <Fingerprint className={`h-4 w-4 ${selectedRole.requiresMfa ? "text-emerald-400" : "text-slate-400"}`} />
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                  {selectedRole.requiresMfa ? "Requires 2FA code at login" : "Standard password only"}
                </div>
              </div>

              {/* Session Inactivity Timeout */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <div className="flex items-center justify-between text-xs text-slate-200">
                  <span className="font-bold">Session Auto-Lock</span>
                  <Clock className="h-4 w-4 text-sky-400" />
                </div>
                <div className="mt-1">
                  <select
                    value={selectedRole.sessionTimeoutMin}
                    onChange={(e) => handleTimeoutChange(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-[11px] px-2 py-1 outline-none focus:border-sky-500"
                  >
                    <option value={15}>15 mins (Strict NABL)</option>
                    <option value={30}>30 mins (Standard)</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={480}>8 hours (Full Shift)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* =======================================================
              PERMISSIONS MATRIX FILTER & ACTION BAR
              ======================================================= */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Permissions */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search powers (e.g. panic, sign, qc, discount)..."
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 pl-9 pr-7 py-2 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Critical Toggle & Bulk Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowCriticalOnly(!showCriticalOnly)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                    showCriticalOnly
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                  <span>High Risk Only</span>
                </button>

                {selectedRole.code !== "ADMIN" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = roles.map((r) =>
                          r.id === selectedRole.id ? { ...r, permissions: CLINICAL_PERMISSIONS.map((p) => p.id) } : r
                        );
                        saveRoles(updated);
                        showToast("All Granted", `Assigned all ${CLINICAL_PERMISSIONS.length} powers to ${selectedRole.name}.`, "success");
                      }}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      Grant All
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = roles.map((r) =>
                          r.id === selectedRole.id ? { ...r, permissions: [] } : r
                        );
                        saveRoles(updated);
                        showToast("All Revoked", `Stripped all permissions from ${selectedRole.name}.`, "info");
                      }}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      Revoke All
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Category Quick Filter Chips */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveCategoryFilter("ALL")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all border ${
                  activeCategoryFilter === "ALL"
                    ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                    : "text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                All Domains ({CLINICAL_PERMISSIONS.length})
              </button>

              {PERMISSION_CATEGORIES.map((cat) => {
                const count = CLINICAL_PERMISSIONS.filter((p) => p.category === cat.id).length;
                const active = activeCategoryFilter === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all border ${
                      active
                        ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                        : "text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =======================================================
              PERMISSION DOMAIN GROUPS & TOGGLES
              ======================================================= */}
          <div className="space-y-4">
            {PERMISSION_CATEGORIES.filter((cat) =>
              activeCategoryFilter === "ALL" ? true : cat.id === activeCategoryFilter
            ).map((category) => {
              const permsInCat = filteredPermissions.filter((p) => p.category === category.id);
              if (permsInCat.length === 0) return null;

              const CategoryIcon = category.icon;
              const grantedInCat = permsInCat.filter((p) => selectedRole.permissions.includes(p.id)).length;
              const allGranted = grantedInCat === permsInCat.length;

              return (
                <div
                  key={category.id}
                  className="rounded-2xl border border-slate-800 bg-gradient-to-b from-[#090D1A] to-[#0A0F1E] overflow-hidden shadow-xl"
                >
                  {/* Category Header */}
                  <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800/90 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CategoryIcon className={`h-4 w-4 ${category.color}`} />
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                        {category.label}
                      </span>
                      <span className="rounded-full bg-slate-800 px-2 py-0.2 text-[10px] font-mono text-slate-400">
                        {grantedInCat} / {permsInCat.length} Authorized
                      </span>
                    </div>

                    {selectedRole.code !== "ADMIN" && (
                      <button
                        type="button"
                        onClick={() => handleCategoryBulkToggle(category.id, !allGranted)}
                        className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 hover:underline cursor-pointer"
                      >
                        {allGranted ? "Deselect Group" : "Select Entire Group"}
                      </button>
                    )}
                  </div>

                  {/* Permissions List */}
                  <div className="divide-y divide-slate-800/60 p-2">
                    {permsInCat.map((perm) => {
                      const isGranted = selectedRole.permissions.includes(perm.id);
                      const isAdmin = selectedRole.code === "ADMIN";

                      return (
                        <div
                          key={perm.id}
                          onClick={() => handleTogglePermission(perm.id)}
                          className={`group flex items-start justify-between gap-4 p-3 rounded-xl transition-colors cursor-pointer ${
                            isGranted ? "hover:bg-slate-800/50" : "hover:bg-slate-800/30 opacity-75"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox Icon */}
                            <div className="mt-0.5 shrink-0">
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                                  isGranted
                                    ? "border-sky-500 bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/40"
                                    : "border-slate-700 bg-slate-900 text-transparent group-hover:border-slate-500"
                                }`}
                              >
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-slate-100 group-hover:text-white">
                                  {perm.name}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  [{perm.id}]
                                </span>
                                {perm.isCritical && (
                                  <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 px-1.5 py-0.2 text-[9px] font-extrabold text-rose-300 border border-rose-500/30">
                                    <AlertTriangle className="h-2.5 w-2.5 text-rose-400" />
                                    HIGH RISK
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 m-0 mt-0.5 leading-relaxed">
                                {perm.description}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-extrabold border shrink-0 ${
                              isGranted
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : "bg-slate-800/70 text-slate-400 border-slate-700"
                            }`}
                          >
                            {isGranted ? "AUTHORIZED" : "RESTRICTED"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL 1: CREATE CUSTOM ROLE
          ========================================================= */}
      {isCreateModalOpen && (
        <RoleModal
          title="Create Custom Clinical Role"
          initialRole={null}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={(newRoleData) => {
            const newId = `role-${Date.now()}`;
            const created: LabRole = {
              ...newRoleData,
              id: newId,
              userCount: 0,
              isSystem: false,
              updatedAt: new Date().toISOString().split("T")[0],
            };
            const updated = [...roles, created];
            saveRoles(updated);
            setSelectedRoleId(newId);
            setIsCreateModalOpen(false);
            showToast("Custom Role Created", `New role "${created.name}" configured in access control.`, "success");
          }}
        />
      )}

      {/* =========================================================
          MODAL 2: EDIT ROLE SPECIFICATIONS
          ========================================================= */}
      {isEditModalOpen && selectedRole && (
        <RoleModal
          title={`Edit Role Specifications: ${selectedRole.name}`}
          initialRole={selectedRole}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedData) => {
            const updated = roles.map((r) =>
              r.id === selectedRole.id ? { ...r, ...updatedData, updatedAt: new Date().toISOString().split("T")[0] } : r
            );
            saveRoles(updated);
            setIsEditModalOpen(false);
            showToast("Role Updated", `${selectedRole.name} specifications updated successfully.`, "success");
          }}
        />
      )}

      {/* =========================================================
          GLOBAL TOAST ALERT
          ========================================================= */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[1200] max-w-sm rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-start gap-3">
            {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === "error" && <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === "info" && <Sparkles className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />}
            <div>
              <h4 className="text-xs font-bold text-white m-0">{toast.title}</h4>
              <p className="text-[11px] text-slate-300 m-0 mt-0.5 leading-relaxed">{toast.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-Component: Role Create / Edit Modal
interface RoleModalProps {
  title: string;
  initialRole: LabRole | null;
  onClose: () => void;
  onSave: (role: any) => void;
}

function RoleModal({ title, initialRole, onClose, onSave }: RoleModalProps) {
  const [formData, setFormData] = useState({
    code: initialRole?.code || "",
    name: initialRole?.name || "",
    description: initialRole?.description || "",
    color: initialRole?.color || "from-sky-600 to-indigo-700",
    badgeStyle: initialRole?.badgeStyle || "bg-sky-500/15 text-sky-300 border-sky-500/30",
    isNablSignatory: initialRole?.isNablSignatory || false,
    requiresMfa: initialRole?.requiresMfa || false,
    sessionTimeoutMin: initialRole?.sessionTimeoutMin || 60,
    permissions: initialRole?.permissions || [
      "patient.view",
      "orders.view",
      "results.enter",
    ],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert("Role name and code are required.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-gradient-to-b from-[#0B1120] to-[#0A0F1D] p-6 shadow-2xl text-slate-200 my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">{title}</h2>
            <p className="text-xs text-slate-400 m-0">
              Define clinical role authority, code designation, and security timeouts.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Role Title / Designation *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Molecular Biologist (PCR Specialist)"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Role Identifier Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
                placeholder="e.g. PCR_TECH"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Session Inactivity Timeout</label>
              <select
                value={formData.sessionTimeoutMin}
                onChange={(e) => setFormData({ ...formData, sessionTimeoutMin: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500"
              >
                <option value={15}>15 mins (Strict)</option>
                <option value={30}>30 mins</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={480}>8 hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Description & Scope</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed responsibilities and diagnostic boundary..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          {/* Role Badging Color Style */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Visual Theme & Identity</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Sapphire Sky", color: "from-sky-600 to-blue-700", badge: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
                { name: "Emerald Clinical", color: "from-emerald-600 to-teal-700", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
                { name: "Royal Violet", color: "from-indigo-600 to-purple-700", badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
                { name: "Golden Amber", color: "from-amber-600 to-orange-700", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
                { name: "Crimson Quality", color: "from-rose-600 to-red-700", badge: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
                { name: "Ocean Cyan", color: "from-teal-600 to-cyan-700", badge: "bg-teal-500/15 text-teal-300 border-teal-500/30" },
              ].map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: theme.color, badgeStyle: theme.badge })}
                  className={`rounded-xl border p-2 text-center text-[10px] font-bold transition-all ${
                    formData.color === theme.color ? "border-sky-400 bg-slate-800 text-white shadow-sm" : "border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className={`h-2.5 w-full rounded bg-gradient-to-r ${theme.color} mb-1.5`} />
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Compliance Checkboxes */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNablSignatory}
                onChange={(e) => setFormData({ ...formData, isNablSignatory: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
              />
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-amber-400" />
                Enable NABL ISO 15189 Diagnostic Signing Rights
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer pt-1.5 border-t border-slate-800/80">
              <input
                type="checkbox"
                checked={formData.requiresMfa}
                onChange={(e) => setFormData({ ...formData, requiresMfa: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0"
              />
              <span className="font-bold text-slate-200 flex items-center gap-1">
                <Fingerprint className="h-3.5 w-3.5 text-sky-400" />
                Mandatory Two-Factor Authentication (2FA)
              </span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/30 hover:scale-[1.02] transition-all"
            >
              {initialRole ? "Save Role Specs" : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
