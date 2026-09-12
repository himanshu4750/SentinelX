const pool = require("../config/database");


// ==========================================
// SAVE ALERT
// ==========================================

const saveAlert = async (alert) => {

    const query = `
        INSERT INTO alerts (
            alert_type,
            title,
            username,
            source_ip,
            severity,
            risk_score,
            mitre_tactic,
            mitre_technique,
            mitre_technique_id,
            timestamp,
            status
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10, $11
        )
        RETURNING *;
    `;

    const values = [
        alert.alertType,
        alert.title,
        alert.username,
        alert.sourceIp,
        alert.severity,
        alert.riskScore,
        alert.mitreTactic || null,
        alert.mitreTechnique || null,
        alert.mitreTechniqueId || null,
        alert.timestamp,
        "NEW"
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0];
};


// ==========================================
// GET ALL ALERTS
// ==========================================

const getAllAlerts = async () => {

    const result = await pool.query(`
        SELECT *
        FROM alerts
        ORDER BY timestamp DESC;
    `);

    return result.rows;
};


// ==========================================
// GET ALERT BY ID
// ==========================================

const getAlertById = async (alertId) => {

    const result = await pool.query(
        `
        SELECT *
        FROM alerts
        WHERE id = $1;
        `,
        [alertId]
    );

    return result.rows[0] || null;
};


// ==========================================
// GET ALERT STATUS HISTORY
// ==========================================

const getAlertStatusHistory = async (
    alertId
) => {

    const result = await pool.query(
        `
        SELECT *
        FROM alert_status_history
        WHERE alert_id = $1
        ORDER BY changed_at DESC;
        `,
        [alertId]
    );

    return result.rows;
};


// ==========================================
// ADD ALERT NOTE
// ==========================================

const addAlertNote = async (
    alertId,
    note
) => {

    const result = await pool.query(
        `
        INSERT INTO alert_notes (
            alert_id,
            note
        )
        VALUES (
            $1,
            $2
        )
        RETURNING *;
        `,
        [
            alertId,
            note
        ]
    );

    return result.rows[0];
};


// ==========================================
// GET ALERT NOTES
// ==========================================

const getAlertNotes = async (
    alertId
) => {

    const result = await pool.query(
        `
        SELECT *
        FROM alert_notes
        WHERE alert_id = $1
        ORDER BY created_at DESC;
        `,
        [alertId]
    );

    return result.rows;
};


// ==========================================
// UPDATE ALERT STATUS
// ==========================================

const updateAlertStatus = async (
    alertId,
    status
) => {

    const client =
        await pool.connect();

    try {

        await client.query("BEGIN");


        // Get current alert
        const existingResult =
            await client.query(
                `
                SELECT *
                FROM alerts
                WHERE id = $1
                FOR UPDATE;
                `,
                [alertId]
            );


        const existingAlert =
            existingResult.rows[0];


        if (!existingAlert) {

            await client.query(
                "ROLLBACK"
            );

            return null;
        }


        const oldStatus =
            existingAlert.status || "NEW";


        let updateQuery;


        // ======================================
        // ACKNOWLEDGED
        // ======================================

        if (
            status ===
            "ACKNOWLEDGED"
        ) {

            updateQuery = `
                UPDATE alerts
                SET
                    status = $1,

                    acknowledged_at =
                        COALESCE(
                            acknowledged_at,
                            CURRENT_TIMESTAMP
                        ),

                    updated_at =
                        CURRENT_TIMESTAMP

                WHERE id = $2

                RETURNING *;
            `;


        // ======================================
        // CLOSED
        // ======================================

        } else if (
            status ===
            "CLOSED"
        ) {

            updateQuery = `
                UPDATE alerts
                SET
                    status = $1,

                    closed_at =
                        COALESCE(
                            closed_at,
                            CURRENT_TIMESTAMP
                        ),

                    updated_at =
                        CURRENT_TIMESTAMP

                WHERE id = $2

                RETURNING *;
            `;


        // ======================================
        // OTHER STATUS
        // ======================================

        } else {

            updateQuery = `
                UPDATE alerts
                SET
                    status = $1,

                    updated_at =
                        CURRENT_TIMESTAMP

                WHERE id = $2

                RETURNING *;
            `;
        }


        const updatedResult =
            await client.query(
                updateQuery,
                [
                    status,
                    alertId
                ]
            );


        const updatedAlert =
            updatedResult.rows[0];


        // ======================================
        // RECORD STATUS HISTORY
        // ======================================

        if (
            oldStatus !== status
        ) {

            await client.query(
                `
                INSERT INTO
                    alert_status_history (
                        alert_id,
                        old_status,
                        new_status
                    )
                VALUES (
                    $1,
                    $2,
                    $3
                );
                `,
                [
                    alertId,
                    oldStatus,
                    status
                ]
            );
        }


        await client.query(
            "COMMIT"
        );


        return updatedAlert;


    } catch (error) {

        await client.query(
            "ROLLBACK"
        );

        throw error;


    } finally {

        client.release();
    }
};


// ==========================================
// EXPORT SERVICES
// ==========================================

module.exports = {

    saveAlert,

    getAllAlerts,

    getAlertById,

    getAlertStatusHistory,

    addAlertNote,

    getAlertNotes,

    updateAlertStatus
};