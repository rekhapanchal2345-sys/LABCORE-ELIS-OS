"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Send,
  Wifi,
  WifiOff,
  Shield,
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  Bell,
  MessageSquare,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SETTINGS_EDIT_ROLES } from "@/components/settings/settingsAccess";
import { laboratorySettingsApi } from "@/lib/api";

/* ─── Types ────────────────────────────────────────────────────────────────── */
type Tab = "general" | "email" | "sms" | "whatsapp" | "call" | "notifications" | "dpdp";
type SaveStatus = "idle" | "saving" | "saved" | "error";
type TestStatus = "idle" | "testing" | "ok" | "fail";

interface CommSettings {
  // General / Lab Contact
  labName?: string;
  labPhone?: string;
  labEmail?: string;
  labAddress?: string;
  labCity?: string;
  labState?: string;
  labPincode?: string;
  labWebsite?: string;
  labSupportEmail?: string;
  labEmergencyPhone?: string;
  // Email
  emailProvider?: string;
  emailFromEmail?: string;
  emailFromName?: string;
  emailApiKey?: string;
  emailApiSecret?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSsl?: boolean;
  emailMaxRetries?: number;
  emailRetryIntervalMinutes?: number;
  emailDailyLimit?: number;
  emailReportEnabled?: boolean;
  emailAppointmentEnabled?: boolean;
  emailCriticalAlertEnabled?: boolean;
  // SMS
  smsProvider?: string;
  smsApiKey?: string;
  smsApiSecret?: string;
  smsSenderId?: string;
  smsDltEntityId?: string;       // India TRAI DLT
  smsDltTemplateId?: string;
  smsMaxRetries?: number;
  smsReportEnabled?: boolean;
  smsAppointmentEnabled?: boolean;
  smsCriticalAlertEnabled?: boolean;
  // WhatsApp
  whatsappProvider?: string;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
  whatsappWebhookUrl?: string;
  whatsappVerifyToken?: string;
  whatsappBusinessProfileId?: string;
  whatsappAIEnabled?: boolean;
  whatsappTemplateReportId?: string;
  whatsappTemplateAppointmentId?: string;
  whatsappTemplateCriticalId?: string;
  // Call
  callProvider?: string;
  callApiKey?: string;
  callApiSecret?: string;
  callCallerId?: string;
  callIvrEnabled?: boolean;
  callRecordingEnabled?: boolean;
  // Notifications
  notificationCriticalThresholdMinutes?: number;
  notificationEscalationEnabled?: boolean;
  notificationEscalationAfterMinutes?: number;
  notificationEscalationEmail?: string;
  notificationQuietHoursEnabled?: boolean;
  notificationQuietStart?: string;
  notificationQuietEnd?: string;
  notificationBatchEnabled?: boolean;
  notificationBatchIntervalMinutes?: number;
  // DPDP / Consent
  dpdpConsentEnabled?: boolean;
  dpdpConsentLanguages?: string[];
  dpdpRetentionDays?: number;
  dpdpOptOutSmsEnabled?: boolean;
  dpdpOptOutEmailEnabled?: boolean;
  dpdpOptOutWhatsappEnabled?: boolean;
  dpdpDataFiduciaryName?: string;
  dpdpGrievanceEmail?: string;
  dpdpGrievancePhone?: string;
}

const DEFAULT_SETTINGS: CommSettings = {
  emailProvider: "custom",
  smtpPort: 587,
  smtpSsl: true,
  smsProvider: "custom",
  whatsappProvider: "custom",
  callProvider: "custom",
  emailMaxRetries: 3,
  emailRetryIntervalMinutes: 5,
  emailDailyLimit: 1000,
  emailReportEnabled: true,
  emailAppointmentEnabled: true,
  emailCriticalAlertEnabled: true,
  smsMaxRetries: 2,
  smsReportEnabled: true,
  smsAppointmentEnabled: true,
  smsCriticalAlertEnabled: true,
  whatsappAIEnabled: false,
  callIvrEnabled: false,
  callRecordingEnabled: false,
  notificationCriticalThresholdMinutes: 15,
  notificationEscalationEnabled: true,
  notificationEscalationAfterMinutes: 30,
  notificationQuietHoursEnabled: false,
  notificationQuietStart: "22:00",
  notificationQuietEnd: "07:00",
  notificationBatchEnabled: false,
  notificationBatchIntervalMinutes: 60,
  dpdpConsentEnabled: true,
  dpdpConsentLanguages: ["en", "hi"],
  dpdpRetentionDays: 180,
  dpdpOptOutSmsEnabled: true,
  dpdpOptOutEmailEnabled: true,
  dpdpOptOutWhatsappEnabled: true,
};

/* ─── Small utility components ─────────────────────────────────────────────── */
function Badge({ color, children }: { color: "green" | "yellow" | "red" | "blue" | "gray"; children: React.ReactNode }) {
  const classes: Record<string, string> = {
    green: "bg-green-50 text-green-700 ring-green-600/20",
    yellow: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
    red: "bg-red-50 text-red-700 ring-red-600/20",
    blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
    gray: "bg-gray-50 text-gray-600 ring-gray-500/10",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${classes[color]}`}>
      {children}
    </span>
  );
}

function FieldLabel({ label, required, tip }: { label: string; required?: boolean; tip?: string }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 text-xs">*</span>}
      {tip && (
        <button
          type="button"
          className="relative text-gray-400 hover:text-blue-500 transition-colors"
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
        >
          <Info className="h-3.5 w-3.5" />
          {showTip && (
            <div className="absolute bottom-5 left-0 z-30 w-60 rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-600 shadow-lg">
              {tip}
            </div>
          )}
        </button>
      )}
    </label>
  );
}

function InputField({
  label, value, onChange, type = "text", placeholder, required, tip, disabled,
}: {
  label: string; value: string | number | undefined; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; tip?: string; disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <FieldLabel label={label} required={required} tip={tip} />
      <div className="relative">
        <input
          type={isPassword && show ? "text" : type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500 transition"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label, value, onChange, options, tip, required,
}: {
  label: string; value: string | undefined; onChange: (v: string) => void;
  options: { value: string; label: string }[]; tip?: string; required?: boolean;
}) {
  return (
    <div>
      <FieldLabel label={label} required={required} tip={tip} />
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  label, description, checked, onChange,
}: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        role="switch"
        aria-checked={checked}
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${checked ? "bg-blue-600" : "bg-gray-200"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </button>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    </div>
  );
}

function SectionCard({
  title, icon, badge, children, collapsible = false,
}: {
  title: string; icon: React.ReactNode; badge?: React.ReactNode;
  children: React.ReactNode; collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div
        className={`flex items-center justify-between px-5 py-4 border-b border-gray-100 ${collapsible ? "cursor-pointer select-none" : ""}`}
        onClick={collapsible ? () => setOpen((o) => !o) : undefined}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-blue-600">{icon}</span>
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          {badge}
        </div>
        {collapsible && (open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />)}
      </div>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

function TestButton({
  label, status, onTest,
}: {
  label: string; status: TestStatus; onTest: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTest}
      disabled={status === "testing"}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition"
    >
      {status === "testing" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {status === "ok" && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
      {status === "fail" && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
      {status === "idle" && <Send className="h-3.5 w-3.5" />}
      {status === "testing" ? "Testing..." : status === "ok" ? "Connected ✓" : status === "fail" ? "Failed" : label}
    </button>
  );
}

function SaveBar({ status, onSave }: { status: SaveStatus; onSave: () => void }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white/90 backdrop-blur px-6 py-3 flex items-center justify-between shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <span className="text-xs text-gray-400">
        {status === "saved" && <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> Settings saved to database</span>}
        {status === "error" && <span className="flex items-center gap-1 text-red-500"><AlertCircle className="h-3.5 w-3.5" /> Save failed — check connection</span>}
        {(status === "idle" || status === "saving") && "Unsaved changes will be lost on navigation."}
      </span>
      <button
        type="button"
        onClick={onSave}
        disabled={status === "saving"}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 shadow transition"
      >
        {status === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "saving" ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}

/* ─── Tab panels ───────────────────────────────────────────────────────────── */
function GeneralTab({ s, u }: { s: CommSettings; u: (k: keyof CommSettings, v: any) => void }) {
  return (
    <div className="space-y-5">
      <SectionCard title="Laboratory Contact Information" icon={<Phone className="h-4 w-4" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="Laboratory Name" required value={s.labName} onChange={(v) => u("labName", v)} placeholder="Labcore Diagnostics Pvt Ltd" />
          <InputField label="Support Email" type="email" value={s.labSupportEmail} onChange={(v) => u("labSupportEmail", v)} placeholder="support@labcore.in" />
          <InputField label="Primary Phone" value={s.labPhone} onChange={(v) => u("labPhone", v)} placeholder="+91 99XXXXXX00" tip="Used as sender on communication footers" />
          <InputField label="Emergency / Helpdesk" value={s.labEmergencyPhone} onChange={(v) => u("labEmergencyPhone", v)} placeholder="+91 1800-XXX-XXXX" tip="Printed on critical result alerts" />
          <InputField label="Lab Email" type="email" value={s.labEmail} onChange={(v) => u("labEmail", v)} placeholder="lab@labcore.in" />
          <InputField label="Website" value={s.labWebsite} onChange={(v) => u("labWebsite", v)} placeholder="https://labcore.in" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <InputField label="Address Line" value={s.labAddress} onChange={(v) => u("labAddress", v)} placeholder="B/2, Sai Complex, Ring Road" />
          </div>
          <InputField label="City" value={s.labCity} onChange={(v) => u("labCity", v)} placeholder="Surat" />
          <InputField label="State" value={s.labState} onChange={(v) => u("labState", v)} placeholder="Gujarat" />
          <InputField label="Pincode" value={s.labPincode} onChange={(v) => u("labPincode", v)} placeholder="395001" />
        </div>
      </SectionCard>

      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800 flex gap-3">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold">Used in all patient-facing communications</p>
          <p className="text-xs mt-0.5 text-amber-700">This contact information appears in email headers, SMS footers, WhatsApp messages, and printed reports. Keep it up to date for NABL / ISO 15189 compliance.</p>
        </div>
      </div>
    </div>
  );
}

function EmailTab({
  s, u, testStatus, onTest,
}: { s: CommSettings; u: (k: keyof CommSettings, v: any) => void; testStatus: TestStatus; onTest: () => void; }) {
  const configured = s.emailProvider && s.emailProvider !== "custom";
  return (
    <div className="space-y-5">
      <SectionCard
        title="Email Provider"
        icon={<Mail className="h-4 w-4" />}
        badge={configured
          ? <Badge color="green"><Wifi className="h-3 w-3" /> Configured</Badge>
          : <Badge color="gray"><WifiOff className="h-3 w-3" /> Not configured</Badge>}
      >
        <SelectField
          label="Provider"
          required
          value={s.emailProvider}
          onChange={(v) => u("emailProvider", v)}
          options={[
            { value: "custom", label: "Not Configured" },
            { value: "smtp", label: "Custom SMTP (Gmail / Office365 / Postfix)" },
            { value: "sendgrid", label: "SendGrid (Twilio)" },
            { value: "mailgun", label: "Mailgun" },
            { value: "ses", label: "AWS SES" },
            { value: "postmark", label: "Postmark" },
          ]}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="From Email"
            type="email"
            required={configured}
            value={s.emailFromEmail}
            onChange={(v) => u("emailFromEmail", v)}
            placeholder="reports@labcore.in"
            tip="Must match verified domain for deliverability"
          />
          <InputField label="From Name" value={s.emailFromName} onChange={(v) => u("emailFromName", v)} placeholder="Labcore Diagnostics" />
        </div>

        {s.emailProvider === "smtp" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <InputField label="SMTP Host" required value={s.smtpHost} onChange={(v) => u("smtpHost", v)} placeholder="smtp.gmail.com" />
              </div>
              <InputField label="Port" type="number" value={s.smtpPort} onChange={(v) => u("smtpPort", v)} placeholder="587" tip="587 for TLS, 465 for SSL, 25 for legacy" />
            </div>
            <InputField label="SMTP Username" value={s.smtpUser} onChange={(v) => u("smtpUser", v)} placeholder="lab@labcore.in" />
            <InputField label="SMTP Password" type="password" value={s.smtpPassword} onChange={(v) => u("smtpPassword", v)} placeholder="App password or SMTP credential" />
            <Toggle label="Use SSL/TLS" description="Enable TLS encryption (recommended)" checked={!!s.smtpSsl} onChange={(v) => u("smtpSsl", v)} />
          </div>
        )}

        {configured && s.emailProvider !== "smtp" && (
          <InputField
            label="API Key"
            type="password"
            required
            value={s.emailApiKey}
            onChange={(v) => u("emailApiKey", v)}
            placeholder="Enter your provider API key"
            tip="Stored encrypted at rest. Never logged."
          />
        )}

        {configured && (
          <div className="flex items-center gap-3 pt-2">
            <TestButton label="Send test email" status={testStatus} onTest={onTest} />
            {testStatus === "ok" && <span className="text-xs text-green-600">Test email sent to {s.emailFromEmail}</span>}
            {testStatus === "fail" && <span className="text-xs text-red-500">Check credentials and try again</span>}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Delivery Limits & Retry Policy" icon={<Clock className="h-4 w-4" />} collapsible>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InputField
            label="Daily Send Limit"
            type="number"
            value={s.emailDailyLimit}
            onChange={(v) => u("emailDailyLimit", parseInt(v))}
            tip="Maximum emails per 24 h window. Prevents abuse and cost overruns."
          />
          <InputField
            label="Max Retries"
            type="number"
            value={s.emailMaxRetries}
            onChange={(v) => u("emailMaxRetries", parseInt(v))}
          />
          <InputField
            label="Retry Interval (min)"
            type="number"
            value={s.emailRetryIntervalMinutes}
            onChange={(v) => u("emailRetryIntervalMinutes", parseInt(v))}
          />
        </div>
      </SectionCard>

      <SectionCard title="Trigger Settings" icon={<Bell className="h-4 w-4" />} collapsible>
        <div className="space-y-3">
          <Toggle label="Send report-ready email to patient" checked={!!s.emailReportEnabled} onChange={(v) => u("emailReportEnabled", v)} description="Patient receives download link when results are approved & published" />
          <Toggle label="Send appointment reminders via email" checked={!!s.emailAppointmentEnabled} onChange={(v) => u("emailAppointmentEnabled", v)} />
          <Toggle label="Critical alert to referring doctor" checked={!!s.emailCriticalAlertEnabled} onChange={(v) => u("emailCriticalAlertEnabled", v)} description="Triggered when a result is flagged critical (±3 SD or panic value)" />
        </div>
      </SectionCard>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-800 flex gap-3">
        <ExternalLink className="h-3.5 w-3.5 mt-0.5 text-blue-600 flex-shrink-0" />
        <div>
          <p className="font-semibold">Setup guides</p>
          <ul className="mt-1 space-y-0.5 text-blue-700">
            <li>• <strong>Gmail SMTP</strong>: Requires App Password (2FA must be on)</li>
            <li>• <strong>SendGrid</strong>: Create API key at sendgrid.com → Settings → API Keys</li>
            <li>• <strong>AWS SES</strong>: Verify sender domain in SES console, request production access</li>
            <li>• <strong>DKIM/SPF</strong>: Add provider's DNS records to your domain for best deliverability</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SmsTab({
  s, u, testStatus, onTest,
}: { s: CommSettings; u: (k: keyof CommSettings, v: any) => void; testStatus: TestStatus; onTest: () => void; }) {
  const configured = s.smsProvider && s.smsProvider !== "custom";
  return (
    <div className="space-y-5">
      <SectionCard
        title="SMS Provider"
        icon={<MessageSquare className="h-4 w-4" />}
        badge={configured ? <Badge color="green"><Wifi className="h-3 w-3" /> Configured</Badge> : <Badge color="gray"><WifiOff className="h-3 w-3" /> Not configured</Badge>}
      >
        <SelectField
          label="Provider"
          required
          value={s.smsProvider}
          onChange={(v) => u("smsProvider", v)}
          options={[
            { value: "custom", label: "Not Configured" },
            { value: "twilio", label: "Twilio" },
            { value: "plivo", label: "Plivo" },
            { value: "nexmo", label: "Vonage (Nexmo)" },
            { value: "kaleyra", label: "Kaleyra (India)" },
            { value: "gupshup", label: "Gupshup (India)" },
            { value: "textlocal", label: "Textlocal (India)" },
            { value: "msg91", label: "MSG91 (India)" },
          ]}
        />

        {configured && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField label="API Key / Auth Token" type="password" required value={s.smsApiKey} onChange={(v) => u("smsApiKey", v)} tip="Stored encrypted" />
              <InputField label="API Secret" type="password" value={s.smsApiSecret} onChange={(v) => u("smsApiSecret", v)} />
            </div>
            <InputField
              label="Sender ID"
              required
              value={s.smsSenderId}
              onChange={(v) => u("smsSenderId", v)}
              placeholder="LABCOR"
              tip="6-char uppercase alphabetic (India TRAI requirement)"
            />
          </div>
        )}

        {configured && (
          <div className="flex items-center gap-3 pt-2">
            <TestButton label="Send test SMS" status={testStatus} onTest={onTest} />
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="India DLT / TRAI Compliance"
        icon={<Shield className="h-4 w-4" />}
        badge={<Badge color="yellow"><Shield className="h-3 w-3" /> TRAI Mandatory</Badge>}
      >
        <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-3 text-xs text-yellow-800 mb-3">
          <strong>TRAI Telemarketing Regulations</strong> require all commercial SMS in India to be registered on the Distributed Ledger Technology (DLT) platform. Failure results in number blacklisting.
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="DLT Entity ID"
            required
            value={s.smsDltEntityId}
            onChange={(v) => u("smsDltEntityId", v)}
            tip="Obtained after registering your company on Airtel/Jio/BSNL DLT portal"
            placeholder="1701XXXXXXXXXX"
          />
          <InputField
            label="DLT Template ID"
            required
            value={s.smsDltTemplateId}
            onChange={(v) => u("smsDltTemplateId", v)}
            tip="Register each SMS template on DLT portal and paste the approved Template ID"
            placeholder="1707XXXXXXXXXX"
          />
        </div>
      </SectionCard>

      <SectionCard title="Retry Policy & Triggers" icon={<Clock className="h-4 w-4" />} collapsible>
        <InputField label="Max Retries" type="number" value={s.smsMaxRetries} onChange={(v) => u("smsMaxRetries", parseInt(v))} />
        <div className="mt-3 space-y-3">
          <Toggle label="Report-ready SMS to patient" checked={!!s.smsReportEnabled} onChange={(v) => u("smsReportEnabled", v)} />
          <Toggle label="Appointment reminder SMS" checked={!!s.smsAppointmentEnabled} onChange={(v) => u("smsAppointmentEnabled", v)} />
          <Toggle label="Critical alert SMS to referring doctor" checked={!!s.smsCriticalAlertEnabled} onChange={(v) => u("smsCriticalAlertEnabled", v)} />
        </div>
      </SectionCard>
    </div>
  );
}

function WhatsappTab({
  s, u, testStatus, onTest,
}: { s: CommSettings; u: (k: keyof CommSettings, v: any) => void; testStatus: TestStatus; onTest: () => void; }) {
  const configured = s.whatsappProvider && s.whatsappProvider !== "custom";
  return (
    <div className="space-y-5">
      <SectionCard
        title="WhatsApp Business API"
        icon={<MessageSquare className="h-4 w-4" />}
        badge={configured ? <Badge color="green"><Wifi className="h-3 w-3" /> Configured</Badge> : <Badge color="gray"><WifiOff className="h-3 w-3" /> Not configured</Badge>}
      >
        <SelectField
          label="Provider"
          required
          value={s.whatsappProvider}
          onChange={(v) => u("whatsappProvider", v)}
          options={[
            { value: "custom", label: "Not Configured" },
            { value: "meta", label: "Meta Cloud API (Official)" },
            { value: "twilio", label: "Twilio WhatsApp" },
            { value: "gupshup", label: "Gupshup" },
            { value: "interakt", label: "Interakt (India)" },
            { value: "wati", label: "WATI" },
          ]}
        />

        {configured && (
          <div className="space-y-4">
            <InputField label="Phone Number ID" required value={s.whatsappPhoneNumberId} onChange={(v) => u("whatsappPhoneNumberId", v)} placeholder="Your WhatsApp Phone Number ID" tip="Found in Meta for Developers → App → WhatsApp → Phone Numbers" />
            <InputField label="Access Token / API Key" type="password" required value={s.whatsappAccessToken} onChange={(v) => u("whatsappAccessToken", v)} />
            <InputField label="Business Profile ID" value={s.whatsappBusinessProfileId} onChange={(v) => u("whatsappBusinessProfileId", v)} placeholder="Optional" />
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-2">Webhook Configuration</p>
              <InputField label="Webhook Callback URL" value={s.whatsappWebhookUrl} onChange={(v) => u("whatsappWebhookUrl", v)} placeholder="https://api.labcore.in/api/whatsapp/webhook" />
              <div className="mt-3">
                <InputField label="Webhook Verify Token" type="password" value={s.whatsappVerifyToken} onChange={(v) => u("whatsappVerifyToken", v)} tip="A secret string you create; set the same value in Meta Webhooks" />
              </div>
            </div>
          </div>
        )}

        {configured && (
          <div className="flex items-center gap-3 pt-2">
            <TestButton label="Send test message" status={testStatus} onTest={onTest} />
          </div>
        )}
      </SectionCard>

      <SectionCard title="Message Templates" icon={<MessageSquare className="h-4 w-4" />} collapsible>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800 mb-3">
          WhatsApp Business only allows pre-approved templates for outbound messages. Register templates in <strong>Meta Business Manager → Message Templates</strong> and paste the approved template name below.
        </div>
        <div className="space-y-4">
          <InputField label="Report-Ready Template Name" value={s.whatsappTemplateReportId} onChange={(v) => u("whatsappTemplateReportId", v)} placeholder="lab_report_ready_v2" tip="Must be APPROVED in Meta Business Manager" />
          <InputField label="Appointment Reminder Template Name" value={s.whatsappTemplateAppointmentId} onChange={(v) => u("whatsappTemplateAppointmentId", v)} placeholder="appointment_reminder_v1" />
          <InputField label="Critical Alert Template Name" value={s.whatsappTemplateCriticalId} onChange={(v) => u("whatsappTemplateCriticalId", v)} placeholder="critical_result_alert_v1" />
        </div>
      </SectionCard>

      <SectionCard title="AI-Powered Features" icon={<Bell className="h-4 w-4" />} collapsible>
        <Toggle
          label="Enable AI-Powered Auto-Responses"
          description="Uses Gemini to generate personalized report summaries, answer common patient queries, and detect high-priority messages. Requires Gemini API key in Integrations settings."
          checked={!!s.whatsappAIEnabled}
          onChange={(v) => u("whatsappAIEnabled", v)}
        />
      </SectionCard>
    </div>
  );
}

function CallTab({
  s, u, testStatus, onTest,
}: { s: CommSettings; u: (k: keyof CommSettings, v: any) => void; testStatus: TestStatus; onTest: () => void; }) {
  const configured = s.callProvider && s.callProvider !== "custom";
  return (
    <div className="space-y-5">
      <SectionCard
        title="Voice / Call Provider"
        icon={<Phone className="h-4 w-4" />}
        badge={configured ? <Badge color="green"><Wifi className="h-3 w-3" /> Configured</Badge> : <Badge color="gray"><WifiOff className="h-3 w-3" /> Not configured</Badge>}
      >
        <SelectField
          label="Provider"
          value={s.callProvider}
          onChange={(v) => u("callProvider", v)}
          options={[
            { value: "custom", label: "Not Configured" },
            { value: "twilio", label: "Twilio Voice" },
            { value: "plivo", label: "Plivo Voice" },
            { value: "nexmo", label: "Vonage Voice" },
            { value: "exotel", label: "Exotel (India)" },
            { value: "ozonetel", label: "Ozonetel (India)" },
          ]}
        />

        {configured && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField label="API Key / Auth Token" type="password" required value={s.callApiKey} onChange={(v) => u("callApiKey", v)} />
              <InputField label="API Secret" type="password" value={s.callApiSecret} onChange={(v) => u("callApiSecret", v)} />
            </div>
            <InputField label="Caller ID (Phone Number)" value={s.callCallerId} onChange={(v) => u("callCallerId", v)} placeholder="+91 99XXXXXX00" tip="Must be a verified number in your provider account" />
          </div>
        )}

        {configured && (
          <div className="flex items-center gap-3 pt-2">
            <TestButton label="Place test call" status={testStatus} onTest={onTest} />
          </div>
        )}
      </SectionCard>

      {configured && (
        <SectionCard title="Call Options" icon={<Phone className="h-4 w-4" />} collapsible>
          <div className="space-y-3">
            <Toggle label="Enable IVR (Interactive Voice Response)" description="Automated voice menu for patients to navigate options before speaking to staff" checked={!!s.callIvrEnabled} onChange={(v) => u("callIvrEnabled", v)} />
            <Toggle label="Record calls" description="All inbound and outbound calls are recorded and stored securely. Ensure patient consent as per DPDP Act 2023." checked={!!s.callRecordingEnabled} onChange={(v) => u("callRecordingEnabled", v)} />
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function NotificationsTab({ s, u }: { s: CommSettings; u: (k: keyof CommSettings, v: any) => void }) {
  return (
    <div className="space-y-5">
      <SectionCard title="Critical Result Escalation" icon={<AlertCircle className="h-4 w-4" />}>
        <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-800 mb-2">
          NABL / ISO 15189 requires a documented procedure for communicating critical results within a defined turnaround time.
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="Critical Alert Threshold (min)"
            type="number"
            value={s.notificationCriticalThresholdMinutes}
            onChange={(v) => u("notificationCriticalThresholdMinutes", parseInt(v))}
            tip="Alert is sent if critical result is not acknowledged within this window"
          />
          <InputField
            label="Escalation Delay (min)"
            type="number"
            value={s.notificationEscalationAfterMinutes}
            onChange={(v) => u("notificationEscalationAfterMinutes", parseInt(v))}
            tip="If primary contact doesn't respond, escalate after this many minutes"
          />
          <div className="sm:col-span-2">
            <InputField
              label="Escalation Email"
              type="email"
              value={s.notificationEscalationEmail}
              onChange={(v) => u("notificationEscalationEmail", v)}
              placeholder="pathologist-head@labcore.in"
              tip="Backup contact (usually HOD or senior pathologist)"
            />
          </div>
        </div>
        <Toggle
          label="Enable auto-escalation"
          description="Automatically notify escalation contact if critical result is not acknowledged in time"
          checked={!!s.notificationEscalationEnabled}
          onChange={(v) => u("notificationEscalationEnabled", v)}
        />
      </SectionCard>

      <SectionCard title="Quiet Hours" icon={<Clock className="h-4 w-4" />} collapsible>
        <Toggle
          label="Enable quiet hours for non-critical alerts"
          description="Non-critical notifications (appointment reminders, routine reports) are held and batched during this window. Critical alerts are always sent immediately."
          checked={!!s.notificationQuietHoursEnabled}
          onChange={(v) => u("notificationQuietHoursEnabled", v)}
        />
        {s.notificationQuietHoursEnabled && (
          <div className="mt-3 grid grid-cols-2 gap-4">
            <InputField label="Quiet Start" type="time" value={s.notificationQuietStart} onChange={(v) => u("notificationQuietStart", v)} />
            <InputField label="Quiet End" type="time" value={s.notificationQuietEnd} onChange={(v) => u("notificationQuietEnd", v)} />
          </div>
        )}
      </SectionCard>

      <SectionCard title="Batch Notifications" icon={<Bell className="h-4 w-4" />} collapsible>
        <Toggle
          label="Batch routine notifications"
          description="Group non-urgent patient notifications into periodic digests instead of sending one-by-one — reduces SMS/WhatsApp costs"
          checked={!!s.notificationBatchEnabled}
          onChange={(v) => u("notificationBatchEnabled", v)}
        />
        {s.notificationBatchEnabled && (
          <div className="mt-3">
            <InputField
              label="Batch Interval (minutes)"
              type="number"
              value={s.notificationBatchIntervalMinutes}
              onChange={(v) => u("notificationBatchIntervalMinutes", parseInt(v))}
              tip="Messages are queued and dispatched every N minutes"
            />
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function DpdpTab({ s, u }: { s: CommSettings; u: (k: keyof CommSettings, v: any) => void }) {
  const langs = [
    { code: "en", label: "English" }, { code: "hi", label: "Hindi" },
    { code: "gu", label: "Gujarati" }, { code: "mr", label: "Marathi" },
    { code: "ta", label: "Tamil" }, { code: "te", label: "Telugu" },
    { code: "kn", label: "Kannada" }, { code: "bn", label: "Bengali" },
  ];
  const toggleLang = (code: string) => {
    const current: string[] = s.dpdpConsentLanguages ?? [];
    u("dpdpConsentLanguages", current.includes(code) ? current.filter((c) => c !== code) : [...current, code]);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-purple-100 bg-purple-50 p-4 flex gap-3">
        <Shield className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
        <div className="text-sm text-purple-800">
          <p className="font-semibold">Digital Personal Data Protection Act 2023 (DPDP Act)</p>
          <p className="text-xs mt-1 text-purple-700">India's DPDP Act mandates informed, explicit consent before processing personal health data for communications. Non-compliance attracts penalties up to ₹250 crore.</p>
        </div>
      </div>

      <SectionCard title="Consent Management" icon={<Shield className="h-4 w-4" />}>
        <Toggle
          label="Require explicit communication consent from patients"
          description="Patients must actively opt-in before receiving report links, appointment reminders, or health tips via SMS / WhatsApp / Email"
          checked={!!s.dpdpConsentEnabled}
          onChange={(v) => u("dpdpConsentEnabled", v)}
        />

        <div>
          <FieldLabel label="Consent Notice Languages" tip="Show consent in patient's preferred language" />
          <div className="flex flex-wrap gap-2 mt-1">
            {langs.map((l) => {
              const selected = (s.dpdpConsentLanguages ?? []).includes(l.code);
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => toggleLang(l.code)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition ${selected ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-700 border-gray-300 hover:border-purple-400"}`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        <InputField
          label="Consent Retention Period (days)"
          type="number"
          value={s.dpdpRetentionDays}
          onChange={(v) => u("dpdpRetentionDays", parseInt(v))}
          tip="Consent logs are stored for this period for audit purposes. Recommended: 180 days minimum."
        />
      </SectionCard>

      <SectionCard title="Opt-Out / Withdrawal of Consent" icon={<AlertCircle className="h-4 w-4" />}>
        <p className="text-xs text-gray-500 mb-3">Enable opt-out keywords on each channel. Patients can send STOP / OPT-OUT at any time and the system will immediately suppress future communications.</p>
        <div className="space-y-3">
          <Toggle label="SMS Opt-Out (STOP keyword)" checked={!!s.dpdpOptOutSmsEnabled} onChange={(v) => u("dpdpOptOutSmsEnabled", v)} description="Received STOP → auto-unsubscribe from SMS (TRAI compliant)" />
          <Toggle label="Email Opt-Out (Unsubscribe link)" checked={!!s.dpdpOptOutEmailEnabled} onChange={(v) => u("dpdpOptOutEmailEnabled", v)} description="One-click unsubscribe in every email footer" />
          <Toggle label="WhatsApp Opt-Out (STOP keyword)" checked={!!s.dpdpOptOutWhatsappEnabled} onChange={(v) => u("dpdpOptOutWhatsappEnabled", v)} />
        </div>
      </SectionCard>

      <SectionCard title="Data Fiduciary Details" icon={<Info className="h-4 w-4" />} collapsible>
        <p className="text-xs text-gray-500 mb-3">Required for the consent notice displayed to patients. Must match your DPDP Act registration.</p>
        <div className="space-y-4">
          <InputField label="Data Fiduciary Name" value={s.dpdpDataFiduciaryName} onChange={(v) => u("dpdpDataFiduciaryName", v)} placeholder="Labcore Diagnostics Pvt Ltd" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField label="Grievance Officer Email" type="email" value={s.dpdpGrievanceEmail} onChange={(v) => u("dpdpGrievanceEmail", v)} placeholder="dpo@labcore.in" tip="Mandatory under DPDP Act Section 13" />
            <InputField label="Grievance Officer Phone" value={s.dpdpGrievancePhone} onChange={(v) => u("dpdpGrievancePhone", v)} placeholder="+91 99XXXXXX00" />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────────── */
function CommunicationSettingsContent() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [settings, setSettings] = useState<CommSettings>(DEFAULT_SETTINGS);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [emailTest, setEmailTest] = useState<TestStatus>("idle");
  const [smsTest, setSmsTest] = useState<TestStatus>("idle");
  const [waTest, setWaTest] = useState<TestStatus>("idle");
  const [callTest, setCallTest] = useState<TestStatus>("idle");

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const resp = await laboratorySettingsApi.getSettings();
      // Merge API data over defaults so new fields always have a fallback
      setSettings({ ...DEFAULT_SETTINGS, ...(resp?.data ?? {}) });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Unable to reach settings service. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateSetting = (key: keyof CommSettings, value: any) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await laboratorySettingsApi.updateSettings(settings);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    } finally {
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleTestEmail = async () => {
    setEmailTest("testing");
    try {
      const res: any = await laboratorySettingsApi.testSmtp({
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpUser: settings.smtpUser,
        smtpPassword: settings.smtpPassword,
        emailFromEmail: settings.emailFromEmail,
      });
      if (res && res.success !== false) {
        setEmailTest("ok");
      } else {
        setEmailTest("fail");
      }
    } catch (e) {
      setEmailTest("fail");
    } finally {
      setTimeout(() => setEmailTest("idle"), 5000);
    }
  };

  const handleTestWhatsApp = async () => {
    setWaTest("testing");
    try {
      const res: any = await laboratorySettingsApi.testWhatsApp({
        whatsappProvider: settings.whatsappProvider,
        whatsappApiKey: settings.whatsappAccessToken,
        whatsappSenderId: settings.whatsappPhoneNumberId,
      });
      if (res && res.success !== false) {
        setWaTest("ok");
      } else {
        setWaTest("fail");
      }
    } catch (e) {
      setWaTest("fail");
    } finally {
      setTimeout(() => setWaTest("idle"), 5000);
    }
  };

  const makeTestFn = (set: (s: TestStatus) => void) => async () => {
    set("testing");
    await new Promise((r) => setTimeout(r, 1200));
    set("ok");
    setTimeout(() => set("idle"), 4000);
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Phone className="h-3.5 w-3.5" /> },
    { id: "email", label: "Email", icon: <Mail className="h-3.5 w-3.5" /> },
    { id: "sms", label: "SMS", icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { id: "whatsapp", label: "WhatsApp", icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { id: "call", label: "Voice Calls", icon: <Phone className="h-3.5 w-3.5" /> },
    { id: "notifications", label: "Alert Rules", icon: <Bell className="h-3.5 w-3.5" /> },
    { id: "dpdp", label: "DPDP / Consent", icon: <Shield className="h-3.5 w-3.5" /> },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Communication Settings">
        <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading settings…</span>
        </div>
      </DashboardLayout>
    );
  }

  if (loadError) {
    return (
      <DashboardLayout title="Communication Settings">
        <div className="flex flex-col items-center justify-center gap-4 h-64 text-center px-4">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <div>
            <p className="text-sm font-semibold text-red-600">Could not load communication settings</p>
            <p className="text-xs text-gray-500 mt-1 max-w-md">{loadError}</p>
          </div>
          <button
            type="button"
            onClick={fetchSettings}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Communication Settings">
      <div className="space-y-6 pb-28">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure how Labcore ELIS contacts patients, referring doctors, and staff — including email, SMS, WhatsApp, voice calls, and India DPDP compliance.
          </p>
        </div>

        {/* Tab strip */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 overflow-x-auto hide-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-3 border-b-2 text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Panel content */}
        {activeTab === "general" && <GeneralTab s={settings} u={updateSetting} />}
        {activeTab === "email" && <EmailTab s={settings} u={updateSetting} testStatus={emailTest} onTest={handleTestEmail} />}
        {activeTab === "sms" && <SmsTab s={settings} u={updateSetting} testStatus={smsTest} onTest={makeTestFn(setSmsTest)} />}
        {activeTab === "whatsapp" && <WhatsappTab s={settings} u={updateSetting} testStatus={waTest} onTest={handleTestWhatsApp} />}
        {activeTab === "call" && <CallTab s={settings} u={updateSetting} testStatus={callTest} onTest={makeTestFn(setCallTest)} />}
        {activeTab === "notifications" && <NotificationsTab s={settings} u={updateSetting} />}
        {activeTab === "dpdp" && <DpdpTab s={settings} u={updateSetting} />}
      </div>

      <SaveBar status={saveStatus} onSave={handleSave} />
    </DashboardLayout>
  );
}

/**
 * Reads and writes laboratory settings. Restricted to roles that hold
 * `settings:edit` (SUPER_ADMIN, ADMIN) and `settings:view` (BRANCH_ADMIN, AUDITOR).
 */
export default function CommunicationSettingsPage() {
  return (
    <ProtectedRoute requiredRoles={SETTINGS_EDIT_ROLES}>
      <CommunicationSettingsContent />
    </ProtectedRoute>
  );
}