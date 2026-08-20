const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        // Check if token is provided
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        // Verify the token and extract userId
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        // Check if the user exists
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        // Attach the user to the request object for further use
        req.user = user;
        next();
    } catch (err) {
        console.error("Auth Error:", err.message);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

module.exports = protectedRoute;
