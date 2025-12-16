const Applicant = require("../models/applicant.model");
const Resume = require("../models/resumes.model");

const getApplicantDetails = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (user.role !== "applicant") {
      return res
        .status(403)
        .json({ message: "Forbidden: Access is allowed only for applicants" });
    }
    const userId = user._id;
    const applicant = await Applicant.findOne({ userId });

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    res.status(200).json({ applicant });
  } catch (error) {
    console.error("Error fetching applicant details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const uploadApplicantResume = async (req, res) => {
  try {
    const { base64, fileName } = req.body;
    const user = req.user;
    console.log("Authenticated user:", user);

    // Validate input
    if (!base64 || !fileName) {
      return res
        .status(400)
        .json({ message: "Base64 data and file name are required." });
    }

    // Find the applicant by user ID
    const applicant = await Applicant.findOne({ userId: user._id });
    if (!applicant) {
      return res.status(404).json({ message: "Applicant profile not found." });
    }

    // Simulate file upload and get URL (replace with actual upload logic)
    const resumeUrl = base64;

    // Create or update resume record
    let resume = await Resume.findOne({ applicantId: applicant._id });
    if (resume) {
      resume.resumeUrl = resumeUrl;
      resume.fileName = fileName;
      resume.uploadedAt = Date.now();
      await resume.save();
    } else {
      resume = new Resume({
        applicantId: applicant._id,
        resumeUrl,
        fileName,
      });
      await resume.save();
    }

    res.status(200).json({ resume });
  } catch (err) {
    console.error("Error uploading resume:", err);
    res.status(500).json({ message: "Server error while uploading resume." });
  }
};

const getUserResume = async (req, res) => {
  try {
    const user = req.user;
    const applicant = await Applicant.findOne({ userId: user._id });
    if (!applicant) {
      return res.status(404).json({ message: "Applicant profile not found." });
    }

    const resume = await Resume.findOne({ applicantId: applicant._id });
    if (!resume) {
      return res.status(200).json({ resume: null });
    }

    res.status(200).json({ resume });
  } catch (err) {
    console.error("Error fetching resume:", err);
    res.status(500).json({ message: "Server error while fetching resume." });
  }
};

module.exports = {
  uploadApplicantResume,
  getApplicantDetails,
  getUserResume,
};
