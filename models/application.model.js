const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        applicantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Applicant",
            required: true,
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        status: {
            type: String,
            enum: ["applied", "shortlisted", "rejected", "hired"],
            default: "applied",
        },
        resumeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resume",
            required: true,
        },
        coverLetter: {
            type: String,
            required: true,
        },
        noticePeriod: {
            type: Number,
            required: true,
        },
        expectedSalary: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
