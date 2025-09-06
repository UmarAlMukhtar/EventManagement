const Registration = require("../models/Registration");

exports.createRegistration = async (req, res) => {
  try {
    await Registration.createRegistration(req.body);
    res.status(201).json({ message: "Registration created." });
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
