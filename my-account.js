
// Get the logged-in user's details
const savedUser = localStorage.getItem("chapterOneUser");
const token = localStorage.getItem("chapterOneToken");

// Check whether the user is logged in
if (!savedUser || !token) {
    alert("Please login to access your account.");
    window.location.href = "login.html";
} else {
    try {
        const user = JSON.parse(savedUser);

        // Display user information
        document.getElementById("accountName").textContent =
            `Welcome, ${user.name}!`;

        document.getElementById("accountEmail").textContent =
            user.email;

    } catch (error) {
        localStorage.removeItem("chapterOneUser");
        localStorage.removeItem("chapterOneToken");

        alert("Session error. Please login again.");
        window.location.href = "login.html";
    }
}

// Logout functionality
const logoutButton = document.getElementById("accountLogout");

logoutButton.addEventListener("click", function () {
    localStorage.removeItem("chapterOneToken");
    localStorage.removeItem("chapterOneUser");

    alert("You have been logged out.");
    window.location.href = "index.html";
});
