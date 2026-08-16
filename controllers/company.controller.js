const Company = require('../models/company.model');
const cloudinary = require('../config/cloudinary');

const getCompanyDetails = async (req, res) => {
    try {
        const companyUserId = req.user._id;

        // Check if the user is a company
        const companyDetails = await Company.findOne({ user: companyUserId });
        if (!companyDetails) {
            return res.status(404).json({ message: 'Company details not found' });
        }

        res.status(200).json(companyDetails);
    } catch (error) {
        console.error('Error fetching company details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateCompanyDetails = async (req, res) => {
    try {
        const companyUserId = req.user._id;
        const { name, industry, size, location, website, about, logo } = req.body;

        if (name && (name.length < 3 || name.length > 20)) {
            return res.status(400).json({ message: 'Company name must be between 3 and 20 characters' });
        }
        if (about && (about.length < 10 || about.length > 5000)) {
            return res.status(400).json({ message: 'About section must be between 10 and 5000 characters' });
        }
        if (industry && !["IT", "Finance", "Healthcare", "Education", "Marketing", "Sales", "Other"].includes(industry)) {
            return res.status(400).json({ message: 'Invalid industry' });
        }
        if (size && !["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10000", "10000+"].includes(size)) {
            return res.status(400).json({ message: 'Invalid company size' });
        }
        if (website && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(website)) {
            return res.status(400).json({ message: 'Invalid website URL' });
        }

        // Check if the user is a company
        const companyDetails = await Company.findOne({ user: companyUserId });
        if (!companyDetails) {
            return res.status(404).json({ message: 'Company details not found' });
        }

        if (logo && typeof logo === 'string' && logo.startsWith('data:image')) {
            // Upload new logo to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(logo, {
                folder: 'jobstack/company_logos',
                public_id: `${companyUserId}_logo`,
                overwrite: true,
            });
            companyDetails.logo = uploadResult.secure_url;
        }

        // Update company details
        companyDetails.name = name || "";
        companyDetails.industry = industry || "";
        companyDetails.size = size || "";
        companyDetails.location = location || "";
        companyDetails.website = website || "";
        companyDetails.about = about || "";

        await companyDetails.save();

        res.status(200).json(companyDetails);
    } catch (error) {
        console.error('Error fetching company details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getCompanyDetails,
    updateCompanyDetails
};