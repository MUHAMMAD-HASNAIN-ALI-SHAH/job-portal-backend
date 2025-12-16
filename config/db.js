const mongoose = require("mongoose");
require("dotenv").config();

const connectDb = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDb;
