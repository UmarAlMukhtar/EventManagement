const express = require("express");
const router = express.Router();
const {
  createRegistration,
  getRegistrationsByUser,
  getRegistrationsByEvent,
  updateRegistration,
  deleteRegistration,
} = require("../controllers/registrationController");

router.post("/", createRegistration);
router.get("/user/:user_id", getRegistrationsByUser);
router.get("/event/:event_id", getRegistrationsByEvent);
router.put("/:reg_id", updateRegistration);
router.delete("/:reg_id", deleteRegistration);

module.exports = router;
