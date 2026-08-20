const addJobValidator = (req, res, next) => {
    try {
        // Extract job details from request body
        const { title, description, location, salary, jobType, experienceLevel, skills, requirements, status, applicationDeadline } = req.body;

        // validations

        // validation for title description
        if (!title || title.length < 3 || title.length > 100) {
            return res.status(400).json({ message: 'Job title must be between 3 and 100 characters' });
        }
        if (!description || description.length < 10 || description.length > 5000) {
            return res.status(400).json({ message: 'Job description must be between 10 and 5000 characters' });
        }

        // validation for requirements
        if (requirements && !Array.isArray(requirements)) {
            return res.status(400).json({ message: 'Requirements must be an array of strings' });
        }
        if (requirements.length < 1) {
            return res.status(400).json({ message: 'At least one requirement is required' });
        }

        // validation for skills
        if (skills && !Array.isArray(skills)) {
            return res.status(400).json({ message: 'Skills must be an array of strings' });
        }
        if (skills.length < 1) {
            return res.status(400).json({ message: 'At least one skill is required' });
        }

        // validation for experience level and job type
        if (experienceLevel && !["Internship", "Entry", "Mid", "Senior", "Lead"].includes(experienceLevel)) {
            return res.status(400).json({ message: 'Invalid experience level' });
        }

        // validation for location
        if (!location || location.length < 3) {
            return res.status(400).json({ message: 'Location must be at least 3 characters long' });
        }

        // validation for salary
        if (!salary) {
            return res.status(400).json({ message: 'Salary is required' });
        }

        // validation for employment type
        if (jobType && !["Full-time", "Part-time", "Contract", "Freelance", "Temporary"].includes(jobType)) {
            return res.status(400).json({ message: 'Invalid job type' });
        }

        // validation for status
        if (status && !["active", "draft", "closed"].includes(status)) {
            return res.status(400).json({ message: 'Invalid job status' });
        }

        // validation for application deadline
        if (!applicationDeadline) {
            return res.status(400).json({ message: 'Application deadline is required' });
        }

        next();
    } catch (error) {
        console.error("Error validating job data:", error);
        res.status(500).json({ message: "Server error." });
    }
}
const editJobValidator = (req, res, next) => {
    try {
        // Extract job details from request body
        const { title, description, location, salary, jobType, experienceLevel, skills, requirements, status, applicationDeadline } = req.body;

        // validations

        // validation for title description
        if (!title || title.length < 3 || title.length > 100) {
            return res.status(400).json({ message: 'Job title must be between 3 and 100 characters' });
        }
        if (!description || description.length < 10 || description.length > 5000) {
            return res.status(400).json({ message: 'Job description must be between 10 and 5000 characters' });
        }

        // validation for requirements
        if (requirements && !Array.isArray(requirements)) {
            return res.status(400).json({ message: 'Requirements must be an array of strings' });
        }
        if (requirements.length < 1) {
            return res.status(400).json({ message: 'At least one requirement is required' });
        }

        // validation for skills
        if (skills && !Array.isArray(skills)) {
            return res.status(400).json({ message: 'Skills must be an array of strings' });
        }
        if (skills.length < 1) {
            return res.status(400).json({ message: 'At least one skill is required' });
        }

        // validation for experience level and job type
        if (experienceLevel && !["Internship", "Entry", "Mid", "Senior", "Lead"].includes(experienceLevel)) {
            return res.status(400).json({ message: 'Invalid experience level' });
        }

        // validation for location
        if (!location || location.length < 3) {
            return res.status(400).json({ message: 'Location must be at least 3 characters long' });
        }

        // validation for salary
        if (!salary) {
            return res.status(400).json({ message: 'Salary is required' });
        }

        // validation for employment type
        if (jobType && !["Full-time", "Part-time", "Contract", "Freelance", "Temporary"].includes(jobType)) {
            return res.status(400).json({ message: 'Invalid job type' });
        }

        // validation for status
        if (status && !["active", "draft", "closed"].includes(status)) {
            return res.status(400).json({ message: 'Invalid job status' });
        }

        // validation for application deadline
        if (!applicationDeadline) {
            return res.status(400).json({ message: 'Application deadline is required' });
        }

        next();
    } catch (error) {
        console.error("Error validating job data:", error);
        res.status(500).json({ message: "Server error." });
    }
}

module.exports = {
    addJobValidator,
    editJobValidator
};