const Resume = require("../models/resumes.model");
const Applicant = require("../models/applicant.model");
const Application = require("../models/application.model");
const { uploadResumeToCloudinary, deleteResumeFromCloudinary } = require("../config/resume");

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
            const resumeUrl = await uploadResumeToCloudinary(resumeBase64);

            // Check if the existing resume is being used in any application before deleting it from Cloudinary
            const checkDeleteResumeFromCloudinary = await Application.findOne({ resume: existingResume.resumeUrl });
            if (!checkDeleteResumeFromCloudinary) {
                await deleteResumeFromCloudinary(existingResume.resumeUrl);
            }

            await Resume.findByIdAndUpdate(existingResume._id, { resumeUrl, fileName }, { new: true });

            return res.status(200).json();
        }

        const resumeUrl = await uploadResumeToCloudinary(resumeBase64);

        // Create a new resume
        const newResume = new Resume({
            applicantId: applicantDetails._id,
            resumeUrl,
            fileName,
        });

        await newResume.save();

        res.status(201).json(newResume);
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

const deleteResume = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if the user is an applicant
        const applicantDetails = await Applicant.findOne({ userId });
        if (!applicantDetails) {
            return res.status(403).json({ message: 'You are not authorized to delete the resume' });
        }

        // Find the resume by applicant ID
        const resume = await Resume.findOne({ applicantId: applicantDetails._id });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Check if the resume is being used in any application before deleting it from Cloudinary
        const checkDeleteResumeFromCloudinary = await Application.findOne({ resumeUrl: resume.resumeUrl });
        if (!checkDeleteResumeFromCloudinary) {
            await deleteResumeFromCloudinary(resume.resumeUrl);
        }

        // Delete the resume from the database
        await Resume.findByIdAndDelete(resume._id);

        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting resume', error });
        console.error('Error deleting resume:', error);
    }
};

module.exports = {
    uploadResume,
    getResume,
    deleteResume,
};
