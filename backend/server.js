const express = require("express");

const cors = require("cors");

const dotenv = require("dotenv");

const path = require("path");


// Load environment variables

dotenv.config();


// Create Express application

const app = express();


// ==================================================
// MIDDLEWARE
// ==================================================

app.use(
    cors()
);


app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended: true
    })
);


// ==================================================
// API ROUTES
// ==================================================

const messageRoutes =
    require("./routes/messages");


app.use(
    "/api/messages",
    messageRoutes
);


// ==================================================
// HEALTH CHECK
// ==================================================

app.get("/api", (req, res) => {

    res.json({

        success: true,

        message:
            "Umar Abdullahi portfolio API is running."

    });

});


// ==================================================
// SERVE FRONTEND
// ==================================================

const frontendPath =
    path.join(
        __dirname,
        "..",
        "frontend"
    );


app.use(
    express.static(frontendPath)
);


// ==================================================
// FRONTEND FALLBACK
// ==================================================

app.get("*splat", (req, res) => {

    res.sendFile(
        path.join(
            frontendPath,
            "index.html"
        )
    );

});


// ==================================================
// START SERVER
// ==================================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);