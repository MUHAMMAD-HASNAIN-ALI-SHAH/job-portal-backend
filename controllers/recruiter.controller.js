const Recruiter = require("../models/recruiter.model");

const getRecruiterDetails = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (user.role !== "recruiter") {
      return res
        .status(403)
        .json({ message: "Forbidden: Access is allowed only for recruiter" });
    }
    const userId = user._id;
    const recruiter = await Recruiter.findOne({ userId });

    if (!recruiter) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    res.status(200).json({ recruiter });
  } catch (error) {
    console.error("Error fetching applicant details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const Recruiter = require("../models/Recruiter"); // adjust path if needed

const uploadRecruiterDetails = async (req, res) => {
  try {
    const userId = req.user._id; // assuming you have auth middleware setting req.user
    const {
      companyName,
      companyLogo,
      companyWebsite,
      companySize,
      industry,
      bio,
    } = req.body;

    // Validate required fields
    if (!companyName || companyName.trim() === "") {
      return res.status(400).json({ message: "Company name is required" });
    }

    // Find recruiter by userId
    let recruiter = await Recruiter.findOne({ userId });

    if (!recruiter) {
      // If no recruiter exists, create new
      recruiter = new Recruiter({
        userId,
        companyName,
        companyLogo: companyLogo || "",
        companyWebsite: companyWebsite || "",
        companySize: companySize || "",
        industry: industry || "",
        bio: bio || "",
      });
    } else {
      // Update existing recruiter
      recruiter.companyName = companyName;
      recruiter.companyLogo = companyLogo || recruiter.companyLogo;
      recruiter.companyWebsite = companyWebsite || recruiter.companyWebsite;
      recruiter.companySize = companySize || recruiter.companySize;
      recruiter.industry = industry || recruiter.industry;
      recruiter.bio = bio || recruiter.bio;
    }

    await recruiter.save();

    res.status(200).json({ message: "Recruiter details updated", recruiter });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while updating recruiter details" });
  }
};

module.exports = { uploadRecruiterDetails };

module.exports = {
  getRecruiterDetails,
};
