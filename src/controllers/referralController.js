const doctorService = require('../services/doctorService');

// Get all referral ledger transactions
exports.getReferralLedger = (req, res) => {
  try {
    const { doctorId, payoutStatus } = req.query;
    let ledger = doctorService.getReferralLedger();

    if (doctorId) {
      ledger = ledger.filter(l => l.doctor.doctorId === doctorId);
    }
    if (payoutStatus) {
      ledger = ledger.filter(l => l.payoutStatus.toLowerCase() === payoutStatus.toLowerCase());
    }

    const totalGross = ledger.reduce((sum, item) => sum + item.totalGrossCommission, 0);
    const totalTds = ledger.reduce((sum, item) => sum + item.tdsAmount, 0);
    const totalNet = ledger.reduce((sum, item) => sum + item.netCommissionPayable, 0);

    res.status(200).json({
      success: true,
      count: ledger.length,
      summary: {
        totalGrossCommission: totalGross,
        totalTdsDeducted: totalTds,
        totalNetPayable: totalNet,
        pendingPayoutAmount: ledger.filter(l => l.payoutStatus !== 'Paid & Settled').reduce((sum, i) => sum + i.netCommissionPayable, 0),
        settledPayoutAmount: ledger.filter(l => l.payoutStatus === 'Paid & Settled').reduce((sum, i) => sum + i.netCommissionPayable, 0)
      },
      data: ledger
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Doctor Specific Incentive Ledger Summary
exports.getDoctorIncentives = (req, res) => {
  try {
    const summary = doctorService.getDoctorIncentiveSummary(req.params.doctorId);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Settle / Disburse Referral Commission Payout
exports.settleReferralPayout = (req, res) => {
  try {
    const { transactionId } = req.params;
    const { paymentMode, paymentReferenceNumber, remarks, settledByAdmin } = req.body;

    const settled = doctorService.approveReferralPayout(transactionId, {
      paymentMode,
      paymentReferenceNumber,
      remarks,
      settledByAdmin
    });

    if (!settled) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({
      success: true,
      message: `Commission payout for ${transactionId} settled successfully. UTR: ${settled.settlementDetails.paymentReferenceNumber}`,
      data: settled
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
