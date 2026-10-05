"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { communicationApi, whatsappApi } from "@/lib/api";
import {
  MessageSquare,
  Mail,
  Phone,
  Send,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Zap,
  Activity,
  Users,
  FileText,
  Shield,
  Bell,
  Search,
  Filter,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  Loader2,
  XCircle,
  Radio,
  Inbox,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface CommStats {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  smsCount: number;
  emailCount: number;
  whatsappCount: number;
  deliveryRate: number;
  todayCount: number;
}

interface CommLog {
  id: string;
  channel: "SMS" | "EMAIL" | "WHATSAPP" | "CALL";
  status: "SENT" | "DELIVERED" | "FAILED" | "PENDING" | "READ";
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  message: string;
  subject?: string;
  context: string;
  sentAt: string;
  deliveredAt?: string;
  errorMessage?: string;
}

const DEMO_STATS: CommStats = {
  totalSent: 1284,
  delivered: 1198,
  failed: 86,
  pending: 12,
  smsCount: 742,
  emailCount: 315,
  whatsappCount: 227,
  deliveryRate: 93.3,
  todayCount: 47,
};

const DEMO_LOGS: CommLog[] = [
  { id: "c1", channel: "WHATSAPP", status: "DELIVERED", patientName: "Ramesh Kumar", patientPhone: "9876543210", message: "Your lab results are ready. UHID: LC-0012. Visit reception or call.", context: "RESULT", sentAt: new Date(Date.now() - 5 * 60000).toISOString(), deliveredAt: new Date(Date.now() - 4 * 60000).toISOString() },
  { id: "c2", channel: "SMS", status: "DELIVERED", patientName: "Sunita Devi", patientPhone: "8765432109", message: "Payment of \u20b91,200 received at LabCore. Receipt: REC-0089.", context: "PAYMENT", sentAt: new Date(Date.now() - 15 * 60000).toISOString(), deliveredAt: new Date(Date.now() - 14 * 60000).toISOString() },
  { id: "c3", channel: "EMAIL", status: "DELIVERED", patientName: "Priya Sharma", patientEmail: "priya@example.com", message: "Lab order registered.", subject: "Order Registered – Priya Sharma", context: "ORDER", sentAt: new Date(Date.now() - 30 * 60000).toISOString(), deliveredAt: new Date(Date.now() - 29 * 60000).toISOString() },
  { id: "c4", channel: "WHATSAPP", status: "FAILED", patientName: "Ajay Singh", patientPhone: "7654321098", message: "Critical value alert for CBC test.", context: "CRITICAL", sentAt: new Date(Date.now() - 45 * 60000).toISOString(), errorMessage: "Phone unreachable" },
  { id: "c5", channel: "SMS", status: "PENDING", patientName: "Meena Agarwal", patientPhone: "6543210987", message: "Appointment reminder for tomorrow.", context: "APPOINTMENT", sentAt: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: "c6", channel: "WHATSAPP", status: "READ", patientName: "Dr. Vikram Nair", patientPhone: "9345678901", message: "Report dispatched for patient LC-0099.", context: "REPORT", sentAt: new Date(Date.now() - 2 * 3600000).toISOString(), deliveredAt: new Date(Date.now() - 1.9 * 3600000).toISOString() },
  { id: "c7", channel: "EMAIL", status: "SENT", patientName: "Kavya Reddy", patientEmail: "kavya@hospital.in", message: "Invoice #INV-0227 generated for \u20b93,500.", subject: "Invoice Generated", context: "PAYMENT", sentAt: new Date(Date.now() - 3 * 3600000).toISOString() },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const CHANNEL_CONFIG: Record<CommLog["channel"], { icon: React.ElementType; color: string; bg: string; label: string }> = {
  WHATSAPP: { icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "WhatsApp" },
  SMS: { icon: Phone, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", label: "SMS" },
  EMAIL: { icon: Mail, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", label: "Email" },
  CALL: { icon: Phone, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Call" },
};

const STATUS_CONFIG: Record<CommLog["status"], { icon: React.ElementType; color: string; label: string }> = {
  DELIVERED: { icon: CheckCircle2, color: "text-emerald-400", label: "Delivered" },
  SENT: { icon: Send, color: "text-blue-400", label: "Sent" },
  READ: { icon: CheckCircle2, color: "text-cyan-400", label: "Read" },
  PENDING: { icon: Clock, color: "text-amber-400", label: "Pending" },
  FAILED: { icon: XCircle, color: "text-red-400", label: "Failed" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: string | number; icon: React.ElementType; color: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{label}</p>
          <p className={`mt-1.5 text-2xl font-extrabold tracking-tight ${color}`}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.replace("text-", "bg-").replace("400", "500/10")} border ${color.replace("text-", "border-").replace("400", "500/20")}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function CommunicationHubPage() {
  const [logs, setLogs] = useState<CommLog[]>(DEMO_LOGS);
  const [stats, setStats] = useState<CommStats>(DEMO_STATS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"logs" | "analytics" | "campaigns">("logs");
  const [retrying, setRetrying] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = channelFilter === "ALL" || log.channel === channelFilter;
    const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  const handleRetry = async (logId: string) => {
    setRetrying(logId);
    try {
      await communicationApi.retry(logId);
      setLogs((prev) =>
        prev.map((l) => (l.id === logId ? { ...l, status: "PENDING" as const } : l))
      );
    } catch {
      // fail silently for demo
    } finally {
      setRetrying(null);
    }
  };

  const deliveryRate = stats.totalSent > 0
    ? ((stats.delivered / stats.totalSent) * 100).toFixed(1)
    : "0";

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
          {/* ── Header ── */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 shadow-xl shadow-violet-500/25">
                    <Radio className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">Communication Hub</h1>
                    <p className="text-sm text-slate-400">SMS · WhatsApp · Email · Voice — All in one command center</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400">Live</span>
                </div>
                <button
                  onClick={() => setLoading(true)}
                  className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <a
                  href="/settings/communications"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-violet-600/20 hover:from-violet-500 transition"
                >
                  <Zap className="h-4 w-4" />
                  Configure Providers
                </a>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 flex gap-1 rounded-2xl border border-slate-700/40 bg-slate-800/30 p-1 w-fit">
              {(["logs", "analytics", "campaigns"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-5 py-2 text-sm font-semibold capitalize transition-all ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Total Sent" value={stats.totalSent.toLocaleString("en-IN")} icon={Send} color="text-slate-300" sub="All time" />
            <StatCard label="Delivered" value={stats.delivered.toLocaleString("en-IN")} icon={CheckCircle2} color="text-emerald-400" sub={`${deliveryRate}% rate`} />
            <StatCard label="Failed" value={stats.failed} icon={XCircle} color="text-red-400" sub="Need retry" />
            <StatCard label="WhatsApp" value={stats.whatsappCount} icon={MessageSquare} color="text-emerald-400" />
            <StatCard label="SMS" value={stats.smsCount} icon={Phone} color="text-blue-400" />
            <StatCard label="Email" value={stats.emailCount} icon={Mail} color="text-violet-400" />
          </div>

          {/* ── Logs Tab ── */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patient, message..."
                    className="w-full rounded-xl border border-slate-700/60 bg-slate-800/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {["ALL", "WHATSAPP", "SMS", "EMAIL"].map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setChannelFilter(ch)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                        channelFilter === ch
                          ? "border-violet-500/50 bg-violet-500/15 text-violet-400"
                          : "border-slate-700/50 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {["ALL", "DELIVERED", "PENDING", "FAILED"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                        statusFilter === st
                          ? "border-violet-500/50 bg-violet-500/15 text-violet-400"
                          : "border-slate-700/50 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Log Entries */}
              <div className="space-y-2">
                {filteredLogs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Inbox className="h-12 w-12 text-slate-700 mb-3" />
                    <p className="text-slate-500 font-medium">No communication logs match your filters</p>
                  </div>
                )}

                {filteredLogs.map((log) => {
                  const chCfg = CHANNEL_CONFIG[log.channel];
                  const stCfg = STATUS_CONFIG[log.status];
                  const ChIcon = chCfg.icon;
                  const StIcon = stCfg.icon;

                  return (
                    <div
                      key={log.id}
                      className="group rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4 transition hover:border-slate-600/60 hover:bg-slate-800/50"
                    >
                      <div className="flex items-start gap-3">
                        {/* Channel badge */}
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${chCfg.bg}`}>
                          <ChIcon className={`h-4 w-4 ${chCfg.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-white">{log.patientName}</span>
                            <span className={`text-xs font-bold ${chCfg.color}`}>{chCfg.label}</span>
                            <span className={`flex items-center gap-1 text-xs font-semibold ${stCfg.color}`}>
                              <StIcon className="h-3 w-3" />
                              {stCfg.label}
                            </span>
                            <span className="ml-auto text-xs text-slate-600">{timeAgo(log.sentAt)}</span>
                          </div>
                          {log.subject && (
                            <p className="text-xs font-semibold text-slate-400 mb-0.5">{log.subject}</p>
                          )}
                          <p className="text-xs text-slate-500 leading-relaxed truncate max-w-2xl">{log.message}</p>
                          {log.errorMessage && (
                            <p className="mt-1 text-xs text-red-400">\u26a0\ufe0f {log.errorMessage}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                          {log.status === "FAILED" && (
                            <button
                              onClick={() => handleRetry(log.id)}
                              disabled={retrying === log.id}
                              className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition disabled:opacity-50"
                            >
                              {retrying === log.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                              Retry
                            </button>
                          )}
                          {log.channel === "WHATSAPP" && log.patientPhone && (
                            <a
                              href={`https://wa.me/91${log.patientPhone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Chat
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Analytics Tab ── */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Delivery performance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "WhatsApp Delivery Rate", value: "96.2%", note: "227 sent today", color: "from-emerald-500 to-teal-600", width: "96%" },
                  { label: "SMS Delivery Rate", value: "91.4%", note: "742 sent today", color: "from-blue-500 to-blue-700", width: "91%" },
                  { label: "Email Open Rate", value: "68.5%", note: "315 sent today", color: "from-violet-500 to-indigo-600", width: "68%" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{item.label}</p>
                    <p className="text-3xl font-extrabold text-white mb-3">{item.value}</p>
                    <div className="h-2 rounded-full bg-slate-700/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700`}
                        style={{ width: item.width }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{item.note}</p>
                  </div>
                ))}
              </div>

              {/* Context breakdown */}
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5">
                <h3 className="text-sm font-bold text-white mb-4">Notification Context Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: "Results Ready", count: 487, pct: 38, color: "from-emerald-500 to-teal-500" },
                    { label: "Payment Receipts", count: 324, pct: 25, color: "from-amber-500 to-orange-500" },
                    { label: "Order Registration", count: 218, pct: 17, color: "from-blue-500 to-blue-700" },
                    { label: "Report Dispatch", count: 154, pct: 12, color: "from-cyan-500 to-blue-500" },
                    { label: "Appointments", count: 76, pct: 6, color: "from-violet-500 to-indigo-500" },
                    { label: "Critical Alerts", count: 25, pct: 2, color: "from-red-500 to-rose-600" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4">
                      <span className="w-36 text-sm text-slate-400 truncate flex-shrink-0">{item.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-700/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-sm font-bold text-slate-300">{item.count.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Campaigns Tab ── */}
          {activeTab === "campaigns" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Manage bulk notification campaigns for results dispatch, payment reminders, and appointment notifications.</p>
                <a
                  href="/whatsapp"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 transition"
                >
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp Hub
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              {[
                { title: "Results Ready Blast", status: "Active", sent: 1200, channel: "WhatsApp + SMS", schedule: "On result approval", color: "emerald" },
                { title: "Payment Due Reminders", status: "Active", sent: 340, channel: "SMS", schedule: "3 days before due", color: "amber" },
                { title: "Appointment Reminders", status: "Paused", sent: 89, channel: "WhatsApp", schedule: "24h before appointment", color: "blue" },
                { title: "Critical Value Escalation", status: "Active", sent: 25, channel: "SMS + Email", schedule: "Immediate", color: "red" },
              ].map((camp) => (
                <div key={camp.title} className="flex items-center gap-4 rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4 hover:border-slate-600/60 transition">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-${camp.color}-500/10 border border-${camp.color}-500/20`}>
                    <Bell className={`h-5 w-5 text-${camp.color}-400`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-white">{camp.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        camp.status === "Active" ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700 text-slate-400"
                      }`}>{camp.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">{camp.channel} · {camp.schedule} · {camp.sent.toLocaleString("en-IN")} sent</p>
                  </div>
                  <button className="rounded-xl border border-slate-700/50 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:border-slate-500 transition">
                    Configure
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
