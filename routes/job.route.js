const express = require("express");
const router = express.Router();
require("dotenv").config();
const protectedRoute = require("../middlewares/user.route");
const { createJob, getJobs, editJob, deleteJob, getAllJobs, getJobDetails } = require("../controllers/job.controller");
const { addJobValidator, editJobValidator } = require("../validators/job.validator");

// company routes
router.route("/").post(protectedRoute, addJobValidator, createJob);
router.route("/").get(protectedRoute, getJobs);
router.route("/:id").put(protectedRoute, editJobValidator, editJob);
router.route("/:id").delete(protectedRoute, deleteJob);

// public routes
router.route("/all").get(getAllJobs);
router.route("/:id").get(getJobDetails);

module.exports = router;
