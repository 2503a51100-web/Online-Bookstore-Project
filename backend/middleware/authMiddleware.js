
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// VERIFY LOGIN TOKEN
const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "Not authorized. Please login."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User not found."
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token."
        });
    }
};

// ALLOW ADMIN AND SUPER ADMIN
const adminOnly = (req, res, next) => {
    if (
        req.user &&
        ["admin", "superadmin"].includes(req.user.role)
    ) {
        return next();
    }

    return res.status(403).json({
        message: "Access denied. Admin privileges required."
    });
};

// ALLOW ONLY SUPER ADMIN
const superAdminOnly = (req, res, next) => {
    if (req.user && req.user.role === "superadmin") {
        return next();
    }

    return res.status(403).json({
        message: "Access denied. Super Admin privileges required."
    });
};

module.exports = {
    protect,
    adminOnly,
    superAdminOnly
};
