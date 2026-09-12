require("dotenv").config();
const cors = require("cors");
// require("dotenv").config();
const dashboardRoutes = require("./src/routes/dashboardRoutes");


const express = require("express");
const pool = require("./src/config/database");

const eventRoutes = require("./src/routes/eventRoutes");
const alertRoutes = require("./src/routes/alertRoutes");
const incidentRoutes = require("./src/routes/incidentRoutes");

const app = express();
app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());



app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "SentinelX backend is running"
    });
});

app.use("/api/events", eventRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = 5000;
pool.query("SELECT NOW()")
    .then((result) => {
        console.log("PostgreSQL connected successfully");
        console.log("Database time:", result.rows[0].now);
    })
    .catch((error) => {
        console.error("PostgreSQL connection failed:");
        console.error(error.message);
    });

app.listen(PORT, () => {
    console.log(`SentinelX server running on port ${PORT}`);
});

module.exports = app;