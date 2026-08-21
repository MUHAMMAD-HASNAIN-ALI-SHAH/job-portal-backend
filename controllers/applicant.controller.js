const Applicant = require("../models/applicant.model");
const Resume = require("../models/resumes.model");
const Application = require("../models/application.model");
const { uploadResumeToCloudinary, deleteResumeFromCloudinary } = require("../config/resume");
const { getEmbedding } = require("../config/gemini");
const { extractTextFromPdfUrl } = require("../config/extractTextFromPdfUrl");

const determineProfileCompleteness = (applicant) => {
  let completeness = 0;
  const totalFields = 9;
  if (applicant.fullName) completeness++;
  if (applicant.headLine) completeness++;
  if (applicant.bio) completeness++;
  if (applicant.yearsOfExperience) completeness++;
  if (applicant.skills && applicant.skills.length > 0) completeness++;
  if (applicant.education && applicant.education.length > 0) completeness++;
  if (applicant.preferredJobTypes && applicant.preferredJobTypes.length > 0) completeness++;
  if (applicant.expectedSalary) completeness++;
  if (applicant.noticePeriod) completeness++;
  return (completeness / totalFields) * 100;
};

// public route
const getApplicantDetails = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if the user is an applicant and fetch their details
    const applicant = await Applicant.findOne({ userId }).populate("resumeId");
    if (!applicant) {
      return res.status(404).json({ message: "Applicant details not found" });
    }

    res.status(200).json(applicant);
  } catch (error) {
    console.error("Error fetching applicant details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// public route
const editApplicantDetails = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if the user is an applicant and fetch their details
    const applicant = await Applicant.findOne({ userId }).populate("resumeId");
    if (!applicant) {
      return res.status(404).json({ message: "Applicant details not found" });
    }

    // Extract the fields from the request body
    const { fullName, headLine, bio, yearsOfExperience, skills, education, preferredJobTypes, expectedSalary, noticePeriod,
    } = req.body;

    // Update the applicant's details
    applicant.fullName = fullName || "";
    applicant.headLine = headLine || "";
    applicant.bio = bio || "";
    applicant.yearsOfExperience = yearsOfExperience || "";
    applicant.skills = skills || [];
    applicant.education = education || [];
    applicant.preferredJobTypes = preferredJobTypes || [];
    applicant.expectedSalary = expectedSalary || "";
    applicant.noticePeriod = noticePeriod || "";
    applicant.profileCompleteness = determineProfileCompleteness(applicant);

    // Save the updated applicant details
    await applicant.save();

    res.status(200).json(applicant);
  } catch (error) {
    console.error("Error editingapplicant details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// public route
const uploadResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const { resumeBase64, fileName } = req.body;

    // Check if the user is an applicant
    const applicantDetails = await Applicant.findOne({ userId });
    if (!applicantDetails) {
      return res.status(403).json({
        message: "You are not authorized to upload a resume",
      });
    }

    // Check if the applicant already has a resume on file
    const existingResume = applicantDetails.resumeId
      ? await Resume.findById(applicantDetails.resumeId)
      : null;

    const resumeUrl = await uploadResumeToCloudinary(resumeBase64);
    const resumeText = await extractTextFromPdfUrl(resumeUrl);
    const resumeEmbedding = await getEmbedding(resumeText);

    if (existingResume) {
      // Only remove the old resume (Cloudinary + DB doc) if it isn't
      // referenced by any past/existing application — otherwise we'd
      // break that application's link to its submitted resume.
      const oldResumeInUse = await Application.findOne({ resumeId: existingResume._id });

      if (!oldResumeInUse) {
        await deleteResumeFromCloudinary(existingResume.resumeUrl);
        await Resume.findByIdAndDelete(existingResume._id);
      }

      const newResume = await Resume.create({
        applicantId: applicantDetails._id,
        resumeUrl,
        fileName,
        embedding: resumeEmbedding,
      });

      applicantDetails.resumeId = newResume._id;
      await applicantDetails.save();

      return res.status(200).json(newResume);
    }

    // No existing resume — create a new one
    const newResume = new Resume({
      applicantId: applicantDetails._id,
      resumeUrl,
      fileName,
      embedding: resumeEmbedding,
    });

    await newResume.save();

    applicantDetails.resumeId = newResume._id;
    await applicantDetails.save();

    return res.status(201).json(newResume);
  } catch (error) {
    console.error('Error uploading resume:', error);
    return res.status(500).json({ message: 'Error uploading resume', error: error.message });
  }
};

// public route
const deleteResume = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user is an applicant
    const applicantDetails = await Applicant.findOne({ userId });
    if (!applicantDetails) {
      return res.status(403).json({
        message: "You are not authorized to delete the resume",
      });
    }

    // Check if applicant has a resume
    if (!applicantDetails.resumeId) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    const resume = await Resume.findById(applicantDetails.resumeId);
    if (!resume) {
      applicantDetails.resumeId = null;
      await applicantDetails.save();

      return res.status(404).json({
        message: "Resume not found",
      });
    }

    // Check if this resume is used in any application
    const resumeInUse = await Application.exists({
      resumeId: resume._id,
    });

    if (resumeInUse) {
      // Keep resume document + Cloudinary file
      // because applications still reference it
      applicantDetails.resumeId = null;
      await applicantDetails.save();

      return res.status(200).json();
    }

    // Safe to delete
    await deleteResumeFromCloudinary(resume.resumeUrl);

    // Delete the resume document from the database
    await Resume.findByIdAndDelete(resume._id);

    // Remove the reference to the resume in the applicant's document
    applicantDetails.resumeId = null;
    await applicantDetails.save();

    return res.status(200).json();
  } catch (error) {
    console.error("Error deleting resume:", error);

    return res.status(500).json({
      message: "Error deleting resume",
      error: error.message,
    });
  }
};

module.exports = {
  getApplicantDetails,
  editApplicantDetails,
  uploadResume,
  deleteResume,
};
