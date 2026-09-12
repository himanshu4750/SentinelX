const {
    getDashboardStats
} = require("../services/dashboardService");

const getDashboard = async (req, res) => {
    try {
        const stats = await getDashboardStats();

        return res.json({
            success: true,
            dashboard: stats
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard"
        });
    }
};

module.exports = {
    getDashboard
};