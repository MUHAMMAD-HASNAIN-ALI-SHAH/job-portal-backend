const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        name: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
        },
        industry: {
            type: String,
            trim: true,
            enum: ["IT", "Finance", "Healthcare", "Education", "Marketing", "Sales", "Other", ""],
        },
        size: {
            type: String,
            trim: true,
            enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10000", "10000+", ""],
        },
        location: {
            type: String,
            trim: true,
        },
        website: {
            type: String,
            trim: true,
        },
        about: {
            type: String,
            trim: true,
            maxlength: 5000,
        },
        logo: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);

module.exports = Company;