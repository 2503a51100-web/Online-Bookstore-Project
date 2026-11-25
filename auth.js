
const USER_API_URL = "https://online-bookstore-project-a950.onrender.com/api/users";

// CHECK ADMIN ROLES
function isAdminRole(role) {
    return role === "admin" || role === "superadmin";
}

// USER REGISTRATION
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message = document.getElementById("registerMessage");
        const button = registerForm.querySelector("button");

        if (password !== confirmPassword) {
            message.textContent =
                "Passwords do not match. Please try again.";
            message.style.color = "red";
            return;
        }

        try {
            button.disabled = true;
            button.textContent = "Creating Account...";
            message.textContent = "Please wait...";

            const response = await fetch(`${USER_API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            message.textContent =
                "Account created successfully! Redirecting to login...";
            message.style.color = "green";

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        } catch (error) {
            message.textContent = error.message;
            message.style.color = "red";

        } finally {
            button.disabled = false;
            button.textContent = "Create Account";
        }
    });
}

// USER LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const message = document.getElementById("loginMessage");
        const button = loginForm.querySelector("button");

        try {
            button.disabled = true;
            button.textContent = "Logging in...";
            message.textContent = "Please wait...";

            const response = await fetch(`${USER_API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // SAVE LOGIN DETAILS
            localStorage.setItem("chapterOneToken", data.token);

            localStorage.setItem(
                "chapterOneUser",
                JSON.stringify(data.user)
            );

            message.textContent = "Login successful! Redirecting...";
            message.style.color = "green";

            // REDIRECT BASED ON USER ROLE
            setTimeout(() => {
                if (isAdminRole(data.user.role)) {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "index.html";
                }
            }, 1000);

        } catch (error) {
            message.textContent = error.message;
            message.style.color = "red";

        } finally {
            button.disabled = false;
            button.textContent = "Login";
        }
    });
}

// DISPLAY USER ACCOUNT ON HOMEPAGE
const accountArea = document.getElementById("accountArea");

if (accountArea) {
    const savedUser = localStorage.getItem("chapterOneUser");
    const token = localStorage.getItem("chapterOneToken");

    if (savedUser && token) {
        try {
            const user = JSON.parse(savedUser);

            accountArea.innerHTML = "";

            const welcomeText = document.createElement("span");
            welcomeText.className = "welcome-user";
            welcomeText.textContent = `Welcome, ${user.name}`;

            const logoutButton = document.createElement("button");
            logoutButton.className = "logout-btn";
            logoutButton.textContent = "Logout";

            logoutButton.addEventListener("click", function() {
                localStorage.removeItem("chapterOneToken");
                localStorage.removeItem("chapterOneUser");

                window.location.reload();
            });

            const accountLink = document.createElement("a");
            accountLink.className = "account-link";

            if (isAdminRole(user.role)) {
                accountLink.href = "admin.html";

                accountLink.textContent =
                    user.role === "superadmin"
                        ? "Super Admin Dashboard"
                        : "Admin Dashboard";

            } else {
                accountLink.href = "my-account.html";
                accountLink.textContent = "My Account";
            }

            accountArea.appendChild(welcomeText);
            accountArea.appendChild(accountLink);
            accountArea.appendChild(logoutButton);

        } catch (error) {
            localStorage.removeItem("chapterOneUser");
            localStorage.removeItem("chapterOneToken");
        }
    }
}
