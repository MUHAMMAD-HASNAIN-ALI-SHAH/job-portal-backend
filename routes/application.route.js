const express = require("express");
const router = express.Router();
require("dotenv").config();
const protectedRoute = require("../middlewares/user.route");
const { applyJob, getCompanyApplications, updateStatus, getUserApplications, getCompanyShortlistedApplicationsCount } = require("../controllers/application.controller");
const { applyJobValidator } = require("../validators/applications.validator");

router.route("/").post(protectedRoute, applyJobValidator, applyJob);
router.route("/company").get(protectedRoute, getCompanyApplications);
router.route("/status").put(protectedRoute, updateStatus);
router.route("/applicant").get(protectedRoute, getUserApplications);
router.route("/company/shortlisted/count").get(protectedRoute, getCompanyShortlistedApplicationsCount);

module.exports = router;
