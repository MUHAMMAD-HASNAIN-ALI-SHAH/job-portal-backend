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
    phone: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Applicant = mongoose.model("Applicant", applicantSchema);

module.exports = Applicant;
