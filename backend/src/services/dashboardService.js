const pool = require("../config/database");

const getDashboardStats = async () => {
    const eventResult = await pool.query(`
        SELECT COUNT(*) FROM events;
    `);

    const alertResult = await pool.query(`
        SELECT COUNT(*) FROM alerts;
    `);

    const incidentResult = await pool.query(`
        SELECT COUNT(*) FROM incidents;
    `);

    const criticalAlertResult = await pool.query(`
        SELECT COUNT(*)
        FROM alerts
        WHERE severity = 'CRITICAL';
    `);

    const highAlertResult = await pool.query(`
        SELECT COUNT(*)
        FROM alerts
        WHERE severity = 'HIGH';
    `);

    const openIncidentResult = await pool.query(`
        SELECT COUNT(*)
        FROM incidents
        WHERE status = 'OPEN';
    `);

    return {
        totalEvents: Number(eventResult.rows[0].count),
        totalAlerts: Number(alertResult.rows[0].count),
        totalIncidents: Number(incidentResult.rows[0].count),
        criticalAlerts: Number(criticalAlertResult.rows[0].count),
        highAlerts: Number(highAlertResult.rows[0].count),
        openIncidents: Number(openIncidentResult.rows[0].count)
    };
};

module.exports = {
    getDashboardStats
};
