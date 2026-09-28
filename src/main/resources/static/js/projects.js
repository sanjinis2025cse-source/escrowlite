document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkUser();

        loadProjects();

        loadFreelancers();

        setupModal();

        setupForm();

        setupLogout();

    }
);


/*
 * CHECK LOGIN AND ROLE
 */
function checkUser() {

    const userId =
        sessionStorage.getItem("userId");

    const userName =
        sessionStorage.getItem("userName");

    const userRole =
        sessionStorage.getItem("userRole");


    if (!userId || !userRole) {

        window.location.href =
            "/login";

        return;

    }


    document.getElementById(
        "profileName"
    ).textContent =
        userName || "User";


    document.getElementById(
        "profileRole"
    ).textContent =
        formatRole(userRole);


    document.getElementById(
        "avatar"
    ).textContent =
        userName
            ? userName
                .charAt(0)
                .toUpperCase()
            : "U";


    const dashboardLink =
        document.getElementById(
            "dashboardLink"
        );


    if (userRole === "CLIENT") {

        dashboardLink.href =
            "/client-dashboard";

        document.getElementById(
            "pageDescription"
        ).textContent =
            "Create and manage projects for your freelancers.";

    } else {

        dashboardLink.href =
            "/freelancer-dashboard";

        document.getElementById(
            "pageDescription"
        ).textContent =
            "View projects assigned to you.";

        document.getElementById(
            "createProjectButton"
        ).style.display =
            "none";

    }

}


/*
 * LOAD PROJECTS
 */
async function loadProjects() {

    const userId =
        sessionStorage.getItem("userId");

    const role =
        sessionStorage.getItem("userRole");


    try {

        let url =
            "/api/projects";


        if (role === "CLIENT") {

            url =
                "/api/projects/client/" +
                userId;

        } else if (
            role === "FREELANCER"
        ) {

            url =
                "/api/projects/freelancer/" +
                userId;

        }


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Unable to load projects"
            );

        }


        const projects =
            await response.json();


        displayProjects(projects);


    } catch (error) {

        console.error(
            "Project loading error:",
            error
        );


        document.getElementById(
            "projectsContainer"
        ).innerHTML = `

            <div class="empty-projects">

                Unable to load projects.

            </div>

        `;

    }

}


/*
 * DISPLAY PROJECTS
 */
function displayProjects(projects) {

    const container =
        document.getElementById(
            "projectsContainer"
        );


    if (!projects ||
        projects.length === 0) {

        container.innerHTML = `

            <div class="empty-projects">

                <h3>No projects yet</h3>

                <p>
                    Create your first project
                    to get started.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        projects.map(project => `

            <div class="project-card">

                <h3>
                    ${escapeHtml(
                        project.title
                    )}
                </h3>


                <p class="project-description">

                    ${escapeHtml(
                        project.description
                    )}

                </p>


                <div class="project-details">

                    <div class="project-detail">

                        <span>Budget</span>

                        <strong>
                            ₹${Number(
                                project.budget || 0
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </strong>

                    </div>


                    <div class="project-detail">

                        <span>Client</span>

                        <strong>
                            ${
                                project.client
                                    ?.name ||
                                "Not available"
                            }
                        </strong>

                    </div>


                    <div class="project-detail">

                        <span>Freelancer</span>

                        <strong>
                            ${
                                project.freelancer
                                    ?.name ||
                                "Not assigned"
                            }
                        </strong>

                    </div>

                </div>


                <span class="status-badge">

                    ${escapeHtml(
                        project.status ||
                        "CREATED"
                    )}

                </span>

            </div>

        `).join("");

}


/*
 * LOAD FREELANCERS
 */
async function loadFreelancers() {

    const role =
        sessionStorage.getItem("userRole");


    if (role !== "CLIENT") {

        return;

    }


    try {

        const response =
            await fetch(
                "/api/users"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load users"
            );

        }


        const users =
            await response.json();


        const freelancers =
            users.filter(
                user =>
                    user.role ===
                    "FREELANCER"
            );


        const select =
            document.getElementById(
                "freelancer"
            );


        freelancers.forEach(
            freelancer => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    freelancer.id;


                option.textContent =
                    freelancer.name +
                    " (" +
                    freelancer.email +
                    ")";


                select.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Freelancer loading error:",
            error
        );

    }

}


/*
 * MODAL
 */
function setupModal() {

    const modal =
        document.getElementById(
            "projectModal"
        );


    document.getElementById(
        "createProjectButton"
    ).addEventListener(
        "click",
        () => {

            modal.classList.add(
                "show"
            );

        }
    );


    document.getElementById(
        "closeModal"
    ).addEventListener(
        "click",
        closeModal
    );


    document.getElementById(
        "cancelButton"
    ).addEventListener(
        "click",
        closeModal
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeModal();

            }

        }
    );

}


/*
 * CLOSE MODAL
 */
function closeModal() {

    document.getElementById(
        "projectModal"
    ).classList.remove(
        "show"
    );

}


/*
 * CREATE PROJECT
 */
function setupForm() {

    const form =
        document.getElementById(
            "projectForm"
        );


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const clientId =
                sessionStorage.getItem(
                    "userId"
                );


            const freelancerId =
                document.getElementById(
                    "freelancer"
                ).value;


            const title =
                document.getElementById(
                    "title"
                ).value.trim();


            const description =
                document.getElementById(
                    "description"
                ).value.trim();


            const budget =
                document.getElementById(
                    "budget"
                ).value;


            const submitButton =
                document.getElementById(
                    "submitButton"
                );


            if (
                !clientId ||
                !freelancerId ||
                !title ||
                !description ||
                !budget
            ) {

                showMessage(
                    "Please fill all fields.",
                    "error"
                );

                return;

            }


            submitButton.disabled =
                true;


            submitButton.textContent =
                "Creating...";


            try {

                const response =
                    await fetch(
                        "/api/projects",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    title:
                                        title,

                                    description:
                                        description,

                                    budget:
                                        Number(
                                            budget
                                        ),

                                    status:
                                        "CREATED",

                                    client: {
                                        id:
                                            Number(
                                                clientId
                                            )
                                    },

                                    freelancer: {
                                        id:
                                            Number(
                                                freelancerId
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
                        "Unable to create project"
                    );

                }


                showMessage(
                    "Project created successfully.",
                    "success"
                );


                form.reset();


                closeModal();


                await loadProjects();


            } catch (error) {

                console.error(
                    "Create project error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to create project.",
                    "error"
                );


            } finally {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Create Project";

            }

        }
    );

}


/*
 * LOGOUT
 */
function setupLogout() {

    document.getElementById(
        "logoutButton"
    ).addEventListener(
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


/*
 * MESSAGE
 */
function showMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "message"
        );


    element.textContent =
        message;


    element.className =
        "message " + type;


    setTimeout(
        () => {

            element.className =
                "message";

        },
        3500
    );

}


/*
 * ROLE FORMAT
 */
function formatRole(role) {

    return role
        .toLowerCase()
        .replace(
            /^\w/,
            character =>
                character.toUpperCase()
        );

}


/*
 * HTML ESCAPE
 */
function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}