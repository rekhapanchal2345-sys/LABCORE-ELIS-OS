"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboardlayout";
import SettingsTabs, { SettingsTab } from "@/components/settings/SettingsTabs";
import ProfileSettings from "@/components/settings/ProfileSettings";
import GeneralSettings from "@/components/settings/GeneralSettings";
import UsersSettings from "@/components/settings/UsersSettings";
import LaboratorySettings from "@/components/settings/LaboratorySettings";
import BillingSettings from "@/components/settings/BillingSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import IntegrationSettings from "@/components/settings/IntegrationSettings";
import AdvancedSettings from "@/components/settings/AdvancedSettings";
import DataRetentionSettings from "@/components/settings/DataRetentionSettings";
import BrandingSettings from "@/components/settings/BrandingSettings";
import BackupSettings from "@/components/settings/BackupSettings";
import { 
  getStoredSettings, 
  setStoredSettings, 
  defaultSettings, 
  SettingsStoreState 
} from "@/lib/settingsStorage";
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Check, 
  RotateCcw, 
  Save, 
  Award, 
  Lock,
  Sliders
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Global Ctrl+S / Cmd+S save shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        triggerGlobalSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSave = async (settingsType: SettingsTab, data: any) => {
    setSaving(true);
    try {
      // 1. Dual-Write to local storage & broadcast change events
      setStoredSettings(settingsType, data);

      // 2. Simulated brief network handshake
      await new Promise((resolve) => setTimeout(resolve, 500));

      setHasUnsavedChanges(false);
      showToast(`✓ ${getTabTitle(settingsType)} successfully saved & synced!`);
    } catch (err) {
      console.error("Save error in page:", err);
      showToast("⚠ Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const triggerGlobalSave = () => {
    // Read current settings for active tab and trigger save
    const current = getStoredSettings(activeTab);
    handleSave(activeTab, current);
  };

  const resetActiveTabToDefaults = () => {
    if (confirm(`Reset ${getTabTitle(activeTab)} back to system factory defaults?`)) {
      const defaultVal = defaultSettings[activeTab];
      setStoredSettings(activeTab, defaultVal);
      showToast(`Reset ${getTabTitle(activeTab)} to defaults.`);
      window.location.reload();
    }
  };

  const renderSettingsContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileSettings
            saving={saving}
            initialValues={getStoredSettings("profile")}
            onSave={(data) => handleSave("profile", data)}
          />
        );
      case "laboratory":
        return (
          <LaboratorySettings
            saving={saving}
            initialValues={getStoredSettings("laboratory")}
            onSave={(data) => handleSave("laboratory", data)}
          />
        );
      case "general":
        return (
          <GeneralSettings
            saving={saving}
            initialValues={getStoredSettings("general")}
            onSave={(data) => handleSave("general", data)}
          />
        );
      case "users":
        return (
          <UsersSettings
            saving={saving}
            initialValues={getStoredSettings("users")}
            onSave={(data) => handleSave("users", data)}
          />
        );
      case "billing":
        return (
          <BillingSettings
            saving={saving}
            initialValues={getStoredSettings("billing")}
            onSave={(data) => handleSave("billing", data)}
          />
        );
      case "notifications":
        return (
          <NotificationSettings
            saving={saving}
            initialValues={getStoredSettings("notifications")}
            onSave={(data) => handleSave("notifications", data)}
          />
        );
      case "security":
        return (
          <SecuritySettings
            saving={saving}
            initialValues={getStoredSettings("security")}
            onSave={(data) => handleSave("security", data)}
          />
        );
      case "integrations":
        return (
          <IntegrationSettings
            saving={saving}
            initialValues={getStoredSettings("integrations")}
            onSave={(data) => handleSave("integrations", data)}
          />
        );
      case "advanced":
        return (
          <AdvancedSettings
            saving={saving}
            initialValues={getStoredSettings("advanced")}
            onSave={(data) => handleSave("advanced", data)}
          />
        );
      case "data_retention":
        return (
          <DataRetentionSettings
            saving={saving}
            initialValues={getStoredSettings("data_retention")}
            onSave={(data) => handleSave("data_retention", data)}
          />
        );
      case "branding":
        return (
          <BrandingSettings
            saving={saving}
            initialValues={getStoredSettings("branding")}
            onSave={(data) => handleSave("branding", data)}
          />
        );
      case "backup":
        return (
          <BackupSettings
            saving={saving}
            initialValues={getStoredSettings("backup")}
            onSave={(data) => handleSave("backup", data)}
          />
        );
      default:
        return (
          <ProfileSettings
            saving={saving}
            initialValues={getStoredSettings("profile")}
            onSave={(data) => handleSave("profile", data)}
          />
        );
    }
  };

  const getTabTitle = (tab: SettingsTab) => {
    const titles: Record<SettingsTab, string> = {
      profile: "Practitioner Profile & Signature",
      laboratory: "Laboratory & Accreditation",
      general: "General System Settings",
      users: "Users, Roles & Access Control",
      billing: "Billing, Tariffs & GST Rules",
      notifications: "Alerts, SMS & WhatsApp Gateways",
      security: "Security Policy & Multi-Factor Auth",
      integrations: "Analyzers, HL7 & API Integrations",
      advanced: "Advanced System Engine & Caching",
      data_retention: "Data Retention & Compliance",
      branding: "Report Letterhead & Visual Branding",
      backup: "Disaster Recovery & Automated Cloud Backup",
    };
    return titles[tab];
  };

  return (
    <DashboardLayout title="Settings & Administration">
      <div className="space-y-6 pb-24">
        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-[1000] flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-slate-900/95 px-5 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Luxury Enterprise Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-cyan-400 border border-indigo-400/30">
                  <Sliders className="h-4 w-4" />
                </span>
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                  System Settings & Administration
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/40">
                  <ShieldCheck className="h-3 w-3" />
                  NABL & ISO 15189 Verified
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Configure practitioner credentials, digital report signatures, regulatory accreditations, and automated clinical workflows.
              </p>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">License Status</span>
                <span className="font-semibold text-emerald-400">MC-4819 (Active)</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">LIS Engine</span>
                <span className="font-semibold text-cyan-400">LabCore v3.2 PRO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Tab Content */}
        <div className="min-h-[500px]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{getTabTitle(activeTab)}</span>
            </h2>
            <button
              type="button"
              onClick={resetActiveTabToDefaults}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Tab Defaults
            </button>
          </div>

          {renderSettingsContent()}
        </div>

        {/* Luxury Floating Action Bar */}
        <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="pointer-events-auto flex items-center gap-4 rounded-2xl border border-slate-700/60 bg-slate-950/90 px-5 py-3 shadow-2xl backdrop-blur-xl text-white">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">
                {hasUnsavedChanges ? "Unsaved changes detected" : "All changes synchronized"}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={resetActiveTabToDefaults}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>

              <button
                type="button"
                onClick={triggerGlobalSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-5 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
              >
                {saving ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Save Changes
                    <kbd className="hidden sm:inline-block rounded bg-white/20 px-1 py-0.5 text-[9px] font-mono">
                      Ctrl+S
                    </kbd>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}