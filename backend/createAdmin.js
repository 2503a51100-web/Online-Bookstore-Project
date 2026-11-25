
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

const createAdmin = async () => {
    try {
        const {
            ADMIN_NAME,
            ADMIN_EMAIL,
            ADMIN_PASSWORD,
            MONGO_URI
        } = process.env;

        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !MONGO_URI) {
            throw new Error(
                "Please configure all admin and MongoDB environment variables."
            );
        }

        if (ADMIN_PASSWORD.length < 8) {
            throw new Error("Admin password must be at least 8 characters.");
        }

        await mongoose.connect(MONGO_URI);

        const email = ADMIN_EMAIL.trim().toLowerCase();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            if (existingUser.role === "superadmin") {
                console.log("This account is already a Super Admin.");
            } else {
                existingUser.role = "superadmin";
                await existingUser.save();

                console.log("Existing account upgraded to Super Admin!");
            }

            return;
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        await User.create({
            name: ADMIN_NAME.trim(),
            email,
            password: hashedPassword,
            role: "superadmin"
        });

        console.log("Super Admin account created successfully!");

    } catch (error) {
        console.error("Super Admin setup failed:", error.message);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
};

createAdmin();
