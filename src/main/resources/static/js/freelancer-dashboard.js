document.addEventListener("DOMContentLoaded", () => {

    loadUser();

    loadFreelancerData();

    setupLogout();

});


function loadUser() {

    const name =
        sessionStorage.getItem("userName");

    const role =
        sessionStorage.getItem("userRole");


    if (role !== "FREELANCER") {

        window.location.href =
            "/login";

        return;
    }


    if (name) {

        document.getElementById("profileName")
            .textContent = name;

        document.getElementById("welcomeName")
            .textContent =
            "Welcome back, " + name;

        document.getElementById("avatar")
            .textContent =
            name.charAt(0).toUpperCase();

    }

}


async function loadFreelancerData() {

    try {

        const projectsResponse =
            await fetch("/api/projects");

        const milestonesResponse =
            await fetch("/api/milestones");

        const submissionsResponse =
            await fetch("/api/submissions");

        const transactionsResponse =
            await fetch("/api/transactions");


        const projects =
            await projectsResponse.json();

        const milestones =
            await milestonesResponse.json();

        const submissions =
            await submissionsResponse.json();

        const transactions =
            await transactionsResponse.json();


        document.getElementById("projectCount")
            .textContent = projects.length;


        document.getElementById("milestoneCount")
            .textContent = milestones.filter(
                m =>
                    m.status === "PENDING" ||
                    m.status === "IN_PROGRESS"
            ).length;


        document.getElementById("submissionCount")
            .textContent = submissions.length;


        const earnings =
            transactions.reduce(
                (sum, transaction) =>
                    sum +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );


        document.getElementById("earningAmount")
            .textContent =
            "₹" +
            earnings.toLocaleString("en-IN");


        document.getElementById("paymentStatus")
            .textContent =
            "₹" +
            earnings.toLocaleString("en-IN");


        displayProjects(projects);

        displayMilestones(milestones);


    } catch (error) {

        console.error(
            "Freelancer dashboard error:",
            error
        );

    }

}


function displayProjects(projects) {

    const list =
        document.getElementById("projectList");


    if (!projects.length) {

        list.innerHTML =
            '<div class="empty">No assigned projects.</div>';

        return;
    }


    list.innerHTML =
        projects.slice(0, 5).map(project => `

            <div class="project-item">

                <div>

                    <strong>
                        ${escapeHtml(project.title)}
                    </strong>

                    <span>
                        Budget:
                        ₹${Number(
                            project.budget || 0
                        ).toLocaleString("en-IN")}
                    </span>

                </div>

                <div class="project-status">
                    ${project.status}
                </div>

            </div>

        `).join("");

}


function displayMilestones(milestones) {

    const list =
        document.getElementById("milestoneList");


    if (!milestones.length) {

        list.innerHTML =
            '<div class="empty">No upcoming milestones.</div>';

        return;
    }


    list.innerHTML =
        milestones.slice(0, 5).map(milestone => `

            <div class="project-item">

                <div>

                    <strong>
                        ${escapeHtml(milestone.title)}
                    </strong>

                    <span>
                        Deadline:
                        ${milestone.deadline || "Not specified"}
                    </span>

                </div>

                <div class="project-status">
                    ${milestone.status}
                </div>

            </div>

        `).join("");

}


function setupLogout() {

    const button =
        document.getElementById("logoutButton");


    button.addEventListener(
        "click",
        async () => {

            try {

                await fetch(
                    "/api/auth/logout",
                    {
                        method: "POST"
                    }
                );

            } finally {

                sessionStorage.clear();

                window.location.href =
                    "/login";

            }

        }
    );

}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}