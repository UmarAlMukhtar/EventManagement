const Registration = require("../models/Registration");

exports.createRegistration = async (req, res) => {
  try {
    const { event_id } = req.body;
    const user_id = req.user.user_id; // From auth middleware

    // Check if user is already registered
    const existingRegistration = await Registration.checkRegistration(
      event_id,
      user_id
    );
    if (existingRegistration) {
      return res
        .status(409)
        .json({ error: "Already registered for this event" });
    }

    const result = await Registration.createRegistration({ event_id, user_id });
    res.status(201).json({
      message: "Registration successful",
      registration_id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const user_id = req.user.user_id; // From auth middleware
    const registrations = await Registration.getRegistrationsByUser(user_id);
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRegistrationsByUser = async (req, res) => {
  try {
    const registrations = await Registration.getRegistrationsByUser(
      req.params.user_id
    );
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRegistrationsByEvent = async (req, res) => {
  try {
    const registrations = await Registration.getRegistrationsByEvent(
      req.params.event_id
    );
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkRegistrationStatus = async (req, res) => {
  try {
    const { event_id } = req.params;
    const user_id = req.user.user_id;

    const registration = await Registration.checkRegistration(
      event_id,
      user_id
    );
    res.json({
      isRegistered: !!registration,
      registration: registration || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRegistration = async (req, res) => {
  try {
    await Registration.updateRegistration(req.params.reg_id, req.body);
    res.json({ message: "Registration updated." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRegistration = async (req, res) => {
  try {
    await Registration.deleteRegistration(req.params.reg_id);
    res.json({ message: "Registration deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
