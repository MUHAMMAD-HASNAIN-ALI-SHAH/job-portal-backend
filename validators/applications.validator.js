const applyJobValidator = (req, res, next) => {
    try {
        const { jobId, coverLetter, resumeBase64, fileName, expectedSalary, noticePeriod } = req.body;

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

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    applyJobValidator,
};
