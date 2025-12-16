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
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

module.exports = Resume;
