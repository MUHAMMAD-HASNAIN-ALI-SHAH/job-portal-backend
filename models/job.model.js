const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    requirements: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      enum: ["Internship", "Entry", "Mid", "Senior", "Lead"],
      default: "Entry",
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    salary: {
      type: String,
      default: "",
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Freelance", "Temporary"],
      default: "Full-time",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicationDeadline: {
      type: Date,
      default: null,
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    views: {
      type: Number,
      default: 0,
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("job", jobSchema);

module.exports = Job;
