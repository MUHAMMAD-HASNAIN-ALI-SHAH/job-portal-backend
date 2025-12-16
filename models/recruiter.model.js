const mongoose = require("mongoose");

const recruiterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyLogo: {
      type: String,
      default: "",
      trim: true,
    },
    companyWebsite: {
      type: String,
      default: "",
      trim: true,
    },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
      trim: true,
    },
    industry: {
      type: String,
      enum: [
        "Technology",
        "Finance",
        "Healthcare",
        "Education",
        "Retail",
        "Manufacturing",
        "Other",
      ],
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    jobPosts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "job" }
    ],
  },
  { timestamps: true }
);

const Recruiter = mongoose.model("Recruiter", recruiterSchema);

module.exports = Recruiter;
