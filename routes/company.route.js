const express = require("express");
const router = express.Router();
require("dotenv").config();
const protectedRoute = require("../middlewares/user.route");
const { getCompanyDetails, updateCompanyDetails } = require("../controllers/company.controller");

router.route("/").get(protectedRoute, getCompanyDetails);
router.route("/").put(protectedRoute, updateCompanyDetails);

module.exports = router;
