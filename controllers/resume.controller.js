const Resume = require("../models/resumes.model");
const Applicant = require("../models/applicant.model");

const uploadResume = async (req, res) => {
    try {
        const userId = req.user._id;
        const { resumeBase64, fileName } = req.body;

        // Check if the user is an applicant
        const applicantDetails = await Applicant.findOne({ userId });
        if (!applicantDetails) {
            return res.status(403).json({ message: 'You are not authorized to upload a resume' });
        }

        // Check if the applicant has already uploaded a resume
        const existingResume = await Resume.findOne({ applicantId: applicantDetails._id });
        if (existingResume) {
            await Resume.findByIdAndUpdate(existingResume._id, { resumeUrl: resumeBase64, fileName }, { new: true });
            return res.status(200).json();
        }

        // Create a new resume
        const newResume = new Resume({
            applicantId: applicantDetails._id,
            resumeUrl: resumeBase64,
            fileName,
        });

        await newResume.save();

        res.status(201).json();
    } catch (error) {
        res.status(500).json({ message: 'Error uploading resume', error });
        console.error('Error uploading resume:', error);
    }
};

const getResume = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if the user is an applicant
        const applicantDetails = await Applicant.findOne({ userId });
        if (!applicantDetails) {
            return res.status(403).json({ message: 'You are not authorized to view the resume' });
        }

        // Find the resume by applicant ID
        const resume = await Resume.findOne({ applicantId: applicantDetails._id });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.status(200).json(resume);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching resume', error });
        console.error('Error fetching resume:', error);
    }
};

module.exports = {
    uploadResume,
    getResume,
};
