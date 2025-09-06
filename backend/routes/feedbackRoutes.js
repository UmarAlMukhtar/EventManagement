const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  getFeedbackByReg,
  getFeedbackByEvent,
  getFeedbackByUser,
} = require("../controllers/feedbackController");

router.post("/", submitFeedback);
router.get("/registration/:reg_id", getFeedbackByReg);
router.get("/event/:event_id", getFeedbackByEvent);
router.get("/user/:user_id", getFeedbackByUser);

module.exports = router;
