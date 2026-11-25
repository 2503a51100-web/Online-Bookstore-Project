
const express = require("express");
const router = express.Router();

const {
    getAllBooks,
    addBook,
    getBookById,
    updateBook,
    deleteBook
} = require("../controllers/bookController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

// Public routes
router.route("/")
    .get(getAllBooks);

router.route("/:id")
    .get(getBookById);

// Admin-only routes
router.route("/")
    .post(protect, adminOnly, addBook);

router.route("/:id")
    .put(protect, adminOnly, updateBook)
    .delete(protect, adminOnly, deleteBook);

module.exports = router;
