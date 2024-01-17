if (localStorage.getItem("token")) {
} else {
    window.location.href = "/client/users/login";
}

const nameInput = document.querySelector('input[name="name"]');
const descInput = document.querySelector('input[name="description"]');
const userIdInput = document.querySelector('input[name="userId"]');

const createProject = async () => {
    const name = nameInput.value;
    const description = descInput.value;
    const userId = userIdInput.value;

    try {
        const response = await fetch("/api/users/project/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, description, userId }),
        });

        const projectData = await response.json();

        // Do something with the project data
        window.location.href = `/client/users/project/${projectData.projectData._id}`;
    } catch (error) {
        console.error(error);
    }
};

// Call the createProject function when the submit button is clicked
const submitButton = document.querySelector('input[name="submit"]');
submitButton.addEventListener("click", createProject);

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
