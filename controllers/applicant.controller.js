const Applicant = require("../models/applicant.model");
const Resume = require("../models/resumes.model");

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
    const applicant = await Applicant.findOne({ userId })

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    res.status(200).json(applicant);
  } catch (error) {
    console.error("Error fetching applicant details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const editApplicantDetails = async (req, res) => {
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

    const {
      fullName,
      headLine,
      bio,
      yearsOfExperience,
      skills,
      education,
      preferredJobTypes,
      expectedSalary,
      noticePeriod,
    } = req.body;

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    // Update the applicant's details
    applicant.fullName = fullName || applicant.fullName;
    applicant.headLine = headLine || applicant.headLine;
    applicant.bio = bio || applicant.bio;
    applicant.yearsOfExperience = yearsOfExperience || applicant.yearsOfExperience;
    applicant.skills = skills || applicant.skills;
    applicant.education = education || applicant.education;
    applicant.preferredJobTypes = preferredJobTypes || applicant.preferredJobTypes;
    applicant.expectedSalary = expectedSalary || applicant.expectedSalary;
    applicant.noticePeriod = noticePeriod || applicant.noticePeriod;
    applicant.profileCompleteness = determineProfileCompleteness(applicant);

    await applicant.save();

    res.status(200).json(applicant);
  } catch (error) {
    console.error("Error editingapplicant details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getApplicantDetails,
  editApplicantDetails,
};
