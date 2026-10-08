const express = require('express');
const router = express.Router();

const doctorController = require('../controllers/doctorController');
const reportVerificationController = require('../controllers/reportVerificationController');
const prescriptionController = require('../controllers/prescriptionController');
const referralController = require('../controllers/referralController');
const emrController = require('../controllers/emrController');

const { authenticateUser } = require('../middlewares/authMiddleware');

router.use(authenticateUser);

// 1. Doctor Management & Profiles
router.get('/doctors', doctorController.getDoctors);
router.get('/doctors/:id', doctorController.getDoctorById);
router.post('/doctors', doctorController.createDoctor);
router.put('/doctors/:id', doctorController.updateDoctor);

// 2. Pathologist / Diagnostic Report Verification & Authorization
router.get('/reports/verification-queue', reportVerificationController.getVerificationQueue);
router.get('/reports/:reportId', reportVerificationController.getReportDetail);
router.post('/reports/:reportId/sign-off', reportVerificationController.signOffReport);
router.post('/reports/:reportId/re-test', reportVerificationController.orderReRun);

// 3. Digital Prescriptions & CPOE (Test Ordering)
router.get('/prescriptions', prescriptionController.getPrescriptions);
router.get('/prescriptions/:prescriptionNumber', prescriptionController.getPrescriptionByNumber);
router.post('/prescriptions', prescriptionController.createPrescription);

// 4. Referral Partner Accounting & Incentive Payouts
router.get('/referrals/ledger', referralController.getReferralLedger);
router.get('/referrals/doctor/:doctorId', referralController.getDoctorIncentives);
router.post('/referrals/payout/:transactionId/settle', referralController.settleReferralPayout);

// 5. Patient EMR & Longitudinal Lab Trends
router.get('/emr/patients', emrController.getAllEMRs);
router.get('/emr/patient/:uhid', emrController.getPatientEMR);

module.exports = router;
