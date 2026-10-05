const doctorService = require('../services/doctorService');

// Get all reports in verification queue (Pending, Panic, Approved)
exports.getVerificationQueue = (req, res) => {
  try {
    const { status, panicOnly, department } = req.query;
    let reports = doctorService.getPendingReports();

    if (status) {
      reports = reports.filter(r => r.status.toLowerCase().includes(status.toLowerCase()));
    }
    if (panicOnly === 'true') {
      reports = reports.filter(r => r.panicAlertAudit && r.panicAlertAudit.isPanicReport);
    }
    if (department) {
      reports = reports.filter(r => r.department.toLowerCase().includes(department.toLowerCase()));
    }

    // Critical panic reports prioritized on top
    reports.sort((a, b) => {
      const aPanic = a.panicAlertAudit?.isPanicReport ? 1 : 0;
      const bPanic = b.panicAlertAudit?.isPanicReport ? 1 : 0;
      return bPanic - aPanic;
    });

    res.status(200).json({
      success: true,
      totalCount: reports.length,
      panicCount: reports.filter(r => r.panicAlertAudit?.isPanicReport).length,
      pendingCount: reports.filter(r => r.status.includes('Pending')).length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single report for detailed review with Delta check history
exports.getReportDetail = (req, res) => {
  try {
    const report = doctorService.getReportById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sign-off & Authorize Report (Embeds Pathologist digital signature and remarks)
exports.signOffReport = (req, res) => {
  try {
    const { reportId } = req.params;
    const { doctorId, doctorName, designation, medicalRegNo, doctorRemarks } = req.body;

    const approvedReport = doctorService.signOffReport(reportId, {
      doctorId,
      doctorName,
      designation,
      medicalRegNo,
      doctorRemarks
    });

    if (!approvedReport) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.status(200).json({
      success: true,
      message: `Report ${reportId} has been digitally signed and authorized. Released for patient download/print.`,
      data: approvedReport
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Order re-run / redraw if results conflict with clinical presentation
exports.orderReRun = (req, res) => {
  try {
    const { reportId } = req.params;
    const { reason, doctorName } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: "Please specify reason for test re-run/redraw" });
    }

    const updated = doctorService.triggerReTest(reportId, reason, doctorName);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.status(200).json({
      success: true,
      message: `Re-run order issued for ${reportId}. Lab technician alerted.`,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
