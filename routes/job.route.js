const express = require("express");
const router = express.Router();
require("dotenv").config();
const protectedRoute = require("../middlewares/verify.route");
const { createJob, getJobs, editJob, deleteJob, getAllJobs, getJobDetails } = require("../controllers/job.controller");

router.route("/").post(protectedRoute, createJob);
router.route("/").get(protectedRoute, getJobs);
router.route("/:id").put(protectedRoute, editJob);
router.route("/:id").delete(protectedRoute, deleteJob);

router.route("/all").get(getAllJobs);
router.route("/:id").get(protectedRoute, getJobDetails);

module.exports = router;
