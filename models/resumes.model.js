const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
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
    embedding: {
      type: [Number],
      default: [],
      select: false,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
);

const Resume = mongoose.model("Resume", resumeSchema);

module.exports = Resume;
