const express = require("express");
const router = express.Router();
require("dotenv").config();
const protectedRoute = require("../middlewares/verify.route");
const { uploadResume, getResume, deleteResume } = require("../controllers/resume.controller");

router.route("/").put(protectedRoute, uploadResume);
router.route("/").get(protectedRoute, getResume);
router.route("/").delete(protectedRoute, deleteResume);

module.exports = router;
