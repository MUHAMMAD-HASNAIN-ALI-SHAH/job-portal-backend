const Applicant = require("../models/applicant.model");
const Application = require("../models/application.model");
const Job = require("../models/job.model");
const Resume = require("../models/resumes.model");
const Company = require("../models/company.model");

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

const getCompanyApplications = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if the user is a company
        const company = await Company.findOne({ user: userId });
        if (!company) {
            return res.status(403).json({ message: "Only companies can view applications." });
        }

        // Fetch all applications for jobs posted by this company
        const jobs = await Job.find({ companyId: company._id });
        const jobIds = jobs.map(job => job._id);

        const applications = await Application.find({ jobId: { $in: jobIds } })
            .populate('applicantId', 'fullName')
            .populate('jobId', 'title')
            .populate('resumeId', 'fileName resumeUrl');

        res.status(200).json(applications);
    } catch (error) {
        console.error("Error fetching company applications:", error);
        res.status(500).json({ message: "Server error." });
    }
};

const updateStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const { applicationId, status, interviewMode, interviewLocation, interviewDate, interviewTime, zoomLink } = req.body;

        // Check if the user is a company
        const company = await Company.findOne({ user: userId });
        if (!company) {
            return res.status(403).json({ message: "Only companies can update application status." });
        }

        // Check if the application exists
        const application = await Application.findById(applicationId).populate('jobId');
        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }

        // Check if the job belongs to the company
        if (application.jobId.companyId.toString() !== company._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this application." });
        }

        // check weather the status is valid
        const validStatuses = ["shortlisted", "rejected", "hired"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status." });
        }

        // check weather the user is already hired or rejected
        if (application.status === "hired" || application.status === "rejected") {
            return res.status(400).json({ message: `Cannot update status. The applicant has already been ${application.status}.` });
        }

        // if the status is shortlisted then the interview details are required
        if (status === "shortlisted") {
            if (!interviewMode || !interviewDate || !interviewTime) {
                return res.status(400).json({ message: "Interview mode, date, and time are required for shortlisted applications." });
            }
            if (interviewMode === "online" && !zoomLink) {
                return res.status(400).json({ message: "Zoom link is required for online interviews." });
            }
            if (interviewMode === "in-person" && !interviewLocation) {
                return res.status(400).json({ message: "Interview location is required for in-person interviews." });
            }
        }

        // Update the application status
        application.status = status;
        application.interviewMode = interviewMode || null;
        application.interviewLocation = interviewLocation || null;
        application.interviewDate = interviewDate || null;
        application.interviewTime = interviewTime || null;
        application.zoomLink = zoomLink || null;

        await application.save();
        res.status(200).json(application);
    } catch (error) {
        console.error("Error updating application status:", error);
        res.status(500).json({ message: "Server error." });
    }
}

const getUserApplications = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if the user is an applicant
        const applicant = await Applicant.findOne({ userId });
        if (!applicant) {
            return res.status(403).json({ message: "Only applicants can view their applications." });
        }

        // Fetch all applications for this applicant
        const applications = await Application.find({ applicantId: applicant._id })
            .populate('jobId', 'title description location salary jobType experienceLevel skills requirements status applicationDeadline')
            .populate('resumeId', 'fileName resumeUrl');

        res.status(200).json(applications);
    } catch (error) {
        console.error("Error fetching user applications:", error);
        res.status(500).json({ message: "Server error." });
    }
};

module.exports = {
    applyJob,
    getCompanyApplications,
    updateStatus,
    getUserApplications
};
