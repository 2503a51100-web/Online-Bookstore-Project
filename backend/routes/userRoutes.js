
const express = require("express");
const router = express.Router();

console.log("USER ROUTES FILE LOADED");

const {
    registerUser,
    loginUser,
    createAdminUser,
    getAllAdmins
} = require("../controllers/userController");

const {
    protect,
    superAdminOnly
} = require("../middleware/authMiddleware");

// PUBLIC ROUTES
router.post("/register", registerUser);
router.post("/login", loginUser);

// SUPER ADMIN ONLY ROUTES

// Create an Admin account
router.post(
    "/admins",
    protect,
    superAdminOnly,
    createAdminUser
);

// Get all Admin accounts
router.get(
    "/admins",
    protect,
    superAdminOnly,
    getAllAdmins
);

module.exports = router;
