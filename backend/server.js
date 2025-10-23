const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// Load environment variables from .env file
require("dotenv").config({ path: path.join(__dirname, ".env") });

const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const authRoutes = require("./routes/authRoutes");

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server default port
    credentials: true,
  })
);
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  next();
});

// Welcome route
app.get("/", async (req, res) => {
  res.json("Welcome to the Event Management System API");
});

app.get("/api", async (req, res) => {
  res.json("Welcome to the Event Management System API");
});

app.get("/api/status", async (req, res) => {
  res.json({ status: "API is running", timestamp: new Date() });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

// 404 handler
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ error: "Not Found" });
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
