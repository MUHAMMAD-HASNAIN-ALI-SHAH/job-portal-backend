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
        resume: {
            type: String,
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
        interviewDate: {
            type: Date,
            default: null,
        },
        interviewTime: {
            type: String,
            default: null,
        },
        interviewMode: {
            type: String,
            enum: ["in-person", "online", "phone"],
            default: null,
        },
        zoomLink: {
            type: String,
            default: null,
        },
        interviewLocation: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
