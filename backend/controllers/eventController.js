const Event = require("../models/Event");

exports.createEvent = async (req, res) => {
  try {
    const coordinator_id = req.user.user_id; // Get from JWT token
    await Event.createEvent({ ...req.body, coordinator_id });
    res.status(201).json({ message: "Event created." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.getEvents();
    res.json(events);
  } catch (err) {
    console.error("=== Error in getEvents ===");
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: err.message || "Unknown error occurred" });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found." });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    await Event.updateEvent(req.params.id, req.body);
    res.json({ message: "Event updated." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await Event.deleteEvent(req.params.id);
    res.json({ message: "Event deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEventsByCoordinator = async (req, res) => {
  try {
    const events = await Event.getEventsByCoordinator(req.params.coordinatorId);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
