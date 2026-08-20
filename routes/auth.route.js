const express = require("express");
const router = express.Router();
require("dotenv").config();
const {
  verifyEmail,
  login,
  logout,
  registration,
  verify
} = require("../controllers/user.controller");
const protectedRoute = require("../middlewares/user.route");

router.route("/register").post(registration);
router.route("/verify-email").post(verifyEmail);
router.route("/login").post(login);
router.route("/verify").post(verify);
router.route("/verify").get(protectedRoute, verify);
router.route("/logout").get(protectedRoute, logout);

module.exports = router;
