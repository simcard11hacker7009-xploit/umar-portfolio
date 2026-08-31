// ==================================================
// MOBILE NAVIGATION
// ==================================================

const menuButton = document.getElementById("menuButton");

const navLinks = document.getElementById("navLinks");


menuButton.addEventListener("click", function () {

    navLinks.classList.toggle("active");

});


// Close mobile menu when a link is clicked

const navigationLinks =
    document.querySelectorAll(".nav-links a");


navigationLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        navLinks.classList.remove("active");

    });

});


// ==================================================
// CONTACT FORM
// ==================================================

const contactForm =
    document.getElementById("contactForm");

const formMessage =
    document.getElementById("formMessage");

const submitButton =
    document.getElementById("submitButton");


contactForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const message =
        document.getElementById("message").value.trim();


    // Basic validation

    if (!name || !email || !message) {

        showMessage(
            "Please fill in all fields.",
            "error"
        );

        return;
    }


    // Disable button while sending

    submitButton.disabled = true;

    submitButton.textContent = "Sending...";


    try {

        const response = await fetch("/api/messages", 
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Something went wrong."
            );

        }


        showMessage(
            "Message sent successfully!",
            "success"
        );


        contactForm.reset();


    } catch (error) {

        console.error(error);


        showMessage(
            "Unable to send message. Please make sure the backend server is running.",
            "error"
        );

    } finally {

        submitButton.disabled = false;

        submitButton.textContent = "Send Message";

    }

});


// ==================================================
// FORM MESSAGE
// ==================================================

function showMessage(message, type) {

    formMessage.textContent = message;

    formMessage.className =
        "form-message " + type;

}