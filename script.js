
const API_URL = "http://localhost:5000/api/books";

const searchInput = document.getElementById("searchInput");
const bookGrid = document.getElementById("bookGrid");
const cartLink = document.querySelector(".cart");

let allBooks = [];
let selectedCategory = "";

let cart = JSON.parse(localStorage.getItem("chapterOneCart") || "[]");


// ========================================
// FETCH BOOKS
// ========================================

async function fetchBooks() {
    try {
        bookGrid.innerHTML = "<p>Loading books...</p>";

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to fetch books");
        }

        allBooks = await response.json();

        displayBooks(allBooks);

    } catch (error) {
        console.error(error);
        bookGrid.innerHTML = "<p>Unable to load books. Check your backend.</p>";
    }
}


// ========================================
// DISPLAY BOOKS
// ========================================

function displayBooks(books) {
    bookGrid.innerHTML = "";

    if (books.length === 0) {
        bookGrid.innerHTML = "<p>No books available currently.</p>";
        return;
    }

    books.forEach(book => {

        const card = document.createElement("div");
        card.className = "book-card";

        // BOOK IMAGE
        const image = document.createElement("img");

        image.src = book.image ||
            "https://placehold.co/300x400/f0ece2/243b2d?text=Book+Cover";

        image.alt = book.title || "Book cover";
        image.style.cursor = "pointer";

        image.onerror = function () {
            this.onerror = null;
            this.src = "https://placehold.co/300x400/f0ece2/243b2d?text=Book+Cover";
        };

        // BOOK TITLE
        const title = document.createElement("h3");
        title.textContent = book.title;
        title.style.cursor = "pointer";

        // AUTHOR
        const author = document.createElement("p");
        author.textContent = book.author;

        // PRICE
        const price = document.createElement("strong");
        price.textContent = "₹" + book.price;

        // ADD TO CART BUTTON
        const addButton = document.createElement("button");
        addButton.className = "add-cart-btn";
        addButton.textContent = "Add to Cart";

        addButton.addEventListener("click", (event) => {
            event.stopPropagation();
            addToCart(book);
        });

        // OPEN BOOK DETAILS
        function openBookDetails() {
            window.location.href =
                `book-details.html?id=${encodeURIComponent(book._id)}`;
        }

        image.addEventListener("click", openBookDetails);
        title.addEventListener("click", openBookDetails);
        author.style.cursor = "pointer";
        author.addEventListener("click", openBookDetails);

        card.append(image, title, author, price, addButton);

        bookGrid.appendChild(card);
    });
}



// ========================================
// SEARCH AND CATEGORY FILTER
// ========================================

function filterBooks() {

    const value = searchInput.value.toLowerCase().trim();

    const filteredBooks = allBooks.filter(book => {

        const matchesSearch =
            (book.title || "").toLowerCase().includes(value) ||
            (book.author || "").toLowerCase().includes(value) ||
            (book.category || "").toLowerCase().includes(value);

        const matchesCategory =
            !selectedCategory || book.category === selectedCategory;

        return matchesSearch && matchesCategory;

    });

    displayBooks(filteredBooks);
}

// SEARCH EVENT
searchInput.addEventListener("input", filterBooks);


// CATEGORY CLICK EVENTS
const categoryCards = document.querySelectorAll(".category-card");

categoryCards.forEach(card => {

    card.addEventListener("click", function(event) {

        event.preventDefault();

        selectedCategory = this.dataset.category || "";

        filterBooks();

        document.getElementById("bestsellers").scrollIntoView({
            behavior: "smooth"
        });

    });

});


// ========================================
// SEARCH BOOK AND REDIRECT ON ENTER
// ========================================

searchInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        const searchValue = searchInput.value.toLowerCase().trim();

        if (!searchValue) {
            return;
        }

        // First, look for an exact book title
        let matchedBook = allBooks.find(book =>
            (book.title || "").toLowerCase() === searchValue
        );

        // If no exact match, look for a title containing the search
        if (!matchedBook) {
            matchedBook = allBooks.find(book =>
                (book.title || "").toLowerCase().includes(searchValue)
            );
        }

        if (matchedBook) {

            window.location.href =
                `book-details.html?id=${encodeURIComponent(matchedBook._id)}`;

        } else {

            alert("Sorry! No matching book found.");

        }
    }

});


// ========================================
// SAVE CART
// ========================================

function saveCart() {

    localStorage.setItem("chapterOneCart", JSON.stringify(cart));

    updateCartCount();
}


// ========================================
// UPDATE CART COUNT
// ========================================

function updateCartCount() {

    const count = cart.reduce(
        (total, item) => total + item.quantity, 0
    );

    cartLink.textContent = `🛒 Cart (${count})`;
}


// ========================================
// ADD TO CART
// ========================================

function addToCart(book) {

    if (book.stock <= 0) {
        alert("Sorry, this book is out of stock.");
        return;
    }

    const existingItem = cart.find(
        item => item._id === book._id
    );

    if (existingItem) {

        if (existingItem.quantity >= book.stock) {
            alert("You cannot add more than the available stock.");
            return;
        }

        existingItem.quantity++;

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

    saveCart();

    alert(book.title + " added to cart!");
}



// ========================================
// CART WINDOW
// ========================================

const cartModal = document.createElement("div");
cartModal.className = "cart-modal";

cartModal.innerHTML = `
    <div class="cart-content">

        <div class="cart-heading">
            <h2>Your Shopping Cart</h2>
            <button class="close-cart" aria-label="Close cart">&times;</button>
        </div>

        <div class="cart-items"></div>

        <div class="cart-footer">
            <h3 class="cart-total">Total: ₹0</h3>

            <button class="clear-cart-btn">Clear Cart</button>

            <button class="checkout-btn">
                Proceed to Checkout
            </button>
        </div>

    </div>
`;

document.body.appendChild(cartModal);

// ========================================
// PROCEED TO CHECKOUT
// ========================================

cartModal.querySelector(".checkout-btn").addEventListener("click", function () {

    if (cart.length === 0) {
        alert("Your cart is empty. Please add books first.");
        return;
    }

    const token = localStorage.getItem("chapterOneToken");

    if (!token) {
        alert("Please login before checkout.");
        window.location.href = "login.html";
        return;
    }

    window.location.href = "checkout.html";

});

// ========================================
// OPEN AND CLOSE CART
// ========================================

cartLink.addEventListener("click", function (event) {

    event.preventDefault();

    cartModal.classList.add("active");

    renderCart();
});


cartModal.querySelector(".close-cart").addEventListener("click", function () {

    cartModal.classList.remove("active");

});


cartModal.addEventListener("click", function (event) {

    if (event.target === cartModal) {
        cartModal.classList.remove("active");
    }

});


// ========================================
// DISPLAY CART ITEMS
// ========================================

function renderCart() {

    const cartItems = cartModal.querySelector(".cart-items");
    const totalElement = cartModal.querySelector(".cart-total");

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML = "<p>Your cart is empty.</p>";

        totalElement.textContent = "Total: ₹0";

        return;
    }

    let total = 0;

    cart.forEach(item => {

        total += item.price * item.quantity;

        const row = document.createElement("div");
        row.className = "cart-item";

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = item.title;

        const price = document.createElement("p");
        price.textContent = `₹${item.price} × ${item.quantity}`;

        details.append(title, price);

        const controls = document.createElement("div");
        controls.className = "quantity-controls";

        const minus = document.createElement("button");
        minus.textContent = "−";

        minus.addEventListener("click", () => {
            changeQuantity(item._id, -1);
        });

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const plus = document.createElement("button");
        plus.textContent = "+";

        plus.addEventListener("click", () => {
            changeQuantity(item._id, 1);
        });

        const remove = document.createElement("button");
        remove.textContent = "Remove";

        remove.addEventListener("click", () => {
            removeFromCart(item._id);
        });

        controls.append(minus, quantity, plus, remove);

        row.append(details, controls);

        cartItems.appendChild(row);

    });

    totalElement.textContent = "Total: ₹" + total;
}


// ========================================
// CHANGE QUANTITY
// ========================================

function changeQuantity(id, change) {

    const item = cart.find(book => book._id === id);

    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
        removeFromCart(id);
        return;
    }

    if (newQuantity > item.stock) {
        alert("Available stock limit reached.");
        return;
    }

    item.quantity = newQuantity;

    saveCart();

    renderCart();
}


// ========================================
// REMOVE FROM CART
// ========================================

function removeFromCart(id) {

    cart = cart.filter(item => item._id !== id);

    saveCart();

    renderCart();
}


// ========================================
// CLEAR CART
// ========================================

cartModal.querySelector(".clear-cart-btn").addEventListener("click", function () {

    cart = [];

    saveCart();

    renderCart();

});


// ========================================
// INITIALIZE
// ========================================

updateCartCount();

fetchBooks();
