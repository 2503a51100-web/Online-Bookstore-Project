
const ORDER_API_URL = "http://localhost:5000/api/orders";

const savedUser = localStorage.getItem("chapterOneUser");
const token = localStorage.getItem("chapterOneToken");

const ordersContainer = document.getElementById("ordersContainer");

// CHECK LOGIN
if (!savedUser || !token) {
    alert("Please login to view your orders.");
    window.location.href = "login.html";
} else {
    loadMyOrders();
}

// ESCAPE TEXT BEFORE DISPLAYING
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// LOAD CUSTOMER ORDERS FROM MONGODB
async function loadMyOrders() {
    try {
        ordersContainer.innerHTML = "<p>Loading your orders...</p>";

        const response = await fetch(`${ORDER_API_URL}/my-orders`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load orders.");
        }

        displayOrders(data);

    } catch (error) {
        ordersContainer.innerHTML = `
            <div class="empty-orders">
                <h2>Unable to load orders</h2>
                <p>${escapeHTML(error.message)}</p>
                <button onclick="loadMyOrders()">Try Again</button>
            </div>
        `;
    }
}

// DISPLAY ORDER HISTORY
function displayOrders(orders) {
    if (!Array.isArray(orders) || orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-orders">
                <h2>No orders yet</h2>
                <p>Your reading journey starts with your first order.</p>
                <a href="index.html#bestsellers">Explore Books</a>
            </div>
        `;
        return;
    }

    ordersContainer.innerHTML = orders.map(order => `
        <div class="order-card">

            <div class="order-header">
                <h2>Order #${escapeHTML(order._id)}</h2>
                <span>${escapeHTML(order.status)}</span>
            </div>

            <p class="order-date">
                Ordered on:
                ${new Date(order.createdAt).toLocaleDateString("en-IN")}
            </p>

            <div class="order-books">
                ${order.items.map(item => `
                    <div class="order-book">
                        <span>
                            ${escapeHTML(item.title)} × ${Number(item.quantity)}
                        </span>

                        <span>
                            ₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                        </span>
                    </div>
                `).join("")}
            </div>

            <h3 class="order-total">
                Total: ₹${Number(order.totalAmount).toFixed(2)}
            </h3>

        </div>
    `).join("");
}
