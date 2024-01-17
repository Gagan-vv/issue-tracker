if (localStorage.getItem("token")) {
} else {
    window.location.href = "/client/users/login";
}

const issueForm = document.querySelector("#issue-form");

issueForm.addEventListener("submit", async event => {
    event.preventDefault();

    const subject = issueForm.elements["subject"].value;
    const description = issueForm.elements["description"].value;
    var labels = issueForm.elements["labels"].value;
    const author = localStorage.getItem("userId");
    const projectId = issueForm.elements["projectId"].value;

    var lablesArr = labels.split(",").map(function (value) {
        return value.trim();
    });

    try {
        const response = await fetch(`/api/users/project/${projectId}/issues`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                subject,
                description,
                labels: lablesArr,
                author,
            }),
        });

        const data = await response.json();

        window.history.go(-1);
    } catch (error) {
        console.error(error);
    }
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
