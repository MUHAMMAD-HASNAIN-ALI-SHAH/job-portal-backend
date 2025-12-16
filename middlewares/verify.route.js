const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ msg: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ msg: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    return res.status(401).json({ msg: "Unauthorized: Invalid token" });
  }
};

module.exports = verifyUser;
