"use client";

import React, { useState } from "react";
import SettingsSection from "./SettingsSection";
import SettingsField from "./SettingsField";
import { getStoredSettings, setStoredSettings } from "@/lib/settingsStorage";
import { 
  ShieldCheck, 
  KeyRound, 
  Smartphone, 
  Laptop, 
  Lock, 
  CheckCircle2, 
  QrCode, 
  X, 
  Check, 
  AlertTriangle, 
  LogOut, 
  Clock, 
  MapPin, 
  Copy,
  RefreshCw
} from "lucide-react";

export interface SecuritySettingsData {
  minPasswordLength: number;
  passwordExpiryDays: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialCharacter: boolean;
  twoFactorEnabled: boolean;
  twoFactorMethod: string;
  twoFactorRequired: boolean;
  auditLoginActivity: boolean;
  auditDataChanges: boolean;
  deviceFingerprinting: boolean;
  sessionHijackingProtection: boolean;
  hipaaCompliantLogging: boolean;
}

interface SecuritySettingsProps {
  initialValues?: Partial<SecuritySettingsData>;
  saving?: boolean;
  onSave?: (values: SecuritySettingsData) => void;
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const mockSessions: ActiveSession[] = [
  {
    id: "sess-1",
    device: "Windows 11 Enterprise Workstation",
    browser: "Google Chrome 128.0",
    ipAddress: "172.24.1.158 (Internal Lab Subnet)",
    location: "Ahmedabad, Gujarat, IN",
    lastActive: "Active Now",
    isCurrent: true,
  },
  {
    id: "sess-2",
    device: "Apple iPad Pro (Pathology Terminal 02)",
    browser: "Mobile Safari 17.4",
    ipAddress: "192.168.1.42 (LIS Wi-Fi)",
    location: "Main Reference Lab, Floor 4",
    lastActive: "18 minutes ago",
    isCurrent: false,
  },
  {
    id: "sess-3",
    device: "Samsung Galaxy S24 Ultra (Doctor Mobile)",
    browser: "LabCore Mobile App",
    ipAddress: "49.36.112.89 (Cellular 5G)",
    location: "Mumbai, Maharashtra, IN",
    lastActive: "2 hours ago",
    isCurrent: false,
  },
];

export default function SecuritySettings({
  initialValues,
  saving = false,
  onSave,
}: SecuritySettingsProps) {
  const [values, setValues] = useState<SecuritySettingsData>(() => {
    const stored = getStoredSettings("security");
    return {
      ...stored,
      ...initialValues,
    };
  });

  const [saved, setSaved] = useState(false);
  const [sessions, setSessions] = useState<ActiveSession[]>(mockSessions);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [mfaSuccess, setMfaSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const update = <K extends keyof SecuritySettingsData>(
    field: K,
    value: SecuritySettingsData[K]
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setSaved(false);
  };

  const handleSave = () => {
    const updated = setStoredSettings("security", values);
    onSave?.(updated as SecuritySettingsData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const revokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleVerifyOtp = () => {
    if (verificationCode.length >= 6) {
      setMfaSuccess(true);
      update("twoFactorEnabled", true);
      setTimeout(() => {
        setMfaSuccess(false);
        setShowMfaModal(false);
      }, 1500);
    }
  };

  const copySecretKey = () => {
    navigator.clipboard.writeText("HXDM 4QW7 K9ZP 2LBN");
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const Toggle = ({
    label,
    description,
    field,
  }: {
    label: string;
    description: string;
    field: keyof SecuritySettingsData;
  }) => {
    const enabled = Boolean(values[field]);

    return (
      <div className="flex items-start justify-between gap-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 p-4 transition-all hover:border-slate-300">
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {label}
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => update(field, (!enabled) as SecuritySettingsData[typeof field])}
          className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
            enabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
          }`}
          aria-label={`Toggle ${label}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {saved && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 dark:border-emerald-900/50 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Security parameters & 2FA configurations successfully synchronized!</span>
        </div>
      )}

      {/* 1. Two-Factor Authentication Card */}
      <SettingsSection
        title="Two-Factor Authentication (2FA / MFA)"
        description="Enforce multi-factor verification using Google Authenticator, Microsoft Authenticator, or hardware tokens."
        icon={<Smartphone className="h-5 w-5" />}
        badge={
          values.twoFactorEnabled ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3 w-3" />
              2FA Active & Enforced
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="h-3 w-3" />
              2FA Recommended
            </span>
          )
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-5">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Authenticator Application (TOTP RFC-6238)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Secure your account with 6-digit rolling verification codes generated on your smartphone.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMfaModal(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              <QrCode className="h-3.5 w-3.5" />
              {values.twoFactorEnabled ? "Reconfigure Authenticator App" : "Setup Authenticator App"}
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* 2. Active Login Sessions */}
      <SettingsSection
        title="Active Diagnostic Terminals & Login Sessions"
        description="Monitor active sign-in sessions across lab analyzers, desktop terminals, and mobile devices."
        icon={<Laptop className="h-5 w-5" />}
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Device & Browser</th>
                <th className="py-3 px-4">Network IP & Subnet</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sessions.map((sess) => (
                <tr key={sess.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {sess.isCurrent && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      {sess.device}
                    </div>
                    <div className="text-[11px] text-slate-500">{sess.browser}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {sess.ipAddress}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {sess.location}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {sess.isCurrent ? (
                      <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                        This Terminal
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {sess.lastActive}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {!sess.isCurrent && (
                      <button
                        type="button"
                        onClick={() => revokeSession(sess.id)}
                        className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        Terminate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsSection>

      {/* 3. Password Complexity & Security Guardrails */}
      <SettingsSection
        title="Password Governance & Access Rules"
        description="Configure cryptographic strength requirements and automatic account lockout rules."
        icon={<Lock className="h-5 w-5" />}
      >
        <div className="grid gap-5 md:grid-cols-4">
          <SettingsField label="Min Password Length">
            <input
              type="number"
              min={8}
              max={32}
              value={values.minPasswordLength}
              onChange={(e) => update("minPasswordLength", Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </SettingsField>

          <SettingsField label="Password Expiry (Days)">
            <input
              type="number"
              min={30}
              max={365}
              value={values.passwordExpiryDays}
              onChange={(e) => update("passwordExpiryDays", Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </SettingsField>

          <SettingsField label="Max Failed Login Attempts">
            <input
              type="number"
              min={3}
              max={10}
              value={values.maxLoginAttempts}
              onChange={(e) => update("maxLoginAttempts", Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </SettingsField>

          <SettingsField label="Lockout Duration (Mins)">
            <input
              type="number"
              min={5}
              max={120}
              value={values.lockoutDurationMinutes}
              onChange={(e) => update("lockoutDurationMinutes", Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </SettingsField>
        </div>

        <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
          <Toggle
            label="Enforce Uppercase & Lowercase Letters"
            description="Require at least one uppercase [A-Z] and lowercase [a-z] character."
            field="requireUppercase"
          />
          <Toggle
            label="Require Numbers & Symbols"
            description="Require digits [0-9] and special characters (!@#$%^&*) in passwords."
            field="requireSpecialCharacter"
          />
          <Toggle
            label="Audit Trail Logging (21 CFR Part 11)"
            description="Log all user logins, diagnostic result edits, and signoffs to tamper-evident ledger."
            field="auditLoginActivity"
          />
          <Toggle
            label="Session Hijacking & IP Fingerprint Guard"
            description="Immediately terminate session if IP subnet or User-Agent mutates unexpectedly."
            field="sessionHijackingProtection"
          />
        </div>
      </SettingsSection>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
        >
          <Check className="h-3.5 w-3.5" />
          Save Security Policy
        </button>
      </div>

      {/* 2FA QR Code Setup Modal */}
      {showMfaModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <QrCode className="h-5 w-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Two-Factor Authentication Setup</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMfaModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col items-center text-center">
              {/* Simulated High-Res QR Code */}
              <div className="rounded-xl border-4 border-white bg-white p-3 shadow-lg">
                <svg className="h-36 w-36 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm-4-2h2v4h-2v-4zm6 6h2v2h-2v-2zm-6 2h4v2h-4v-2zm2-4h2v2h-2v-2zm-2-2h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                </svg>
              </div>

              <p className="mt-3 text-xs text-slate-300">
                Scan this QR code using <strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong>
              </p>

              {/* Secret Key */}
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-mono text-cyan-400">
                <span>HXDM 4QW7 K9ZP 2LBN</span>
                <button
                  type="button"
                  onClick={copySecretKey}
                  className="text-slate-400 hover:text-white ml-1"
                  title="Copy secret key"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              {copiedKey && <span className="text-[10px] text-emerald-400 mt-1">Copied to clipboard!</span>}

              {/* Enter 6-digit Code */}
              <div className="mt-5 w-full space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Enter 6-Digit Code from App
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] font-mono text-lg rounded-xl border border-slate-700 bg-slate-950 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>

              {mfaSuccess && (
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  2FA successfully verified & enabled!
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setShowMfaModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verificationCode.length < 6}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50"
              >
                Verify & Activate 2FA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}