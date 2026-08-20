const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
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
      required: true,
    },
    salary: {
      type: String,
      default: "",
      trim: true,
      required: true,
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Freelance", "Temporary"],
      default: "Full-time",
    },
    status: {
      type: String,
      enum: ["active", "draft", "closed"],
      default: "active",
    },
    applicationDeadline: {
      type: Date,
      default: null,
      required: true,
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
    embedding: {
      type: [Number],
      default: [],
      select: false,
    },
  },
);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
