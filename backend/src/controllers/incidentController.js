const {
    getAllIncidents,
    getIncidentByIncidentId,
    updateIncidentStatus,
    getIncidentStatusHistory,
    addIncidentNote,
    getIncidentNotes,
    getIncidentAlerts,
    getIncidentEvents
} = require("../services/incidentService");


// ==========================================
// GET ALL INCIDENTS
// ==========================================

const getIncidents = async (req, res) => {
    try {

        const incidents =
            await getAllIncidents();

        return res.json({
            success: true,
            count: incidents.length,
            incidents
        });

    } catch (error) {

        console.error(
            "Error retrieving incidents:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve incidents"
        });
    }
};


// ==========================================
// GET SINGLE INCIDENT
// ==========================================

const getIncident = async (req, res) => {
    try {

        const { incidentId } =
            req.params;

        if (
            !incidentId ||
            !String(incidentId).trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid incident ID"
            });
        }

        const incident =
            await getIncidentByIncidentId(
                incidentId
            );

        if (!incident) {
            return res.status(404).json({
                success: false,
                message:
                    "Incident not found"
            });
        }

        const [
            alerts,
            events
        ] = await Promise.all([

            getIncidentAlerts(
                incidentId
            ),

            getIncidentEvents(
                incidentId
            )
        ]);

        return res.json({
            success: true,

            incident: {
                ...incident,
                alerts,
                events
            }
        });

    } catch (error) {

        console.error(
            "Error retrieving incident:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve incident"
        });
    }
};


// ==========================================
// GET INCIDENT STATUS HISTORY
// ==========================================

const getIncidentHistory = async (
    req,
    res
) => {
    try {

        const { incidentId } =
            req.params;

        if (
            !incidentId ||
            !String(incidentId).trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid incident ID"
            });
        }

        const incident =
            await getIncidentByIncidentId(
                incidentId
            );

        if (!incident) {
            return res.status(404).json({
                success: false,
                message:
                    "Incident not found"
            });
        }

        const history =
            await getIncidentStatusHistory(
                incidentId
            );

        return res.json({
            success: true,
            incidentId,
            count: history.length,
            history
        });

    } catch (error) {

        console.error(
            "Error retrieving incident history:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve incident history"
        });
    }
};


// ==========================================
// CHANGE INCIDENT STATUS
// ==========================================

const changeIncidentStatus = async (
    req,
    res
) => {
    try {

        const { incidentId } =
            req.params;

        const { status } =
            req.body;


        // Validate incident ID

        if (
            !incidentId ||
            !String(incidentId).trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid incident ID"
            });
        }


        // Validate status

        if (
            !status ||
            !String(status).trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Status is required"
            });
        }


        const normalizedStatus =
            String(status)
                .trim()
                .toUpperCase();


        // Allowed statuses

        const allowedStatuses = [
            "OPEN",
            "INVESTIGATING",
            "RESOLVED"
        ];


        if (
            !allowedStatuses.includes(
                normalizedStatus
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Status must be OPEN, INVESTIGATING, or RESOLVED"
            });
        }


        // Find current incident

        const existingIncident =
            await getIncidentByIncidentId(
                incidentId
            );


        if (!existingIncident) {
            return res.status(404).json({
                success: false,
                message:
                    "Incident not found"
            });
        }


        // ======================================
        // INCIDENT WORKFLOW VALIDATION
        // ======================================

        const currentStatus =
            existingIncident.status ||
            "OPEN";


        const validTransitions = {

            OPEN: [
                "INVESTIGATING"
            ],

            INVESTIGATING: [
                "RESOLVED"
            ],

            RESOLVED: []
        };


        // Prevent selecting same status

        if (
            currentStatus ===
            normalizedStatus
        ) {
            return res.status(400).json({
                success: false,

                message:
                    `Incident is already ${normalizedStatus}`
            });
        }


        // Prevent invalid transitions

        if (
            !validTransitions[currentStatus] ||

            !validTransitions[
                currentStatus
            ].includes(
                normalizedStatus
            )
        ) {
            return res.status(400).json({
                success: false,

                message:
                    `Invalid incident status transition: ${currentStatus} → ${normalizedStatus}`
            });
        }


        // ======================================
        // UPDATE INCIDENT
        // ======================================

        const updatedIncident =
            await updateIncidentStatus(
                incidentId,
                normalizedStatus
            );


        return res.json({
            success: true,

            message:
                `Incident status updated from ${currentStatus} to ${normalizedStatus}`,

            incident:
                updatedIncident
        });

    } catch (error) {

        console.error(
            "Error updating incident status:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to update incident status"
        });
    }
};


// ==========================================
// GET INCIDENT NOTES
// ==========================================

const getNotes = async (
    req,
    res
) => {
    try {

        const { incidentId } =
            req.params;


        if (
            !incidentId ||
            !String(incidentId).trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid incident ID"
            });
        }


        const incident =
            await getIncidentByIncidentId(
                incidentId
            );


        if (!incident) {
            return res.status(404).json({
                success: false,
                message:
                    "Incident not found"
            });
        }


        const notes =
            await getIncidentNotes(
                incidentId
            );


        return res.json({
            success: true,
            incidentId,
            count: notes.length,
            notes
        });

    } catch (error) {

        console.error(
            "Error retrieving incident notes:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to retrieve incident notes"
        });
    }
};


// ==========================================
// CREATE INCIDENT NOTE
// ==========================================

const createNote = async (
    req,
    res
) => {
    try {

        const { incidentId } =
            req.params;

        const { note } =
            req.body;


        // Validate incident ID

        if (
            !incidentId ||
            !String(incidentId).trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid incident ID"
            });
        }


        // Validate note

        if (
            !note ||
            !String(note).trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Note is required"
            });
        }


        const cleanNote =
            String(note).trim();


        // Maximum note size

        if (
            cleanNote.length >
            2000
        ) {
            return res.status(400).json({
                success: false,

                message:
                    "Note must be 2000 characters or fewer"
            });
        }


        // Confirm incident exists

        const incident =
            await getIncidentByIncidentId(
                incidentId
            );


        if (!incident) {
            return res.status(404).json({
                success: false,
                message:
                    "Incident not found"
            });
        }


        // Save note

        const savedNote =
            await addIncidentNote(
                incidentId,
                cleanNote
            );


        return res.status(201).json({
            success: true,

            message:
                "Incident note added successfully",

            note:
                savedNote
        });

    } catch (error) {

        console.error(
            "Error creating incident note:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to create incident note"
        });
    }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    getIncidents,
    getIncident,
    getIncidentHistory,
    changeIncidentStatus,
    getNotes,
    createNote
};