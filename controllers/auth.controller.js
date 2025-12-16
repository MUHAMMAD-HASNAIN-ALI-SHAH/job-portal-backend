const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user.model");
const Code = require("../models/code.schema");
const { sendCode } = require("../config/email");
const Applicant = require("../models/applicant.model");
const Recruiter = require("../models/recruiter.model");

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

const recruiterRegistration = async (req, res) => {
  try {
    let { fullName, email, password, companyName } = req.body;
    if (!fullName || !email || !password || !companyName)
      return res.status(400).json({ msg: "Please fill in all fields" });

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
      return res.status(400).json({ msg: "User already exists" });
    }

    // hashing password and creating user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: "recruiter",
    });

    // create recruiter profile
    const recruiterProfile = new Recruiter({
      userId: newUser._id,
      fullName,
      companyName,
    });
    await recruiterProfile.save();

    // send verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    await Code.create({ userId: newUser._id, code: verificationCode, email });
    await transporter.sendMail({
      from: `"Jobstack" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Your Verification Code",
      html: sendCode(verificationCode),
    });

    res.status(201).json({
      msg: "Registration successfull plz enter the verification code sent to your email",
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const applicantRegistration = async (req, res) => {
  try {
    let { fullName, email, password, phone, location } = req.body;
    if (!fullName || !email || !password || !phone || !location)
      return res.status(400).json({ msg: "Please fill in all fields" });

    // checking for already registered user
    email = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email });

    // Remove unverified user and profile
    if (existingUser && !existingUser.emailVerified) {
      await User.deleteOne({ _id: existingUser._id });
      await Code.deleteMany({ userId: existingUser._id });
      await Applicant.deleteOne({ userId: existingUser._id });
    }

    // if user already exists
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // hashing password and creating user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: "applicant",
    });

    // create applicant profile
    const applicantProfile = new Applicant({
      userId: newUser._id,
      fullName,
      phone,
      location,
    });
    await applicantProfile.save();

    // send verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    await Code.create({ userId: newUser._id, code: verificationCode, email });
    await transporter.sendMail({
      from: `"Jobstack" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Your Verification Code",
      html: sendCode(verificationCode),
    });

    res.status(201).json({
      msg: "Registration successfull plz enter the verification code sent to your email",
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    let { code, email } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({ msg: "Please provide a verification code" });
    }

    const verification = await Code.findOne({ code, email });

    if (!verification) {
      return res
        .status(400)
        .json({ msg: "Invalid or expired verification code" });
    }

    const createdAt = verification.createdAt;
    const now = new Date();
    const diffInMinutes = (now - createdAt) / (1000 * 60);

    if (diffInMinutes > 10) {
      await Code.deleteOne({ _id: verification._id });
      return res.status(400).json({
        msg: "Verification code has expired. Please request a new one.",
      });
    }

    // Verify email
    await User.updateOne({ _id: verification.userId }, { emailVerified: true });
    await Code.deleteOne({ _id: verification._id });

    return res.status(201).json({ msg: "Email verified successfully" });
  } catch (err) {
    console.error("Email Verification Error:", err.message);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Please fill in all fields" });

    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user || !user.emailVerified)
      return res
        .status(400)
        .json({ msg: "User does not exist or email not verified" });

    if (!user.password)
      return res.status(400).json({ msg: "User signed up with Google" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    generateToken(user._id, res);
    res.status(200).json({
      msg: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const verify = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      msg: "Verify successful",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Verify Error:", err.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ msg: "Logout successful" });
  } catch (err) {
    console.error("Logout Controller Error: " + err.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = {
  recruiterRegistration,
  verifyEmail,
  login,
  verify,
  logout,
  applicantRegistration,
};
