
const BOOK_API_URL = "http://localhost:5000/api/books";

// Check admin login
const token = localStorage.getItem("chapterOneToken");
const savedUser = localStorage.getItem("chapterOneUser");

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

// ADD BOOK
const addBookForm = document.getElementById("addBookForm");

if (addBookForm) {
    addBookForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const message = document.getElementById("addBookMessage");
        const button = addBookForm.querySelector("button");

        const bookData = {
            title: document.getElementById("title").value.trim(),
            author: document.getElementById("author").value.trim(),
            price: Number(document.getElementById("price").value),
            category: document.getElementById("category").value,
            stock: Number(document.getElementById("stock").value),
            image: document.getElementById("image").value.trim(),
            description: document.getElementById("description").value.trim()
        };

        try {
            button.disabled = true;
            button.textContent = "Adding Book...";
            message.textContent = "Please wait...";
            message.style.color = "#243f30";

            const response = await fetch(BOOK_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(bookData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not add book");
            }

            message.textContent = "Book added successfully!";
            message.style.color = "green";

            addBookForm.reset();

        } catch (error) {
            message.textContent = error.message;
            message.style.color = "red";
        } finally {
            button.disabled = false;
            button.textContent = "Add Book to Store";
        }
    });
}
