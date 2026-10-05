const express = require('express');
const cors = require('cors');
const path = require('path');
const doctorRoutes = require('./src/routes/doctorRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/v1/doctor-module', doctorRoutes);

// System Health & Module Info
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    system: 'LabCore ELIS & Hospital Information System',
    module: 'Doctor & Pathologist Advanced Portal',
    version: '2.5.0-PRO'
  });
});

// Fallback to frontend index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 LabCore ELIS Doctor Module Backend Server Running!`);
    console.log(`🌐 Clinical Portal: http://localhost:${PORT}`);
    console.log(`🩺 API Base: http://localhost:${PORT}/api/v1/doctor-module`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
