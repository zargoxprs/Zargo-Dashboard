require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/authMiddleware");

const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const alertRoutes = require("./routes/alertRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const leadRoutes = require("./routes/leadRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
const rawOrigins = process.env.CORS_ORIGIN || "*";
const corsOrigins = rawOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin:
    corsOrigins.length === 1 && corsOrigins[0] === "*"
      ? true
      : corsOrigins.length === 1
      ? corsOrigins[0]
      : corsOrigins,
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    ts: Date.now(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/lead", leadRoutes);
app.use("/api/reports", reportRoutes);

// Error handler
app.use(errorHandler);

// Start server
(async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Zargo backend listening on :${PORT}`);
    });
  } catch (e) {
    console.error("Failed to start server:", e.message);
    process.exit(1);
  }
})();