const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Applicant",
      required: true,
      unique: true,
    },
    resumeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    parsedResumeText: {
      type: Object,
      default: {},
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
);

const Resume = mongoose.model("Resume", resumeSchema);

module.exports = Resume;
