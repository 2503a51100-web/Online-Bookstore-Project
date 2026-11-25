
const ORDER_API_URL = "http://localhost:5000/api/orders";

const savedUser = localStorage.getItem("chapterOneUser");
const token = localStorage.getItem("chapterOneToken");

const checkoutForm = document.getElementById("checkoutForm");
const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutMessage = document.getElementById("checkoutMessage");

let user = null;
let cart = [];

if (!savedUser || !token) {
    alert("Please login before checkout.");
    window.location.href = "login.html";
}

try {
    user = JSON.parse(savedUser || "null");
    cart = JSON.parse(localStorage.getItem("chapterOneCart") || "[]");

    if (!user || !Array.isArray(cart)) {
        throw new Error("Invalid checkout data.");
    }
} catch (error) {
    user = null;
    cart = [];
}

// PREFILL CUSTOMER DETAILS
if (user) {
    document.getElementById("customerName").value = user.name || "";
    document.getElementById("customerEmail").value = user.email || "";
}

// DISPLAY CART SUMMARY
function displayCheckoutSummary() {
    if (!cart.length) {
        checkoutItems.innerHTML = `
            <p>Your cart is empty.</p>
            <a href="index.html">Continue Shopping</a>
        `;

        checkoutTotal.textContent = "₹0.00";
        checkoutForm.querySelector("button").disabled = true;
        return;
    }

    let total = 0;

    checkoutItems.innerHTML = cart.map(item => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        const itemTotal = price * quantity;

        total += itemTotal;

        return `
            <div class="checkout-item">
                <span>${escapeHTML(item.title)} × ${quantity}</span>
                <strong>₹${itemTotal.toFixed(2)}</strong>
            </div>
        `;
    }).join("");

    checkoutTotal.textContent = `₹${total.toFixed(2)}`;
}

// ESCAPE BOOK TITLES
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

displayCheckoutSummary();

// PLACE ORDER IN MONGODB
checkoutForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!user || !token) {
        alert("Please login again.");
        window.location.href = "login.html";
        return;
    }

    if (!cart.length) {
        checkoutMessage.textContent = "Your cart is empty.";
        return;
    }

    const button = checkoutForm.querySelector("button");

    const orderData = {
        customerName: document.getElementById("customerName").value.trim(),
        customerEmail: document.getElementById("customerEmail").value.trim(),
        customerPhone: document.getElementById("customerPhone").value.trim(),
        customerAddress: document.getElementById("customerAddress").value.trim(),
        customerCity: document.getElementById("customerCity").value.trim(),
        customerPincode: document.getElementById("customerPincode").value.trim(),

        items: cart.map(item => ({
            book: item._id || item.book,
            title: item.title,
            price: Number(item.price),
            quantity: Number(item.quantity)
        }))
    };

    if (orderData.items.some(item => !item.book)) {
        checkoutMessage.textContent =
            "A book is missing its ID. Please remove it from your cart and add it again.";

        return;
    }

    try {
        button.disabled = true;
        button.textContent = "Placing Order...";
        checkoutMessage.textContent = "Please wait...";

        const response = await fetch(ORDER_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to place your order.");
        }

        // Clear cart only after successful server response
        localStorage.removeItem("chapterOneCart");

        alert("Your order has been placed successfully!");

        window.location.href = "my-orders.html";

    } catch (error) {
        checkoutMessage.textContent = error.message;
        button.disabled = false;
        button.textContent = "Place Order";
    }
});
