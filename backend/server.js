require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/authMiddleware");

const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const alertRoutes = require("./routes/alertRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const reportRoutes = require("./routes/reportRoutes");

const app = express();
const PORT = process.env.PORT || 5000;


const rawOrigins = process.env.CORS_ORIGIN || "*";
const corsOrigins = rawOrigins.split(",").map((origin) => origin.trim()).filter(Boolean);
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
app.use(express.json());

// Serve frontend static files
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/reports", reportRoutes);

// SPA fallback: serve index.html for all non-API routes
app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));

app.use(errorHandler);

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Zargo backend listening on :${PORT}`));
  } catch (e) {
    console.error("Failed to start server:", e.message);
    process.exit(1);
  }
})();
