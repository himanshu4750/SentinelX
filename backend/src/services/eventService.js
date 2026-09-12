const pool = require("../config/database");


// ==========================================
// SAVE EVENT
// ==========================================

const saveEvent = async (event) => {

    const query = `
        INSERT INTO events (
            event_type,
            username,
            source_ip,
            source,
            timestamp
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5
        )
        RETURNING *;
    `;

    const values = [
        event.eventType,
        event.username,
        event.sourceIp,
        event.source,
        event.timestamp
    ];

    const result =
        await pool.query(
            query,
            values
        );

    return result.rows[0];
};


// ==========================================
// GET ALL EVENTS
// ==========================================

const getAllEvents = async () => {

    const result =
        await pool.query(`
            SELECT *
            FROM events
            ORDER BY timestamp DESC;
        `);

    return result.rows;
};


// ==========================================
// GET RECENT RELATED EVENTS
// ==========================================

const getRecentEvents = async (
    username,
    sourceIp,
    minutes = 5
) => {

    const result =
        await pool.query(
            `
            SELECT *
            FROM events
            WHERE
                username = $1
                AND source_ip = $2
                AND timestamp >=
                    NOW() - ($3 * INTERVAL '1 minute')
            ORDER BY timestamp ASC;
            `,
            [
                username,
                sourceIp,
                minutes
            ]
        );

    return result.rows;
};


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    saveEvent,
    getAllEvents,
    getRecentEvents
};