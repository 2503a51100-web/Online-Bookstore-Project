
const mongoose = require("mongoose");
const Order = require("../models/order");
const Book = require("../models/book");

// CREATE ORDER
const createOrder = async (req, res) => {
    const updatedStock = [];

    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            customerCity,
            customerPincode,
            items
        } = req.body;

        // Validate customer details
        if (
            !customerName?.trim() ||
            !customerEmail?.trim() ||
            !customerPhone?.trim() ||
            !customerAddress?.trim() ||
            !customerCity?.trim() ||
            !customerPincode?.trim() ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                message: "Please provide all order details."
            });
        }

        // Use the email belonging to the logged-in account
        if (
            customerEmail.trim().toLowerCase() !==
            req.user.email.toLowerCase()
        ) {
            return res.status(400).json({
                message: "Customer email does not match your account."
            });
        }

        if (!/^\d{10}$/.test(customerPhone)) {
            return res.status(400).json({
                message: "Please enter a valid 10-digit phone number."
            });
        }

        if (!/^\d{6}$/.test(customerPincode)) {
            return res.status(400).json({
                message: "Please enter a valid 6-digit pincode."
            });
        }

        // Combine repeated book IDs into one quantity
        const quantities = new Map();

        for (const item of items) {
            if (
                !item.book ||
                !mongoose.Types.ObjectId.isValid(item.book) ||
                !Number.isInteger(Number(item.quantity)) ||
                Number(item.quantity) <= 0
            ) {
                return res.status(400).json({
                    message: "Invalid book or quantity in your cart."
                });
            }

            const id = String(item.book);

            quantities.set(
                id,
                (quantities.get(id) || 0) + Number(item.quantity)
            );
        }

        const orderItems = [];
        let totalAmount = 0;

        // Verify each book and decrease stock safely
        for (const [bookId, quantity] of quantities) {

            const book = await Book.findById(bookId);

            if (!book) {
                throw new Error("One of the books in your cart was not found.");
            }

            if (book.stock < quantity) {
                throw new Error(
                    `Only ${book.stock} copies of "${book.title}" are available.`
                );
            }

            // Atomic stock update: prevents selling unavailable stock
            const updatedBook = await Book.findOneAndUpdate(
                {
                    _id: bookId,
                    stock: { $gte: quantity }
                },
                {
                    $inc: { stock: -quantity }
                },
                {
                    new: true
                }
            );

            if (!updatedBook) {
                throw new Error(
                    `Stock changed for "${book.title}". Please try again.`
                );
            }

            updatedStock.push({
                bookId,
                quantity
            });

            // Use trusted database details, not browser prices
            orderItems.push({
                book: book._id,
                title: book.title,
                quantity,
                price: book.price
            });

            totalAmount += book.price * quantity;
        }

        // Save order in MongoDB
        const order = await Order.create({
            user: req.user._id,
            customerName: customerName.trim(),
            customerEmail: req.user.email,
            customerPhone,
            customerAddress: customerAddress.trim(),
            customerCity: customerCity.trim(),
            customerPincode,
            items: orderItems,
            totalAmount
        });

        return res.status(201).json({
            message: "Order placed successfully!",
            order
        });

    } catch (error) {

        // Restore stock if order creation or processing fails
        for (const item of updatedStock) {
            await Book.updateOne(
                { _id: item.bookId },
                { $inc: { stock: item.quantity } }
            );
        }

        return res.status(400).json({
            message: error.message || "Unable to place your order."
        });
    }
};

// GET LOGGED-IN USER'S ORDERS
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// GET ALL ORDERS (ADMIN)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// UPDATE ORDER STATUS (ADMIN)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Order Placed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status."
            });
        }

        // Find the order
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found."
            });
        }

        // Restore stock only when cancelling for the first time
        if (status === "Cancelled" && order.status !== "Cancelled") {

            for (const item of order.items) {
                await Book.findByIdAndUpdate(
                    item.book,
                    {
                        $inc: { stock: item.quantity }
                    }
                );
            }
        }

        // Update order status
        order.status = status;
        await order.save();

        res.status(200).json({
            message: "Order status updated successfully!",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus
};
