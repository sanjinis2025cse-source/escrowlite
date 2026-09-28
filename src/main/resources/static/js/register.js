const registerForm =
    document.getElementById("registerForm");

const registerMessage =
    document.getElementById("registerMessage");

const registerButton =
    document.getElementById("registerButton");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const togglePassword =
    document.getElementById("togglePassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");


/* =========================
   PASSWORD SHOW / HIDE
   ========================= */

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.textContent = "HIDE";

    } else {

        passwordInput.type = "password";

        togglePassword.textContent = "SHOW";

    }

});


toggleConfirmPassword.addEventListener("click", () => {

    if (confirmPasswordInput.type === "password") {

        confirmPasswordInput.type = "text";

        toggleConfirmPassword.textContent = "HIDE";

    } else {

        confirmPasswordInput.type = "password";

        toggleConfirmPassword.textContent = "SHOW";

    }

});


/* =========================
   REGISTRATION
   ========================= */

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            document.getElementById("name")
                .value.trim();

        const email =
            document.getElementById("email")
                .value.trim();

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;

        const selectedRole =
            document.querySelector(
                'input[name="role"]:checked'
            );


        /* =========================
           VALIDATION
           ========================= */

        if (!name || !email || !password ||
            !confirmPassword || !selectedRole) {

            showMessage(
                "Please fill in all required fields.",
                "error"
            );

            return;

        }


        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return;

        }


        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            return;

        }


        const role =
            selectedRole.value;


        /* =========================
           DISABLE BUTTON
           ========================= */

        registerButton.disabled = true;

        registerButton.textContent =
            "Creating Account...";

        hideMessage();


        try {

            /* =========================
               SEND DATA TO BACKEND
               ========================= */

            const response = await fetch(
                "/api/users",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        password: password,

                        role: role

                    })
                }
            );


            const data =
                await response.json();


            /* =========================
               HANDLE ERROR
               ========================= */

            if (!response.ok) {

                let errorMessage =
                    "Registration failed.";


                if (data.message) {

                    errorMessage =
                        data.message;

                } else if (data.errors) {

                    errorMessage =
                        Object.values(data.errors)
                            .join(", ");

                }


                throw new Error(
                    errorMessage
                );

            }


            /* =========================
               SUCCESS
               ========================= */

            showMessage(
                "Account created successfully. Redirecting to login...",
                "success"
            );


            registerForm.reset();


            setTimeout(() => {

                window.location.href =
                    "/login";

            }, 1200);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to create account. Please try again.",
                "error"
            );


        } finally {

            registerButton.disabled = false;

            registerButton.textContent =
                "Create Account";

        }

    }
);


/* =========================
   SHOW MESSAGE
   ========================= */

function showMessage(message, type) {

    registerMessage.textContent =
        message;

    registerMessage.className =
        "register-message " + type;

}


/* =========================
   HIDE MESSAGE
   ========================= */

function hideMessage() {

    registerMessage.textContent = "";

    registerMessage.className =
        "register-message";

}