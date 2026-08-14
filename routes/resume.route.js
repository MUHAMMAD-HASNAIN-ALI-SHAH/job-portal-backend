const express = require("express");
const router = express.Router();
require("dotenv").config();
const protectedRoute = require("../middlewares/verify.route");
const { uploadResume, getResume } = require("../controllers/resume.controller");

router.route("/").post(protectedRoute, uploadResume);
router.route("/").get(protectedRoute, getResume);

module.exports = router;
