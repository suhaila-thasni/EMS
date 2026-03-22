import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

// Initialize Database Tables
import "./utils/db-init";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((req, res, next) => {
  console.log(`[SERVER] ${req.method} ${req.path}`);
  next();
});

// INCREASED LIMIT FOR BASE64 IMAGES
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
import authRoutes from "./routes/authRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import jobRoutes from "./routes/jobRoutes";
import messageRoutes from "./routes/messageRoutes";
import activityRoutes from "./routes/activityRoutes";

// Basic Health Check Route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "EMS Backend Server is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/activity", activityRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("<h1>EMS Backend API</h1><p>The server is operational.</p>");
});

// Global error handler MUST be after all routes
app.use((err: any, req: any, res: any, next: any) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: "Payload too large. Please use a smaller image." });
  }
  if (err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: "Invalid JSON payload" });
  }
  console.error('[SERVER] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
  🚀 Server Running!
  ------------------
  📡 Status: Healthy
  🔗 URL: http://localhost:${PORT}
  📅 Date: ${new Date().toLocaleString()}
  ------------------
  `);
});
