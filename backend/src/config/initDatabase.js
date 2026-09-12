require("dotenv").config();

const pool = require("./database");

const initializeDatabase = async () => {
    try {
        console.log("Creating SentinelX database tables...");

        // EVENTS TABLE
        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                event_type VARCHAR(100) NOT NULL,
                username VARCHAR(100),
                source_ip VARCHAR(100),
                source VARCHAR(100),
                timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                metadata JSONB DEFAULT '{}'::jsonb
            );
        `);

        console.log("Events table created");

        // ALERTS TABLE
        await pool.query(`
            CREATE TABLE IF NOT EXISTS alerts (
                id SERIAL PRIMARY KEY,
                alert_type VARCHAR(150) NOT NULL,
                title VARCHAR(255) NOT NULL,
                username VARCHAR(100),
                source_ip VARCHAR(100),
                severity VARCHAR(20) NOT NULL,
                risk_score INTEGER,
                mitre_tactic VARCHAR(100),
                mitre_technique VARCHAR(150),
                mitre_technique_id VARCHAR(30),
                timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Alerts table created");

        // INCIDENTS TABLE
        await pool.query(`
            CREATE TABLE IF NOT EXISTS incidents (
                id SERIAL PRIMARY KEY,
                incident_id VARCHAR(50) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                username VARCHAR(100),
                source_ip VARCHAR(100),
                severity VARCHAR(20) NOT NULL,
                risk_score INTEGER DEFAULT 0,
                status VARCHAR(50) DEFAULT 'OPEN',
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Incidents table created");

        // CONNECTION BETWEEN INCIDENTS AND ALERTS
        await pool.query(`
            CREATE TABLE IF NOT EXISTS incident_alerts (
                id SERIAL PRIMARY KEY,
                incident_id INTEGER NOT NULL,
                alert_id INTEGER NOT NULL,

                CONSTRAINT fk_incident
                    FOREIGN KEY (incident_id)
                    REFERENCES incidents(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_alert
                    FOREIGN KEY (alert_id)
                    REFERENCES alerts(id)
                    ON DELETE CASCADE,

                UNIQUE (incident_id, alert_id)
            );
        `);

        console.log("Incident-alert table created");

        console.log("");
        console.log("SentinelX database initialized successfully!");

    } catch (error) {
        console.error("Database initialization failed:");
        console.error(error.message);

    } finally {
        await pool.end();
    }
};

initializeDatabase();