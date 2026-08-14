const express = require("express");
const router = express.Router();
require("dotenv").config();
const protectedRoute = require("../middlewares/verify.route");
const { applyJob } = require("../controllers/application.controller");

router.route("/").post(protectedRoute, applyJob);

module.exports = router;
