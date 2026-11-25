
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        customerName: {
            type: String,
            required: true,
            trim: true
        },

        customerEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        customerPhone: {
            type: String,
            required: true
        },

        customerAddress: {
            type: String,
            required: true
        },

        customerCity: {
            type: String,
            required: true
        },

        customerPincode: {
            type: String,
            required: true
        },

        items: [
            {
                book: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Book",
                    required: true
                },

                title: {
                    type: String,
                    required: true
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "Order Placed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled"
            ],
            default: "Order Placed"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Order", orderSchema);
