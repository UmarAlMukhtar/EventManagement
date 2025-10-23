const EventCoordinator = require("../models/EventCoordinator");
const Event = require("../models/Event");

exports.addCoordinator = async (req, res) => {
  try {
    const { event_id, coordinator_id } = req.body;
    const user_id = req.user.user_id; // From auth middleware

    if (!event_id || !coordinator_id) {
      return res
        .status(400)
        .json({ error: "Event ID and coordinator ID are required" });
    }

    // Check if user is the main coordinator or admin
    const [eventRows] = await require("../models/db").query(
      "SELECT coordinator_id FROM events WHERE event_id = ?",
      [event_id]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = eventRows[0];
    if (event.coordinator_id !== user_id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          error: "Only the main coordinator can add other coordinators",
        });
    }

    // Check if coordinator exists
    const [userRows] = await require("../models/db").query(
      "SELECT user_id FROM users WHERE user_id = ? AND role IN ('coordinator', 'admin')",
      [coordinator_id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Coordinator not found" });
    }

    // Check if already added
    const isAlreadyAdded = await EventCoordinator.checkCoordinator(
      event_id,
      coordinator_id
    );
    if (isAlreadyAdded) {
      return res
        .status(409)
        .json({ error: "This coordinator is already assigned to this event" });
    }

    await EventCoordinator.addCoordinator(event_id, coordinator_id);
    res.status(201).json({ message: "Coordinator added successfully" });
  } catch (err) {
    console.error("Add coordinator error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.removeCoordinator = async (req, res) => {
  try {
    const { event_id, coordinator_id } = req.body;
    const user_id = req.user.user_id; // From auth middleware

    if (!event_id || !coordinator_id) {
      return res
        .status(400)
        .json({ error: "Event ID and coordinator ID are required" });
    }

    // Check if user is the main coordinator or admin
    const [eventRows] = await require("../models/db").query(
      "SELECT coordinator_id FROM events WHERE event_id = ?",
      [event_id]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = eventRows[0];
    if (event.coordinator_id !== user_id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          error: "Only the main coordinator can remove other coordinators",
        });
    }

    await EventCoordinator.removeCoordinator(event_id, coordinator_id);
    res.status(200).json({ message: "Coordinator removed successfully" });
  } catch (err) {
    console.error("Remove coordinator error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getEventCoordinators = async (req, res) => {
  try {
    const { event_id } = req.params;
    const coordinators = await EventCoordinator.getEventCoordinators(event_id);
    res.json(coordinators);
  } catch (err) {
    console.error("Get coordinators error:", err);
    res.status(500).json({ error: err.message });
  }
};
