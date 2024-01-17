if (localStorage.getItem("token")) {
} else {
    window.location.href = "/client/users/login";
}

var lastSelectedIssue;
var projectId;

const updateForm = document.querySelector("#update-form");
const updateButton = document.querySelector("#update-button");

const addActivityButton = document.getElementById("addActivityButton");

var isAddDialogShown = false;

function showActivityAdder() {
    if (
        !isAddDialogShown &&
        (lastSelectedIssue != null || lastSelectedIssue != undefined)
    ) {
        const activityList = document.getElementById("activityList");
        const timeline = activityList.innerHTML;
        var elementToAdded = `<textarea
                                style="height: 30px"
                                class="form-control"
                                aria-label="With textarea"
                                id="update-input"></textarea>
                        </div>
                        <div style="height: 10px"></div>
                        <a class="btn btn-primary" id="update-button" style="margin-bottom: 30px" onclick="callCreateActivity()">Add to timeline</a>
                        <a class="btn btn-secondary" id="close-button" style="margin-bottom: 30px" onclick="setSelectedItem('${lastSelectedIssue}')">Close</a>`;
        activityList.innerHTML = elementToAdded + timeline;
        isAddDialogShown = true;
    } else {
        console.log(`lastSelected Issue is ${lastSelectedIssue}`);
    }
}

function callCreateActivity() {
    const updateInput = document.querySelector("#update-input").value;
    if (lastSelectedIssue != null || lastSelectedIssue != undefined) {
        const issueId = lastSelectedIssue;
        createActivity(projectId, issueId, updateInput);
    } else {
        console.log(lastSelectedIssue);
    }
}

function setSelectedItem(issue) {
    lastSelectedIssue = issue;
    fetch(`/api/users/issues/${issue}/activities`)
        .then(response => response.json())
        .then(data => {
            // Update the activities list with the new activities
            const activityList = document.getElementById("activityList");
            activityList.innerHTML = "";
            isAddDialogShown = false;
            data.activities.forEach(function (activity) {
                const activityItem = `
          <li class="timeline-item mb-5">
            <h5 class="fw-bold">${activity.action}</h5>
            <p class="text-muted mb-2 fw-bold">
            ${activity.user.username}
            </p>
            <p class="text-muted">${timeSince(activity.updatedAt)}</p>
          </li>
        `;
                activityList.innerHTML += activityItem;
            });
        })
        .catch(error => console.error(error));

    //now update issue details
    fetch(`/api/users/issues/${issue}`)
        .then(response => response.json())
        .then(data => {
            // Update the activities list with the new activities
            var buttonText = data.issue.isFixed ? "Reopen" : "Mark fixed";
            var buttonClass = data.issue.isFixed ? "btn-danger" : "btn-success";
            const issue = document.getElementById("issue-details");
            issue.innerHTML = "";
            {
                const issueItem = `<span>${timeSince(
                    data.issue.createdAt
                )}</span>
                <span>
                    <svg
                        style="margin-left: 30px"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-person-fill"
                        viewBox="0 0 16 16">
                        <path
                            d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    </svg>
                    <span> ${data.issue.author.username}</span>
                </span>
                <div style="height: 10px"></div>
                <h3>${data.issue.subject}</h3>
                <div style="height: 20px"></div>
                <h6>
                ${data.issue.description}
                </h6>

                <button class="btn ${buttonClass}" onclick="setFixStatus(${!data
                    .issue.isFixed})">${buttonText}</button>`;
                issue.innerHTML += issueItem;
            }
        })
        .catch(error => console.error(error));
}

function setFixStatus(isFixed) {
    var issueId = lastSelectedIssue;
    fetch(`/api/users/issues/${issueId}/fixed`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            isFixed,
        }),
    })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
            } else {
                setSelectedItem(issueId);
                checkIssuesFixStatus();
                var closed = `This issue is closed by ${localStorage.username}`;
                var reopened = `This issue is reopened by ${localStorage.username}`;
                if (
                    lastSelectedIssue != null ||
                    lastSelectedIssue != undefined
                ) {
                    const issueId = lastSelectedIssue;
                    createActivity(
                        projectId,
                        issueId,
                        isFixed ? closed : reopened
                    );
                } else {
                    console.log(lastSelectedIssue);
                }
                // Update the UI with the new isFixed value
            }
        })
        .catch(err => console.error(err));
}

var globalIssues;
function checkIssuesFixStatus() {
    var issueList = document.getElementById("issueList");
    var projectStatusHeader = document.getElementById("project-status-header");
    var issueId = lastSelectedIssue;

    let totalIssues = 0;
    let fixedIssues = 0;
    fetch(`/client/users/project/${projectId}/issues`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
            } else {
                // Update the UI with the new isFixed value
                setSelectedItem(issueId);
                var isProjectFixed = true;
                issueList.innerHTML = "";
                totalIssues = data.issues.length;
                globalIssues = data.issues;
                data.issues.forEach(issue => {
                    if (!issue.isFixed) {
                        isProjectFixed = false;
                    } else {
                        fixedIssues = fixedIssues + 1;
                    }
                    var buttonText = isProjectFixed ? "FIXED" : "IN PROGRESS";

                    const status = document.getElementById("project-status");
                    status.innerHTML = buttonText;

                    var issueElement = issue.isFixed
                        ? `<a onclick="setSelectedItem('${issue._id}')">
                            <li
                                style="
                                    color: green;
                                    text-decoration: line-through;
                                "
                                class="issue">
                                ${issue.subject}
                            </li>
                        </a>`
                        : `<a onclick="setSelectedItem('${issue._id}')">
                            <li style="color: red" class="issue">
                                ${issue.subject}
                            </li>
                        </a>
                        `;

                    issueList.innerHTML += issueElement;
                });

                projectStatusHeader.innerHTML = `${fixedIssues} of ${totalIssues} Fixed`;
            }
        })
        .catch(err => console.error(err));
}

function setProjectId(project) {
    projectId = project;
}

const createActivity = async (projectId, issueId, updateInput) => {
    try {
        const response = await fetch(
            `/api/users/project/${projectId}/issues/${issueId}/createActivity`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: updateInput,
                    user: localStorage.getItem("userId"),
                }),
            }
        );
        setSelectedItem(lastSelectedIssue);
    } catch (error) {
        console.error(error);
    }
};

const searchForm = document.querySelector("#search-form");
const searchResults = document.querySelector("#search-results");

searchForm.addEventListener("submit", async event => {
    event.preventDefault();

    var issueList = document.getElementById("issueList");
    const subject = searchForm.querySelector("#search-title").value.trim();
    const description = searchForm
        .querySelector("#search-description")
        .value.trim();
    const author = searchForm.querySelector("#search-author").value.trim();
    const labelsInput = searchForm.querySelector("#search-labels").value.trim();
    const labels = labelsInput ? labelsInput.split(",") : [];

    // Send search parameters to server
    fetch(`/api/users/projects/${projectId}/searchIssues`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...(subject && { subject }),
            ...(description && { description }),
            ...(author && { author }),
            ...(labels.length > 0 && { labels }),
        }),
    })
        .then(res => res.json())
        .then(data => {
            {
                console.log(data);
                issueList.innerHTML = "";
                data.issues.forEach(issue => {
                    console.log(issue);
                    var issueElement = issue.isFixed
                        ? `<a onclick="setSelectedItem('${issue._id}')">
                        <li
                            style="
                                color: green;
                                text-decoration: line-through;
                            "
                            class="issue">
                            ${issue.subject}
                        </li>
                    </a>`
                        : `<a onclick="setSelectedItem('${issue._id}')">
                        <li style="color: red" class="issue">
                            ${issue.subject}
                        </li>
                    </a>
                    `;

                    issueList.innerHTML += issueElement;
                });
            }
        });
});

function timeSince(timestamp) {
    let time = Date.parse(timestamp);
    let now = Date.now();
    let secondsPast = (now - time) / 1000;
    let suffix = "ago";

    let intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
    };

    for (let i in intervals) {
        let interval = intervals[i];
        if (secondsPast >= interval) {
            let count = Math.floor(secondsPast / interval);
            return `${count} ${i} ${count > 1 ? "s" : ""} ${suffix}`;
        }
    }
}

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

function logout() {
    // Clear cache
    window.location.reload(true);

    // Clear localStorage
    localStorage.clear();

    // Redirect to login page
    window.location.href = "/client/users/login";
}
