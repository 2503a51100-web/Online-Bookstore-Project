
const ORDER_API_URL = "https://online-bookstore-project-a950.onrender.com/api/orders";

const token = localStorage.getItem("chapterOneToken");
const savedUser = localStorage.getItem("chapterOneUser");

const ordersList = document.getElementById("manageOrdersList");
const searchInput = document.getElementById("orderSearch");
const statusFilter = document.getElementById("orderStatusFilter");

let allOrders = [];

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

// ESCAPE TEXT
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// LOAD ALL ORDERS
async function loadOrders() {
    try {
        ordersList.innerHTML = "<p>Loading orders...</p>";

        const response = await fetch(`${ORDER_API_URL}/all`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load orders.");
        }

        allOrders = Array.isArray(data) ? data : [];

        updateOrderStats();
        filterOrders();

    } catch (error) {
        ordersList.innerHTML = `
            <p>${escapeHTML(error.message)}</p>
        `;
    }
}

// UPDATE ORDER STATISTICS
function updateOrderStats() {
    document.getElementById("adminTotalOrders").textContent =
        allOrders.length;

    document.getElementById("adminProcessingOrders").textContent =
        allOrders.filter(order => order.status === "Processing").length;

    document.getElementById("adminShippedOrders").textContent =
        allOrders.filter(order => order.status === "Shipped").length;

    document.getElementById("adminDeliveredOrders").textContent =
        allOrders.filter(order => order.status === "Delivered").length;
}

// FILTER ORDERS
function filterOrders() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedStatus = statusFilter.value;

    const filteredOrders = allOrders.filter(order => {
        const customerName = order.customerName || "";
        const customerEmail = order.customerEmail || "";

        const matchesSearch =
            customerName.toLowerCase().includes(searchText) ||
            customerEmail.toLowerCase().includes(searchText);

        const matchesStatus =
            !selectedStatus || order.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    displayOrders(filteredOrders);
}

// DISPLAY ORDERS
function displayOrders(orders) {
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-orders">
                <h2>No orders found</h2>
                <p>Customer orders will appear here.</p>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="admin-order-card">

            <div class="admin-order-header">
                <div>
                    <h2>Order #${escapeHTML(order._id)}</h2>
                    <p>
                        ${new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                </div>

                <span class="admin-order-status">
                    ${escapeHTML(order.status)}
                </span>
            </div>

            <div class="admin-customer-details">
                <h3>Customer Details</h3>
                <p><strong>Name:</strong> ${escapeHTML(order.customerName)}</p>
                <p><strong>Email:</strong> ${escapeHTML(order.customerEmail)}</p>
                <p><strong>Phone:</strong> ${escapeHTML(order.customerPhone)}</p>
                <p><strong>Address:</strong>
                    ${escapeHTML(order.customerAddress)},
                    ${escapeHTML(order.customerCity)} -
                    ${escapeHTML(order.customerPincode)}
                </p>
            </div>

            <div class="admin-ordered-books">
                <h3>Ordered Books</h3>

                ${order.items.map(item => `
                    <div class="admin-order-book">
                        <span>
                            ${escapeHTML(item.title)} × ${Number(item.quantity)}
                        </span>

                        <strong>
                            ₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                        </strong>
                    </div>
                `).join("")}
            </div>

            <div class="admin-order-footer">
                <h3>
                    Total: ₹${Number(order.totalAmount).toFixed(2)}
                </h3>

                <div class="order-status-control">
                    <label>Update Status:</label>

                    <select
                        id="status-${escapeHTML(order._id)}"
                        onchange="updateOrderStatus('${escapeHTML(order._id)}', this.value)"
                    >
                        <option value="Order Placed" ${order.status === "Order Placed" ? "selected" : ""}>Order Placed</option>
                        <option value="Processing" ${order.status === "Processing" ? "selected" : ""}>Processing</option>
                        <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
                        <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
                        <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                    </select>
                </div>
            </div>

        </div>
    `).join("");
}

// UPDATE ORDER STATUS
async function updateOrderStatus(orderId, newStatus) {
    const confirmed = confirm(
        `Change this order's status to "${newStatus}"?`
    );

    if (!confirmed) {
        filterOrders();
        return;
    }

    try {
        const response = await fetch(
            `${ORDER_API_URL}/${orderId}/status`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not update order.");
        }

        alert("Order status updated successfully!");

        await loadOrders();

    } catch (error) {
        alert(error.message);
        await loadOrders();
    }
}

// SEARCH AND FILTER EVENTS
searchInput.addEventListener("input", filterOrders);
statusFilter.addEventListener("change", filterOrders);

// LOAD ORDERS WHEN PAGE OPENS
loadOrders();
