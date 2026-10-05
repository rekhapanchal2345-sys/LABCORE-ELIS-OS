import React from 'react';
import { ReferralTransaction } from '../../types/doctor.types';

interface Props {
  referrals: ReferralTransaction[];
  stats: {
    totalGrossReferral: number;
    totalTdsDeductions: number;
    totalReferralPayout: number;
    pendingPayoutAmount: number;
  };
  onSettlePayout: (transactionId: string, utr: string) => Promise<any>;
}

export const ReferralLedgerView: React.FC<Props> = ({
  referrals,
  stats,
  onSettlePayout
}) => {
  const handleSettle = async (transactionId: string) => {
    const utr = prompt(`Enter Bank UTR / Reference No. for ${transactionId}:`, `UTR-HDFC${Math.floor(1000000 + Math.random() * 9000000)}`);
    if (!utr) return;
    await onSettlePayout(transactionId, utr);
  };

  return (
    <div className="space-y-5 text-xs">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-slate-400">Gross Referral Commission</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            ₹{stats.totalGrossReferral.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-rose-300">TDS Deductions (10% Sec 194J)</div>
          <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">
            ₹{stats.totalTdsDeductions.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-emerald-400">Net Payable Commission</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            ₹{stats.totalReferralPayout.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-amber-300">Pending Settlement</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
            ₹{stats.pendingPayoutAmount.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <i className="fa-solid fa-receipt text-emerald-400"></i>
            <span>Referring Doctor Payout Ledger & Disbursements</span>
          </h3>
          <span className="text-slate-400 text-[11px]">Real-Time Department-Wise Commission Engine</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction / Bill</th>
                <th className="py-3 px-4">Doctor & Clinic</th>
                <th className="py-3 px-4">Patient Details</th>
                <th className="py-3 px-4">Tests & Commission Rate</th>
                <th className="py-3 px-4">Financials (TDS 10%)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {referrals.map(t => {
                const isSettled = t.payoutStatus === 'Paid & Settled';
                return (
                  <tr key={t.transactionId} className="hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-sky-400 font-bold">{t.transactionId}</div>
                      <div className="text-[11px] text-slate-400">
                        {t.billDetails.billNumber} • {new Date(t.billDetails.billDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{t.doctor.doctorName}</div>
                      <div className="text-[11px] text-slate-400">{t.doctor.clinicName || 'Consultant'} • PAN: {t.doctor.panNumber || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">
                        {t.billDetails.patientName}{' '}
                        <span className="text-slate-400 font-mono">({t.billDetails.patientUhid})</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Bill: ₹{t.billDetails.netPayableAmount.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300">
                        {t.testBreakdown.map(tb => `${tb.testName} (${tb.commissionPercentage}%)`).join(', ')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-slate-300">Gross: ₹{t.totalGrossCommission}</div>
                      <div className="text-rose-400 text-[11px]">TDS: -₹{t.tdsAmount}</div>
                      <div className="text-emerald-400 font-bold">Net: ₹{t.netCommissionPayable}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-semibold inline-block ${
                          isSettled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {t.payoutStatus}
                      </span>
                      {isSettled && (
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          {t.settlementDetails?.paymentReferenceNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!isSettled ? (
                        <button
                          onClick={() => handleSettle(t.transactionId)}
                          className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white rounded-lg font-semibold transition"
                        >
                          <i className="fa-solid fa-money-bill-transfer mr-1"></i> Settle Payout
                        </button>
                      ) : (
                        <span className="text-slate-500 font-semibold">
                          <i className="fa-solid fa-circle-check text-emerald-400 mr-1"></i> Disbursed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
