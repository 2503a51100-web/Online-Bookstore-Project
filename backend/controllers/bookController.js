
const Book = require("../models/book");

// 1. Get all books
const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching books",
            error: error.message
        });
    }
};

// 2. Add a new book
const addBook = async (req, res) => {
    try {
        const newBook = new Book(req.body);
        const savedBook = await newBook.save();

        res.status(201).json(savedBook);
    } catch (error) {
        res.status(500).json({
            message: "Error adding book",
            error: error.message
        });
    }
};

// 3. Get a single book by ID
const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching book",
            error: error.message
        });
    }
};

// 4. Update book
const updateBook = async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedBook) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json(updatedBook);
    } catch (error) {
        res.status(500).json({
            message: "Error updating book",
            error: error.message
        });
    }
};

// 5. Delete book
const deleteBook = async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);

        if (!deletedBook) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting book",
            error: error.message
        });
    }
};

// Export all controller functions
module.exports = {
    getAllBooks,
    addBook,
    getBookById,
    updateBook,
    deleteBook
};
