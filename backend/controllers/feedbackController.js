const Feedback = require("../models/Feedback");

exports.submitFeedback = async (req, res) => {
  try {
    await Feedback.submitFeedback(req.body);
    res.status(201).json({ message: "Feedback submitted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeedbackByReg = async (req, res) => {
  try {
    const feedback = await Feedback.getFeedbackByReg(req.params.reg_id);
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeedbackByEvent = async (req, res) => {
  try {
    const feedback = await Feedback.getFeedbackByEvent(req.params.event_id);
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeedbackByUser = async (req, res) => {
  try {
    const feedback = await Feedback.getFeedbackByUser(req.params.user_id);
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
