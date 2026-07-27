require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./src/config/db");
const { apiLimiter, authLimiter } = require("./src/middleware/rateLimiter");

// Import routes
const authRoutes = require("./src/routes/LoginRoute");
const hospitalRoutes = require("./src/routes/hospitalRoutes");
const triageRoutes = require("./src/routes/triageRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const appointmentRoutes = require("./src/routes/appointmentRoutes");
const expenseRoutes = require("./src/routes/expenseRoutes");
const agentRoutes = require("./src/routes/agentRoutes");
const patientRoutes = require("./src/routes/patientRoutes");
const doctorRoutes = require("./src/routes/doctorRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const bedRoutes = require("./src/routes/bedRoutes");

const app = express();

// ==================== MIDDLEWARE ====================

// CORS - Restrict to frontend origin in production
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Hospital-ID"],
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Global rate limiting
app.use("/api/", apiLimiter);

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== ROUTES ====================

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MediHive AI Multi-Tenant Backend Running",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/triage", triageRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/beds", bedRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ==================== START SERVER ====================

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║                                                              ║
  ║     🏥  MediHive AI - Multi-Tenant Hospital System           ║
  ║                                                              ║
  ║     Server Running On Port ${PORT}                            ║
  ║     Environment: ${process.env.NODE_ENV || "development"}                         ║
  ║     MongoDB: ${process.env.MONGODB_URI ? "Connected" : "Not Configured"}                          ║
  ║                                                              ║
  ║     Available Endpoints:                                     ║
  ║     • POST /api/auth/register-superadmin                     ║
  ║     • POST /api/auth/login                                   ║
  ║     • GET  /api/hospitals                                    ║
  ║     • GET  /api/patients                                     ║
  ║     • GET  /api/doctors                                      ║
  ║     • POST /api/appointments/book                            ║
  ║     • POST /api/triage                                       ║
  ║     • POST /api/agent/chat                                   ║
  ║     • GET  /api/analytics/dashboard                          ║
  ║     • GET  /api/beds                                         ║
  ║                                                              ║
  ╚══════════════════════════════════════════════════════════════╝
  `);
});
