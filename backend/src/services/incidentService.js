const pool = require("../config/database");


// ==========================================
// GET ALL INCIDENTS
// ==========================================

const getAllIncidents = async () => {

    const result = await pool.query(`
        SELECT *
        FROM incidents
        ORDER BY id DESC;
    `);

    return result.rows;
};


// ==========================================
// GET INCIDENT USING INCIDENT ID
// ==========================================

const getIncidentByIncidentId = async (
    incidentId
) => {

    const result = await pool.query(
        `
        SELECT *
        FROM incidents
        WHERE incident_id = $1;
        `,
        [incidentId]
    );

    return result.rows[0] || null;
};


// ==========================================
// CREATE INCIDENT
// ==========================================

const createIncident = async (
    incident
) => {

    const result = await pool.query(
        `
        INSERT INTO incidents (
            incident_id,
            title,
            username,
            source_ip,
            severity,
            risk_score,
            status
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
        )
        RETURNING *;
        `,
        [
            incident.incidentId,
            incident.title,
            incident.username,
            incident.sourceIp,
            incident.severity,
            incident.riskScore,
            incident.status || "OPEN"
        ]
    );

    return result.rows[0];
};


// ==========================================
// FIND ACTIVE INCIDENT
// ==========================================

const getOpenIncident = async (
    username,
    sourceIp
) => {

    const result = await pool.query(
        `
        SELECT *
        FROM incidents
        WHERE
            username = $1
            AND source_ip = $2
            AND status IN (
                'OPEN',
                'INVESTIGATING'
            )
        ORDER BY id DESC
        LIMIT 1;
        `,
        [
            username,
            sourceIp
        ]
    );

    return result.rows[0] || null;
};


// ==========================================
// UPDATE INCIDENT RISK + SEVERITY
// ==========================================

const updateIncident = async (
    incidentId,
    severity,
    riskScore
) => {

    const result = await pool.query(
        `
        UPDATE incidents
        SET
            severity = $1,
            risk_score = $2
        WHERE id = $3
        RETURNING *;
        `,
        [
            severity,
            riskScore,
            incidentId
        ]
    );

    return result.rows[0] || null;
};


// ==========================================
// LINK ALERT TO INCIDENT
// ==========================================

const linkAlertToIncident = async (
    incidentId,
    alertId
) => {

    /*
        Prevent the same alert from being linked
        to the same incident more than once.

        We use WHERE NOT EXISTS instead of
        ON CONFLICT so this works even if the
        table does not currently have a UNIQUE
        constraint.
    */

    const result = await pool.query(
        `
        INSERT INTO incident_alerts (
            incident_id,
            alert_id
        )

        SELECT
            $1,
            $2

        WHERE NOT EXISTS (
            SELECT 1
            FROM incident_alerts
            WHERE
                incident_id = $1
                AND alert_id = $2
        )

        RETURNING *;
        `,
        [
            incidentId,
            alertId
        ]
    );

    return result.rows[0] || null;
};


// ==========================================
// UPDATE INCIDENT STATUS
// ==========================================

const updateIncidentStatus = async (
    incidentId,
    status
) => {

    const client =
        await pool.connect();

    try {

        await client.query(
            "BEGIN"
        );


        // Get current incident

        const existingResult =
            await client.query(
                `
                SELECT *
                FROM incidents
                WHERE incident_id = $1
                FOR UPDATE;
                `,
                [
                    incidentId
                ]
            );


        const existingIncident =
            existingResult.rows[0];


        if (!existingIncident) {

            await client.query(
                "ROLLBACK"
            );

            return null;
        }


        const oldStatus =
            existingIncident.status ||
            "OPEN";


        // Update status

        const updatedResult =
            await client.query(
                `
                UPDATE incidents
                SET status = $1
                WHERE incident_id = $2
                RETURNING *;
                `,
                [
                    status,
                    incidentId
                ]
            );


        const updatedIncident =
            updatedResult.rows[0];


        // Save status history

        if (
            oldStatus !== status
        ) {

            await client.query(
                `
                INSERT INTO incident_status_history (
                    incident_id,
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
                    incidentId,
                    oldStatus,
                    status
                ]
            );
        }


        await client.query(
            "COMMIT"
        );


        return updatedIncident;

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
// GET INCIDENT STATUS HISTORY
// ==========================================

const getIncidentStatusHistory = async (
    incidentId
) => {

    const result = await pool.query(
        `
        SELECT *
        FROM incident_status_history
        WHERE incident_id = $1
        ORDER BY changed_at DESC;
        `,
        [
            incidentId
        ]
    );

    return result.rows;
};


// ==========================================
// ADD INCIDENT NOTE
// ==========================================

const addIncidentNote = async (
    incidentId,
    note
) => {

    const result = await pool.query(
        `
        INSERT INTO incident_notes (
            incident_id,
            note
        )
        VALUES (
            $1,
            $2
        )
        RETURNING *;
        `,
        [
            incidentId,
            note
        ]
    );

    return result.rows[0];
};


// ==========================================
// GET INCIDENT NOTES
// ==========================================

const getIncidentNotes = async (
    incidentId
) => {

    const result = await pool.query(
        `
        SELECT *
        FROM incident_notes
        WHERE incident_id = $1
        ORDER BY created_at DESC;
        `,
        [
            incidentId
        ]
    );

    return result.rows;
};


// ==========================================
// GET ALERTS LINKED TO INCIDENT
// ==========================================

const getIncidentAlerts = async (
    incidentId
) => {

    const incident =
        await getIncidentByIncidentId(
            incidentId
        );


    if (!incident) {

        return [];
    }


    const result =
        await pool.query(
            `
            SELECT a.*
            FROM alerts a

            INNER JOIN incident_alerts ia
                ON a.id = ia.alert_id

            WHERE ia.incident_id = $1

            ORDER BY a.id DESC;
            `,
            [
                incident.id
            ]
        );


    return result.rows;
};


// ==========================================
// GET EVENTS RELATED TO INCIDENT
// ==========================================

const getIncidentEvents = async (
    incidentId
) => {

    const incident =
        await getIncidentByIncidentId(
            incidentId
        );


    if (!incident) {

        return [];
    }


    const result =
        await pool.query(
            `
            SELECT *
            FROM events

            WHERE
                username = $1
                AND source_ip = $2

            ORDER BY id DESC;
            `,
            [
                incident.username,
                incident.source_ip
            ]
        );


    return result.rows;
};


// ==========================================
// EXPORT SERVICE FUNCTIONS
// ==========================================

module.exports = {

    // Incident creation / correlation
    createIncident,
    getOpenIncident,
    updateIncident,
    linkAlertToIncident,

    // Incident retrieval
    getAllIncidents,
    getIncidentByIncidentId,

    // Status workflow
    updateIncidentStatus,
    getIncidentStatusHistory,

    // Analyst notes
    addIncidentNote,
    getIncidentNotes,

    // Investigation
    getIncidentAlerts,
    getIncidentEvents
};