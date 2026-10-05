
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Award,
  Sparkles,
  FileCheck,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getRoleLabel } from "@/lib/auth";
import NotificationCenter from "./NotificationCenter";
import GlobalSearchModal from "./GlobalSearchModal";
import LogoutModal from "@/components/auth/LogoutModal";

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

export default function Header({
  onMenuClick,
  title = "LabCore ELIS",
}: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [hasCriticalAlert, setHasCriticalAlert] = useState(true);
  const [userInitials, setUserInitials] = useState('JA');
  const [userName, setUserName] = useState('Jaya Ashapurama');
  const [userRole, setUserRole] = useState('ADMIN');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Global Ctrl+K / Cmd+K Search Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    
    // Check local profile settings
    try {
      const raw = localStorage.getItem("labcore_settings_profile");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.firstName || parsed.lastName) {
          const fn = `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim();
          if (fn) {
            setUserName(fn);
            const names = fn.split(" ");
            setUserInitials(names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0][0]);
          }
        }
        if (parsed.profileImage) {
          setUserAvatar(parsed.profileImage);
        }
      }
    } catch (e) {
      // ignore
    }

    if (user?.fullName) {
      const names = user.fullName.split(' ');
      setUserInitials(names.length > 1 
        ? names[0][0] + names[names.length - 1][0]
        : names[0][0]);
      setUserName(user.fullName);
    } else if (user?.email) {
      setUserInitials(user.email[0].toUpperCase());
      setUserName(user.email);
    }
    if (user?.avatar) {
      setUserAvatar(user.avatar as string);
    }
    setUserRole(getRoleLabel(user?.role, "ADMIN"));

    const handleProfileUpdated = (e: any) => {
      const updated = e.detail;
      if (updated?.fullName) {
        setUserName(updated.fullName);
        const names = updated.fullName.split(" ");
        setUserInitials(names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0][0]);
      }
      if (updated?.avatar || updated?.profileImage) {
        setUserAvatar(updated.avatar || updated.profileImage);
      }
    };

    window.addEventListener("labcore:profile-updated", handleProfileUpdated);
    return () => window.removeEventListener("labcore:profile-updated", handleProfileUpdated);
  }, [user]);

  const handleProfileClick = () => {
    setShowProfile(false);
    router.push("/settings");
  };

  const handleSettingsClick = () => {
    setShowProfile(false);
    router.push("/settings");
  };

  const handleLogout = () => {
    setShowProfile(false);
    setIsLogoutModalOpen(true);
  };

  const executeLogout = async () => {
    if (logout) await logout();
    router.push("/login");
  };

  return (
    <header className="h-[64px] bg-[var(--surface-primary)] border-b border-[var(--border-light)] flex items-center justify-between px-6 sticky top-0 z-[100]">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="w-10 h-10 border border-[var(--border-light)] rounded-lg bg-[var(--surface-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="m-0 text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            {title}
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
              Enterprise LIS
            </span>
          </h1>

          <div className="text-xs text-[var(--text-tertiary)]">
            Clinical Diagnostic Laboratory Information System
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        {/* Global Spotlight Search Trigger */}
        <button
          type="button"
          onClick={() => {
            setShowSearchModal(true);
            setShowNotifications(false);
            setShowProfile(false);
          }}
          aria-label="Search Clinical System"
          className="hidden md:flex items-center gap-2.5 px-3.5 py-2 border border-[var(--border-light)] rounded-xl bg-[var(--surface-secondary)] text-[var(--text-tertiary)] hover:bg-[var(--background-tertiary)] hover:border-indigo-300 hover:text-[var(--text-primary)] transition-all shadow-xs group cursor-pointer"
          title="Search Patients, Tests, UHID, Orders... (Ctrl+K)"
        >
          <Search className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-indigo-600 transition-colors" />
          <span className="text-xs font-medium pr-1">Search records, tests, UHID...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded-md border border-[var(--border-light)] bg-[var(--surface-primary)] px-1.5 py-0.5 text-[10px] font-mono font-bold text-[var(--text-tertiary)] group-hover:text-indigo-600 group-hover:border-indigo-200 shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Icon Button */}
        <button
          type="button"
          onClick={() => {
            setShowSearchModal(true);
            setShowNotifications(false);
            setShowProfile(false);
          }}
          aria-label="Search"
          className="md:hidden w-10 h-10 border border-[var(--border-light)] rounded-xl bg-[var(--surface-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)] hover:border-indigo-300 transition-colors cursor-pointer"
          title="Search (Ctrl+K)"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className={`w-10 h-10 border rounded-xl flex items-center justify-center relative transition-all duration-200 ${
              showNotifications
                ? "bg-sky-50 border-sky-300 text-sky-600 shadow-xs"
                : "border-[var(--border-light)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Bell className={`w-5 h-5 ${hasCriticalAlert && unreadCount > 0 ? "text-rose-600 animate-bounce" : ""}`} />

            {unreadCount > 0 && (
              <span className={`absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full text-[9px] font-black text-white ${
                hasCriticalAlert ? "bg-rose-600 animate-pulse shadow-xs shadow-rose-500/50" : "bg-sky-600"
              }`}>
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationCenter
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            onUnreadCountChange={(cnt, crit) => {
              setUnreadCount(cnt);
              setHasCriticalAlert(crit);
            }}
          />
        </div>

        {/* Professional Executive User Profile Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
              showProfile
                ? "bg-indigo-50 border-indigo-200 shadow-sm"
                : "border-[var(--border-light)] bg-[var(--surface-secondary)] hover:bg-[var(--background-tertiary)] hover:border-indigo-200"
            }`}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  isMounted ? userInitials : 'JA'
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500">
              </span>
            </div>

            {/* Name and Designation */}
            <div className="hidden sm:flex flex-col items-start leading-tight text-left">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {isMounted ? userName : 'Jaya Ashapurama'}
                </span>
                <span title="NABL Verified Authorized Signatory" className="inline-flex shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="rounded bg-[var(--surface-primary)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-secondary)] border border-[var(--border-light)] shadow-sm">
                  {isMounted ? userRole : 'ADMIN'}
                </span>
                <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[9px] font-medium text-sky-700 border border-sky-100 shadow-sm flex items-center gap-1 transition-colors group-hover:bg-sky-100">
                  <ShieldCheck className="w-2.5 h-2.5 text-sky-600" />
                  Verified
                </span>
              </div>
            </div>

            <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-200 ${showProfile ? "rotate-180 text-indigo-600" : ""}`} />
          </button>

          {/* Professional Executive Popover Control Center */}
          {showProfile && (
            <div className="absolute right-0 top-12 w-84 bg-white border border-[var(--border-light)] rounded-xl shadow-lg overflow-hidden z-[1000] animate-in zoom-in-95 duration-200">
              {/* Executive Header Banner */}
              <div className="bg-[var(--surface-secondary)] p-4 border-b border-[var(--border-light)]">
                <div className="flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-sm overflow-hidden">
                      {userAvatar ? (
                        <img src={userAvatar} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        isMounted ? userInitials : 'JA'
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-[var(--text-primary)] truncate">
                        {isMounted ? userName : 'Jaya Ashapurama'}
                      </h4>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[12px] text-[var(--text-secondary)] truncate mt-0.5">
                      Chief Administrator & Pathologist
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="rounded-md bg-[var(--surface-primary)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)] border border-[var(--border-light)] shadow-sm">
                        {isMounted ? userRole : 'ADMIN'}
                      </span>
                      <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 border border-sky-100 shadow-sm flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-sky-600" />
                        NABL Authorized
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Clinical Credentials & License Card */}
              <div className="p-3 bg-slate-50/70 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500 font-medium">Accreditation ID:</span>
                  <span className="font-mono font-bold text-slate-900">MED-DIR-2026-9182</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500 font-medium">Digital Signature:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Cryptographically Bound
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500 font-medium">Lab Facility:</span>
                  <span className="font-semibold text-slate-800">Central Diagnostics Hub</span>
                </div>
              </div>

              {/* Quick Actions Menu */}
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Executive Profile & Credentials</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(false);
                    router.push("/approvals");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Medical Sign-off & Verifications</span>
                </button>

                <button
                  type="button"
                  onClick={handleSettingsClick}
                  className="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>LIS Configurations & Security</span>
                </button>
              </div>

              {/* Logout Footer */}
              <div className="p-1.5 bg-slate-50/50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-3.5 py-2 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Secure Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Clinical Spotlight Command Palette */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={executeLogout}
      />
    </header>
  );
}

