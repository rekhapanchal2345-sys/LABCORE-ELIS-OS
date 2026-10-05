"use client";

import React, { useState, useCallback } from "react";
import {
  X,
  MessageSquare,
  Mail,
  Phone,
  Send,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Zap,
  User,
  Shield,
} from "lucide-react";
import { communicationApi } from "@/lib/api";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Channel = "whatsapp" | "sms" | "email";
type SendStatus = "idle" | "sending" | "sent" | "error";

export interface NotificationPayload {
  patientId?: string;
  patientName: string;
  phone?: string | null;
  email?: string | null;
  uhid?: string;
  context: "ORDER" | "RESULT" | "PAYMENT" | "APPOINTMENT" | "CRITICAL" | "REPORT";
  orderNumber?: string;
  receiptNumber?: string;
  reportNumber?: string;
  testName?: string;
  amount?: number;
  dueBalance?: number;
  date?: string;
  customMessage?: string;
}

interface NotificationDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: NotificationPayload;
  labName?: string;
  labPhone?: string;
}

/* ─── Message Generators ─────────────────────────────────────────────────── */
const generateMessage = (
  channel: Channel,
  payload: NotificationPayload,
  labName: string,
  labPhone: string
): string => {
  const { patientName, context, orderNumber, receiptNumber, testName, amount, dueBalance, uhid, date, reportNumber, customMessage } = payload;
  const fmt = (v?: number) => v !== undefined ? `\u20b9${v.toLocaleString("en-IN")}` : "";
  const dateStr = date || new Date().toLocaleDateString("en-IN");
  const isWA = channel === "whatsapp";
  const bold = (t: string) => isWA ? `*${t}*` : t;

  if (customMessage) return customMessage;

  switch (context) {
    case "ORDER":
      return isWA
        ? `\ud83d\udd2c ${bold(`${labName.toUpperCase()} \u2013 ORDER REGISTERED`)}\n\nDear ${bold(patientName)},\n\nYour lab order has been successfully registered.\n\n\ud83d\udccb ${bold("Order No:")} ${orderNumber || "\u2014"}\n\ud83d\udd16 ${bold("UHID:")} ${uhid || "\u2014"}\n\ud83d\udcc5 ${bold("Date:")} ${dateStr}\n\nSample collection will proceed as scheduled. You will be notified when results are ready.\n\n_${labName} \u2022 ${labPhone}_`
        : `Dear ${patientName}, Your lab order ${orderNumber || ""} has been registered at ${labName}. UHID: ${uhid || "\u2014"}. We will notify you when results are ready. ${labPhone}`;

    case "RESULT":
      return isWA
        ? `\ud83e\uddea ${bold(`${labName.toUpperCase()} \u2013 RESULTS READY`)}\n\nDear ${bold(patientName)},\n\nYour lab results are now available for review.\n\n\ud83d\udd2c ${bold("Test:")} ${testName || "All Tests"}\n\ud83d\udd16 ${bold("UHID:")} ${uhid || "\u2014"}\n\ud83d\udcc5 ${bold("Date:")} ${dateStr}\n\n\ud83d\udcf2 Collect your report at reception or ask us to share a secure PDF link.\n\n_Thank you for choosing ${labName} \u2022 ${labPhone}_`
        : `Dear ${patientName}, Your lab results for ${testName || "your tests"} are ready. UHID: ${uhid || "\u2014"}. Visit ${labName} or call ${labPhone} for your report.`;

    case "PAYMENT":
      return isWA
        ? `\u2705 ${bold(`${labName.toUpperCase()} \u2013 PAYMENT RECEIVED`)}\n\nDear ${bold(patientName)},\n\nWe have received your payment. Thank you!\n\n\ud83d\udcc4 ${bold("Receipt:")} ${receiptNumber || "\u2014"}\n\ud83d\udcb0 ${bold("Amount:")} ${fmt(amount)}\n\ud83d\udcc5 ${bold("Date:")} ${dateStr}\n${dueBalance ? `\n\u26a0\ufe0f ${bold("Pending Balance:")} ${fmt(dueBalance)}\n` : ""}\n_${labName} Finance Team \u2022 ${labPhone}_`
        : `Dear ${patientName}, Payment of ${fmt(amount)} received at ${labName}. Receipt: ${receiptNumber || "\u2014"}. ${dueBalance ? `Balance due: ${fmt(dueBalance)}.` : ""} For queries call ${labPhone}.`;

    case "REPORT":
      return isWA
        ? `\ud83d\udcca ${bold(`${labName.toUpperCase()} \u2013 REPORT DISPATCHED`)}\n\nDear ${bold(patientName)},\n\nYour verified laboratory report is ready.\n\n\ud83d\udccb ${bold("Report No:")} ${reportNumber || "\u2014"}\n\ud83d\udd2c ${bold("Test:")} ${testName || "All Tests"}\n\ud83d\udd16 ${bold("UHID:")} ${uhid || "\u2014"}\n\n\ud83d\udcf2 Your report has been digitally signed by our pathologist. Request a PDF copy at reception or via this number.\n\n_${labName} \u2022 Accredited Laboratory \u2022 ${labPhone}_`
        : `Dear ${patientName}, Your verified lab report ${reportNumber || ""} is ready from ${labName}. UHID: ${uhid || "\u2014"}. Call ${labPhone} for details.`;

    case "CRITICAL":
      return isWA
        ? `\ud83d\udea8 ${bold(`${labName.toUpperCase()} \u2013 CRITICAL VALUE ALERT`)}\n\nDear ${bold(patientName)},\n\nOne or more of your test results have returned ${bold("critical / panic values")} that require immediate medical attention.\n\n\ud83d\udd2c ${bold("Test:")} ${testName || "\u2014"}\n\ud83d\udd16 ${bold("UHID:")} ${uhid || "\u2014"}\n\nPlease contact your doctor or visit the nearest emergency immediately.\n\n_${labName} Clinical Team \u2022 ${labPhone}_`
        : `URGENT: Dear ${patientName}, Critical lab value detected for ${testName || "your test"}. Please contact your doctor immediately. ${labName} ${labPhone}`;

    case "APPOINTMENT":
      return isWA
        ? `\ud83d\udcc5 ${bold(`${labName.toUpperCase()} \u2013 APPOINTMENT REMINDER`)}\n\nDear ${bold(patientName)},\n\nThis is a reminder for your upcoming sample collection at our facility.\n\n\ud83d\udcc5 ${bold("Date:")} ${dateStr}\n\ud83d\udd16 ${bold("UHID:")} ${uhid || "\u2014"}\n\nPlease arrive 15 min early. Bring your ID and doctor\u2019s prescription.\n\n_${labName} \u2022 ${labPhone}_`
        : `Dear ${patientName}, Reminder: Sample collection at ${labName} on ${dateStr}. Bring ID & prescription. UHID: ${uhid || "\u2014"}. Call ${labPhone} for queries.`;

    default:
      return `Dear ${patientName}, This is a notification from ${labName}. UHID: ${uhid || "\u2014"}. Contact us at ${labPhone}.`;
  }
};

const CONTEXT_LABELS: Record<NotificationPayload["context"], { label: string; emoji: string; color: string }> = {
  ORDER: { label: "Order Registration", emoji: "\ud83d\udccb", color: "text-blue-400" },
  RESULT: { label: "Results Ready", emoji: "\ud83e\uddea", color: "text-emerald-400" },
  PAYMENT: { label: "Payment Receipt", emoji: "\u2705", color: "text-amber-400" },
  REPORT: { label: "Report Dispatch", emoji: "\ud83d\udcca", color: "text-cyan-400" },
  CRITICAL: { label: "Critical Alert", emoji: "\ud83d\udea8", color: "text-red-400" },
  APPOINTMENT: { label: "Appointment Reminder", emoji: "\ud83d\udcc5", color: "text-violet-400" },
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function NotificationDispatchModal({
  isOpen,
  onClose,
  payload,
  labName = "LabCore Diagnostics",
  labPhone = "+91-9876543210",
}: NotificationDispatchModalProps) {
  const [activeChannel, setActiveChannel] = useState<Channel>("whatsapp");
  const [phone, setPhone] = useState((payload.phone || "").replace(/[^0-9]/g, ""));
  const [email, setEmail] = useState(payload.email || "");
  const [message, setMessage] = useState<string>("");
  const [subject, setSubject] = useState(`${CONTEXT_LABELS[payload.context].label} \u2013 ${payload.patientName}`);
  const [copied, setCopied] = useState(false);
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const currentMessage = message || generateMessage(activeChannel, payload, labName, labPhone);
  const contextMeta = CONTEXT_LABELS[payload.context];

  const handleChannelChange = useCallback((ch: Channel) => {
    setActiveChannel(ch);
    setMessage("");
    setSendStatus("idle");
    setStatusMsg("");
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;
    const encoded = encodeURIComponent(currentMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    setSendStatus("sent");
    setStatusMsg("WhatsApp chat opened in a new tab.");
  };

  const handleSendSMS = async () => {
    if (!payload.patientId || !phone) {
      setStatusMsg("Patient ID and phone number are required.");
      setSendStatus("error");
      return;
    }
    setSendStatus("sending");
    try {
      const res = await communicationApi.sendSMS({
        patientId: payload.patientId,
        to: phone.length === 10 ? `+91${phone}` : `+${phone}`,
        message: currentMessage,
      }) as { success: boolean; message?: string };
      if (res.success) {
        setSendStatus("sent");
        setStatusMsg("SMS sent successfully!");
      } else {
        throw new Error(res.message || "SMS failed");
      }
    } catch (err) {
      setSendStatus("error");
      setStatusMsg(err instanceof Error ? err.message : "SMS sending failed.");
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      setStatusMsg("Email address is required.");
      setSendStatus("error");
      return;
    }
    setSendStatus("sending");
    try {
      const res = await communicationApi.sendEmail({
        patientId: payload.patientId,
        to: email,
        subject,
        body: currentMessage,
      }) as { success: boolean; message?: string };
      if (res.success) {
        setSendStatus("sent");
        setStatusMsg("Email sent successfully!");
      } else {
        throw new Error(res.message || "Email failed");
      }
    } catch (err) {
      setSendStatus("error");
      setStatusMsg(err instanceof Error ? err.message : "Email sending failed.");
    }
  };

  const handleSend = () => {
    setSendStatus("idle");
    setStatusMsg("");
    if (activeChannel === "whatsapp") handleSendWhatsApp();
    else if (activeChannel === "sms") handleSendSMS();
    else handleSendEmail();
  };

  if (!isOpen) return null;

  const channels: { id: Channel; label: string; icon: React.ReactNode; active: string; inactive: string }[] = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <MessageSquare className="h-4 w-4" />,
      active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/50",
      inactive: "border-slate-700/50 text-slate-500 hover:border-slate-600 hover:text-slate-300",
    },
    {
      id: "sms",
      label: "SMS",
      icon: <Phone className="h-4 w-4" />,
      active: "bg-blue-500/15 text-blue-400 border-blue-500/50",
      inactive: "border-slate-700/50 text-slate-500 hover:border-slate-600 hover:text-slate-300",
    },
    {
      id: "email",
      label: "Email",
      icon: <Mail className="h-4 w-4" />,
      active: "bg-violet-500/15 text-violet-400 border-violet-500/50",
      inactive: "border-slate-700/50 text-slate-500 hover:border-slate-600 hover:text-slate-300",
    },
  ];

  const sendBtnClass =
    activeChannel === "whatsapp"
      ? "bg-gradient-to-r from-emerald-600 to-green-500 shadow-emerald-600/20 hover:from-emerald-500"
      : activeChannel === "sms"
      ? "bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-600/20 hover:from-blue-500"
      : "bg-gradient-to-r from-violet-600 to-indigo-500 shadow-violet-600/20 hover:from-violet-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[95vh] overflow-y-auto rounded-3xl border border-slate-700/60 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/90 px-6 py-4 backdrop-blur-sm rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Send Notification</h2>
              <p className="text-xs text-slate-400">
                <span>{contextMeta.emoji} </span>
                <span className={contextMeta.color}>{contextMeta.label}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Patient Info */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-700/40 bg-slate-800/40 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-700/60 text-slate-300 flex-shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{payload.patientName}</p>
              <p className="text-xs text-slate-400 truncate">
                {payload.uhid && `UHID: ${payload.uhid}`}
                {payload.uhid && payload.phone && " \u2022 "}
                {payload.phone && `\ud83d\udcde ${payload.phone}`}
              </p>
            </div>
            {payload.context === "CRITICAL" && (
              <span className="flex items-center gap-1 rounded-lg bg-red-500/15 px-2 py-1 text-xs font-bold text-red-400 border border-red-500/20 flex-shrink-0">
                <AlertCircle className="h-3 w-3" /> CRITICAL
              </span>
            )}
          </div>

          {/* Channel Selector */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Notification Channel</p>
            <div className="grid grid-cols-3 gap-2">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleChannelChange(ch.id)}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-sm font-semibold transition-all ${
                    activeChannel === ch.id ? ch.active : ch.inactive
                  }`}
                >
                  {ch.icon}
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Input */}
          {activeChannel !== "email" && (
            <div>
              <label className="block mb-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-800/60 py-2.5 pl-12 pr-4 text-sm font-mono text-white placeholder-slate-600 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>
          )}

          {/* Email Fields */}
          {activeChannel === "email" && (
            <>
              <div>
                <label className="block mb-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-800/60 py-2.5 px-4 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-800/60 py-2.5 px-4 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </>
          )}

          {/* Message Preview / Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {activeChannel === "email" ? "Email Body" : "Message Preview"}
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600">{currentMessage.length} chars</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <textarea
              value={message || currentMessage}
              onChange={(e) => setMessage(e.target.value)}
              rows={activeChannel === "email" ? 8 : 6}
              className="w-full rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 text-xs font-mono text-slate-200 leading-relaxed outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none"
            />
            {message && (
              <button
                onClick={() => setMessage("")}
                className="mt-1 text-xs text-slate-600 hover:text-slate-400 transition"
              >
                \u21ba Reset to template
              </button>
            )}
          </div>

          {/* DPDP Note */}
          <div className="flex items-start gap-2 rounded-xl border border-slate-700/30 bg-slate-800/20 px-3 py-2.5">
            <Shield className="h-3.5 w-3.5 mt-0.5 text-slate-500 flex-shrink-0" />
            <p className="text-xs text-slate-500 leading-relaxed">
              DPDP Act 2023 compliant. Sending only to consented patients. All communications are logged in the audit trail.
            </p>
          </div>

          {/* Status */}
          {sendStatus === "sent" && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <p className="text-sm font-medium text-emerald-300">{statusMsg}</p>
            </div>
          )}
          {sendStatus === "error" && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <p className="text-sm font-medium text-red-300">{statusMsg}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700/60 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800/60 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sendStatus === "sending" || sendStatus === "sent"}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${sendBtnClass}`}
            >
              {sendStatus === "sending" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending\u2026</>
              ) : sendStatus === "sent" ? (
                <><CheckCircle2 className="h-4 w-4" /> Sent!</>
              ) : activeChannel === "whatsapp" ? (
                <><ExternalLink className="h-4 w-4" /> Open WhatsApp</>
              ) : (
                <><Send className="h-4 w-4" /> Send {activeChannel === "sms" ? "SMS" : "Email"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
