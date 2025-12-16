const express = require("express");
const router = express.Router();
require("dotenv").config();
const verifyUser = require("../middlewares/verify.route");
const { uploadApplicantResume, getApplicantDetails, getUserResume } = require("../controllers/applicant.controller");

router.route("/").get(verifyUser, getApplicantDetails);
router.route("/resume").post(verifyUser, uploadApplicantResume);
router.route("/resume").get(verifyUser, getUserResume);

module.exports = router;
