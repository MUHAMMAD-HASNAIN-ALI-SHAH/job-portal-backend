const Applicant = require("../models/applicant.model");
const Application = require("../models/application.model");
const Job = require("../models/job.model");
const Resume = require("../models/resumes.model");

const applyJob = async (req, res) => {
    try {
        const userId = req.user._id;
        const { jobId, coverLetter, resume: resumeBase64, fileName, expectedSalary, noticePeriod } = req.body;

        // Validation
        if (!jobId || !coverLetter || expectedSalary === undefined || noticePeriod === undefined) {
            return res.status(400).json({ message: "All fields are required." });
        }
        if (coverLetter.length < 10) {
            return res.status(400).json({ message: "Cover letter must be at least 10 characters long." });
        }
        if (expectedSalary < 0) {
            return res.status(400).json({ message: "Expected salary must be a positive number." });
        }
        if (noticePeriod < 0) {
            return res.status(400).json({ message: "Notice period must be a positive number." });
        }

        // Check if the user is an applicant
        const applicant = await Applicant.findOne({ userId });
        if (!applicant) {
            return res.status(403).json({ message: "Only applicants can apply for jobs." });
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found." });
        }

        // Check if the applicant has already applied for the job
        const existingApplication = await Application.findOne({ applicantId: applicant._id, jobId: jobId });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this job." });
        }

        // Resolve the resume to attach to this application
        let getResume = await Resume.findOne({ applicantId: applicant._id });

        if (!getResume && !resumeBase64) {
            return res.status(404).json({ message: "Resume not found. Please upload your resume before applying." });
        }

        if (resumeBase64) {
            if (getResume) {
                getResume = await Resume.findByIdAndUpdate(
                    getResume._id,
                    { fileName, file: resumeBase64 },
                    { new: true }
                );
            } else {
                getResume = await Resume.create({
                    applicantId: applicant._id,
                    fileName,
                    file: resumeBase64,
                });
            }
        }

        // Create a new application
        const application = new Application({
            applicantId: applicant._id,
            jobId,
            coverLetter,
            resumeId: getResume._id,
            expectedSalary,
            noticePeriod,
        });

        job.applicantsCount += 1;
        await job.save();
        await application.save();

        res.status(201).json({ message: "Application submitted successfully.", application });
    } catch (error) {
        console.error("Error applying for job:", error);
        res.status(500).json({ message: "Server error." });
    }
};

module.exports = {
    applyJob,
};
