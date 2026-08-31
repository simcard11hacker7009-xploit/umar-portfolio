const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));

// Send contact messages to Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const messagesFile = path.join(__dirname, "messages.json");

if (!fs.existsSync(messagesFile)) {
    fs.writeFileSync(messagesFile, "[]");
}

app.post("/api/messages", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all fields."
        });
    }

    // Save message
    let messages = [];

    try {
        messages = JSON.parse(
            fs.readFileSync(messagesFile, "utf8")
        );
    } catch (error) {
        messages = [];
    }

    messages.push({
        id: Date.now(),
        name,
        email,
        message,
        date: new Date().toISOString()
    });

    fs.writeFileSync(
        messagesFile,
        JSON.stringify(messages, null, 2)
    );

    // Send email
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `New Portfolio Message from ${name}`,
            text: `
Name: ${name}
Email: ${email}

Message:
${message}
            `
        });

        res.json({
            success: true,
            message: "Message sent successfully!"
        });

    } catch (error) {
        console.error("Email error:", error);

        res.status(500).json({
            success: false,
            message: "Message was saved, but email could not be sent."
        });
    }
});

// View saved messages
app.get("/api/messages", (req, res) => {
    try {
        const messages = JSON.parse(
            fs.readFileSync(messagesFile, "utf8")
        );

        res.json(messages);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Could not read messages."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
