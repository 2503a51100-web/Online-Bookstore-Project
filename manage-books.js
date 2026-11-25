
const BOOK_API_URL = "https://online-bookstore-project-a950.onrender.com/api/books";

const token = localStorage.getItem("chapterOneToken");
const savedUser = localStorage.getItem("chapterOneUser");

const booksList = document.getElementById("manageBooksList");
const searchInput = document.getElementById("bookSearch");
const categoryFilter = document.getElementById("categoryFilter");
const message = document.getElementById("manageBooksMessage");

let allBooks = [];

// CHECK ADMIN ACCESS
if (!token || !savedUser) {
    window.location.href = "login.html";
} else {
    try {
        const user = JSON.parse(savedUser);

    if (!["admin", "superadmin"].includes(user.role)) {
        alert("Access denied. Admin privileges required.");
        window.location.href = "index.html";
    }   
    } catch (error) {
        localStorage.removeItem("chapterOneToken");
        localStorage.removeItem("chapterOneUser");
        window.location.href = "login.html";
    }
}

// LOAD BOOKS
async function loadBooks() {
    try {
        booksList.innerHTML = `
            <tr>
                <td colspan="6">Loading books...</td>
            </tr>
        `;

        const response = await fetch(BOOK_API_URL);
        const books = await response.json();

        if (!response.ok) {
            throw new Error("Could not load books.");
        }

        allBooks = Array.isArray(books) ? books : [];

        displayBooks(allBooks);

    } catch (error) {
        booksList.innerHTML = `
            <tr>
                <td colspan="6">Unable to load books. Please try again.</td>
            </tr>
        `;

        console.error("Error loading books:", error);
    }
}

// DISPLAY BOOKS
function displayBooks(books) {
    if (books.length === 0) {
        booksList.innerHTML = `
            <tr>
                <td colspan="6">No books found.</td>
            </tr>
        `;
        return;
    }

    booksList.innerHTML = books.map(book => `
        <tr>
            <td>${escapeHTML(book.title)}</td>
            <td>${escapeHTML(book.author)}</td>
            <td>${escapeHTML(book.category)}</td>
            <td>₹${Number(book.price).toFixed(2)}</td>
            <td>${Number(book.stock)}</td>
            <td>
                <button
                    class="edit-book-btn"
                    onclick="editBook('${book._id}')">
                    Edit
                </button>

                <button
                    class="delete-book-btn"
                    onclick="deleteBook('${book._id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
}

// SAFELY DISPLAY TEXT
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// SEARCH AND GENRE FILTER
function filterBooks() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;

    const filteredBooks = allBooks.filter(book => {
        const matchesSearch =
            book.title.toLowerCase().includes(searchText) ||
            book.author.toLowerCase().includes(searchText);

        const matchesCategory =
            !selectedCategory || book.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayBooks(filteredBooks);
}

searchInput.addEventListener("input", filterBooks);
categoryFilter.addEventListener("change", filterBooks);

// EDIT BOOK
async function editBook(id) {
    const book = allBooks.find(item => item._id === id);

    if (!book) return;

    const title = prompt("Enter book title:", book.title);
    if (title === null) return;

    const author = prompt("Enter author:", book.author);
    if (author === null) return;

    const price = prompt("Enter price:", book.price);
    if (price === null) return;

    const category = prompt("Enter genre:", book.category);
    if (category === null) return;

    const stock = prompt("Enter stock:", book.stock);
    if (stock === null) return;

    const image = prompt("Enter cover image URL:", book.image || "");
    if (image === null) return;

    const description = prompt("Enter book description:", book.description || "");
    if (description === null) return;

    const updatedBook = {
        title: title.trim(),
        author: author.trim(),
        price: Number(price),
        category: category.trim(),
        stock: Number(stock),
        image: image.trim(),
        description: description.trim()
    };

    if (
        !updatedBook.title ||
        !updatedBook.author ||
        !updatedBook.category ||
        !Number.isFinite(updatedBook.price) ||
        updatedBook.price < 0 ||
        !Number.isInteger(updatedBook.stock) ||
        updatedBook.stock < 0
    ) {
        alert("Please enter valid book details.");
        return;
    }

    try {
        const response = await fetch(`${BOOK_API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedBook)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not update book.");
        }

        alert("Book updated successfully!");
        await loadBooks();

    } catch (error) {
        alert(error.message);
    }
}

// DELETE BOOK
async function deleteBook(id) {
    const book = allBooks.find(item => item._id === id);

    if (!book) return;

    const confirmed = confirm(
        `Are you sure you want to delete "${book.title}"?`
    );

    if (!confirmed) return;

    try {
        const response = await fetch(`${BOOK_API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not delete book.");
        }

        alert("Book deleted successfully!");
        await loadBooks();

    } catch (error) {
        alert(error.message);
    }
}

// LOAD BOOKS WHEN PAGE OPENS
loadBooks();
