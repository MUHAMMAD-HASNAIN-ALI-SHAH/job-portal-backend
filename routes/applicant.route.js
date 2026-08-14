const express = require("express");
const router = express.Router();
require("dotenv").config();
const protectedRoute = require("../middlewares/verify.route");
const { getApplicantDetails, editApplicantDetails } = require("../controllers/applicant.controller");

router.route("/").get(protectedRoute, getApplicantDetails);
router.route("/").put(protectedRoute, editApplicantDetails);

module.exports = router;
