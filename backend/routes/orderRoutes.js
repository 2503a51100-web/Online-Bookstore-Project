
console.log("ORDER ROUTES FILE LOADED");
const express = require("express");
const router = express.Router();
router.get("/test", (req, res) => {
    res.json({ message: "Order routes are working!" });
});

const {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus
} = require("../controllers/orderController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

// Customer routes
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);

// Admin routes
router.get("/all", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
