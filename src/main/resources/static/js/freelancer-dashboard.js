document.addEventListener("DOMContentLoaded", () => {

    checkUser();
    loadDashboardData();
    setupLogout();

});


/* =========================================
   CHECK LOGGED-IN USER
   ========================================= */

function checkUser() {

    const userId = sessionStorage.getItem("userId");
    const userName = sessionStorage.getItem("userName");
    const userEmail = sessionStorage.getItem("userEmail");
    const userRole = sessionStorage.getItem("userRole");

    if (!userId || !userRole) {

        window.location.href = "/login";
        return;
    }

    if (userRole !== "FREELANCER") {

        window.location.href = "/login";
        return;
    }

    const profileName =
        document.getElementById("profileName");

    const profileEmail =
        document.getElementById("profileEmail");

    const welcomeName =
        document.getElementById("welcomeName");

    const profileAvatar =
        document.getElementById("profileAvatar");


    if (profileName) {
        profileName.textContent =
            userName || "Freelancer";
    }


    if (profileEmail) {
        profileEmail.textContent =
            userEmail || "";
    }


    if (welcomeName) {
        welcomeName.textContent =
            userName || "Freelancer";
    }


    if (profileAvatar) {

        const name =
            userName || "F";

        profileAvatar.textContent =
            name.charAt(0).toUpperCase();
    }

}


/* =========================================
   LOAD DASHBOARD DATA
   ========================================= */

async function loadDashboardData() {

    try {

        const userId =
            sessionStorage.getItem("userId");


        if (!userId) {

            window.location.href = "/login";
            return;
        }


        const projectsResponse = await fetch(
            `/api/projects/freelancer/${encodeURIComponent(userId)}`
        );


        if (!projectsResponse.ok) {
            throw new Error(
                "Unable to load projects"
            );
        }


        const projects =
            await projectsResponse.json();


        const freelancerProjects =
            Array.isArray(projects)
                ? projects
                : [];


        const milestoneGroups = await Promise.all(freelancerProjects.map(async project => {
            const response = await fetch(`/api/milestones/project/${project.id}`);
            if (!response.ok) throw new Error("Unable to load milestones");
            return response.json();
        }));
        const allMilestones = milestoneGroups.flat();
        const submissionGroups = await Promise.all(allMilestones.map(async milestone => {
            const response = await fetch(`/api/submissions/milestone/${milestone.id}`);
            if (!response.ok) throw new Error("Unable to load submissions");
            return response.json();
        }));
        const allSubmissions = submissionGroups.flat();
        const allTransactions = await fetch("/api/transactions").then(async response => {
            if (!response.ok) throw new Error("Unable to load transactions");
            return response.json();
        });


        /*
         * Filter milestones belonging to
         * freelancer's projects.
         */

        const projectIds =
            freelancerProjects.map(
                project => project.id
            );


        const freelancerMilestones =
            allMilestones.filter(
                milestone => {

                    if (
                        !milestone.project ||
                        !milestone.project.id
                    ) {
                        return false;
                    }

                    return projectIds.includes(
                        milestone.project.id
                    );
                }
            );


        /*
         * Filter submissions belonging to
         * freelancer's milestones.
         */

        const milestoneIds =
            freelancerMilestones.map(
                milestone => milestone.id
            );


        const freelancerSubmissions =
            allSubmissions.filter(
                submission => {

                    if (
                        !submission.milestone ||
                        !submission.milestone.id
                    ) {
                        return false;
                    }

                    return milestoneIds.includes(
                        submission.milestone.id
                    );
                }
            );


        updateStatistics(
            freelancerProjects,
            freelancerMilestones,
            freelancerSubmissions,
            allTransactions.filter(transaction =>
                projectIds.includes(transaction.escrowRelease?.milestone?.project?.id)
            )
        );


        displayProjects(
            freelancerProjects
        );


        displayMilestones(
            freelancerMilestones
        );


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

        showLoadingError(
            "Unable to load dashboard data."
        );

    }

}


/* =========================================
   UPDATE STATISTICS
   ========================================= */

function updateStatistics(
    projects,
    milestones,
    submissions,
    transactions
) {

    const projectCount =
        document.getElementById("projectCount");

    const milestoneCount =
        document.getElementById("milestoneCount");

    const submissionCount =
        document.getElementById("submissionCount");

    const earningsAmount =
        document.getElementById("earningsAmount");


    if (projectCount) {

        projectCount.textContent =
            projects.length;
    }


    if (milestoneCount) {

        milestoneCount.textContent =
            milestones.length;
    }


    if (submissionCount) {

        submissionCount.textContent =
            submissions.length;
    }


    /*
     * Calculate completed earnings.
     */

    let earnings = 0;


    transactions.forEach(
        transaction => {

            if (
                transaction.status ===
                "COMPLETED"
            ) {

                const amount =
                    Number(
                        transaction.amount || 0
                    );

                earnings += amount;
            }

        }
    );


    if (earningsAmount) {

        earningsAmount.textContent =
            formatCurrency(earnings);
    }

}


/* =========================================
   DISPLAY PROJECTS
   ========================================= */

function displayProjects(projects) {

    const projectsList =
        document.getElementById("projectsList");


    if (!projectsList) {
        return;
    }


    if (!projects || projects.length === 0) {

        projectsList.innerHTML = `

            <div class="loading-state">

                No projects assigned yet.

            </div>

        `;

        return;
    }


    projectsList.innerHTML =
        projects.map(
            project => `

                <div class="dashboard-item">

                    <div>

                        <strong>
                            ${escapeHtml(
                                project.title ||
                                "Untitled Project"
                            )}
                        </strong>

                        <p>
                            ${escapeHtml(
                                project.description ||
                                "No description available."
                            )}
                        </p>

                    </div>

                    <span class="status-badge">

                        ${formatStatus(
                            project.status
                        )}

                    </span>

                </div>

            `
        ).join("");

}


/* =========================================
   DISPLAY MILESTONES
   ========================================= */

function displayMilestones(milestones) {

    const milestonesList =
        document.getElementById("milestonesList");


    if (!milestonesList) {
        return;
    }


    if (!milestones || milestones.length === 0) {

        milestonesList.innerHTML = `

            <div class="loading-state">

                No milestones available.

            </div>

        `;

        return;
    }


    milestonesList.innerHTML =
        milestones.map(
            milestone => `

                <div class="dashboard-item">

                    <div>

                        <strong>
                            ${escapeHtml(
                                milestone.title ||
                                "Untitled Milestone"
                            )}
                        </strong>

                        <p>
                            Amount:
                            ${formatCurrency(
                                milestone.amount || 0
                            )}
                        </p>

                    </div>

                    <span class="status-badge">

                        ${formatStatus(
                            milestone.status
                        )}

                    </span>

                </div>

            `
        ).join("");

}


/* =========================================
   SHOW ERROR
   ========================================= */

function showLoadingError(message) {

    const projectsList =
        document.getElementById("projectsList");

    const milestonesList =
        document.getElementById("milestonesList");


    if (projectsList) {

        projectsList.innerHTML = `

            <div class="loading-state">

                ${escapeHtml(message)}

            </div>

        `;
    }


    if (milestonesList) {

        milestonesList.innerHTML = `

            <div class="loading-state">

                ${escapeHtml(message)}

            </div>

        `;
    }

}


/* =========================================
   LOGOUT
   ========================================= */

function setupLogout() {

    const logoutButton =
        document.getElementById("logoutButton");


    if (!logoutButton) {
        return;
    }


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


/* =========================================
   FORMAT CURRENCY
   ========================================= */

function formatCurrency(amount) {

    const value =
        Number(amount || 0);


    return "₹" +
        value.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );

}


/* =========================================
   FORMAT STATUS
   ========================================= */

function formatStatus(status) {

    if (!status) {
        return "Unknown";
    }


    return status
        .toString()
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );

}


/* =========================================
   ESCAPE HTML
   ========================================= */

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
