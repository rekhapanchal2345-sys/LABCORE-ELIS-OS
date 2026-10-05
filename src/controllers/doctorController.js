const doctorService = require('../services/doctorService');

// Fetch all doctors with optional filters
exports.getDoctors = (req, res) => {
  try {
    const { department, doctorType, status, search } = req.query;
    let doctors = doctorService.getAllDoctors();

    if (department) {
      doctors = doctors.filter(d => d.department.toLowerCase() === department.toLowerCase());
    }
    if (doctorType) {
      doctors = doctors.filter(d => d.doctorType.toLowerCase() === doctorType.toLowerCase());
    }
    if (status) {
      doctors = doctors.filter(d => d.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      doctors = doctors.filter(d =>
        d.fullName.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.medicalCouncilRegNo.toLowerCase().includes(q) ||
        d.doctorCode.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single doctor details with availability & metrics
exports.getDoctorById = (req, res) => {
  try {
    const doctor = doctorService.getDoctorById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register new doctor / referring partner
exports.createDoctor = (req, res) => {
  try {
    const { fullName, specialization, department, qualification, medicalCouncilRegNo, contact, doctorType } = req.body;

    if (!fullName || !specialization || !medicalCouncilRegNo) {
      return res.status(400).json({
        success: false,
        message: "Full Name, Specialization, and Medical Council Registration Number are required."
      });
    }

    const newDoctor = doctorService.addDoctor(req.body);
    res.status(201).json({
      success: true,
      message: "Doctor registered successfully",
      data: newDoctor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Doctor profile or OPD slot schedule
exports.updateDoctor = (req, res) => {
  try {
    const updated = doctorService.updateDoctor(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
