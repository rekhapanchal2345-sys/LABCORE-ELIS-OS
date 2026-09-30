"use client";

import { useState } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { BarChart3, TrendingUp, Sparkles, Layers } from "lucide-react";

interface TestItem {
  testName: string;
  testCode: string;
  category: string;
  count: number;
}

interface WorkloadChartsProps {
  orderTrends?: Array<{ date: string; count: number }>;
  topTests?: TestItem[];
  loading?: boolean;
}

export default function WorkloadCharts({
  orderTrends,
  topTests,
  loading = false,
}: WorkloadChartsProps) {
  const [chartView, setChartView] = useState<"trend" | "panels">("trend");

  // Fallback demo trends if backend raw query has limited points
  const trendData = orderTrends && orderTrends.length > 0
    ? orderTrends.map(item => ({
        date: new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        orders: Number(item.count) || 0,
      }))
    : [
        { date: "07 Sep", orders: 18 },
        { date: "08 Sep", orders: 24 },
        { date: "09 Sep", orders: 29 },
        { date: "10 Sep", orders: 35 },
        { date: "11 Sep", orders: 31 },
        { date: "12 Sep", orders: 42 },
        { date: "Today", orders: 28 },
      ];

  const panelData = topTests && topTests.length > 0
    ? topTests.slice(0, 5).map(t => ({
        name: t.testCode || t.testName.substring(0, 10),
        full: t.testName,
        count: t.count,
      }))
    : [
        { name: "CBC", full: "Complete Blood Count", count: 48 },
        { name: "LIPID", full: "Lipid Profile (Cholesterol)", count: 32 },
        { name: "LFT", full: "Liver Function Test", count: 26 },
        { name: "HBA1C", full: "Glycated Hemoglobin", count: 22 },
        { name: "TSH", full: "Thyroid Stimulating Hormone", count: 18 },
      ];

  return (
    <div className="luxury-glass-card p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
                Workload & Volume Trends
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                  Analytics
                </span>
              </h3>
              <p className="text-xs text-slate-500">Diagnostic volume velocity and high-demand test panels</p>
            </div>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/60 self-start sm:self-auto text-xs">
            <button
              onClick={() => setChartView("trend")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                chartView === "trend"
                  ? "bg-white text-sky-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Order Trend
            </button>
            <button
              onClick={() => setChartView("panels")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                chartView === "panels"
                  ? "bg-white text-sky-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Top Tests
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="mt-4 h-64 w-full">
          {chartView === "trend" ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={{ stroke: '#e2e8f0' }} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 500,
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  name="Orders" 
                  stroke="#0284c7" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#orderGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={panelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={{ stroke: '#e2e8f0' }} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                />
                <Tooltip 
                  formatter={(val: any, name: any, item: any) => [val, item?.payload?.full || name]}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 500,
                  }} 
                />
                <Bar 
                  dataKey="count" 
                  name="Test Count" 
                  fill="#0284c7" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1 text-slate-700 font-medium">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          Volume peak: 09:00 AM - 12:30 PM
        </span>
        <a href="/tests" className="text-sky-600 font-semibold hover:underline">
          View Test Catalog &rarr;
        </a>
      </div>
    </div>
  );
}
