const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user.model");
const { verificationLink } = require("../config/email");
const Company = require("../models/company.model");
const Applicant = require("../models/applicant.model");

const generateToken = (userId, res) => {
  const token = jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "none",
  });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const registration = async (req, res) => {
  try {
    let { email, password, role } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Please fill in all fields" });

    if (!email.trim()) {
      return res.status(400).json({ message: "Email cannot be empty" });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format. Please enter a valid email address." });
    }

    if (!password) {
      return res.status(400).json({ message: "Password cannot be empty" });
    } else if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    if (!["applicant", "company"].includes(role)) {
      return res.status(400).json({ message: "Please select a registration type." });
    }

    // checking for already registered user
    email = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email });

    // Remove unverified user and profile
    if (existingUser && !existingUser.emailVerified) {
      await User.deleteOne({ _id: existingUser._id });
      await Code.deleteMany({ userId: existingUser._id });
      await Recruiter.deleteOne({ userId: existingUser._id });
    }

    // if user already exists
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // hashing password and creating user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role,
    });

    if (role === "company") {
      await Company.create({ user: newUser._id, email: email });
    }

    if (role === "applicant") {
      await Applicant.create({ user: newUser._id });
    }

    // send verification link
    const verificationToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const verification = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: `"Jobstack" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Your Verification Link",
      html: verificationLink(verification),
    });

    res.status(201).json();
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Validate email and password
    if (!email || !password)
      return res.status(400).json({ message: "Please fill in all fields" });
    if (!email.trim()) {
      return res.status(400).json({ message: "Email cannot be empty" });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format. Please enter a valid email address." });
    }
    if (!password) {
      return res.status(400).json({ message: "Password cannot be empty" });
    } else if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Check if user exists and email is verified and password is correct
    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user || !user.emailVerified)
      return res
        .status(400)
        .json({ message: "User does not exist or email not verified" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);
    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Check if token is provided
    if (!token) {
      return res.status(400).json({ message: "Missing token" });
    }

    // Verify the token and extract userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Check if the user exists
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's emailVerified status
    await User.updateOne({ _id: decoded.userId }, { $set: { emailVerified: true } });

    return res.status(200).json();
  } catch (err) {
    console.error("Email Verification Error:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const verify = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Verify Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout Controller Error: " + err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  verifyEmail,
  login,
  verify,
  logout,
  registration,
};
