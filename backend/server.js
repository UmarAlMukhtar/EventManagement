const express = require("express");
const app = express();

const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");


// Middleware
app.use(express.json());

// Welcome route
app.get("/", async (req, res) => {
res.json("Welcome to the Event Management System API");
});

// Routes
app.use("/users", userRoutes);
app.use("/events", eventRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/registrations", registrationRoutes);
app.use("/feedback", feedbackRoutes);

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
