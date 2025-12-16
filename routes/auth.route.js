const express = require("express");
const router = express.Router();
require("dotenv").config();
const {
  verifyEmail,
  login,
  verify,
  logout,
  applicantRegistration,
  recruiterRegistration,
} = require("../controllers/auth.controller");
const verifyUser = require("../middlewares/verify.route");

router.route("/applicant-registration").post(applicantRegistration);
router.route("/recruiter-registration").post(recruiterRegistration);
router.route("/verify-email").post(verifyEmail);
router.route("/login").post(login);
router.route("/verify").get(verifyUser, verify);
router.route("/logout").get(verifyUser, logout);

module.exports = router;
