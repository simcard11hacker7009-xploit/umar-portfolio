const express = require("express");

const fs = require("fs");

const path = require("path");


const router = express.Router();


// Location of our JSON database

const dataDirectory =
    path.join(__dirname, "..", "data");

const dataFile =
    path.join(dataDirectory, "messages.json");


// Make sure the data directory exists

if (!fs.existsSync(dataDirectory)) {

    fs.mkdirSync(dataDirectory, {
        recursive: true
    });

}


// Make sure the JSON file exists

if (!fs.existsSync(dataFile)) {

    fs.writeFileSync(
        dataFile,
        "[]",
        "utf8"
    );

}


// ==================================================
// POST /api/messages
// ==================================================

router.post("/", (req, res) => {

    try {

        const {
            name,
            email,
            message
        } = req.body;


        // Validate fields

        if (
            !name ||
            !email ||
            !message
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, email and message are required."
            });

        }


        // Basic email validation

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(email)) {

            return res.status(400).json({
                success: false,
                message:
                    "Please enter a valid email address."
            });

        }


        // Read existing messages

        const fileContent =
            fs.readFileSync(
                dataFile,
                "utf8"
            );


        let messages = [];


        try {

            messages =
                JSON.parse(fileContent);

        } catch (error) {

            messages = [];

        }


        // Create new message

        const newMessage = {

            id: Date.now(),

            name: name.trim(),

            email: email.trim(),

            message: message.trim(),

            createdAt:
                new Date().toISOString()

        };


        // Add message

        messages.push(newMessage);


        // Save message

        fs.writeFileSync(
            dataFile,
            JSON.stringify(
                messages,
                null,
                2
            ),
            "utf8"
        );


        // Send response

        res.status(201).json({

            success: true,

            message:
                "Your message has been received.",

            data: newMessage

        });


    } catch (error) {

        console.error(
            "Message error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error. Please try again later."

        });

    }

});


// ==================================================
// GET /api/messages
// ==================================================

router.get("/", (req, res) => {

    try {

        const fileContent =
            fs.readFileSync(
                dataFile,
                "utf8"
            );


        const messages =
            JSON.parse(fileContent);


        res.json({

            success: true,

            count: messages.length,

            data: messages

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            success: false,

            message:
                "Unable to load messages."

        });

    }

});


module.exports = router;