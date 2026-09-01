const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Messages file
const messagesFile = path.join(__dirname, "messages.json");

// Create messages.json if it doesn't exist
if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, "[]");
}

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Contact form
app.post("/api/messages", async (req, res) => {
  const { name, email, message } = req.body;

  // Check fields
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all fields."
    });
  }

  // Read existing messages
  let messages = [];

  try {
    messages = JSON.parse(
      fs.readFileSync(messagesFile, "utf8")
    );
  } catch (error) {
    messages = [];
  }

  // Add new message
  const newMessage = {
    id: Date.now(),
    name: name,
    email: email,
    message: message,
    date: new Date().toISOString()
  };

  messages.push(newMessage);

  // Save message
  try {
    fs.writeFileSync(
      messagesFile,
      JSON.stringify(messages, null, 2)
    );
  } catch (error) {
    console.error("Could not save message:", error);

    return res.status(500).json({
      success: false,
      message: "Could not save message."
    });
  }

  // Send email with Resend
  try {
    if (process.env.RESEND_API_KEY && process.env.EMAIL_USER) {
      const resendResponse = await fetch(
        "https://api.resend.com/emails",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "Portfolio <onboarding@resend.dev>",
            to: [process.env.EMAIL_USER],
            reply_to: email,
            subject: `New Portfolio Message from ${name}`,
            text:
              `Name: ${name}\n\n` +
              `Email: ${email}\n\n` +
              `Message:\n${message}`
          })
        }
      );

      if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        console.error("Resend error:", errorText);

        return res.status(200).json({
          success: true,
          message: "Message saved successfully, but email could not be sent."
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!"
    });

  } catch (error) {
    console.error("Email error:", error);

    return res.status(200).json({
      success: true,
      message: "Message saved successfully, but email could not be sent."
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

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Portfolio backend is running!"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
