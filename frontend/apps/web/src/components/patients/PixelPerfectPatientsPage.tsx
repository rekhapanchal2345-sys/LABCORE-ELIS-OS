"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { patientApi, orderApi } from "@/lib/api";
import { showSuccess, showError, showInfo } from "@/lib/notifications";
import { PatientQuickRegisterModal } from "@/components/orders/PatientQuickRegisterModal";
import BarcodeLabelModal, { BarcodeLabelItem } from "@/components/barcodes/BarcodeLabelModal";
import {
  formatPatientFullName,
  calculateClinicalAge,
  formatIndianPhone,
  formatBloodGroup,
  formatAbhaNumber,
  sanitizeMedicalConditions,
} from "@/lib/patient-utils";
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Plus,
  Printer,
  Copy,
  Check,
  Phone,
  Mail,
  MessageCircle,
  MoreVertical,
  Activity,
  Droplets,
  Calendar,
  AlertTriangle,
  HeartPulse,
  ExternalLink,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText,
  FlaskConical,
  Stethoscope,
  Sparkles,
  Edit,
  Trash2,
  Share2,
  CheckCircle2,
  Building2,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  MapPin,
  FileCheck,
} from "lucide-react";

export type Patient = {
  id: string;
  uhid: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  age: number | null;
  dateOfBirth?: string | null;
  phone: string | null;
  email: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  bloodGroup: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  insuranceProvider?: string | null;
  policyNumber?: string | null;
  createdAt: string;
  updatedAt?: string;
  status?: "Active" | "Inactive" | "Critical";
  isActive?: boolean;
  // Diagnostic flags
  isVip?: boolean;
  isCritical?: boolean;
  chronicConditions?: string[];
  allergies?: string[];
  totalOrders?: number;
  pendingOrders?: number;
  lastVisitDate?: string | null;
};

type PatientIdentityMarkProps = {
  firstName: string;
  lastName: string;
  status?: Patient["status"];
  size?: "compact" | "card" | "hero";
  gender?: Patient["gender"];
};

/**
 * Patient identity avatar using exact medical patient icons provided by user.
 * Female: long-hair silhouette in blue circle. Male: short-hair silhouette in blue circle.
 * Status dot shown at bottom-right (green=Active, red=Critical, grey=Inactive).
 */
function PatientIdentityMark({ firstName, lastName, status, size = "compact", gender }: PatientIdentityMarkProps) {
  const isCritical = status === "Critical";
  const isActive = status === "Active";
  const genderUpper = gender?.toUpperCase() || "";
  const isFemale = genderUpper === "FEMALE";
  const isMale = genderUpper === "MALE";
  const dimensions = size === "hero" ? "h-14 w-14" : size === "card" ? "h-12 w-12" : "h-11 w-11";

  return (
    <div
      className={`relative ${dimensions} shrink-0 transition-all duration-300 hover:scale-105`}
      title={`${isCritical ? "Critical" : isActive ? "Active" : "Inactive"} · ${isFemale ? "Female" : isMale ? "Male" : "Other"} patient`}
    >
      {isFemale ? (
        /* ── FEMALE patient icon – exact replica of user image ── */
        <svg viewBox="0 0 100 100" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          {/* White background */}
          <circle cx="50" cy="50" r="50" fill="white" />
          {/* Blue outer ring */}
          <circle cx="50" cy="50" r="47" fill="none" stroke="#2196F3" strokeWidth="6" />
          {/* ── Dark navy silhouette ── */}
          {/* Long hair – left */}
          <path d="M28 36 C24 40 22 50 23 60 C24 68 27 75 30 81 L36 81 L36 100 L22 100 L22 36 Z" fill="#253858" />
          {/* Long hair – right */}
          <path d="M72 36 C76 40 78 50 77 60 C76 68 73 75 70 81 L64 81 L64 100 L78 100 L78 36 Z" fill="#253858" />
          {/* Head */}
          <ellipse cx="50" cy="34" rx="19" ry="21" fill="#253858" />
          {/* Face cutout (white) */}
          <ellipse cx="50" cy="35" rx="13" ry="15" fill="white" />
          {/* Neck dark */}
          <rect x="44" y="50" width="12" height="9" fill="#253858" />
          {/* Neck white gap */}
          <rect x="46" y="51" width="8" height="6" fill="white" />
          {/* Body / torso */}
          <path d="M22 100 L22 72 C22 60 32 53 44 50 L44 60 C38 62 36 66 36 72 L36 100 Z" fill="#253858" />
          <path d="M78 100 L78 72 C78 60 68 53 56 50 L56 60 C62 62 64 66 64 72 L64 100 Z" fill="#253858" />
          <rect x="36" y="72" width="28" height="28" fill="#253858" />
          {/* V-neck white */}
          <polygon points="46,55 50,65 54,55" fill="white" />
          {/* Medical cross – right chest */}
          <rect x="59" y="69" width="11" height="3" fill="white" rx="1.5" />
          <rect x="63" y="65" width="3" height="11" fill="white" rx="1.5" />
        </svg>
      ) : isMale ? (
        /* ── MALE patient icon – exact replica of user image ── */
        <svg viewBox="0 0 100 100" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          {/* White background */}
          <circle cx="50" cy="50" r="50" fill="white" />
          {/* Blue outer ring */}
          <circle cx="50" cy="50" r="47" fill="none" stroke="#2196F3" strokeWidth="6" />
          {/* ── Dark navy silhouette ── */}
          {/* Head with short hair cap */}
          <ellipse cx="50" cy="31" rx="18" ry="20" fill="#253858" />
          {/* Short hair flat top */}
          <ellipse cx="50" cy="20" rx="17" ry="9" fill="#253858" />
          {/* Face cutout (white) */}
          <ellipse cx="50" cy="33" rx="12" ry="14" fill="white" />
          {/* Neck dark */}
          <rect x="44" y="48" width="12" height="9" fill="#253858" />
          {/* Neck white gap */}
          <rect x="46" y="49" width="8" height="6" fill="white" />
          {/* Body / torso – broad shoulders */}
          <path d="M18 100 L18 74 C18 60 30 53 44 49 L44 59 C36 62 34 66 34 74 L34 100 Z" fill="#253858" />
          <path d="M82 100 L82 74 C82 60 70 53 56 49 L56 59 C64 62 66 66 66 74 L66 100 Z" fill="#253858" />
          <rect x="34" y="74" width="32" height="26" fill="#253858" />
          {/* Crew-neck white */}
          <ellipse cx="50" cy="56" rx="6" ry="4" fill="white" />
          {/* Medical cross – right chest */}
          <rect x="59" y="67" width="12" height="3" fill="white" rx="1.5" />
          <rect x="64" y="63" width="3" height="12" fill="white" rx="1.5" />
        </svg>
      ) : (
        /* ── OTHER / UNKNOWN gender – neutral icon ── */
        <svg viewBox="0 0 100 100" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" fill="white" />
          <circle cx="50" cy="50" r="47" fill="none" stroke="#2196F3" strokeWidth="6" />
          <ellipse cx="50" cy="31" rx="17" ry="19" fill="#253858" />
          <ellipse cx="50" cy="32" rx="11" ry="13" fill="white" />
          <rect x="44" y="49" width="12" height="9" fill="#253858" />
          <rect x="46" y="50" width="8" height="6" fill="white" />
          <path d="M20 100 L20 73 C20 60 30 53 44 49 L44 59 C36 62 34 66 34 73 L34 100 Z" fill="#253858" />
          <path d="M80 100 L80 73 C80 60 70 53 56 49 L56 59 C64 62 66 66 66 73 L66 100 Z" fill="#253858" />
          <rect x="34" y="73" width="32" height="27" fill="#253858" />
          <ellipse cx="50" cy="56" rx="6" ry="4" fill="white" />
          {/* Medical cross – center chest */}
          <rect x="44" y="67" width="12" height="3" fill="white" rx="1.5" />
          <rect x="49" y="63" width="3" height="12" fill="white" rx="1.5" />
        </svg>
      )}

      {/* Status dot – bottom-right corner */}
      <div className="absolute -bottom-1 -right-1">
        <div className={`h-3.5 w-3.5 rounded-full border-2 border-white shadow-md ${
          isCritical
            ? "bg-rose-500 ring-2 ring-rose-200/60 animate-pulse"
            : isActive
              ? "bg-emerald-400 ring-2 ring-emerald-200/60"
              : "bg-slate-400 ring-2 ring-slate-200/60"
        }`} />
      </div>
    </div>
  );
}

export default function PixelPerfectPatientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // URL Parameter Synchronization Helper
  const updateUrlParams = useCallback((updates: Record<string, string | number | null | undefined>) => {
    if (typeof window === "undefined") return;
    const currentParams = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, val]) => {
      if (
        val === null ||
        val === undefined ||
        val === "" ||
        (key === "page" && Number(val) === 1) ||
        (key === "limit" && Number(val) === 10) ||
        (key === "chip" && val === "ALL") ||
        (key === "gender" && val === "All") ||
        (key === "bloodGroup" && val === "All") ||
        (key === "sortBy" && val === "recent") ||
        (key === "viewMode" && val === "table")
      ) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, String(val));
      }
    });
    const qs = currentParams.toString();
    const newUrl = `${pathname}${qs ? `?${qs}` : ""}`;
    window.history.replaceState(null, "", newUrl);
  }, [pathname]);

  // Search & Filtering initial state from URL
  const initialSearch = searchParams.get("q") || searchParams.get("search") || "";
  const initialChip = (searchParams.get("chip") as any) || "ALL";
  const initialGender = searchParams.get("gender") || "All";
  const initialBloodGroup = searchParams.get("bloodGroup") || "All";
  const initialSortBy = (searchParams.get("sortBy") as any) || "recent";
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 10;
  const initialViewMode = (searchParams.get("viewMode") as any) || "table";

  // Primary Data State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Global Server KPI Stats
  const [kpiStats, setKpiStats] = useState({
    totalRoster: 0,
    activeCount: 0,
    todayCount: 0,
    criticalCount: 0,
    pendingCount: 0,
    seniorCount: 0,
  });

  // Server Pagination Metadata
  const [paginationInfo, setPaginationInfo] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 1,
  });

  // Inspection Drawer & Selected Patient
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [drawerFullPatient, setDrawerFullPatient] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"overview" | "orders" | "vitals" | "documents">(
    (searchParams.get("tab") as any) || "overview"
  );
  const [patientOrders, setPatientOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // View Mode: Table vs Luxury Medical Card Grid
  const [viewMode, setViewMode] = useState<"table" | "grid">(initialViewMode);

  // Search & Filtering State
  const [search, setSearch] = useState(initialSearch);
  const [activeChip, setActiveChip] = useState<"ALL" | "ACTIVE" | "TODAY" | "CRITICAL" | "PENDING" | "SENIOR">(
    ["ALL", "ACTIVE", "TODAY", "CRITICAL", "PENDING", "SENIOR"].includes(initialChip) ? initialChip : "ALL"
  );
  const [genderFilter, setGenderFilter] = useState(initialGender);
  const [bloodGroupFilter, setBloodGroupFilter] = useState(initialBloodGroup);
  const [sortBy, setSortBy] = useState<"recent" | "name" | "age" | "uhid">(
    ["recent", "name", "age", "uhid"].includes(initialSortBy) ? initialSortBy : "recent"
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);

  // Modals & Real-world Workflows
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [barcodeItems, setBarcodeItems] = useState<BarcodeLabelItem[]>([]);
  const [whatsappModalPatient, setWhatsappModalPatient] = useState<Patient | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState("");

  // Copy Feedback indicator
  const [copiedUhid, setCopiedUhid] = useState<string | null>(null);

  // DPDP Act 2023 PII Privacy Masking Toggle
  const [maskPii, setMaskPii] = useState(false);

  const maskPhone = (phoneStr?: string | null) => {
    if (!phoneStr) return "Not recorded";
    const cleaned = formatIndianPhone(phoneStr);
    if (!cleaned.isValid) return phoneStr;
    return `+91 ${cleaned.rawDigits.slice(0, 5)} •••••`;
  };

  const maskEmail = (emailStr?: string | null) => {
    if (!emailStr || !emailStr.includes("@")) return "Not recorded";
    const [user, domain] = emailStr.split("@");
    if (user.length <= 2) return `${user[0]}*@${domain}`;
    return `${user.slice(0, 2)}•••••@${domain}`;
  };

  // Escape key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        handleCloseDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  // Document Title
  useEffect(() => {
    document.title = "Patients Medical Dossier | LabCore ELIS";
  }, []);

  // Sync state with URL search params changes (e.g. Back/Forward button)
  useEffect(() => {
    const qParam = searchParams.get("q") || searchParams.get("search") || "";
    if (qParam !== search) setSearch(qParam);

    const cParam = (searchParams.get("chip") as any) || "ALL";
    if (["ALL", "ACTIVE", "TODAY", "CRITICAL", "PENDING", "SENIOR"].includes(cParam) && cParam !== activeChip) {
      setActiveChip(cParam);
    }

    const gParam = searchParams.get("gender") || "All";
    if (gParam !== genderFilter) setGenderFilter(gParam);

    const bgParam = searchParams.get("bloodGroup") || "All";
    if (bgParam !== bloodGroupFilter) setBloodGroupFilter(bgParam);

    const sParam = (searchParams.get("sortBy") as any) || "recent";
    if (["recent", "name", "age", "uhid"].includes(sParam) && sParam !== sortBy) setSortBy(sParam);

    const pParam = Number(searchParams.get("page")) || 1;
    if (pParam !== currentPage) setCurrentPage(pParam);

    const lParam = Number(searchParams.get("limit")) || 10;
    if (lParam !== itemsPerPage) setItemsPerPage(lParam);

    const vmParam = (searchParams.get("viewMode") as any) || "table";
    if (["table", "grid"].includes(vmParam) && vmParam !== viewMode) setViewMode(vmParam);
  }, [searchParams]);

  // Deep-link Drawer handler from URL `?view=:uhid` or `?view=:id`
  useEffect(() => {
    const viewParam = searchParams.get("view");
    const tabParam = (searchParams.get("tab") as any) || "overview";
    if (viewParam) {
      const match = patients.find(p => p.uhid === viewParam || p.id === viewParam);
      if (match) {
        setSelectedPatient(match);
        setIsDrawerOpen(true);
        if (["overview", "orders", "vitals", "documents"].includes(tabParam)) {
          setDrawerTab(tabParam);
        }
        fetchOrdersForDrawer(match.id);
        fetchPatientDetailForDrawer(match.id);
      } else if (!loading && patients.length > 0) {
        // Deep-fetch if patient not in current page slice
        patientApi.getById(viewParam).then(res => {
          if (res && (res.data || res)) {
            const p = res.data?.patient || res.data || res;
            const mappedP: Patient = {
              id: p.id,
              uhid: p.uhid || "N/A",
              firstName: p.firstName || "",
              middleName: p.middleName || "",
              lastName: p.lastName || "",
              gender: (p.gender || "OTHER").toUpperCase() as any,
              age: p.age !== null && p.age !== undefined ? p.age : (p.dateOfBirth ? calculateClinicalAge(p.dateOfBirth, p.age).years : null),
              dateOfBirth: p.dateOfBirth || null,
              phone: p.phone || null,
              email: p.email || null,
              address: p.address || null,
              city: p.city || null,
              state: p.state || null,
              postalCode: p.postalCode || p.pincode || null,
              bloodGroup: p.bloodGroup || null,
              emergencyContactName: p.emergencyContactName || null,
              emergencyContactPhone: p.emergencyContactPhone || p.emergencyContact || null,
              insuranceProvider: p.insuranceProvider || null,
              policyNumber: p.insuranceNumber || p.policyNumber || null,
              createdAt: p.createdAt || new Date().toISOString(),
              status: p.isActive === false ? "Inactive" : (p.isCritical ? "Critical" : "Active"),
              isActive: p.isActive !== false,
              isVip: Boolean(p.isVip || p.patientType === "VIP"),
              isCritical: Boolean(p.isCritical),
              totalOrders: p.totalOrders ?? 0,
            };
            setSelectedPatient(mappedP);
            setDrawerFullPatient(p);
            setIsDrawerOpen(true);
            if (["overview", "orders", "vitals", "documents"].includes(tabParam)) {
              setDrawerTab(tabParam);
            }
            fetchOrdersForDrawer(p.id);
          }
        }).catch(err => console.warn("Could not deep-load patient for drawer view:", err));
      }
    } else if (!viewParam && isDrawerOpen) {
      setIsDrawerOpen(false);
      setSelectedPatient(null);
      setDrawerFullPatient(null);
    }
  }, [searchParams, patients, loading]);

  // Load Patients on Mount or Page / Filter change
  useEffect(() => {
    fetchPatients(currentPage);
  }, [currentPage, itemsPerPage, genderFilter, activeChip]);

  // 400ms Debounced search on typing
  const isSearchMount = React.useRef(true);
  useEffect(() => {
    if (isSearchMount.current) {
      isSearchMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      updateUrlParams({ q: search.trim() || null, page: 1 });
      setCurrentPage(1);
      fetchPatients(1, false, search.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Patients from API with Real Server-Side Pagination
  const fetchPatients = async (pageNumber = 1, isManualRefresh = false, searchQueryOverride?: string) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      setSelectedIds(new Set()); // Clear selection across pages to prevent stale IDs

      const effectiveSearch = searchQueryOverride !== undefined ? searchQueryOverride : search;

      const params = new URLSearchParams({
        page: String(pageNumber),
        limit: String(itemsPerPage),
      });
      if (effectiveSearch.trim()) params.set("search", effectiveSearch.trim());
      if (genderFilter !== "All") params.set("gender", genderFilter);
      if (activeChip !== "ALL") params.set("activeChip", activeChip);

      const response = await patientApi.getAll(params.toString());

      if (response && response.success && response.data) {
        const rawData = response.data.patients || (Array.isArray(response.data) ? response.data : []);
        const pagination = response.data.pagination || {
          page: pageNumber,
          limit: itemsPerPage,
          total: rawData.length,
          totalPages: Math.max(1, Math.ceil(rawData.length / itemsPerPage)),
        };
        const kpis = response.data.kpis || {
          totalRoster: pagination.total,
          activeCount: rawData.filter((p: any) => p.isActive !== false).length,
          todayCount: 0,
          criticalCount: 0,
        };

        // Auto-correct stale page (Item 16: if records reduce or page > totalPages, reset to last valid page)
        if (pagination.totalPages > 0 && pageNumber > pagination.totalPages) {
          setCurrentPage(pagination.totalPages);
          return;
        }

        const mappedPatients: Patient[] = rawData.map((p: any) => {
          const rawCreated = p.createdAt || new Date().toISOString();
          const pAge = p.age !== null && p.age !== undefined ? p.age : (p.dateOfBirth ? calculateClinicalAge(p.dateOfBirth, p.age).years : null);
          const lastOrderDate = p.lastVisitDate || p.orders?.[0]?.createdAt || null;

          return {
            id: p.id,
            uhid: p.uhid || p.patientId || p.mrn || "N/A",
            firstName: p.firstName || "",
            middleName: p.middleName || "",
            lastName: p.lastName || "",
            gender: (p.gender || "OTHER").toUpperCase() as any,
            age: pAge,
            dateOfBirth: p.dateOfBirth || null,
            phone: p.phone || null,
            email: p.email || null,
            address: p.address || null,
            city: p.city || null,
            state: p.state || null,
            postalCode: p.postalCode || p.pincode || null,
            bloodGroup: p.bloodGroup || null,
            emergencyContactName: p.emergencyContactName || null,
            emergencyContactPhone: p.emergencyContactPhone || p.emergencyContact || null,
            insuranceProvider: p.insuranceProvider || null,
            policyNumber: p.insuranceNumber || p.policyNumber || null,
            createdAt: rawCreated,
            updatedAt: p.updatedAt || rawCreated,
            status: p.isActive === false ? "Inactive" : (p.isCritical ? "Critical" : "Active"),
            isActive: p.isActive !== false,
            isVip: Boolean(p.isVip || p.patientType === "VIP"),
            isCritical: Boolean(p.isCritical),
            chronicConditions: Array.isArray(p.chronicDiseases)
              ? p.chronicDiseases
              : Array.isArray(p.chronicConditions)
                ? p.chronicConditions
                : [],
            allergies: Array.isArray(p.allergies) ? p.allergies : [],
            totalOrders: p.totalOrders ?? p._count?.orders ?? (Array.isArray(p.orders) ? p.orders.length : 0),
            pendingOrders: p.pendingOrders ?? 0,
            lastVisitDate: lastOrderDate,
          };
        });

        setPatients(mappedPatients);
        setPaginationInfo({
          page: pagination.page || pageNumber,
          limit: pagination.limit || itemsPerPage,
          total: pagination.total || mappedPatients.length,
          totalPages: pagination.totalPages || Math.max(1, Math.ceil((pagination.total || mappedPatients.length) / itemsPerPage)),
        });
        setKpiStats({
          totalRoster: kpis.totalRoster ?? pagination.total,
          activeCount: kpis.activeCount ?? mappedPatients.filter((p) => p.status === "Active").length,
          todayCount: kpis.todayCount ?? 0,
          criticalCount: kpis.criticalCount ?? mappedPatients.filter((p) => p.isCritical).length,
          pendingCount: kpis.pendingCount ?? mappedPatients.filter((p) => (p.pendingOrders ?? 0) > 0).length,
          seniorCount: kpis.seniorCount ?? mappedPatients.filter((p) => (p.age ?? 0) >= 60).length,
        });

        if (isManualRefresh) showSuccess("Patient records synchronized successfully");
      } else {
        setPatients([]);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
      showError("Could not retrieve patients roster. Please check network connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Toggle Patient Active/Inactive status via API
  const handleTogglePatientStatus = async (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    const nextIsActive = patient.isActive === false ? true : false;
    try {
      const response = await patientApi.update(patient.id, { isActive: nextIsActive });
      if (response && (response.success || response.data)) {
        const nextStatus = nextIsActive ? (patient.isCritical ? "Critical" : "Active") : "Inactive";
        showSuccess(`Patient ${patient.firstName} status set to ${nextIsActive ? "Active" : "Inactive"}`);
        setPatients((prev) =>
          prev.map((p) =>
            p.id === patient.id
              ? {
                  ...p,
                  isActive: nextIsActive,
                  status: nextStatus,
                }
              : p
          )
        );
        if (selectedPatient && selectedPatient.id === patient.id) {
          setSelectedPatient((prev) =>
            prev
              ? {
                  ...prev,
                  isActive: nextIsActive,
                  status: nextStatus,
                }
              : null
          );
        }
      } else {
        showError("Failed to update patient status.");
      }
    } catch (err: any) {
      console.error("Error toggling patient status:", err);
      showError(err?.message || "Failed to update patient status.");
    }
  };

  // Fetch test orders for the active drawer patient
  const fetchOrdersForDrawer = useCallback(async (patientId: string) => {
    try {
      setLoadingOrders(true);
      const res = await orderApi.getAll(`patientId=${patientId}`);
      if (res && res.data) {
        const rawOrders = Array.isArray(res.data) ? res.data : (res.data.orders || []);
        setPatientOrders(rawOrders);
      } else {
        setPatientOrders([]);
      }
    } catch {
      setPatientOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Deep-Fetch Patient Record for Drawer
  const fetchPatientDetailForDrawer = useCallback(async (patientId: string) => {
    try {
      const detailRes = await patientApi.getById(patientId);
      if (detailRes && (detailRes.data || detailRes)) {
        const pDetail = detailRes.data?.patient || detailRes.data || detailRes;
        setDrawerFullPatient(pDetail);
      }
    } catch (err) {
      console.error("Error fetching patient details for drawer:", err);
    }
  }, []);

  // Open the Clinical Slide-over Drawer & Deep-Fetch Patient Record
  const handleOpenDrawer = async (patient: Patient, tab: "overview" | "orders" | "vitals" | "documents" = "overview") => {
    setSelectedPatient(patient);
    setDrawerFullPatient(null);
    setIsDrawerOpen(true);
    setDrawerTab(tab);
    updateUrlParams({ view: patient.uhid || patient.id, tab: tab !== "overview" ? tab : null });
    fetchOrdersForDrawer(patient.id);
    fetchPatientDetailForDrawer(patient.id);
  };

  // Switch drawer tabs with URL syncing
  const handleDrawerTabChange = (newTab: "overview" | "orders" | "vitals" | "documents") => {
    setDrawerTab(newTab);
    updateUrlParams({ tab: newTab !== "overview" ? newTab : null });
  };

  // Close the slide-over drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedPatient(null);
    setDrawerFullPatient(null);
    updateUrlParams({ view: null, tab: null });
  };

  // 1-Click Copy UHID with feedback
  const handleCopyUhid = (e: React.MouseEvent, uhid: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uhid);
    setCopiedUhid(uhid);
    showSuccess(`UHID ${uhid} copied to clipboard`);
    setTimeout(() => {
      setCopiedUhid(null);
    }, 2000);
  };

  // Prepare and open Barcode Label Modal for Patient
  const handlePrintBarcode = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    const ageStr = patient.age !== null && patient.age !== undefined ? (patient.age === 0 ? "Newborn" : `${patient.age}Y`) : "";
    const genChar = patient.gender === "MALE" ? "M" : patient.gender === "FEMALE" ? "F" : "O";
    const patientName = formatPatientFullName(patient);
    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const items: BarcodeLabelItem[] = [
      {
        id: `bc-badge-${patient.id}`,
        barcode: patient.uhid,
        patientName,
        uhid: patient.uhid,
        testName: "Patient Identification / Accession Badge",
        specimenType: "Patient Badge",
        tubeType: "Standard ID Tag",
        tubeColor: "Blue",
        tubeColorHex: "#2563EB",
        gender: genChar,
        age: ageStr,
        date: dateStr,
        priority: patient.isCritical ? "STAT (CRITICAL)" : "ROUTINE",
      },
      {
        id: `bc-edta-${patient.id}`,
        barcode: `${patient.uhid}-EDTA`,
        patientName,
        uhid: patient.uhid,
        testName: "Hematology / Whole Blood (CBC, ESR, HbA1c)",
        specimenType: "EDTA Whole Blood",
        tubeType: "Lavender Top (EDTA K2/K3)",
        tubeColor: "Lavender",
        tubeColorHex: "#9333EA",
        gender: genChar,
        age: ageStr,
        date: dateStr,
        priority: patient.isCritical ? "STAT" : "ROUTINE",
      },
      {
        id: `bc-serum-${patient.id}`,
        barcode: `${patient.uhid}-SERUM`,
        patientName,
        uhid: patient.uhid,
        testName: "Biochemistry / Serology (LFT, KFT, Lipids)",
        specimenType: "Serum (Clotted)",
        tubeType: "Gold / Red Top (SST Gel Clot Activator)",
        tubeColor: "Gold / Red",
        tubeColorHex: "#DC2626",
        gender: genChar,
        age: ageStr,
        date: dateStr,
        priority: patient.isCritical ? "STAT" : "ROUTINE",
      },
      {
        id: `bc-fluoride-${patient.id}`,
        barcode: `${patient.uhid}-FLUO`,
        patientName,
        uhid: patient.uhid,
        testName: "Glycolysis / Blood Glucose (FBS / PPBS)",
        specimenType: "Fluoride Plasma",
        tubeType: "Grey Top (Sodium Fluoride)",
        tubeColor: "Grey",
        tubeColorHex: "#64748B",
        gender: genChar,
        age: ageStr,
        date: dateStr,
        priority: patient.isCritical ? "STAT" : "ROUTINE",
      },
    ];

    setBarcodeItems(items);
    setBarcodeModalOpen(true);
  };

  // Open WhatsApp Dispatch Modal
  const handleOpenWhatsApp = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    if (!patient.phone) {
      showError("No telephone number on file for this patient.");
      return;
    }

    const hasOrders = (patient.totalOrders ?? 0) > 0;

    const fullName = formatPatientFullName(patient);
    const msg = hasOrders
      ? `Dear ${fullName},\n\nGreetings from LabCore Diagnostics.\nYour registered Patient ID (UHID) is *${patient.uhid}*.\nYour diagnostic order is logged in our system, and your verified reports will be accessible online.\n\nHelpline: +91 9106161228 | LabCore Diagnostics Portal`
      : `Dear ${fullName},\n\nWelcome to LabCore Diagnostics.\nYour registered Patient ID (UHID) is *${patient.uhid}*.\n\nHelpline: +91 9106161228 | LabCore Diagnostics Portal`;

    setWhatsappModalPatient(patient);
    setWhatsappMessage(msg);
  };

  // Send WhatsApp message directly
  const handleSendWhatsAppDirect = () => {
    if (!whatsappModalPatient?.phone) return;
    const cleanPhone = whatsappModalPatient.phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, "_blank");
    showSuccess(`WhatsApp dispatch window opened for ${whatsappModalPatient.firstName}`);
    setWhatsappModalPatient(null);
  };

  // Sanitize CSV value against formula injection & unescaped quotes
  const sanitizeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    let str = String(val).trim();
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  };

  // Export to CSV with full clinical columns & security sanitization
  const handleExportCSV = (patientsToExport: Patient[]) => {
    if (patientsToExport.length === 0) {
      showInfo("No patient records to export.");
      return;
    }

    console.log(`[AUDIT LOG] Patient Roster CSV Export requested at ${new Date().toISOString()} for ${patientsToExport.length} patients`);

    const headers = [
      "UHID",
      "First Name",
      "Last Name",
      "Gender",
      "Age",
      "Blood Group",
      "Phone",
      "Email",
      "City",
      "Status",
      "Clinical Priority",
      "Total Orders",
      "Registered On",
    ];

    const rows = patientsToExport.map((p) => [
      sanitizeCSV(p.uhid),
      sanitizeCSV(p.firstName),
      sanitizeCSV(p.lastName),
      sanitizeCSV(p.gender),
      sanitizeCSV(p.age !== null && p.age !== undefined ? (p.age === 0 ? "0 (Newborn)" : p.age) : ""),
      sanitizeCSV(formatBloodGroup(p.bloodGroup)),
      sanitizeCSV(p.phone),
      sanitizeCSV(p.email),
      sanitizeCSV(p.city),
      sanitizeCSV(p.status),
      sanitizeCSV(p.isCritical ? "CRITICAL" : p.isVip ? "VIP" : "ROUTINE"),
      sanitizeCSV(p.totalOrders ?? 0),
      sanitizeCSV(new Date(p.createdAt).toLocaleDateString("en-IN")),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `labcore_patients_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess(`Exported ${patientsToExport.length} patient records successfully (Audit logged)`);
  };

  // Handle Multi-Selection Checkbox
  const toggleSelectPatient = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAllOnPage = (currentItems: Patient[]) => {
    const next = new Set(selectedIds);
    const allSelected = currentItems.every((item) => next.has(item.id));
    if (allSelected) {
      currentItems.forEach((item) => next.delete(item.id));
    } else {
      currentItems.forEach((item) => next.add(item.id));
    }
    setSelectedIds(next);
  };

  // Search Submit Handler (Triggers Server Search across all DB records)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentPage === 1) {
      fetchPatients(1);
    } else {
      setCurrentPage(1);
    }
  };

  // Clear Search Handler
  const handleClearSearch = () => {
    setSearch("");
    if (currentPage === 1) {
      fetchPatients(1, false, "");
    } else {
      setCurrentPage(1);
    }
  };

  // Sorted Patients for Current Page (Server handles search, filter & pagination)
  const filteredPatients = useMemo(() => {
    return [...patients].sort((a, b) => {
      if (sortBy === "name") return formatPatientFullName(a).localeCompare(formatPatientFullName(b));
      if (sortBy === "age") return (b.age ?? 0) - (a.age ?? 0);
      if (sortBy === "uhid") return a.uhid.localeCompare(b.uhid);
      // recent
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [patients, sortBy]);

  const currentPatients = filteredPatients;

  // Dynamic Sliding Window Page Buttons (Item 15: guarantees current page is always visible)
  const visiblePages = useMemo(() => {
    const totalP = paginationInfo.totalPages || 1;
    const maxButtons = 5;
    let startP = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endP = Math.min(totalP, startP + maxButtons - 1);
    if (endP - startP + 1 < maxButtons) {
      startP = Math.max(1, endP - maxButtons + 1);
    }
    const pages = [];
    for (let p = startP; p <= endP; p++) {
      pages.push(p);
    }
    return pages;
  }, [currentPage, paginationInfo.totalPages]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateUrlParams({ page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    updateUrlParams({ limit: newLimit, page: 1 });
  };

  // Global Server KPI Stats
  const totalPatientsCount = kpiStats.totalRoster;
  const activePatientsCount = kpiStats.activeCount;
  const todayWalkinCount = kpiStats.todayCount;
  const criticalCount = kpiStats.criticalCount;

  // Selected Patients Array for Bulk Actions
  const selectedPatientsList = useMemo(() => {
    return patients.filter((p) => selectedIds.has(p.id));
  }, [patients, selectedIds]);

  // Bulk Print Barcodes (Patient Accession Badges)
  const handleBulkPrintBarcodes = () => {
    if (selectedPatientsList.length === 0) return;
    const items: BarcodeLabelItem[] = selectedPatientsList.map((p, idx) => {
      const ageStr = p.age !== null && p.age !== undefined ? (p.age === 0 ? "Newborn" : `${p.age}Y`) : "";
      const genChar = p.gender === "MALE" ? "M" : (p.gender === "FEMALE" ? "F" : "O");
      return {
        id: `bulk-badge-${p.id}-${idx}`,
        barcode: p.uhid,
        patientName: formatPatientFullName(p),
        uhid: p.uhid,
        testName: "Patient Identification / Accession Badge",
        specimenType: "Patient Badge",
        tubeType: "Standard ID Tag",
        tubeColor: "Blue",
        tubeColorHex: "#2563EB",
        age: ageStr,
        gender: genChar,
        date: new Date().toLocaleDateString("en-IN"),
        priority: p.isCritical ? "STAT" : "ROUTINE",
      };
    });
    setBarcodeItems(items);
    setBarcodeModalOpen(true);
  };

  return (
    <DashboardLayout title="Patients">
      <div className="space-y-6 pb-20">
        {/* =========================================================================
            1. PREMIUM ENTERPRISE HERO & KPI SECTION
        ========================================================================= */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-7 text-white shadow-xl ring-1 ring-white/10">
          {/* Premium Background Effects */}
          <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          
          {/* Premium LabCore Logo Banner */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                <FlaskConical className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-widest text-cyan-300 uppercase">LabCore</span>
                <span className="text-[7px] font-medium tracking-wider text-slate-400">Diagnostics</span>
              </div>
            </div>
            <div className="h-4 w-[1px] bg-white/20" />
            <span className="text-[9px] font-semibold text-emerald-300 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between pt-8">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live LIS Directory
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300 backdrop-blur-sm border border-white/10">
                  Master Roster
                </span>
                <span className="rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-cyan-300 backdrop-blur-sm border border-cyan-400/30">
                  Enterprise Edition
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Patient Medical Dossier
              </h1>
              <p className="mt-1.5 text-sm text-slate-300 max-w-xl leading-relaxed">
                Comprehensive clinical records, automated phlebotomy specimen labeling, and real-time diagnostic test history.
              </p>
            </div>

            {/* Premium Quick Actions Header Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => fetchPatients(1, true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-white/15 backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:ring-white/25 active:scale-95 disabled:opacity-50 group"
                title="Refresh patient roster"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""} group-hover:rotate-180 transition-transform duration-500`} />
                <span>{refreshing ? "Syncing..." : "Sync"}</span>
              </button>

              <button
                onClick={() => handleExportCSV(filteredPatients)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-white/15 backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:ring-white/25 active:scale-95 group"
                title="Export current view to CSV"
              >
                <Download className="h-4 w-4 text-slate-200 group-hover:translate-y-0.5 transition-transform" />
                <span>Export</span>
              </button>

              <button
                onClick={() => setIsQuickRegisterOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20 transition-all duration-300 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/50 hover:ring-white/30 active:scale-95 group"
              >
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                <span>Register Patient</span>
              </button>
            </div>
          </div>

          {/* 4 Premium KPI Cards */}
          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Total Patients */}
            <div className="group relative rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-blue-400/30 hover:shadow-[0_8px_24px_rgba(59,130,246,0.15)]">
              <div className="absolute top-0 right-0 h-1 w-1 rounded-tr-lg bg-blue-400" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Total Roster
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 ring-1 ring-blue-400/30 group-hover:bg-blue-500/30 group-hover:ring-blue-400/50 transition-all">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white group-hover:text-blue-200 transition-colors">
                  {loading ? "..." : totalPatientsCount.toLocaleString()}
                </span>
                <span className="inline-flex items-center text-xs font-semibold text-blue-300">
                  Total Registered
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">All registered diagnostic subjects</p>
            </div>

            {/* Card 2: Active Patients */}
            <div className="group relative rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-emerald-400/30 hover:shadow-[0_8px_24px_rgba(16,185,129,0.15)]">
              <div className="absolute top-0 right-0 h-1 w-1 rounded-tr-lg bg-emerald-400" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Active Clinical
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/30 group-hover:bg-emerald-500/30 group-hover:ring-emerald-400/50 transition-all">
                  <HeartPulse className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white group-hover:text-emerald-200 transition-colors">
                  {loading ? "..." : activePatientsCount.toLocaleString()}
                </span>
                <span className="inline-flex items-center text-xs font-semibold text-emerald-400">
                  {totalPatientsCount > 0
                    ? `${Math.round((activePatientsCount / totalPatientsCount) * 100)}% active`
                    : "100%"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Currently active on pipeline</p>
            </div>

            {/* Card 3: OPD Walk-In Today */}
            <div className="group relative rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-indigo-400/30 hover:shadow-[0_8px_24px_rgba(99,102,241,0.15)]">
              <div className="absolute top-0 right-0 h-1 w-1 rounded-tr-lg bg-indigo-400" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Today's Walk-in OPD
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-400/30 group-hover:bg-indigo-500/30 group-hover:ring-indigo-400/50 transition-all">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white group-hover:text-indigo-200 transition-colors">
                  {loading ? "..." : todayWalkinCount}
                </span>
                <span className="inline-flex items-center text-xs font-semibold text-indigo-300">
                  New Today
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Immediate specimen accessions</p>
            </div>

            {/* Card 4: Critical / Attention */}
            <div className="group relative rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-rose-400/30 hover:shadow-[0_8px_24px_rgba(244,63,94,0.15)]">
              <div className="absolute top-0 right-0 h-1 w-1 rounded-tr-lg bg-rose-400" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Critical / Attention
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 ring-1 ring-rose-400/30 group-hover:bg-rose-500/30 group-hover:ring-rose-400/50 transition-all">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white group-hover:text-rose-200 transition-colors">
                  {loading ? "..." : criticalCount}
                </span>
                <span className="inline-flex items-center text-xs font-semibold text-rose-400">
                  High Priority
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Requires rapid lab attention</p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. ADVANCED SEARCH, FILTER CHIPS & CONTROLS TOOLBAR
        ========================================================================= */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          {/* Top Line: Search Bar & View Mode Toggle */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input & Tactile Action Button */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentPage(1);
                updateUrlParams({ q: search.trim() || null, page: 1 });
                fetchPatients(1, false, search);
              }}
              className="flex items-center gap-2 flex-1"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Patient Name, UHID (e.g. LC-000001), Phone, Email, City..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setCurrentPage(1);
                      updateUrlParams({ q: null, page: 1 });
                      fetchPatients(1, false, "");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search</span>
              </button>
            </form>

            {/* Controls Right: View Mode Toggle & Advanced Filter Toggle */}
            <div className="flex items-center gap-2">
              {/* Table / Grid Toggle */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  onClick={() => {
                    setViewMode("table");
                    updateUrlParams({ viewMode: null });
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === "table"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                    }`}
                  title="Dense Clinical Table View"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Table</span>
                </button>

                <button
                  onClick={() => {
                    setViewMode("grid");
                    updateUrlParams({ viewMode: "grid" });
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === "grid"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                    }`}
                  title="Luxury Medical Cards View"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Cards</span>
                </button>
              </div>

              {/* Advanced Filter Popover Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${showAdvancedFilters || genderFilter !== "All" || bloodGroupFilter !== "All"
                    ? "border-indigo-500 bg-indigo-50/60 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters</span>
                {(genderFilter !== "All" || bloodGroupFilter !== "All") && (
                  <span className="flex h-2 w-2 rounded-full bg-indigo-600" />
                )}
              </button>

              {/* Sort By Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const newSort = e.target.value as any;
                    setSortBy(newSort);
                    updateUrlParams({ sortBy: newSort !== "recent" ? newSort : null });
                  }}
                  className="rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
                >
                  <option value="recent">Sort: Newest First</option>
                  <option value="name">Sort: Name (A-Z)</option>
                  <option value="age">Sort: Age (High to Low)</option>
                  <option value="uhid">Sort: UHID</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Filter Category Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
              Category:
            </span>

            {[
              { id: "ALL", label: "All Patients", count: kpiStats.totalRoster },
              { id: "ACTIVE", label: "Active", count: kpiStats.activeCount },
              { id: "TODAY", label: "Today's OPD", count: kpiStats.todayCount },
              { id: "CRITICAL", label: "Critical Priority", count: kpiStats.criticalCount },
              { id: "PENDING", label: "Pending Lab Reports", count: kpiStats.pendingCount },
              { id: "SENIOR", label: "Senior Citizens (60+)", count: kpiStats.seniorCount },
            ].map((chip) => {
              const isActive = activeChip === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    setActiveChip(chip.id as any);
                    setCurrentPage(1);
                    updateUrlParams({ chip: chip.id !== "ALL" ? chip.id : null, page: 1 });
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${isActive
                      ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  <span>{chip.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-white text-slate-600"
                      }`}
                  >
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expandable Advanced Filters Row */}
          {showAdvancedFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-dashed border-slate-200">
              {/* Gender Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                <select
                  value={genderFilter}
                  onChange={(e) => {
                    const newG = e.target.value;
                    setGenderFilter(newG);
                    setCurrentPage(1);
                    updateUrlParams({ gender: newG !== "All" ? newG : null, page: 1 });
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Blood Group Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Blood Group</label>
                <select
                  value={bloodGroupFilter}
                  onChange={(e) => {
                    const newBg = e.target.value;
                    setBloodGroupFilter(newBg);
                    setCurrentPage(1);
                    updateUrlParams({ bloodGroup: newBg !== "All" ? newBg : null, page: 1 });
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="All">All Blood Groups</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                </select>
              </div>

              {/* Reset Actions */}
              <div className="flex items-end gap-2">
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveChip("ALL");
                    setGenderFilter("All");
                    setBloodGroupFilter("All");
                    setSortBy("recent");
                    setCurrentPage(1);
                    updateUrlParams({ q: null, chip: null, gender: null, bloodGroup: null, sortBy: null, page: 1 });
                    fetchPatients(1, false, "");
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            3. PATIENT DATA DISPLAY (TABLE VIEW VS LUXURY GRID VIEW)
        ========================================================================= */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-4 animate-bounce">
              <FlaskConical className="h-6 w-6 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Synchronizing Patient Records</h3>
            <p className="mt-1 text-sm text-slate-500">
              Retrieving laboratory diagnostic roster, specimen logs, and verified records...
            </p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Patient Records Located</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              We couldn't find any patient matching "{search}" or the selected filter criteria.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearch("");
                  setActiveChip("ALL");
                  setGenderFilter("All");
                  setBloodGroupFilter("All");
                  setCurrentPage(1);
                  updateUrlParams({ q: null, chip: null, gender: null, bloodGroup: null, sortBy: null, page: 1 });
                  fetchPatients(1, false, "");
                }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear Search & Filters
              </button>
              <button
                onClick={() => setIsQuickRegisterOpen(true)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
              >
                + Register New Patient
              </button>
            </div>
          </div>
        ) : viewMode === "table" ? (
          /* ======================== 3A. DENSE CLINICAL TABLE VIEW ======================== */
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="w-12 px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={
                          currentPatients.length > 0 &&
                          currentPatients.every((p) => selectedIds.has(p.id))
                        }
                        onChange={() => handleSelectAllOnPage(currentPatients)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3.5">Patient Information</th>
                    <th className="px-4 py-3.5">Clinical Profile</th>
                    <th className="px-4 py-3.5">Contact & Location</th>
                    <th className="px-4 py-3.5">Orders & Activity</th>
                    <th className="px-4 py-3.5">Clinical Status</th>
                    <th className="px-4 py-3.5 text-right">Clinical Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {currentPatients.map((patient) => {
                    const isSelected = selectedIds.has(patient.id);
                    const fullName = formatPatientFullName(patient);
                    const clinicalAge = calculateClinicalAge(patient.dateOfBirth, patient.age);
                    const phoneFormatted = formatIndianPhone(patient.phone);
                    const sanitizedChronic = sanitizeMedicalConditions(patient.chronicConditions);

                    return (
                      <tr
                        key={patient.id}
                        onClick={() => handleOpenDrawer(patient)}
                        className={`group cursor-pointer transition-all duration-150 hover:bg-indigo-50/40 ${isSelected ? "bg-indigo-50/60" : ""
                          }`}
                      >
                        {/* 1. Checkbox */}
                        <td className="px-4 py-4" onClick={(e) => toggleSelectPatient(e, patient.id)}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => { }}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>

                        {/* 2. Patient Identity */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <PatientIdentityMark
                              firstName={patient.firstName}
                              lastName={patient.lastName}
                              status={patient.status}
                              gender={patient.gender}
                            />

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/patients/${patient.uhid || patient.id}`}
                                  onClick={(e) => {
                                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
                                      e.preventDefault();
                                      handleOpenDrawer(patient);
                                    }
                                  }}
                                  className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors hover:underline cursor-pointer"
                                  title="Click to view dossier (Ctrl+Click to open full page)"
                                >
                                  {fullName}
                                </Link>
                                {patient.isVip && (
                                  <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
                                    VIP
                                  </span>
                                )}
                                {patient.isCritical && (
                                  <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-700 uppercase tracking-wider">
                                    Critical
                                  </span>
                                )}
                              </div>

                              {/* UHID with 1-click Copy */}
                              <div className="mt-1 flex items-center gap-2">
                                <button
                                  onClick={(e) => handleCopyUhid(e, patient.uhid)}
                                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-bold text-slate-700 hover:bg-indigo-100 hover:text-indigo-800 transition-colors"
                                  title="Click to copy UHID"
                                >
                                  <span>{patient.uhid}</span>
                                  {copiedUhid === patient.uhid ? (
                                    <Check className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-slate-400" />
                                  )}
                                </button>

                                {/* Age & Gender */}
                                <span className="rounded-md bg-slate-100/70 px-2 py-0.5 text-xs font-medium text-slate-600">
                                  {clinicalAge.formatted} •{" "}
                                  {patient.gender === "MALE"
                                    ? "Male"
                                    : patient.gender === "FEMALE"
                                      ? "Female"
                                      : "Other"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Clinical Profile */}
                        <td className="px-4 py-4">
                          <div className="space-y-1.5">
                            {/* Blood Group Badge */}
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
                                <Droplets className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                                {formatBloodGroup(patient.bloodGroup)}
                              </span>

                              {/* Chronic tags */}
                              {sanitizedChronic.length > 0 ? (
                                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
                                  {sanitizedChronic[0]}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">None reported</span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400">
                              Registered: {new Date(patient.createdAt).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                        </td>

                        {/* 4. Contact & Reach */}
                        <td className="px-4 py-4">
                          <div className="space-y-1 text-xs">
                            {patient.phone ? (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">{phoneFormatted.display}</span>
                                {/* Quick WhatsApp Dispatch Trigger */}
                                <button
                                  onClick={(e) => handleOpenWhatsApp(e, patient)}
                                  className="rounded-md p-1 text-emerald-600 hover:bg-emerald-50 transition-colors"
                                  title="Dispatch WhatsApp Alert"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400">Phone not on file</span>
                            )}

                            <div className="flex items-center gap-1 text-slate-500">
                              <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                              <span className="truncate max-w-[150px]">
                                {patient.city || patient.address || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 5. Orders & Activity */}
                        <td className="px-4 py-4">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
                                <FlaskConical className="h-3 w-3 text-blue-500" />
                                {patient.totalOrders ?? 0} {patient.totalOrders === 1 ? "Order" : "Orders"}
                              </span>
                              {(patient.pendingOrders ?? 0) > 0 && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                  {patient.pendingOrders} Pending
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">
                              Last visit: {patient.lastVisitDate ? new Date(patient.lastVisitDate).toLocaleDateString("en-IN") : "No orders"}
                            </p>
                          </div>
                        </td>

                        {/* 6. Clinical Status */}
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          {patient.status === "Critical" ? (
                            <button
                              onClick={(e) => handleTogglePatientStatus(e, patient)}
                              className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-300 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Click to toggle Active/Inactive"
                            >
                              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                              Critical STAT
                            </button>
                          ) : patient.status === "Active" ? (
                            <button
                              onClick={(e) => handleTogglePatientStatus(e, patient)}
                              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Click to mark Inactive"
                            >
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              Active
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleTogglePatientStatus(e, patient)}
                              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                              title="Click to mark Active"
                            >
                              <span className="h-2 w-2 rounded-full bg-slate-400" />
                              Inactive
                            </button>
                          )}
                        </td>

                        {/* 7. Clinical Actions Suite (Fixes view opens new page) */}
                        <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {/* View Button -> Opens Slide-Over Drawer in-page or Full Page on Ctrl/Cmd+Click */}
                            <Link
                              href={`/patients/${patient.uhid || patient.id}`}
                              onClick={(e) => {
                                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
                                  e.preventDefault();
                                  handleOpenDrawer(patient);
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                              title="Inspect Clinical Dossier (Ctrl+Click for Full Page)"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">View</span>
                            </Link>

                            {/* New Lab Order */}
                            <Link
                              href={`/orders/new?patientId=${patient.id}`}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                              title="Create Lab Order for Patient"
                            >
                              <Plus className="h-4 w-4" />
                            </Link>

                            {/* Barcode Print */}
                            <button
                              onClick={(e) => handlePrintBarcode(e, patient)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                              title="Print Specimen Tube Barcodes"
                            >
                              <Printer className="h-4 w-4" />
                            </button>

                            {/* WhatsApp Dispatch */}
                            <button
                              onClick={(e) => handleOpenWhatsApp(e, patient)}
                              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Send WhatsApp Update"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Toolbar */}
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-slate-500">
                Displaying{" "}
                <span className="font-bold text-slate-900">
                  {paginationInfo.total > 0 ? (paginationInfo.page - 1) * paginationInfo.limit + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-bold text-slate-900">
                  {Math.min((paginationInfo.page - 1) * paginationInfo.limit + currentPatients.length, paginationInfo.total)}
                </span> of{" "}
                <span className="font-bold text-slate-900">
                  {paginationInfo.total}
                </span>{" "}
                patients
              </p>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Rows per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {visiblePages.map((pNum) => (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === pNum
                          ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(Math.min(paginationInfo.totalPages, currentPage + 1))}
                    disabled={currentPage >= paginationInfo.totalPages}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================== 3B. LUXURY MEDICAL CARD GRID VIEW ======================== */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {currentPatients.map((patient) => {
                const isSelected = selectedIds.has(patient.id);
                const fullName = formatPatientFullName(patient);
                const clinicalAge = calculateClinicalAge(patient.dateOfBirth, patient.age);
                const phoneFormatted = formatIndianPhone(patient.phone);

                return (
                  <div
                    key={patient.id}
                    onClick={() => handleOpenDrawer(patient)}
                    className={`group relative rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${isSelected
                        ? "border-indigo-500 ring-2 ring-indigo-500/20"
                        : "border-slate-200/80 hover:border-indigo-200"
                      }`}
                  >
                    {/* Top Bar: Checkbox & Status */}
                    <div className="flex items-center justify-between">
                      <div onClick={(e) => toggleSelectPatient(e, patient.id)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => { }}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {patient.status === "Critical" ? (
                          <button
                            onClick={(e) => handleTogglePatientStatus(e, patient)}
                            className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200 animate-pulse hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Click to toggle Active/Inactive"
                          >
                            Critical STAT
                          </button>
                        ) : patient.status === "Active" ? (
                          <button
                            onClick={(e) => handleTogglePatientStatus(e, patient)}
                            className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Click to mark Inactive"
                          >
                            Active
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleTogglePatientStatus(e, patient)}
                            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                            title="Click to mark Active"
                          >
                            Inactive
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Patient Avatar & Name */}
                    <div className="mt-4 flex items-center gap-3">
                      <PatientIdentityMark
                        firstName={patient.firstName}
                        lastName={patient.lastName}
                        status={patient.status}
                        gender={patient.gender}
                        size="card"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/patients/${patient.uhid || patient.id}`}
                            onClick={(e) => {
                              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
                                e.preventDefault();
                                handleOpenDrawer(patient);
                              }
                            }}
                            className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors hover:underline cursor-pointer"
                            title="Click to view dossier (Ctrl+Click to open full page)"
                          >
                            {fullName}
                          </Link>
                          {patient.isVip && (
                            <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-black text-amber-800 uppercase">
                              VIP
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 flex items-center gap-2 text-xs">
                          <button
                            onClick={(e) => handleCopyUhid(e, patient.uhid)}
                            className="font-mono font-bold text-slate-600 hover:text-indigo-600"
                          >
                            {patient.uhid}
                          </button>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">
                            {clinicalAge.formatted}{" "}
                            •{" "}
                            {patient.gender === "MALE"
                              ? "M"
                              : patient.gender === "FEMALE"
                                ? "F"
                                : "O"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Badges: Blood & Details */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
                        <Droplets className="h-3 w-3 text-rose-500 fill-rose-500" />
                        {formatBloodGroup(patient.bloodGroup)}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                        <FlaskConical className="h-3 w-3 text-blue-500" />
                        {patient.totalOrders ?? 0} {patient.totalOrders === 1 ? "Order" : "Orders"}
                      </span>
                    </div>

                    {/* Contact snippet */}
                    <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-semibold">{patient.phone || "Not recorded"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">City:</span>
                        <span>{patient.city || patient.address || "N/A"}</span>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div
                      className="mt-4 grid grid-cols-4 gap-1.5 border-t border-slate-100 pt-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={`/patients/${patient.uhid || patient.id}`}
                        onClick={(e) => {
                          if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
                            e.preventDefault();
                            handleOpenDrawer(patient);
                          }
                        }}
                        className="rounded-lg bg-indigo-50 p-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1 col-span-2 cursor-pointer"
                        title="View Patient Drawer (Ctrl+Click for Full Page)"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </Link>

                      <Link
                        href={`/orders/new?patientId=${patient.id}`}
                        className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center"
                        title="Book New Lab Order"
                      >
                        <Plus className="h-4 w-4" />
                      </Link>

                      <button
                        onClick={(e) => handlePrintBarcode(e, patient)}
                        className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center"
                        title="Print Barcode Labels"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grid Pagination Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">
                Page <span className="font-bold text-slate-900">{currentPage}</span> of{" "}
                <span className="font-bold text-slate-900">{paginationInfo.totalPages}</span> ({paginationInfo.total} total patients)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {visiblePages.map((pNum) => (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`h-7 w-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === pNum
                          ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(Math.min(paginationInfo.totalPages, currentPage + 1))}
                  disabled={currentPage >= paginationInfo.totalPages}
                  className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. FLOATING BULK ACTIONS DOCK (APPEARS ON MULTI-SELECT)
        ========================================================================= */}
        {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/95 px-6 py-3.5 text-white shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center gap-2 text-sm font-semibold border-r border-slate-700 pr-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                {selectedIds.size}
              </span>
              <span>Selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkPrintBarcodes}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all"
              >
                <Printer className="h-3.5 w-3.5 text-indigo-300" />
                <span>Print Barcodes</span>
              </button>

              <button
                onClick={() => handleExportCSV(selectedPatientsList)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all"
              >
                <Download className="h-3.5 w-3.5 text-emerald-300" />
                <span>Export Selected</span>
              </button>

              <button
                onClick={() => setSelectedIds(new Set())}
                className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/10"
                title="Deselect all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            5. ULTRA-LUXURY SLIDE-OVER CLINICAL DOSSIER DRAWER
            (FIXES "VIEW OPENS NEW PAGE" ISSUE - SEAMLESS IN-PAGE INSPECTION)
        ========================================================================= */}
        {isDrawerOpen && selectedPatient && (() => {
          const activePatient = drawerFullPatient
            ? {
                ...selectedPatient,
                ...drawerFullPatient,
                allergies: Array.isArray(drawerFullPatient.allergies)
                  ? drawerFullPatient.allergies
                  : selectedPatient.allergies || [],
                chronicConditions: Array.isArray(drawerFullPatient.chronicDiseases)
                  ? drawerFullPatient.chronicDiseases
                  : Array.isArray(drawerFullPatient.chronicConditions)
                  ? drawerFullPatient.chronicConditions
                  : selectedPatient.chronicConditions || [],
                emergencyContactName:
                  drawerFullPatient.emergencyContactName || selectedPatient.emergencyContactName || null,
                emergencyContactPhone:
                  drawerFullPatient.emergencyContactPhone ||
                  drawerFullPatient.emergencyContact ||
                  selectedPatient.emergencyContactPhone ||
                  null,
                insuranceProvider:
                  drawerFullPatient.insuranceProvider || selectedPatient.insuranceProvider || null,
                policyNumber:
                  drawerFullPatient.policyNumber ||
                  drawerFullPatient.insuranceNumber ||
                  selectedPatient.policyNumber ||
                  null,
                city: drawerFullPatient.city || selectedPatient.city || null,
                address: drawerFullPatient.address || selectedPatient.address || null,
                postalCode:
                  drawerFullPatient.postalCode ||
                  drawerFullPatient.pincode ||
                  selectedPatient.postalCode ||
                  null,
              }
            : selectedPatient;

          return (
            <div className="fixed inset-0 z-50 overflow-hidden">
              {/* Backdrop Blur */}
              <div
                onClick={handleCloseDrawer}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
              />

              <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
                  {/* Drawer Header */}
                  <div className="relative border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300 ring-1 ring-indigo-400/30">
                          Clinical Dossier
                        </span>
                        {activePatient.status === "Critical" && (
                          <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-300 ring-1 ring-rose-400/30">
                            Critical Alert
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* DPDP PII Privacy Masking Toggle */}
                        <button
                          onClick={() => setMaskPii(!maskPii)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                            maskPii
                              ? "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40"
                              : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                          }`}
                          title="Toggle DPDP Act 2023 PII Masking"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>{maskPii ? "PII Masked" : "Mask PII"}</span>
                        </button>

                        {/* Seamless internal route if user wants full page */}
                        <Link
                          href={`/patients/${activePatient.uhid || activePatient.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-white/20 hover:text-white transition-colors"
                          title="Open Full Clinical Dossier"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Full Page</span>
                        </Link>

                        <button
                          onClick={handleCloseDrawer}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                          title="Close (Esc)"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Patient Info Header in Drawer */}
                    <div className="mt-4 flex items-center gap-4">
                      <PatientIdentityMark
                        firstName={activePatient.firstName}
                        lastName={activePatient.lastName}
                        status={activePatient.status}
                        gender={activePatient.gender}
                        size="hero"
                      />

                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-extrabold text-white truncate">
                          {formatPatientFullName(activePatient)}
                        </h2>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <button
                            onClick={(e) => handleCopyUhid(e, activePatient.uhid)}
                            className="inline-flex items-center gap-1 font-mono font-bold text-indigo-300 hover:text-white"
                            title="Click to copy UHID"
                          >
                            <span>{activePatient.uhid}</span>
                            <Copy className="h-3 w-3" />
                          </button>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-300">
                            {calculateClinicalAge(activePatient.dateOfBirth, activePatient.age).formatted} •{" "}
                            {activePatient.gender === "MALE"
                              ? "Male"
                              : activePatient.gender === "FEMALE"
                              ? "Female"
                              : "Other"}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="font-bold text-rose-300">
                            {formatBloodGroup(activePatient.bloodGroup)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Drawer Fast Action Bar */}
                    <div className="mt-5 grid grid-cols-4 gap-2">
                      <Link
                        href={`/orders/new?patientId=${activePatient.id}&uhid=${encodeURIComponent(activePatient.uhid)}`}
                        className="rounded-xl bg-indigo-600 px-3 py-2 text-center text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all flex flex-col items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>New Order</span>
                      </Link>

                      <button
                        onClick={(e) => handlePrintBarcode(e, activePatient)}
                        className="rounded-xl bg-white/10 px-3 py-2 text-center text-xs font-bold text-white hover:bg-white/20 transition-all flex flex-col items-center gap-1 cursor-pointer"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Barcodes</span>
                      </button>

                      <button
                        onClick={(e) => handleOpenWhatsApp(e, activePatient)}
                        className="rounded-xl bg-emerald-600/80 px-3 py-2 text-center text-xs font-bold text-white hover:bg-emerald-600 transition-all flex flex-col items-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>WhatsApp</span>
                      </button>

                      <Link
                        href={`/patients/${activePatient.uhid || activePatient.id}`}
                        className="rounded-xl bg-white/10 px-3 py-2 text-center text-xs font-bold text-white hover:bg-white/20 transition-all flex flex-col items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Dossier</span>
                      </Link>
                    </div>
                  </div>

                  {/* Drawer Tab Navigation */}
                  <div className="flex border-b border-slate-200 bg-slate-50 px-6">
                    {[
                      { id: "overview", label: "Overview & Vitals", icon: Activity },
                      { id: "orders", label: "Lab Orders", icon: FlaskConical },
                      { id: "vitals", label: "Clinical Profile", icon: HeartPulse },
                      { id: "documents", label: "Barcodes & Docs", icon: FileText },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = drawerTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleDrawerTabChange(tab.id as any)}
                          className={`flex items-center gap-1.5 border-b-2 py-3 px-3 text-xs font-bold transition-all ${isActive
                              ? "border-indigo-600 text-indigo-600"
                              : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Drawer Tab Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* TAB 1: OVERVIEW */}
                    {drawerTab === "overview" && (
                      <div className="space-y-6">
                        {/* Vitals Summary Card */}
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Clinical Key Metrics
                          </h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                              <span className="text-[11px] text-slate-400 font-medium">Blood Group</span>
                              <p className="text-base font-extrabold text-rose-600">
                                {formatBloodGroup(activePatient.bloodGroup)}
                              </p>
                            </div>
                            <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                              <span className="text-[11px] text-slate-400 font-medium">Age / Gender</span>
                              <p className="text-sm font-bold text-slate-900">
                                {activePatient.age !== null && activePatient.age !== undefined
                                  ? (activePatient.age === 0 ? "0 Y (Newborn)" : `${activePatient.age} Y`)
                                  : "N/A"}{" "}
                                •{" "}
                                {activePatient.gender === "MALE"
                                  ? "M"
                                  : activePatient.gender === "FEMALE"
                                  ? "F"
                                  : "O"}
                              </p>
                            </div>
                            <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                              <span className="text-[11px] text-slate-400 font-medium">Priority Flag</span>
                              <p className="text-sm font-bold text-emerald-600">
                                {activePatient.isCritical ? "STAT Alert" : "Routine OPD"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Contact & Demographics */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Demographics & Contact Information
                          </h4>
                          <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 text-xs">
                            <div className="flex justify-between p-3.5">
                              <span className="text-slate-500">Phone Number</span>
                              <span className="font-bold text-slate-900 font-mono">
                                {maskPii ? maskPhone(activePatient.phone) : formatIndianPhone(activePatient.phone).display}
                              </span>
                            </div>
                            <div className="flex justify-between p-3.5">
                              <span className="text-slate-500">Email Address</span>
                              <span className="font-semibold text-slate-800">
                                {maskPii ? maskEmail(activePatient.email) : (activePatient.email || "Not recorded")}
                              </span>
                            </div>
                            <div className="flex justify-between p-3.5">
                              <span className="text-slate-500">Residential Address</span>
                              <span className="font-medium text-slate-800 text-right max-w-xs">
                                {activePatient.address || activePatient.city || "Not recorded"}
                              </span>
                            </div>
                            <div className="flex justify-between p-3.5">
                              <span className="text-slate-500">City / Postal Code</span>
                              <span className="font-medium text-slate-800 text-right">
                                {activePatient.city || "Not recorded"}{" "}
                                {activePatient.postalCode ? `- ${activePatient.postalCode}` : ""}
                              </span>
                            </div>
                            {(activePatient.nationalId || activePatient.aadhaarNumber) && (
                              <div className="flex justify-between p-3.5 bg-indigo-50/40">
                                <span className="text-indigo-900 font-semibold flex items-center gap-1">
                                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                                  <span>ABDM / National ID</span>
                                </span>
                                <span className="font-mono font-bold text-indigo-900">
                                  {activePatient.nationalId ? formatAbhaNumber(activePatient.nationalId) : (maskPii ? "•••• •••• " + String(activePatient.aadhaarNumber).slice(-4) : activePatient.aadhaarNumber)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between p-3.5">
                              <span className="text-slate-500">Date of Registration</span>
                              <span className="font-medium text-slate-800">
                                {new Date(activePatient.createdAt).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Emergency & Insurance */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Emergency & Insurance Coverage
                          </h4>
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Emergency Contact Name</span>
                              <span className="font-bold text-slate-800">
                                {activePatient.emergencyContactName || "Self / Family"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Emergency Contact Phone</span>
                              <span className="font-bold text-slate-800">
                                {activePatient.emergencyContactPhone || activePatient.emergencyContact || "Not recorded"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                              <span className="text-slate-500">Insurance Provider</span>
                              <span className="font-semibold text-slate-800">
                                {activePatient.insuranceProvider || "Cash / Self-Pay (No TPA)"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Policy / Member ID</span>
                              <span className="font-semibold text-slate-800">
                                {activePatient.policyNumber || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: LAB ORDERS */}
                    {drawerTab === "orders" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Diagnostic Orders & Specimens
                          </h4>
                          <Link
                            href={`/orders/new?patientId=${activePatient.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Book Test</span>
                          </Link>
                        </div>

                        {loadingOrders ? (
                          <div className="py-8 text-center text-xs text-slate-500">
                            <FlaskConical className="h-6 w-6 animate-spin mx-auto text-indigo-500 mb-2" />
                            Loading lab test history...
                          </div>
                        ) : patientOrders.length > 0 ? (
                          <div className="space-y-3">
                            {patientOrders.map((order: any, idx: number) => (
                              <div
                                key={order.id || idx}
                                className="rounded-xl border border-slate-200 p-4 hover:border-indigo-200 transition-all bg-white"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-xs font-bold text-indigo-600">
                                    {order.orderNumber || `ORD-${order.id?.slice(0, 6)}`}
                                  </span>
                                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                    {order.orderStatus || "PROCESSING"}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm font-bold text-slate-800">
                                  {order.items?.[0]?.test?.testName || "Complete Diagnostics Panel"}
                                </p>
                                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                  <span>
                                    Date: {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                                  </span>
                                  <Link
                                    href={`/reports?search=${encodeURIComponent(activePatient.uhid)}`}
                                    className="font-bold text-indigo-600 hover:underline"
                                  >
                                    View Report →
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                            <FlaskConical className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-700">No Orders On Record</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              No lab orders have been processed yet for this UHID.
                            </p>
                            <Link
                              href={`/orders/new?patientId=${activePatient.id}`}
                              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Create First Order</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 3: CLINICAL PROFILE & VITALS */}
                    {drawerTab === "vitals" && (
                      <div className="space-y-4 text-xs">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                          <h4 className="font-bold text-slate-900 text-sm">Chronic Conditions & Risk Flags</h4>
                          <div className="flex flex-wrap gap-2">
                            {sanitizeMedicalConditions(activePatient.chronicConditions).length > 0 ? (
                              sanitizeMedicalConditions(activePatient.chronicConditions).map((c: string, i: number) => (
                                <span
                                  key={i}
                                  className="rounded-lg bg-amber-50 px-2.5 py-1 font-bold text-amber-800 ring-1 ring-amber-200"
                                >
                                  {c}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500">No chronic diseases registered.</span>
                            )}
                          </div>
                        </div>

                        {/* Dynamic Allergies Tab */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                          <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                            <span>Allergies & Drug Sensitivities</span>
                            {sanitizeMedicalConditions(activePatient.allergies).length > 0 && (
                              <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                                {sanitizeMedicalConditions(activePatient.allergies).length} Recorded
                              </span>
                            )}
                          </h4>
                          {sanitizeMedicalConditions(activePatient.allergies).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {sanitizeMedicalConditions(activePatient.allergies).map((allergy: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200"
                                >
                                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                                  {allergy}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-500 text-xs">No known drug allergies (NKDA) recorded.</p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                          <h4 className="font-bold text-slate-900 text-sm">Clinical Audit Timeline</h4>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <div>
                                <p className="font-bold text-slate-800">UHID Assigned</p>
                                <p className="text-slate-400 text-[11px]">
                                  {new Date(activePatient.createdAt).toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                              <div>
                                <p className="font-bold text-slate-800">Master Record Initialized</p>
                                <p className="text-slate-400 text-[11px]">LabCore LIS Engine</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: BARCODES & DOCUMENTS */}
                    {drawerTab === "documents" && (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Specimen Tube Barcode Generator
                            </h4>
                            <button
                              onClick={(e) => handlePrintBarcode(e, activePatient)}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>Print All Labels</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mb-4">
                            Generate diagnostic tube stickers (EDTA Purple, Fluoride Grey, Serum Gold) for phlebotomy vacutainers.
                          </p>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/60 p-3 text-xs">
                              <div className="flex items-center gap-2.5">
                                <span className="h-3 w-3 rounded-full bg-purple-600" />
                                <div>
                                  <p className="font-bold text-purple-900">EDTA K2 Whole Blood</p>
                                  <p className="font-mono text-[11px] text-purple-700">
                                    {activePatient.uhid}-EDTA
                                  </p>
                                </div>
                              </div>
                              <span className="rounded bg-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                                Lavender Top
                              </span>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs">
                              <div className="flex items-center gap-2.5">
                                <span className="h-3 w-3 rounded-full bg-amber-500" />
                                <div>
                                  <p className="font-bold text-amber-900">Serum Gel Clot Activator</p>
                                  <p className="font-mono text-[11px] text-amber-700">
                                    {activePatient.uhid}-SERUM
                                  </p>
                                </div>
                              </div>
                              <span className="rounded bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                Gold / Red Top
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Printable Lab Registration Card */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900">Patient ID Card & Registration Form</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Full printable clinical face-sheet with QR code.
                            </p>
                          </div>
                          <Link
                            href={`/patients/${activePatient.id}/print`}
                            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            Print Form
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="border-t border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {activePatient.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCloseDrawer}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => router.push(`/patients/${activePatient.uhid || activePatient.id}`)}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
                      >
                        <span>Open Full Dossier</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* =========================================================================
            6. MODALS INTEGRATION
        ========================================================================= */}
        {/* Modal 1: Quick OPD Walk-in Registration Modal */}
        <PatientQuickRegisterModal
          isOpen={isQuickRegisterOpen}
          onClose={() => setIsQuickRegisterOpen(false)}
          onPatientCreated={(newPatient) => {
            showSuccess(`Patient ${newPatient.firstName || ""} registered successfully!`);
            fetchPatients();
            setIsQuickRegisterOpen(false);
          }}
        />

        {/* Modal 2: Barcode Label Print Modal */}
        <BarcodeLabelModal
          isOpen={barcodeModalOpen}
          onClose={() => setBarcodeModalOpen(false)}
          labels={barcodeItems}
        />

        {/* Modal 3: WhatsApp Diagnostic Notification Dispatch Modal */}
        {whatsappModalPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <MessageCircle className="h-5 w-5" />
                  <span>Send WhatsApp Diagnostic Alert</span>
                </div>
                <button
                  onClick={() => setWhatsappModalPatient(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">
                    {formatPatientFullName(whatsappModalPatient)} ({whatsappModalPatient.phone})
                  </p>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {whatsappModalPatient.uhid}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Quick Templates</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setWhatsappMessage(
                          `Dear ${formatPatientFullName(whatsappModalPatient)},\n\nWelcome to LabCore Diagnostics.\nYour registered Patient ID (UHID) is *${whatsappModalPatient.uhid}*.\nYour diagnostic medical profile is registered under NABL & ABDM standards.\n\nHelpline: +91 9106161228 | LabCore Diagnostics Portal`
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-all text-center"
                    >
                      UHID Welcome
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setWhatsappMessage(
                          `Dear ${formatPatientFullName(whatsappModalPatient)},\n\nYour specimen has been collected & accessioned at LabCore Central Laboratory.\nUHID: *${whatsappModalPatient.uhid}*\nStatus: Processing in Analyzer Queue.\n\nVerified reports will be dispatched upon pathologist review.`
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-all text-center"
                    >
                      Sample Drawn
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setWhatsappMessage(
                          `Dear ${formatPatientFullName(whatsappModalPatient)},\n\nYour diagnostic laboratory test reports are now ready and authorized.\nUHID: *${whatsappModalPatient.uhid}*\n\nView & download your verified PDF report at:\nhttps://labcore.health/reports?search=${encodeURIComponent(whatsappModalPatient.uhid)}\n\nThank you for choosing LabCore!`
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-all text-center"
                    >
                      Report Ready
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setWhatsappMessage(
                          `Dear ${formatPatientFullName(whatsappModalPatient)},\n\nThank you for your payment at LabCore Diagnostic Center.\nUHID: *${whatsappModalPatient.uhid}*\nYour billing ledger is updated.\n\nFor queries: +91 9106161228 | accounts@labcore.health`
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-all text-center"
                    >
                      Payment Receipt
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Message Content</label>
                  <textarea
                    rows={6}
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs font-mono text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => setWhatsappModalPatient(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendWhatsAppDirect}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Dispatch WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
