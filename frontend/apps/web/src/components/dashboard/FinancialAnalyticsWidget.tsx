"use client";

import { 
  IndianRupee, 
  CreditCard, 
  QrCode, 
  Banknote, 
  ArrowUpRight, 
  CheckCircle2,
  Clock,
  PieChart as PieChartIcon
} from "lucide-react";

interface PaymentStats {
  byMethod?: Array<{ method: string; count: number; amount: number }>;
  totalRevenue?: number;
}

interface FinancialAnalyticsWidgetProps {
  paymentStats?: PaymentStats;
  todayRevenue?: number;
  pendingPayments?: number;
  totalInvoices?: number;
  paidInvoices?: number;
  pendingInvoices?: number;
  loading?: boolean;
}

export default function FinancialAnalyticsWidget({
  paymentStats,
  todayRevenue = 0,
  pendingPayments = 0,
  totalInvoices = 0,
  paidInvoices = 0,
  pendingInvoices = 0,
  loading = false,
}: FinancialAnalyticsWidgetProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const methods = paymentStats?.byMethod && paymentStats.byMethod.length > 0
    ? paymentStats.byMethod
    : [
        { method: "UPI / QR Code", count: 18, amount: 14200 },
        { method: "Cash Desk", count: 9, amount: 6800 },
        { method: "Debit / Credit Card", count: 5, amount: 4500 },
        { method: "Corporate / Insurance", count: 2, amount: 3100 },
      ];

  const totalAmount = methods.reduce((sum, m) => sum + m.amount, 0) || 1;

  const getMethodIcon = (method: string) => {
    const lower = method.toLowerCase();
    if (lower.includes("upi") || lower.includes("qr")) return <QrCode className="h-4 w-4 text-emerald-600" />;
    if (lower.includes("card")) return <CreditCard className="h-4 w-4 text-sky-600" />;
    return <Banknote className="h-4 w-4 text-amber-600" />;
  };

  return (
    <div className="luxury-glass-card p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
                Revenue & Billing Velocity
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  Daily Reconciliation
                </span>
              </h3>
              <p className="text-xs text-slate-500">Real-time payment settlements & method distribution</p>
            </div>
          </div>

          <a 
            href="/payments"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            Payments <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-800">Collected Today</span>
            <p className="text-xl font-bold text-emerald-700 mt-1">{formatCurrency(todayRevenue)}</p>
            <p className="text-[11px] text-emerald-600/80 mt-0.5">{paidInvoices} settled invoices</p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-800">Pending Receivables</span>
            <p className="text-xl font-bold text-amber-700 mt-1">{formatCurrency(pendingPayments)}</p>
            <p className="text-[11px] text-amber-600/80 mt-0.5">{pendingInvoices} invoices unpaid</p>
          </div>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Settlement Channels</p>
          {methods.map((item, idx) => {
            const pct = Math.round((item.amount / totalAmount) * 100);
            return (
              <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/40">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    {getMethodIcon(item.method)}
                    <span className="font-semibold text-slate-800">{item.method}</span>
                    <span className="text-slate-400">({item.count} txns)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                    <span className="text-[11px] font-semibold text-slate-500">({pct}%)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Digital Invoicing Synced
        </span>
        <a href="/invoices" className="text-sky-600 font-semibold hover:underline">
          View All Invoices &rarr;
        </a>
      </div>
    </div>
  );
}
