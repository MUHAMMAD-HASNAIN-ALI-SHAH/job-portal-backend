const Applicant = require("../models/applicant.model");
const Application = require("../models/application.model");
const Job = require("../models/job.model");
const Resume = require("../models/resumes.model");
const Company = require("../models/company.model");
const { uploadResumeToCloudinary } = require("../config/resume");
const { deleteResumeFromCloudinary } = require("../config/resume");
const { extractTextFromPdfUrl } = require("../config/extractTextFromPdfUrl");
const { getEmbedding, calculateATSMatch } = require("../config/gemini");

const applyJob = async (req, res) => {
    try {
        const userId = req.user._id;
        const { jobId, coverLetter, resumeBase64, fileName, expectedSalary, noticePeriod } = req.body;

        if (!jobId || !coverLetter || !expectedSalary || !noticePeriod) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        // Check if the user is an applicant
        const applicant = await Applicant.findOne({ userId });
        if (!applicant) {
            return res.status(403).json({ message: "Only applicants can apply for jobs." });
        }

        // Check if job exists
        const job = await Job.findById(jobId).select("+embedding");
        if (!job) {
            return res.status(404).json({ message: "Job not found." });
        }

        // Check if the applicant has already applied for the job
        const existingApplication = await Application.findOne({ applicantId: applicant._id, jobId: jobId });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this job." });
        }

        const application = new Application({
            applicantId: applicant._id,
            jobId,
            coverLetter,
            resumeId: null,
            expectedSalary,
            noticePeriod,
        });

        let resume;
        if (resumeBase64 && fileName) {
            // upload the resume to cloudinary and get the URL
            const resumeUrl = await uploadResumeToCloudinary(resumeBase64);

            // Extract text from the resume and get the embedding
            const resumeText = await extractTextFromPdfUrl(resumeUrl);
            const embedding = await getEmbedding(resumeText);

            // Save the resume to the Resume collection
            resume = new Resume({
                resumeUrl,
                fileName,
                embedding,
            });

            await resume.save();
        } else {
            // If no resume is provided, check if the applicant has a saved resume
            const getResume = await Resume.findById(
                applicant.resumeId
            ).select("+embedding");
            if (!getResume) {
                return res.status(404).json({ message: "Resume not found." });
            }

            // Use the saved resume for the application
            resume = getResume;
        }

        // Associate the resume with the application
        application.resumeId = resume._id;

        // Calculate ATS match percentage
        const atsMatchPercentage = await calculateATSMatch(resume.embedding, job.embedding);
        application.atsMatchPercentage = atsMatchPercentage;

        job.applicantsCount += 1;
        await job.save();
        await application.save();

        res.status(201).json();
    } catch (error) {
        console.error("Error applying for job:", error);
        res.status(500).json({ message: "Server error." });
    }
};

const getCompanyApplications = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if the user is a company
        const company = await Company.findOne({ userId });
        if (!company) {
            return res.status(403).json({ message: "Only companies can view applications." });
        }

        // Fetch all applications for jobs posted by this company
        const jobs = await Job.find({ companyId: company._id });
        const jobIds = jobs.map(job => job._id);

        const applications = await Application.find({ jobId: { $in: jobIds } })
            .populate('applicantId', 'fullName')
            .populate('jobId', 'title')
            .populate('resumeId', 'resumeUrl fileName');

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
        const company = await Company.findOne({ userId });
        if (!company) {
            return res.status(403).json({ message: "Only companies can update application status." });
        }

        // Check if the application exists
        const application = await Application.findById(applicationId).populate('jobId').populate('resumeId');
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
            if(new Date(interviewDate) < new Date()) {
                return res.status(400).json({ message: "Interview date cannot be in the past." });
            }
        }

        if (status === "hired" || status === "rejected") {
            if (application.resumeId) {
                // Is this exact resume URL used by any OTHER application?
                const usedByAnotherApplication = await Application.exists({
                    _id: { $ne: application._id },
                    resumeId: application.resumeId,
                });

                // Is this the applicant's saved profile resume (reusable for future applications)?
                const isSavedProfileResume = await Applicant.exists({
                    resumeId: application.resumeId,
                });

                const shouldDelete = !usedByAnotherApplication && !isSavedProfileResume;

                if (shouldDelete) {
                    await deleteResumeFromCloudinary(application.resumeId.resumeUrl);
                    await Resume.findByIdAndDelete(application.resumeId._id);
                }
            }
            application.resumeId = null;
            application.fileName = null;
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

        res.status(200).json(applications);
    } catch (error) {
        console.error("Error fetching user applications:", error);
        res.status(500).json({ message: "Server error." });
    }
};

const getCompanyShortlistedApplicationsCount = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if the user is a company
        const company = await Company.findOne({ userId });
        if (!company) {
            return res.status(403).json({ message: "Only companies can view shortlisted applications count." });
        }

        // Fetch all jobs posted by this company
        const jobs = await Job.find({ companyId: company._id });
        const jobIds = jobs.map(job => job._id);

        // Fetch all shortlisted applications for these jobs
        const shortlistedApplications = await Application.find({
            jobId: { $in: jobIds },
            status: "shortlisted"
        });

        res.status(200).json({ count: shortlistedApplications.length });
    } catch (error) {
        console.error("Error fetching company shortlisted applications count:", error);
        res.status(500).json({ message: "Server error." });
    }
};

module.exports = {
    applyJob,
    getCompanyApplications,
    updateStatus,
    getUserApplications,
    getCompanyShortlistedApplicationsCount
};
