const userId = sessionStorage.getItem("userId");
const userName = sessionStorage.getItem("userName");
const userRole = sessionStorage.getItem("userRole");

const milestoneSelect =
    document.getElementById("milestoneSelect");

const submissionGrid =
    document.getElementById("submissionGrid");

const submitWorkButton =
    document.getElementById("submitWorkButton");

const submissionModal =
    document.getElementById("submissionModal");

const submissionForm =
    document.getElementById("submissionForm");

const closeModalButton =
    document.getElementById("closeSubmissionModal");

const cancelButton =
    document.getElementById("cancelSubmissionButton");

const saveSubmissionButton =
    document.getElementById("saveSubmissionButton");

const rejectModal =
    document.getElementById("rejectModal");

const rejectForm =
    document.getElementById("rejectForm");

const closeRejectModalButton =
    document.getElementById("closeRejectModal");

const cancelRejectButton =
    document.getElementById("cancelRejectButton");

const confirmRejectButton =
    document.getElementById("confirmRejectButton");

const reviewComment =
    document.getElementById("reviewComment");

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


let selectedSubmissionId = null;


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (!userId || !userRole) {

            window.location.href =
                "/login";

            return;
        }


        setupUserInterface();

        setupSubmissionModal();

        setupRejectModal();

        setupLogout();

        await loadMilestones();

    }
);


function setupUserInterface() {

    profileName.textContent =
        userName || "User";


    avatar.textContent =
        (userName || "U")
            .charAt(0)
            .toUpperCase();


    if (userRole === "CLIENT") {

        profileRole.textContent =
            "Client Account";

        dashboardLink.href =
            "/client-dashboard";

        pageDescription.textContent =
            "Review freelancer submissions and manage approvals.";

        submitWorkButton.style.display =
            "none";

    } else if (userRole === "FREELANCER") {

        profileRole.textContent =
            "Freelancer Account";

        dashboardLink.href =
            "/freelancer-dashboard";

        pageDescription.textContent =
            "Submit completed work for your assigned milestones.";

        submitWorkButton.style.display =
            "block";

    } else {

        window.location.href =
            "/login";

    }

}


async function loadMilestones() {

    try {

        if (!userId) throw new Error("Please sign in again.");
        const projectsResponse = await fetch(
            `/api/projects/${userRole === "CLIENT" ? "client" : "freelancer"}/${encodeURIComponent(userId)}`
        );
        if (!projectsResponse.ok) throw new Error("Unable to load your projects.");
        const projects = await projectsResponse.json();
        const milestoneGroups = await Promise.all((Array.isArray(projects) ? projects : []).map(async project => {
            const response = await fetch(`/api/milestones/project/${project.id}`);
            if (!response.ok) throw new Error("Unable to load project milestones.");
            return response.json();
        }));
        const milestones = milestoneGroups.flat();


        milestoneSelect.innerHTML =
            '<option value="">Select a milestone</option>';


        if (!Array.isArray(milestones) ||
            milestones.length === 0) {

            showNoMilestones();

            return;
        }


        milestones.forEach(
            milestone => {

                const option =
                    document.createElement("option");

                option.value =
                    milestone.id;

                option.textContent =
                    `${milestone.title} - ₹${formatAmount(
                        milestone.amount
                    )}`;

                milestoneSelect.appendChild(
                    option
                );

            }
        );


        const savedMilestoneId =
            new URLSearchParams(
                window.location.search
            ).get("milestoneId");


        if (
            savedMilestoneId &&
            milestones.some(
                milestone =>
                    String(milestone.id) ===
                    String(savedMilestoneId)
            )
        ) {

            milestoneSelect.value =
                savedMilestoneId;

            await loadSubmissions(
                savedMilestoneId
            );

        }

    } catch (error) {

        console.error(
            "Milestone loading error:",
            error
        );


        showMessage(
            "Unable to load milestones.",
            "error"
        );


        submissionGrid.innerHTML = `
            <div class="empty-state">

                <h3>
                    Unable to load milestones
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>
        `;

    }

}


function showNoMilestones() {

    submissionGrid.innerHTML = `
        <div class="empty-state">

            <h3>
                No milestones found
            </h3>

            <p>
                Create or assign a milestone before submitting work.
            </p>

        </div>
    `;

}


milestoneSelect.addEventListener(
    "change",
    async () => {

        const milestoneId =
            milestoneSelect.value;


        if (!milestoneId) {

            submissionGrid.innerHTML = `
                <div class="empty-state">

                    <h3>
                        Select a milestone
                    </h3>

                    <p>
                        Choose a milestone to view submissions.
                    </p>

                </div>
            `;

            return;
        }


        await loadSubmissions(
            milestoneId
        );

    }
);


async function loadSubmissions(
    milestoneId
) {

    submissionGrid.innerHTML = `
        <div class="empty-state">

            <h3>
                Loading submissions...
            </h3>

            <p>
                Please wait.
            </p>

        </div>
    `;


    try {

        const response =
            await fetch(
                `/api/submissions/milestone/${milestoneId}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load submissions."
            );

        }


        const submissions =
            await response.json();


        displaySubmissions(
            submissions
        );

    } catch (error) {

        console.error(
            "Submission loading error:",
            error
        );


        submissionGrid.innerHTML = `
            <div class="empty-state">

                <h3>
                    Unable to load submissions
                </h3>

                <p>
                    Please try again.
                </p>

            </div>
        `;

    }

}


function displaySubmissions(
    submissions
) {

    if (
        !Array.isArray(submissions) ||
        submissions.length === 0
    ) {

        submissionGrid.innerHTML = `
            <div class="empty-state">

                <h3>
                    No submissions yet
                </h3>

                <p>
                    ${
                        userRole === "FREELANCER"
                            ? "Submit your completed work for this milestone."
                            : "The freelancer has not submitted work yet."
                    }
                </p>

            </div>
        `;

        return;
    }


    submissionGrid.innerHTML =
        submissions
            .map(
                submission =>
                    createSubmissionCard(
                        submission
                    )
            )
            .join("");

}


function createSubmissionCard(
    submission
) {

    const status =
        submission.status ||
        "SUBMITTED";


    const submittedAt =
        submission.submittedAt
            ? formatDateTime(
                submission.submittedAt
            )
            : "Not available";


    let actions = "";


    if (
        userRole === "CLIENT" &&
        status === "SUBMITTED"
    ) {

        actions = `
            <button
                class="action-button approve-button"
                onclick="approveSubmission(
                    ${submission.id}
                )">

                Approve

            </button>


            <button
                class="action-button reject-button"
                onclick="openRejectModal(
                    ${submission.id}
                )">

                Reject

            </button>
        `;

    }


    if (
        userRole === "FREELANCER" &&
        status === "SUBMITTED"
    ) {

        actions = `
            <button
                class="action-button delete-button"
                onclick="deleteSubmission(
                    ${submission.id}
                )">

                Delete

            </button>
        `;

    }


    return `
        <article class="submission-card">

            <h3>
                Submission #${submission.id}
            </h3>


            <p class="submission-description">
                ${escapeHtml(
                    submission.description ||
                    "No description provided."
                )}
            </p>


            <div class="submission-info">

                <div class="info-row">

                    <span>
                        Submitted At
                    </span>

                    <strong>
                        ${submittedAt}
                    </strong>

                </div>


                <div class="info-row">

                    <span>
                        Status
                    </span>

                    <span class="status ${getStatusClass(status)}">

                        ${formatStatus(status)}

                    </span>

                </div>

            </div>


            ${
                submission.reviewComment
                    ? `
                        <div class="review-comment">

                            <strong>
                                Review Comment
                            </strong>

                            ${escapeHtml(
                                submission.reviewComment
                            )}

                        </div>
                    `
                    : ""
            }


            ${
                actions
                    ? `
                        <div class="submission-actions">

                            ${actions}

                        </div>
                    `
                    : ""
            }

        </article>
    `;

}


function setupSubmissionModal() {

    submitWorkButton.addEventListener(
        "click",
        () => {

            const milestoneId =
                milestoneSelect.value;


            if (!milestoneId) {

                showMessage(
                    "Please select a milestone first.",
                    "error"
                );

                return;
            }


            submissionForm.reset();

            submissionModal.classList.add(
                "show"
            );

        }
    );


    closeModalButton.addEventListener(
        "click",
        closeSubmissionModal
    );


    cancelButton.addEventListener(
        "click",
        closeSubmissionModal
    );


    submissionModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                submissionModal
            ) {

                closeSubmissionModal();

            }

        }
    );


    submissionForm.addEventListener(
        "submit",
        createSubmission
    );

}


function closeSubmissionModal() {

    submissionModal.classList.remove(
        "show"
    );

    submissionForm.reset();

}


async function createSubmission(
    event
) {

    event.preventDefault();


    const milestoneId =
        milestoneSelect.value;


    const description =
        document.getElementById(
            "submissionDescription"
        ).value.trim();


    if (!milestoneId) {

        showMessage(
            "Please select a milestone.",
            "error"
        );

        return;
    }


    if (!description) {

        showMessage(
            "Please enter a work description.",
            "error"
        );

        return;
    }


    saveSubmissionButton.disabled =
        true;

    saveSubmissionButton.textContent =
        "Submitting...";


    try {

        const response =
            await fetch(
                "/api/submissions",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        description:
                            description,

                        status:
                            "SUBMITTED",

                        milestone: {
                            id: Number(
                                milestoneId
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
                "Unable to submit work."
            );

        }


        closeSubmissionModal();


        showMessage(
            "Work submitted successfully.",
            "success"
        );


        await loadSubmissions(
            milestoneId
        );

    } catch (error) {

        console.error(
            "Create submission error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to submit work.",
            "error"
        );

    } finally {

        saveSubmissionButton.disabled =
            false;

        saveSubmissionButton.textContent =
            "Submit Work";

    }

}


async function approveSubmission(
    submissionId
) {

    const confirmed =
        confirm(
            "Approve this submission?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/submissions/${submissionId}/status?status=APPROVED`,
                {
                    method: "PUT"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to approve submission."
            );

        }


        showMessage(
            "Submission approved successfully.",
            "success"
        );


        await loadSubmissions(
            milestoneSelect.value
        );

    } catch (error) {

        console.error(
            "Approval error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to approve submission.",
            "error"
        );

    }

}


function openRejectModal(
    submissionId
) {

    selectedSubmissionId =
        submissionId;


    reviewComment.value =
        "";


    rejectModal.classList.add(
        "show"
    );

}


function closeRejectModal() {

    rejectModal.classList.remove(
        "show"
    );

    selectedSubmissionId =
        null;

    reviewComment.value =
        "";

}


closeRejectModalButton.addEventListener(
    "click",
    closeRejectModal
);


cancelRejectButton.addEventListener(
    "click",
    closeRejectModal
);


rejectModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            rejectModal
        ) {

            closeRejectModal();

        }

    }
);


rejectForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (!selectedSubmissionId) {

            return;

        }


        const comment =
            reviewComment.value.trim();


        if (!comment) {

            showMessage(
                "Review comment is required.",
                "error"
            );

            return;
        }


        confirmRejectButton.disabled =
            true;

        confirmRejectButton.textContent =
            "Rejecting...";


        try {

            const url =
                `/api/submissions/${selectedSubmissionId}` +
                `/status?status=REJECTED` +
                `&reviewComment=${encodeURIComponent(comment)}`;


            const response =
                await fetch(
                    url,
                    {
                        method: "PUT"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to reject submission."
                );

            }


            closeRejectModal();


            showMessage(
                "Submission rejected successfully.",
                "success"
            );


            await loadSubmissions(
                milestoneSelect.value
            );

        } catch (error) {

            console.error(
                "Rejection error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to reject submission.",
                "error"
            );

        } finally {

            confirmRejectButton.disabled =
                false;

            confirmRejectButton.textContent =
                "Reject Submission";

        }

    }
);


async function deleteSubmission(
    submissionId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this submission?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/submissions/${submissionId}`,
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
                "Unable to delete submission."
            );

        }


        showMessage(
            "Submission deleted successfully.",
            "success"
        );


        await loadSubmissions(
            milestoneSelect.value
        );

    } catch (error) {

        console.error(
            "Delete submission error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to delete submission.",
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


function getStatusClass(
    status
) {

    switch (status) {

        case "SUBMITTED":
            return "status-submitted";

        case "APPROVED":
            return "status-approved";

        case "REJECTED":
            return "status-rejected";

        default:
            return "status-submitted";

    }

}


function formatStatus(
    status
) {

    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


function formatAmount(
    amount
) {

    return Number(amount || 0)
        .toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );

}


function formatDateTime(
    value
) {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function escapeHtml(
    value
) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
