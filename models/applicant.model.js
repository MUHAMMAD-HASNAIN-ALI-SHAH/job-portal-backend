const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
    },
    headLine: {
      type: String,
    },
    bio: {
      type: String,
    },
    yearsOfExperience: {
      type: Number,
    },
    skills: {
      type: [String],
    },
    education: [
      {
        degree: String,
        institution: String,
        yearOfCompletion: Number,
      },
    ],
    preferredJobTypes: {
      type: [String],
    },
    expectedSalary: {
      type: Number,
    },
    noticePeriod: {
      type: Number,
    },
    profileCompleteness: {
      type: Number,
      default: 0,
    },
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
  },
  { timestamps: true }
);

const Applicant = mongoose.model("Applicant", applicantSchema);

module.exports = Applicant;
