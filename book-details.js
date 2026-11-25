
const API_URL = "https://online-bookstore-project-a950.onrender.com/api/books";

const bookDetails = document.getElementById("bookDetails");

// Get the selected book ID from the URL
const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");

// Load selected book
async function loadBookDetails() {

    if (!bookId) {
        bookDetails.innerHTML = "<p>No book was selected.</p>";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${bookId}`);
        const book = await response.json();

        if (!response.ok) {
            throw new Error(book.message || "Unable to load book details.");
        }

        displayBookDetails(book);

    } catch (error) {
        bookDetails.innerHTML = `
            <p>Unable to load book details.</p>
            <p>${error.message}</p>
            <a href="index.html">Return to Home</a>
        `;
    }
}


// Display book information
function displayBookDetails(book) {

    const image = book.image ||
        "https://placehold.co/400x550?text=No+Book+Image";

    const stockMessage = book.stock > 0
        ? `Available (${book.stock} copies)`
        : "Currently Out of Stock";

    bookDetails.innerHTML = `
        <div class="book-detail-image">
            <img src="${image}" alt="${book.title}"
                 onerror="this.src='https://placehold.co/400x550?text=Book+Image'">
        </div>

        <div class="book-detail-info">

            <p class="section-label">${book.category || "General"}</p>

            <h1>${book.title}</h1>

            <p class="book-detail-author">
                By ${book.author}
            </p>

            <h2>₹${Number(book.price).toFixed(2)}</h2>

            <p class="book-detail-description">
                ${book.description || "No description available for this book."}
            </p>

            <p class="book-stock">
                ${stockMessage}
            </p>

            <button
                id="detailAddCart"
                class="add-cart-btn"
                ${book.stock <= 0 ? "disabled" : ""}
            >
                ${book.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>

            <a href="index.html#bestsellers" class="back-to-books">
                ← Continue Shopping
            </a>

        </div>
    `;

    const addButton = document.getElementById("detailAddCart");

    if (book.stock > 0) {
        addButton.addEventListener("click", function () {
            addBookToCart(book);
        });
    }
}


// Add selected book to cart
function addBookToCart(book) {

    let cart = JSON.parse(
        localStorage.getItem("chapterOneCart") || "[]"
    );

    const existingBook = cart.find(
        item => item._id === book._id
    );

    if (existingBook) {

        if (existingBook.quantity >= book.stock) {
            alert("You cannot add more than the available stock.");
            return;
        }

        existingBook.quantity++;

    } else {

        cart.push({
            _id: book._id,
            title: book.title,
            author: book.author,
            price: book.price,
            image: book.image,
            stock: book.stock,
            quantity: 1
        });

    }

    localStorage.setItem(
        "chapterOneCart",
        JSON.stringify(cart)
    );

    alert("Book added to your cart!");
}


// Start loading
loadBookDetails();
