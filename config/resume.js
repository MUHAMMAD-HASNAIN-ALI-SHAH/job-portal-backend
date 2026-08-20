const cloudinary = require('../config/cloudinary');
const { extractResumeData } = require('./gemini');

const uploadResumeToCloudinary = async (pdfBase64) => {
    try {
        const uniqueFileName = `resume_${Date.now()}.pdf`;

        const result = await cloudinary.uploader.upload(pdfBase64, {
            resource_type: "raw",
            folder: "jobstack/resumes",
            public_id: uniqueFileName,
        });
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
};

const deleteResumeFromCloudinary = async (fileUrl) => {
    try {
        const urlParts = fileUrl.split('/upload/');

        if (urlParts.length < 2) {
            throw new Error("Invalid Cloudinary URL");
        }

        const pathParts = urlParts[1].split('/');
        pathParts.shift(); // Pehla element (version) remove ho jayega

        const publicId = pathParts.join('/');

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "raw"
        });

        console.log("Cloudinary Delete Result:", result);
        return result;
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
        throw error;
    }
};

module.exports = { uploadResumeToCloudinary, deleteResumeFromCloudinary };