const express = require("express");
const router = express.Router();
require("dotenv").config();
const protectedRoute = require("../middlewares/user.route");
const { getApplicantDetails, editApplicantDetails, uploadResume, deleteResume } = require("../controllers/applicant.controller");

router.route("/").get(protectedRoute, getApplicantDetails);
router.route("/").put(protectedRoute, editApplicantDetails);
router.route("/resume").put(protectedRoute, uploadResume);
router.route("/resume").delete(protectedRoute, deleteResume);

module.exports = router;
