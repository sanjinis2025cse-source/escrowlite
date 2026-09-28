const userId = sessionStorage.getItem("userId");
const userName = sessionStorage.getItem("userName");
const userRole = sessionStorage.getItem("userRole");

const projectSelect = document.getElementById("projectSelect");
const milestoneGrid = document.getElementById("milestoneGrid");

const createMilestoneButton =
    document.getElementById("createMilestoneButton");

const milestoneModal =
    document.getElementById("milestoneModal");

const milestoneForm =
    document.getElementById("milestoneForm");

const closeModalButton =
    document.getElementById("closeModalButton");

const cancelButton =
    document.getElementById("cancelButton");

const saveMilestoneButton =
    document.getElementById("saveMilestoneButton");

const message =
    document.getElementById("message");

const logoutButton =
    document.getElementById("logoutButton");

const dashboardLink =
    document.getElementById("dashboardLink");

const profileName =
    document.getElementById("profileName");

const profileRole =
    document.getElementById("profileRole");

const avatar =
    document.getElementById("avatar");

const pageDescription =
    document.getElementById("pageDescription");


document.addEventListener("DOMContentLoaded", async () => {

    if (!userId || !userRole) {
        window.location.href = "/login";
        return;
    }

    setupUserInterface();

    setupModal();

    setupLogout();

    await loadProjects();

});


function setupUserInterface() {

    profileName.textContent = userName || "User";

    avatar.textContent =
        (userName || "U").charAt(0).toUpperCase();


    if (userRole === "CLIENT") {

        profileRole.textContent = "Client Account";

        dashboardLink.href = "/client-dashboard";

        pageDescription.textContent =
            "Create and manage milestones for your projects.";

        createMilestoneButton.style.display = "block";

    } else if (userRole === "FREELANCER") {

        profileRole.textContent = "Freelancer Account";

        dashboardLink.href = "/freelancer-dashboard";

        pageDescription.textContent =
            "View your assigned project milestones and track progress.";

        createMilestoneButton.style.display = "none";

    } else {

        window.location.href = "/login";

    }

}


async function loadProjects() {

    try {

        let url = "/api/projects";


        if (userRole === "CLIENT") {

            url =
                `/api/projects/client/${userId}`;

        } else if (userRole === "FREELANCER") {

            url =
                `/api/projects/freelancer/${userId}`;

        }


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Unable to load projects."
            );

        }


        const projects =
            await response.json();


        projectSelect.innerHTML =
            '<option value="">Select a project</option>';


        if (!Array.isArray(projects) ||
            projects.length === 0) {

            showEmptyProjects();

            return;

        }


        projects.forEach(project => {

            const option =
                document.createElement("option");

            option.value = project.id;

            option.textContent =
                `${project.title} - ₹${formatAmount(project.budget)}`;

            projectSelect.appendChild(option);

        });


        const savedProjectId =
            new URLSearchParams(window.location.search)
                .get("projectId");


        if (savedProjectId &&
            projects.some(
                project =>
                    String(project.id) === String(savedProjectId)
            )) {

            projectSelect.value =
                savedProjectId;

            await loadMilestones(savedProjectId);

        } else {

            projectSelect.value =
                projects[0].id;

            await loadMilestones(projects[0].id);

        }

    } catch (error) {

        console.error(
            "Project loading error:",
            error
        );

        showMessage(
            "Unable to load projects.",
            "error"
        );

        milestoneGrid.innerHTML = `
            <div class="empty-state">

                <h3>
                    Unable to load projects
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>
        `;

    }

}


function showEmptyProjects() {

    milestoneGrid.innerHTML = `
        <div class="empty-state">

            <h3>
                No projects found
            </h3>

            <p>
                ${
                    userRole === "CLIENT"
                        ? "Create a project first before adding milestones."
                        : "You do not have any assigned projects yet."
                }
            </p>

        </div>
    `;

}


projectSelect.addEventListener(
    "change",
    async () => {

        const projectId =
            projectSelect.value;


        if (!projectId) {

            milestoneGrid.innerHTML = `
                <div class="empty-state">

                    <h3>
                        Select a project
                    </h3>

                    <p>
                        Choose a project above to view its milestones.
                    </p>

                </div>
            `;

            return;

        }


        await loadMilestones(projectId);

    }
);


async function loadMilestones(projectId) {

    milestoneGrid.innerHTML = `
        <div class="empty-state">

            <h3>
                Loading milestones...
            </h3>

            <p>
                Please wait.
            </p>

        </div>
    `;


    try {

        const response =
            await fetch(
                `/api/milestones/project/${projectId}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load milestones."
            );

        }


        const milestones =
            await response.json();


        displayMilestones(milestones);

    } catch (error) {

        console.error(
            "Milestone loading error:",
            error
        );


        milestoneGrid.innerHTML = `
            <div class="empty-state">

                <h3>
                    Unable to load milestones
                </h3>

                <p>
                    Please try again.
                </p>

            </div>
        `;

    }

}


function displayMilestones(milestones) {

    if (!Array.isArray(milestones) ||
        milestones.length === 0) {

        milestoneGrid.innerHTML = `
            <div class="empty-state">

                <h3>
                    No milestones yet
                </h3>

                <p>
                    ${
                        userRole === "CLIENT"
                            ? "Create the first milestone for this project."
                            : "No milestones have been added to this project."
                    }
                </p>

            </div>
        `;

        return;

    }


    milestoneGrid.innerHTML =
        milestones.map(
            milestone => createMilestoneCard(milestone)
        ).join("");

}


function createMilestoneCard(milestone) {

    const status =
        milestone.status || "PENDING";


    const statusClass =
        getStatusClass(status);


    const deadline =
        milestone.deadline
            ? formatDate(milestone.deadline)
            : "Not set";


    const amount =
        formatAmount(milestone.amount);


    let actions = "";


    if (userRole === "CLIENT") {

        if (status === "PENDING") {

            actions += `
                <button
                    class="action-button start-button"
                    onclick="updateMilestoneStatus(
                        ${milestone.id},
                        'IN_PROGRESS'
                    )">

                    Start

                </button>
            `;

        }


        if (
            status !== "RELEASED" &&
            status !== "SUBMITTED"
        ) {

            actions += `
                <button
                    class="action-button delete-button"
                    onclick="deleteMilestone(
                        ${milestone.id}
                    )">

                    Delete

                </button>
            `;

        }

    }


    if (userRole === "FREELANCER") {

        if (status === "PENDING") {

            actions += `
                <button
                    class="action-button start-button"
                    onclick="updateMilestoneStatus(
                        ${milestone.id},
                        'IN_PROGRESS'
                    )">

                    Start Work

                </button>
            `;

        }

    }


    return `
        <article class="milestone-card">

            <h3>
                ${escapeHtml(
                    milestone.title || "Untitled Milestone"
                )}
            </h3>


            <p class="milestone-description">
                ${escapeHtml(
                    milestone.description || "No description"
                )}
            </p>


            <div class="milestone-info">

                <div class="info-row">

                    <span>
                        Amount
                    </span>

                    <strong>
                        ₹${amount}
                    </strong>

                </div>


                <div class="info-row">

                    <span>
                        Deadline
                    </span>

                    <strong>
                        ${deadline}
                    </strong>

                </div>


                <div class="info-row">

                    <span>
                        Status
                    </span>

                    <span class="status ${statusClass}">
                        ${formatStatus(status)}
                    </span>

                </div>

            </div>


            ${
                actions
                    ? `
                        <div class="milestone-actions">
                            ${actions}
                        </div>
                    `
                    : ""
            }

        </article>
    `;

}


function setupModal() {

    createMilestoneButton.addEventListener(
        "click",
        () => {

            const selectedProject =
                projectSelect.value;


            if (!selectedProject) {

                showMessage(
                    "Please select a project first.",
                    "error"
                );

                return;

            }


            milestoneForm.reset();

            setMinimumDeadline();

            milestoneModal.classList.add("show");

        }
    );


    closeModalButton.addEventListener(
        "click",
        closeModal
    );


    cancelButton.addEventListener(
        "click",
        closeModal
    );


    milestoneModal.addEventListener(
        "click",
        event => {

            if (event.target === milestoneModal) {

                closeModal();

            }

        }
    );


    milestoneForm.addEventListener(
        "submit",
        createMilestone
    );

}


function closeModal() {

    milestoneModal.classList.remove("show");

    milestoneForm.reset();

}


function setMinimumDeadline() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");


    const day =
        String(today.getDate())
            .padStart(2, "0");


    document.getElementById(
        "milestoneDeadline"
    ).min =
        `${year}-${month}-${day}`;

}


async function createMilestone(event) {

    event.preventDefault();


    const selectedProject =
        projectSelect.value;


    if (!selectedProject) {

        showMessage(
            "Please select a project.",
            "error"
        );

        return;

    }


    const title =
        document.getElementById(
            "milestoneTitle"
        ).value.trim();


    const description =
        document.getElementById(
            "milestoneDescription"
        ).value.trim();


    const amount =
        Number(
            document.getElementById(
                "milestoneAmount"
            ).value
        );


    const deadline =
        document.getElementById(
            "milestoneDeadline"
        ).value;


    if (!title ||
        !description ||
        !amount ||
        amount <= 0 ||
        !deadline) {

        showMessage(
            "Please enter valid milestone details.",
            "error"
        );

        return;

    }


    saveMilestoneButton.disabled = true;

    saveMilestoneButton.textContent =
        "Creating...";


    try {

        const response =
            await fetch(
                "/api/milestones",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        title: title,

                        description: description,

                        amount: amount,

                        deadline: deadline,

                        status: "PENDING",

                        project: {
                            id: Number(
                                selectedProject
                            )
                        }

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to create milestone."
            );

        }


        closeModal();


        showMessage(
            "Milestone created successfully.",
            "success"
        );


        await loadMilestones(
            selectedProject
        );

    } catch (error) {

        console.error(
            "Create milestone error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to create milestone.",
            "error"
        );

    } finally {

        saveMilestoneButton.disabled =
            false;

        saveMilestoneButton.textContent =
            "Create Milestone";

    }

}


async function updateMilestoneStatus(
    milestoneId,
    status
) {

    try {

        const response =
            await fetch(
                `/api/milestones/${milestoneId}/status?status=${status}`,
                {
                    method: "PUT"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update milestone."
            );

        }


        showMessage(
            `Milestone status changed to ${formatStatus(status)}.`,
            "success"
        );


        await loadMilestones(
            projectSelect.value
        );

    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to update milestone status.",
            "error"
        );

    }

}


async function deleteMilestone(
    milestoneId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this milestone?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/milestones/${milestoneId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const data =
                await response.json()
                    .catch(() => ({}));


            throw new Error(
                data.message ||
                "Unable to delete milestone."
            );

        }


        showMessage(
            "Milestone deleted successfully.",
            "success"
        );


        await loadMilestones(
            projectSelect.value
        );

    } catch (error) {

        console.error(
            "Delete milestone error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to delete milestone.",
            "error"
        );

    }

}


function setupLogout() {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await fetch(
                    "/api/auth/logout",
                    {
                        method: "POST"
                    }
                );

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            } finally {

                sessionStorage.clear();

                window.location.href =
                    "/login";

            }

        }
    );

}


function showMessage(
    text,
    type
) {

    message.textContent =
        text;

    message.className =
        `message ${type}`;


    setTimeout(
        () => {

            message.textContent =
                "";

            message.className =
                "message";

        },
        3500
    );

}


function getStatusClass(status) {

    switch (status) {

        case "PENDING":
            return "status-pending";

        case "IN_PROGRESS":
            return "status-in-progress";

        case "SUBMITTED":
            return "status-submitted";

        case "APPROVED":
            return "status-approved";

        case "REJECTED":
            return "status-rejected";

        case "RELEASED":
            return "status-released";

        default:
            return "status-pending";

    }

}


function formatStatus(status) {

    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}


function formatAmount(amount) {

    return Number(amount || 0)
        .toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );

}


function formatDate(dateValue) {

    const date =
        new Date(dateValue);


    if (Number.isNaN(
        date.getTime()
    )) {

        return dateValue;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}