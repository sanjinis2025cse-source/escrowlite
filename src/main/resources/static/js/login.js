const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

const loginButton =
    document.getElementById("loginButton");

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");


/*
 * SHOW / HIDE PASSWORD
 */
togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.textContent = "HIDE";

    } else {

        passwordInput.type = "password";

        togglePassword.textContent = "SHOW";

    }

});


/*
 * LOGIN
 */
loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        document.getElementById("email")
            .value
            .trim();

    const password =
        passwordInput.value;


    /*
     * Validate input
     */
    if (!email || !password) {

        showMessage(
            "Please enter your email and password.",
            "error"
        );

        return;
    }


    /*
     * Disable button while logging in
     */
    loginButton.disabled = true;

    loginButton.textContent =
        "Signing in...";

    hideMessage();


    try {

        /*
         * Send login request
         */
        const response =
            await fetch(
                "/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


        const data =
            await response.json();


        /*
         * Handle server error
         */
        if (!response.ok) {

            throw new Error(
                data.message ||
                "Invalid email or password."
            );

        }


        /*
         * Handle unsuccessful login
         */
        if (!data.success) {

            throw new Error(
                data.message ||
                "Login failed."
            );

        }


        /*
         * Store user information
         *
         * Spring Security handles the
         * actual authentication session.
         *
         * sessionStorage is used only
         * for displaying user information
         * in the frontend.
         */
        sessionStorage.setItem(
            "userId",
            data.userId
        );

        sessionStorage.setItem(
            "userName",
            data.name
        );

        sessionStorage.setItem(
            "userEmail",
            data.email
        );

        sessionStorage.setItem(
            "userRole",
            data.role
        );


        /*
         * Show success message
         */
        showMessage(
            "Login successful. Redirecting...",
            "success"
        );


        /*
         * Redirect according to role
         */
        setTimeout(() => {

            if (data.role === "CLIENT") {

                window.location.href =
                    "/client-dashboard";

            } else if (
                data.role === "FREELANCER"
            ) {

                window.location.href =
                    "/freelancer-dashboard";

            } else {

                window.location.href =
                    "/login";

            }

        }, 700);


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to login. Please try again.",
            "error"
        );


    } finally {

        /*
         * Enable button again
         */
        loginButton.disabled = false;

        loginButton.textContent =
            "Sign In";

    }

});


/*
 * SHOW MESSAGE
 */
function showMessage(message, type) {

    loginMessage.textContent =
        message;

    loginMessage.className =
        "login-message " + type;

}


/*
 * HIDE MESSAGE
 */
function hideMessage() {

    loginMessage.textContent =
        "";

    loginMessage.className =
        "login-message";

}