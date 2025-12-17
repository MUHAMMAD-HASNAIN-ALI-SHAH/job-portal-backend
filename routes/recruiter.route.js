const express = require("express");
const router = express.Router();
require("dotenv").config();
const verifyUser = require("../middlewares/verify.route");
const { getRecruiterDetails } = require("../controllers/recruiter.controller");

router.route("/").get(verifyUser, getRecruiterDetails);
router.route("/").put(verifyUser, getRecruiterDetails);

module.exports = router;
