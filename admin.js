
const ADMIN_API_URL = "https://online-bookstore-project-a950.onrender.com/api";

// GET LOGIN DETAILS
const token = localStorage.getItem("chapterOneToken");
const savedUser = localStorage.getItem("chapterOneUser");

let currentUser = null;
let hasAdminAccess = false;

// CHECK ADMIN DASHBOARD ACCESS
if (!token || !savedUser) {
    window.location.href = "login.html";
} else {
    try {
        currentUser = JSON.parse(savedUser);

        hasAdminAccess = ["admin", "superadmin"].includes(
            currentUser.role
        );

        if (!hasAdminAccess) {
            alert("Access denied. Admin privileges required.");
            window.location.href = "index.html";
        }

    } catch (error) {
        localStorage.removeItem("chapterOneUser");
        localStorage.removeItem("chapterOneToken");

        window.location.href = "login.html";
    }
}

// SHOW SUPER ADMIN SECTION
function setupSuperAdminSection() {
    const superAdminSection =
        document.getElementById("superAdminSection");

    if (superAdminSection && currentUser) {
        superAdminSection.style.display =
            currentUser.role === "superadmin" ? "block" : "none";
    }
}

// LOAD TOTAL BOOKS
async function loadTotalBooks() {
    try {
        const response = await fetch(`${ADMIN_API_URL}/books`);
        const books = await response.json();

        if (!response.ok) {
            throw new Error("Could not load books");
        }

        document.getElementById("totalBooks").textContent =
            Array.isArray(books) ? books.length : 0;

    } catch (error) {
        console.error("Error loading books:", error);
    }
}

// LOAD TOTAL ORDERS
async function loadTotalOrders() {
    try {
        const response = await fetch(`${ADMIN_API_URL}/orders/all`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const orders = await response.json();

        if (!response.ok) {
            throw new Error(orders.message || "Could not load orders");
        }

        document.getElementById("totalOrders").textContent =
            Array.isArray(orders) ? orders.length : 0;

    } catch (error) {
        console.error("Error loading orders:", error);
    }
}

// LOGOUT
const adminLogout = document.getElementById("adminLogout");

if (adminLogout) {
    adminLogout.addEventListener("click", function() {
        localStorage.removeItem("chapterOneToken");
        localStorage.removeItem("chapterOneUser");

        window.location.href = "index.html";
    });
}

// RUN DASHBOARD ONLY FOR ADMIN ROLES
if (hasAdminAccess) {
    setupSuperAdminSection();
    loadTotalBooks();
    loadTotalOrders();
}
