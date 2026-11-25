
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        author: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        image: {
            type: String,
            default: ""
        },

        description: {
            type: String,
            default: ""
        },

        category: {
            type: String,
            default: "General"
        },

        stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, "Stock cannot be negative."],
    validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number."
    }
}
    },
    { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
