const express = require("express");
const app = express();
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
// const authRoutes = require("./routes/authRoutes");

// Middleware
app.use(express.json());

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
// app.use("/api/auth", authRoutes);

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
