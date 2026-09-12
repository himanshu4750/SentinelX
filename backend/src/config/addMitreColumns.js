require("dotenv").config();

const pool = require("./database");

const addMitreColumns = async () => {
    try {
        console.log("Updating alerts table...");

        await pool.query(`
            ALTER TABLE alerts
            ADD COLUMN IF NOT EXISTS mitre_tactic VARCHAR(100);
        `);

        await pool.query(`
            ALTER TABLE alerts
            ADD COLUMN IF NOT EXISTS mitre_technique VARCHAR(150);
        `);

        await pool.query(`
            ALTER TABLE alerts
            ADD COLUMN IF NOT EXISTS mitre_technique_id VARCHAR(30);
        `);

        console.log("MITRE ATT&CK columns added successfully!");

    } catch (error) {
        console.error("Failed to update alerts table:");
        console.error(error.message);

    } finally {
        await pool.end();
    }
};

addMitreColumns();