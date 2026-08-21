const Job = require("../models/job.model");
const Company = require("../models/company.model");
const Applicant = require("../models/applicant.model");
const Application = require("../models/application.model");
const { getEmbedding } = require("../config/gemini");

// company route
const createJob = async (req, res) => {
    try {
        const userId = req.user._id;

        // get company details
        const companyDetails = await Company.findOne({ userId: userId });
        if (!companyDetails) {
            return res.status(404).json({ message: 'Company details not found' });
        }

        // Extract job details from request body
        const { title, description, location, salary, jobType, experienceLevel, skills, requirements, status, applicationDeadline } = req.body;

        // extract text from job details and get embedding
        const jobText = `${title} ${description} ${skills ? skills.join(' ') : ''} ${requirements ? requirements.join(' ') : ''}`;
        const jobEmbedding = await getEmbedding(jobText);

        // Create a new job posting
        const newJob = new Job({
            title,
            description,
            location,
            salary,
            jobType,
            experienceLevel,
            skills,
            requirements,
            status,
            applicationDeadline,
            embedding: jobEmbedding,
            companyId: companyDetails._id
        });

        await newJob.save();

        res.status(201).json(newJob);
    } catch (error) {
        res.status(500).json({ message: 'Error creating job', error });
    }
};

// company route
const editJob = async (req, res) => {
    try {
        const companyUserId = req.user._id;
        const jobId = req.params.id;

        // Check if the user is a company
        const companyDetails = await Company.findOne({ userId: companyUserId });
        if (!companyDetails) {
            return res.status(404).json({ message: 'Company details not found' });
        }

        const { title, description, location, salary, jobType, experienceLevel, skills, requirements, status, applicationDeadline } = req.body;

        // Find the job by ID
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if the user is the owner of the job
        if (job.companyId.toString() !== companyDetails._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to edit this job' });
        }

        const jobText = `${title} ${description} ${skills ? skills.join(' ') : ''} ${requirements ? requirements.join(' ') : ''}`;
        const jobEmbedding = await getEmbedding(jobText);

        // Update the job
        job.title = title || job.title;
        job.description = description || job.description;
        job.location = location || job.location;
        job.salary = salary || job.salary;
        job.jobType = jobType || job.jobType;
        job.experienceLevel = experienceLevel || job.experienceLevel;
        job.skills = skills || job.skills;
        job.requirements = requirements || job.requirements;
        job.status = status || job.status;
        job.applicationDeadline = applicationDeadline || job.applicationDeadline;
        job.embedding = jobEmbedding || job.embedding;

        await job.save();

        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error editing job', error });
    }
};

// company route
const getJobs = async (req, res) => {
    try {
        const companyUserId = req.user._id;

        // Check if the user is a company
        const companyDetails = await Company.findOne({ userId: companyUserId });
        if (!companyDetails) {
            return res.status(404).json({ message: 'Company details not found' });
        }

        const jobs = await Job.find({ companyId: companyDetails._id });

        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error });
    }
};

// company route
const deleteJob = async (req, res) => {
    try {
        const companyUserId = req.user._id;
        const jobId = req.params.id;

        // Find the job by ID
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if the user is a company
        const companyDetails = await Company.findOne({ userId: companyUserId });
        if (!companyDetails) {
            return res.status(404).json({ message: 'Company details not found' });
        }

        // Check if the user is the owner of the job
        if (job.companyId.toString() !== companyDetails._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this job' });
        }

        await Job.findByIdAndDelete(jobId);

        res.status(200).json();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting job', error });
        console.error('Error deleting job:', error);
    }
};

// public route
const getAllJobs = async (req, res) => {
    try {
        const { search = "", location = "" } = req.query;

        const query = {};

        if (search.trim()) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { skills: { $regex: search, $options: "i" } },
            ];
        }

        if (location.trim() && location.toLowerCase() !== "all locations") {
            query.location = { $regex: location, $options: "i" };
        }

        let jobs = await Job.find(query).populate('companyId', 'name location logo');

        // return only active jobs
        jobs = jobs.filter(job => job.status === 'active');

        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching all jobs:', error);
        res.status(500).json({ message: 'Error fetching jobs', error: error.message });
    }
};

// public route
const getJobDetails = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user;

        const job = await Job.findById(jobId).populate('companyId', 'name location logo');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        job.views += 1;
        await job.save();

        // get the applicant details if the user is an applicant
        let applied = false;
        if (userId) {
            const applicant = await Applicant.findOne({ userId });
            if (applicant) {
                const existingApplication = await Application.findOne({
                    applicantId: applicant._id, jobId
                });
                if (existingApplication) {
                    applied = true;
                }
            }
        }

        res.status(200).json({ job, applied });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job details', error });
        console.error('Error fetching job details:', error);
    }
};

module.exports = {
    createJob,
    getJobs,
    getAllJobs,
    editJob,
    deleteJob,
    getJobDetails
};
