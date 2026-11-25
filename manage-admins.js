
const USER_API_URL = "http://localhost:5000/api/users";

const token = localStorage.getItem("chapterOneToken");
const savedUser = localStorage.getItem("chapterOneUser");

let currentUser = null;

// CHECK SUPER ADMIN ACCESS
if (!token || !savedUser) {
    window.location.href = "login.html";
} else {
    try {
        currentUser = JSON.parse(savedUser);

        if (currentUser.role !== "superadmin") {
            alert("Access denied. Only Super Admin can manage Admin accounts.");
            window.location.href = "admin.html";
        }

    } catch (error) {
        localStorage.removeItem("chapterOneUser");
        localStorage.removeItem("chapterOneToken");
        window.location.href = "login.html";
    }
}

// COMMON AUTHORIZATION HEADER
function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// LOAD EXISTING ADMINS
async function loadAdmins() {
    const adminsList = document.getElementById("adminsList");

    try {
        const response = await fetch(`${USER_API_URL}/admins`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const admins = await response.json();

        if (!response.ok) {
            throw new Error(admins.message || "Failed to load Admin accounts.");
        }

        adminsList.innerHTML = "";

        if (!Array.isArray(admins) || admins.length === 0) {
            adminsList.textContent = "No Admin accounts found.";
            return;
        }

        const table = document.createElement("table");
        table.className = "admin-table";

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        ["Name", "Email", "Role", "Created"].forEach((heading) => {
            const th = document.createElement("th");
            th.textContent = heading;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);

        const tbody = document.createElement("tbody");

        admins.forEach((admin) => {
            const row = document.createElement("tr");

            const values = [
                admin.name,
                admin.email,
                admin.role,
                admin.createdAt
                    ? new Date(admin.createdAt).toLocaleDateString()
                    : "—"
            ];

            values.forEach((value) => {
                const td = document.createElement("td");
                td.textContent = value || "—";
                row.appendChild(td);
            });

            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);

        adminsList.appendChild(table);

    } catch (error) {
        adminsList.textContent = error.message;
        console.error("Error loading Admins:", error);
    }
}

// CREATE NEW ADMIN
const createAdminForm = document.getElementById("createAdminForm");

if (createAdminForm) {
    createAdminForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("adminName").value.trim();
        const email = document.getElementById("adminEmail").value.trim();
        const password = document.getElementById("adminPassword").value;

        const message = document.getElementById("adminMessage");
        const button = createAdminForm.querySelector("button");

        try {
            button.disabled = true;
            button.textContent = "Creating Admin...";
            message.textContent = "Please wait...";
            message.style.color = "inherit";

            const response = await fetch(`${USER_API_URL}/admins`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Admin creation failed.");
            }

            message.textContent = data.message;
            message.style.color = "green";

            createAdminForm.reset();

            await loadAdmins();

        } catch (error) {
            message.textContent = error.message;
            message.style.color = "red";

        } finally {
            button.disabled = false;
            button.textContent = "Create Admin Account";
        }
    });
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

// LOAD ADMINS
if (currentUser && currentUser.role === "superadmin") {
    loadAdmins();
}
