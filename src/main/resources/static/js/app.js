document.addEventListener("DOMContentLoaded", () => {

    loadDashboardUser();

    loadDashboardData();

    setupLogout();

});


/*
 * DISPLAY LOGGED-IN USER
 */
function loadDashboardUser() {

    const userName =
        sessionStorage.getItem("userName");

    const userRole =
        sessionStorage.getItem("userRole");


    const welcomeName =
        document.getElementById("welcomeName");

    const profileName =
        document.getElementById("profileName");

    const profileRole =
        document.getElementById("profileRole");

    const profileAvatar =
        document.getElementById("profileAvatar");


    if (userName) {

        welcomeName.textContent =
            "Welcome back, " + userName;

        profileName.textContent =
            userName;

        profileAvatar.textContent =
            userName
                .charAt(0)
                .toUpperCase();

    }


    if (userRole) {

        profileRole.textContent =
            formatRole(userRole);

    }

}


/*
 * FORMAT ROLE
 */
function formatRole(role) {

    if (!role) {
        return "User";
    }

    return role
        .toLowerCase()
        .replace(
            /^\w/,
            character => character.toUpperCase()
        );

}


/*
 * LOAD DASHBOARD DATA
 */
async function loadDashboardData() {

    try {

        const [
            usersResponse,
            projectsResponse,
            milestonesResponse,
            transactionsResponse,
            escrowResponse
        ] = await Promise.all([

            fetch("/api/users"),

            fetch("/api/projects"),

            fetch("/api/milestones"),

            fetch("/api/transactions"),

            fetch("/api/escrow")

        ]);


        const users =
            await usersResponse.json();

        const projects =
            await projectsResponse.json();

        const milestones =
            await milestonesResponse.json();

        const transactions =
            await transactionsResponse.json();

        const escrow =
            await escrowResponse.json();


        /*
         * STATISTICS
         */

        document.getElementById("userCount")
            .textContent = users.length;

        document.getElementById("projectCount")
            .textContent = projects.length;

        document.getElementById("milestoneCount")
            .textContent = milestones.length;

        document.getElementById("transactionCount")
            .textContent = transactions.length;


        /*
         * PROJECTS
         */

        displayProjects(projects);


        /*
         * ESCROW
         */

        displayEscrow(escrow);


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }

}


/*
 * DISPLAY PROJECTS
 */
function displayProjects(projects) {

    const projectList =
        document.getElementById("projectList");


    if (!projects || projects.length === 0) {

        projectList.innerHTML = `
            <div class="empty-state">
                No projects available.
            </div>
        `;

        return;
    }


    const recentProjects =
        projects.slice(0, 5);


    projectList.innerHTML =
        recentProjects.map(project => `

            <div class="project-item">

                <div class="project-info">

                    <strong>
                        ${escapeHtml(project.title)}
                    </strong>

                    <span>
                        ${escapeHtml(
                            project.status || "CREATED"
                        )}
                    </span>

                </div>

                <div class="project-budget">

                    ₹${Number(
                        project.budget || 0
                    ).toLocaleString("en-IN")}

                </div>

            </div>

        `).join("");

}


/*
 * DISPLAY ESCROW
 */
function displayEscrow(escrow) {

    const escrowCount =
        document.getElementById("escrowCount");

    const escrowAmount =
        document.getElementById("escrowAmount");


    escrowCount.textContent =
        escrow.length;


    const totalAmount =
        escrow.reduce(
            (total, release) =>
                total + Number(
                    release.amount || 0
                ),
            0
        );


    escrowAmount.textContent =
        totalAmount.toLocaleString("en-IN");

}


/*
 * LOGOUT
 */
function setupLogout() {

    const logoutButton =
        document.getElementById("logoutButton");


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        async () => {

            logoutButton.disabled = true;

            logoutButton.textContent =
                "Logging out...";


            try {

                const response =
                    await fetch(
                        "/api/auth/logout",
                        {
                            method: "POST"
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Logout failed"
                    );

                }


                /*
                 * Remove frontend session data.
                 */
                sessionStorage.clear();


                /*
                 * Redirect to login.
                 */
                window.location.href =
                    "/login";


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                logoutButton.disabled = false;

                logoutButton.innerHTML =
                    "<span>↪</span> Logout";

                alert(
                    "Unable to logout. Please try again."
                );

            }

        }
    );

}


/*
 * SECURITY HELPER
 *
 * Prevent project/user data from being
 * interpreted as HTML.
 */
function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}