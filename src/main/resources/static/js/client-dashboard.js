document.addEventListener("DOMContentLoaded", () => {

    loadUser();

    loadClientData();

    setupLogout();

});


function loadUser() {

    const name =
        sessionStorage.getItem("userName");

    const role =
        sessionStorage.getItem("userRole");


    if (role !== "CLIENT") {

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


async function loadClientData() {

    try {

        const projectsResponse =
            await fetch("/api/projects");

        const milestonesResponse =
            await fetch("/api/milestones");

        const transactionsResponse =
            await fetch("/api/transactions");

        const escrowResponse =
            await fetch("/api/escrow");


        const projects =
            await projectsResponse.json();

        const milestones =
            await milestonesResponse.json();

        const transactions =
            await transactionsResponse.json();

        const escrow =
            await escrowResponse.json();


        document.getElementById("projectCount")
            .textContent = projects.length;

        document.getElementById("transactionCount")
            .textContent = transactions.length;


        const totalEscrow =
            escrow.reduce(
                (sum, item) =>
                    sum + Number(item.amount || 0),
                0
            );


        document.getElementById("escrowAmount")
            .textContent =
            "₹" +
            totalEscrow.toLocaleString("en-IN");


        displayProjects(projects);

        document.getElementById("reviewCount")
            .textContent =
            milestones.filter(
                m => m.status === "SUBMITTED"
            ).length;


    } catch (error) {

        console.error(
            "Client dashboard error:",
            error
        );

    }

}


function displayProjects(projects) {

    const list =
        document.getElementById("projectList");


    if (!projects.length) {

        list.innerHTML =
            '<div class="empty">No projects available.</div>';

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