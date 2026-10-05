const doctorService = require('../services/doctorService');

// Fetch all prescriptions
exports.getPrescriptions = (req, res) => {
  try {
    const { doctorId, patientUhid, search } = req.query;
    let list = doctorService.getAllPrescriptions();

    if (doctorId) {
      list = list.filter(p => p.doctor.doctorId === doctorId);
    }
    if (patientUhid) {
      list = list.filter(p => p.patient.uhid.toLowerCase() === patientUhid.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.prescriptionNumber.toLowerCase().includes(q) ||
        p.patient.fullName.toLowerCase().includes(q) ||
        p.patient.uhid.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single prescription
exports.getPrescriptionByNumber = (req, res) => {
  try {
    const rx = doctorService.getPrescriptionByNumber(req.params.prescriptionNumber);
    if (!rx) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }
    res.status(200).json({ success: true, data: rx });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new E-Prescription / CPOE Order
exports.createPrescription = (req, res) => {
  try {
    const { doctor, patient, vitals, clinicalSummary, labOrders, medications, adviceAndLifestyle, followUpDate } = req.body;

    if (!doctor || !doctor.doctorId || !patient || !patient.fullName) {
      return res.status(400).json({
        success: false,
        message: "Doctor details and Patient information are required."
      });
    }

    const newRx = doctorService.createPrescription({
      doctor,
      patient,
      vitals: vitals || {},
      clinicalSummary: clinicalSummary || {},
      labOrders: labOrders || [],
      medications: medications || [],
      adviceAndLifestyle: adviceAndLifestyle || "",
      followUpDate: followUpDate || null
    });

    res.status(201).json({
      success: true,
      message: "E-Prescription & Lab Orders created successfully",
      data: newRx
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
