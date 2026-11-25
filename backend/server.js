
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Home route
app.get("/", (req, res) => {
    res.send("Online Book Store Backend is Running!");
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Online Book Store API is working!"
    });
});

// API routes
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.get("/api/test", (req, res) => {
    res.json({ message: "Main server test working!" });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
