require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./src/config/database");

const eventRoutes = require("./src/routes/eventRoutes");
const alertRoutes = require("./src/routes/alertRoutes");
const incidentRoutes = require("./src/routes/incidentRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");

const app = express();

// Enable CORS for all origins (supports both local and deployed frontend)
app.use(cors());
app.use(express.json());

// Base health check endpoints
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "SentinelX backend is running"
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "SentinelX API is active"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

// Mount routes with /api prefix
app.use("/api/events", eventRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Also mount routes without /api prefix for proxy rewrite compatibility
app.use("/events", eventRoutes);
app.use("/alerts", alertRoutes);
app.use("/incidents", incidentRoutes);
app.use("/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;

// Test PostgreSQL connection
if (process.env.DB_PASSWORD || process.env.DATABASE_URL) {
    pool.query("SELECT NOW()")
        .then((result) => {
            console.log("PostgreSQL connected successfully");
            console.log("Database time:", result.rows[0].now);
        })
        .catch((error) => {
            console.error("PostgreSQL connection notice:", error.message);
        });
} else {
    console.log("PostgreSQL connection skipped: No credentials provided in environment.");
}

// Only start the HTTP listener if executed directly (e.g. node server.js)
// When imported by serverless runtimes (like Vercel), app is exported directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`SentinelX server running on port ${PORT}`);
    });
}

module.exports = app;