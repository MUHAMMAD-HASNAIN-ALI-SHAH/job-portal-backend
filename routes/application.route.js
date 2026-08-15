const express = require("express");
const router = express.Router();
require("dotenv").config();
const protectedRoute = require("../middlewares/verify.route");
const { applyJob, getCompanyApplications, updateStatus, getUserApplications } = require("../controllers/application.controller");

router.route("/").post(protectedRoute, applyJob);
router.route("/company").get(protectedRoute, getCompanyApplications);
router.route("/status").put(protectedRoute, updateStatus);
router.route("/applicant").get(protectedRoute, getUserApplications);

module.exports = router;
