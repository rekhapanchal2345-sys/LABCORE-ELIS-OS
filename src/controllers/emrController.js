const doctorService = require('../services/doctorService');

// Get longitudinal patient EMR & historical lab parameter trends
exports.getPatientEMR = (req, res) => {
  try {
    const { uhid } = req.params;
    const emr = doctorService.getPatientEMR(uhid);

    if (!emr) {
      return res.status(404).json({
        success: false,
        message: `EMR records for UHID ${uhid} not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: emr
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get list of all patient EMRs
exports.getAllEMRs = (req, res) => {
  try {
    const emrs = doctorService.getAllPatientEMRs();
    res.status(200).json({
      success: true,
      count: emrs.length,
      data: emrs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
