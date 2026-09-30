"use client";

import { 
  FileText, 
  ExternalLink, 
  User, 
  Stethoscope, 
  Clock, 
  Plus, 
  ChevronRight,
  Sparkles
} from "lucide-react";

interface RecentOrder {
  id: string;
  orderNumber: string;
  patient: {
    firstName: string;
    lastName: string;
    uhid?: string;
  };
  doctor?: {
    fullName: string;
  };
  orderStatus: string;
  priority?: "STAT" | "URGENT" | "ROUTINE";
  createdAt: string;
}

interface RecentOrdersProps {
  orders: RecentOrder[] | any;
  loading?: boolean;
}

export default function RecentOrders({ orders, loading = false }: RecentOrdersProps) {
  const ordersArray: RecentOrder[] = Array.isArray(orders) 
    ? orders 
    : (orders?.orders || orders?.data || []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REGISTERED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Registered</span>;
      case "SAMPLE_COLLECTED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">Collected</span>;
      case "PROCESSING":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Processing</span>;
      case "COMPLETED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case "CANCELLED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="luxury-glass-card flex flex-col justify-between h-full">
      <div>
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
                Live Workorders Stream
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                  {ordersArray.length} Orders Listed
                </span>
              </h3>
              <p className="text-xs text-slate-500">Real-time diagnostic requisition queue & processing stage</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/orders/new"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-700 hover:bg-sky-500/20 text-xs font-semibold transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> New Order
            </a>
            <a
              href="/orders"
              className="text-xs font-semibold text-slate-600 hover:text-sky-600 flex items-center gap-1 transition-colors px-2 py-1"
            >
              View All <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : ordersArray.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xs text-slate-500">No recent orders registered today</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Referral Doctor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Received Time</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {ordersArray.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => (window.location.href = `/orders/${order.id}`)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                      {order.orderNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {order.patient?.firstName} {order.patient?.lastName}
                      </div>
                      {order.patient?.uhid && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          UHID: {order.patient.uhid}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {order.doctor?.fullName ? (
                        <span className="flex items-center gap-1">
                          <Stethoscope className="h-3 w-3 text-sky-600" />
                          {order.doctor.fullName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Self / Walk-in</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(order.orderStatus)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 group-hover:text-sky-700">
                        View <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Click any row to open patient workorder details</span>
        <a href="/orders" className="text-sky-600 font-semibold hover:underline">
          Go to Order Management &rarr;
        </a>
      </div>
    </div>
  );
}