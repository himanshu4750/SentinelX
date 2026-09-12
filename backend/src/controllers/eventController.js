const {
    runDetection
} = require("../detection/detectionEngine");

const {
    createOrUpdateIncident
} = require("../incidents/incidentEngine");

const {
    saveEvent,
    getAllEvents,
    getRecentEvents
} = require("../services/eventService");


// ==========================================
// CREATE EVENT
// ==========================================

const createEvent = async (req, res) => {
    try {

        const {
            eventType,
            username,
            sourceIp,
            source
        } = req.body;


        // ------------------------------------------
        // Basic validation
        // ------------------------------------------

        if (!eventType) {
            return res.status(400).json({
                success: false,
                message: "eventType is required"
            });
        }


        // ------------------------------------------
        // Create event object
        // ------------------------------------------

        const newEvent = {
            eventType,
            username: username || null,
            sourceIp: sourceIp || null,
            source: source || "unknown",
            timestamp: new Date().toISOString()
        };


        // ------------------------------------------
        // Save event permanently in PostgreSQL
        // ------------------------------------------

        const savedEvent =
            await saveEvent(newEvent);


        // ------------------------------------------
        // Convert PostgreSQL format
        // into detection-engine format
        // ------------------------------------------

        const detectionEvent = {
            id: savedEvent.id,
            eventType:
                savedEvent.event_type,
            username:
                savedEvent.username,
            sourceIp:
                savedEvent.source_ip,
            source:
                savedEvent.source,
            timestamp:
                savedEvent.timestamp
        };


        // ------------------------------------------
        // Load recent related events from PostgreSQL
        // ------------------------------------------

        const recentDatabaseEvents =
            await getRecentEvents(
                detectionEvent.username,
                detectionEvent.sourceIp,
                5
            );


        // ------------------------------------------
        // Convert database rows into the format
        // expected by the detection rules
        // ------------------------------------------

        const detectionEvents =
            recentDatabaseEvents.map(
                (event) => ({
                    id:
                        event.id,

                    eventType:
                        event.event_type,

                    username:
                        event.username,

                    sourceIp:
                        event.source_ip,

                    source:
                        event.source,

                    timestamp:
                        event.timestamp
                })
            );


        // ------------------------------------------
        // Run detection rules
        // ------------------------------------------

        const alert =
            await runDetection(
                detectionEvent,
                detectionEvents
            );


        // ------------------------------------------
        // Create or update incident
        // if an alert was generated
        // ------------------------------------------

        const incident =
            await createOrUpdateIncident(
                alert
            );


        // ------------------------------------------
        // Return API response
        // ------------------------------------------

        return res.status(201).json({
            success: true,
            message:
                "Security event stored successfully",
            event:
                savedEvent,
            alert:
                alert,
            incident:
                incident
        });

    } catch (error) {

        console.error(
            "Error creating event:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to store security event"
        });
    }
};


// ==========================================
// GET ALL EVENTS
// ==========================================

const getEvents = async (req, res) => {
    try {

        const events =
            await getAllEvents();

        return res.json({
            success: true,
            count:
                events.length,
            events:
                events
        });

    } catch (error) {

        console.error(
            "Error retrieving events:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve security events"
        });
    }
};


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    createEvent,
    getEvents
};