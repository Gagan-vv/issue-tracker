let login = document.querySelector(".login");
let create = document.querySelector(".create");
let container = document.querySelector(".container");

const loginForm = document.querySelector(".signin");
const usernameInput = loginForm.querySelector('input[type="text"]');
const passwordInput = loginForm.querySelector('input[type="password"]');
const submitButton = loginForm.querySelector('input[type="submit"]');

submitButton.addEventListener("click", event => {
    event.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    fetch("/api/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }),
    })
        .then(response => response.json())
        .then(data => {
            // Save user data to localStorage
            localStorage.setItem("userId", data._id);
            localStorage.setItem("username", data.username);
            localStorage.setItem("role", data.role);
            localStorage.setItem("token", data.token);

            // Redirect to dashboard.ejs on successful login
            // Get the user ID from localStorage
            const userId = localStorage.getItem("userId");

            openDashboard();

            // Construct the URL for the dashboard page with the user ID as a query parameter
            // window.location.href =
            //     "/client/users/dashboard?id=" +
            //     data._id +
            //     "&token=" +
            //     data.token;

            // // Navigate to the dashboard page
            // window.location.href = dashboardUrl;
        })
        .catch(error => {
            console.error("Error:", error);
        });
});

const openDashboard = async () => {
    try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        if (!userId || !token) {
            console.log("User not authenticated");
            return;
        }

        const response = await fetch(`/api/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        window.location.href = `/client/users/dashboard/${userId}`;

        if (!response.ok) {
            throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
    } catch (error) {
        console.error(error);
    }
};

login.onclick = function () {
    container.classList.add("signinForm");
};

create.onclick = function () {
    container.classList.remove("signinForm");
};

const signupForm = document.querySelector(".signup");
const usernameSignupInput = signupForm.querySelector('input[name="username"]');
const emailInput = signupForm.querySelector('input[name="email"]');
const passwordSignupInput = signupForm.querySelector('input[name="password"]');
const confirmPasswordInput = signupForm.querySelector(
    'input[name="confirmPassword"]'
);
const signupButton = signupForm.querySelector('input[name="submitSignup"]');

signupButton.addEventListener("click", event => {
    event.preventDefault();
    const username = usernameSignupInput.value;
    const email = emailInput.value;
    const password = passwordSignupInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    fetch("/api/users/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, role: "user" }),
    })
        .then(response => response.json())
        .then(data => {
            // Save user data to localStorage
            localStorage.setItem("userId", data._id);
            localStorage.setItem("username", data.username);
            localStorage.setItem("role", data.role);
            localStorage.setItem("token", data.token);

            // Redirect to dashboard on successful signup
            openDashboard();
        })
        .catch(error => {
            console.error("Error:", error);
        });
});

window.addEventListener("pageshow", function (event) {
    var historyTraversal =
        event.persisted ||
        (typeof window.performance != "undefined" &&
            window.performance.navigation.type === 2);
    if (historyTraversal) {
        // Handle page restore.
        window.location.reload();
    }
});
