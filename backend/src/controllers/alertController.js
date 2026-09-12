const {
    getAllAlerts,
    getAlertById,
    getAlertStatusHistory,
    updateAlertStatus,
    addAlertNote,
    getAlertNotes
} = require("../services/alertService");


// ==========================================
// GET ALL ALERTS
// ==========================================

const getAlerts = async (req, res) => {
    try {

        const alerts =
            await getAllAlerts();

        return res.json({
            success: true,
            count: alerts.length,
            alerts
        });

    } catch (error) {

        console.error(
            "Error retrieving alerts:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve alerts"
        });
    }
};


// ==========================================
// GET ALERT HISTORY
// ==========================================

const getAlertHistory = async (req, res) => {
    try {

        const alertId =
            Number(req.params.id);


        // ======================================
        // VALIDATE ALERT ID
        // ======================================

        if (
            !Number.isInteger(alertId) ||
            alertId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid alert ID"
            });
        }


        // ======================================
        // CHECK ALERT EXISTS
        // ======================================

        const alert =
            await getAlertById(
                alertId
            );


        if (!alert) {

            return res.status(404).json({
                success: false,
                message: "Alert not found"
            });
        }


        // ======================================
        // GET STATUS HISTORY
        // ======================================

        const history =
            await getAlertStatusHistory(
                alertId
            );


        return res.json({
            success: true,
            alert,
            count: history.length,
            history
        });


    } catch (error) {

        console.error(
            "Error retrieving alert history:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve alert history"
        });
    }
};


// ==========================================
// UPDATE ALERT STATUS
// ==========================================

const changeAlertStatus = async (req, res) => {
    try {

        const alertId =
            Number(req.params.id);


        const { status } =
            req.body;


        // ======================================
        // VALID ALERT STATUSES
        // ======================================

        const allowedStatuses = [
            "NEW",
            "ACKNOWLEDGED",
            "CLOSED"
        ];


        // ======================================
        // VALIDATE ALERT ID
        // ======================================

        if (
            !Number.isInteger(alertId) ||
            alertId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid alert ID"
            });
        }


        // ======================================
        // VALIDATE STATUS
        // ======================================

        if (!status) {

            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }


        // ======================================
        // NORMALIZE STATUS
        // ======================================

        const normalizedStatus =
            String(status)
                .trim()
                .toUpperCase();


        // ======================================
        // CHECK ALLOWED STATUS
        // ======================================

        if (
            !allowedStatuses.includes(
                normalizedStatus
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Status must be NEW, ACKNOWLEDGED, or CLOSED"
            });
        }


        // ======================================
        // FIND ALERT
        // ======================================

        const existingAlert =
            await getAlertById(
                alertId
            );


        if (!existingAlert) {

            return res.status(404).json({
                success: false,
                message: "Alert not found"
            });
        }


        // ======================================
        // CURRENT STATUS
        // ======================================

        const currentStatus =
            String(
                existingAlert.status ||
                "NEW"
            ).toUpperCase();


        // ======================================
        // VALID STATUS TRANSITIONS
        // ======================================

        const validTransitions = {

            NEW: [
                "ACKNOWLEDGED",
                "CLOSED"
            ],

            ACKNOWLEDGED: [
                "CLOSED"
            ],

            CLOSED: []
        };


        // ======================================
        // SAME STATUS
        // ======================================

        if (
            normalizedStatus ===
            currentStatus
        ) {

            return res.json({
                success: true,
                message:
                    `Alert is already ${currentStatus}`,
                alert: existingAlert
            });
        }


        // ======================================
        // GET VALID NEXT STATUSES
        // ======================================

        const allowedNextStatuses =
            validTransitions[
                currentStatus
            ] || [];


        // ======================================
        // BLOCK INVALID TRANSITION
        // ======================================

        if (
            !allowedNextStatuses.includes(
                normalizedStatus
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    `Invalid status transition: ${currentStatus} → ${normalizedStatus}`
            });
        }


        // ======================================
        // UPDATE ALERT
        // ======================================

        const updatedAlert =
            await updateAlertStatus(
                alertId,
                normalizedStatus
            );


        return res.json({
            success: true,
            message:
                `Alert status changed from ${currentStatus} to ${normalizedStatus}`,
            alert: updatedAlert
        });


    } catch (error) {

        console.error(
            "Error updating alert status:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to update alert status"
        });
    }
};


// ==========================================
// GET ALERT NOTES
// ==========================================

const getNotes = async (req, res) => {
    try {

        const alertId =
            Number(req.params.id);


        // ======================================
        // VALIDATE ALERT ID
        // ======================================

        if (
            !Number.isInteger(alertId) ||
            alertId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid alert ID"
            });
        }


        // ======================================
        // CHECK ALERT EXISTS
        // ======================================

        const alert =
            await getAlertById(
                alertId
            );


        if (!alert) {

            return res.status(404).json({
                success: false,
                message: "Alert not found"
            });
        }


        // ======================================
        // GET NOTES
        // ======================================

        const notes =
            await getAlertNotes(
                alertId
            );


        return res.json({
            success: true,
            alertId,
            count: notes.length,
            notes
        });


    } catch (error) {

        console.error(
            "Error retrieving alert notes:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve alert notes"
        });
    }
};


// ==========================================
// CREATE ALERT NOTE
// ==========================================

const createNote = async (req, res) => {
    try {

        const alertId =
            Number(req.params.id);


        const { note } =
            req.body;


        // ======================================
        // VALIDATE ALERT ID
        // ======================================

        if (
            !Number.isInteger(alertId) ||
            alertId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid alert ID"
            });
        }


        // ======================================
        // VALIDATE NOTE
        // ======================================

        if (
            !note ||
            !String(note).trim()
        ) {

            return res.status(400).json({
                success: false,
                message: "Note is required"
            });
        }


        // ======================================
        // CLEAN NOTE
        // ======================================

        const cleanNote =
            String(note).trim();


        // ======================================
        // VALIDATE NOTE LENGTH
        // ======================================

        if (
            cleanNote.length > 2000
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Note must be 2000 characters or less"
            });
        }


        // ======================================
        // CHECK ALERT EXISTS
        // ======================================

        const alert =
            await getAlertById(
                alertId
            );


        if (!alert) {

            return res.status(404).json({
                success: false,
                message: "Alert not found"
            });
        }


        // ======================================
        // SAVE NOTE
        // ======================================

        const savedNote =
            await addAlertNote(
                alertId,
                cleanNote
            );


        return res.status(201).json({
            success: true,
            message:
                "Alert note added successfully",
            note: savedNote
        });


    } catch (error) {

        console.error(
            "Error creating alert note:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to create alert note"
        });
    }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {

    getAlerts,

    getAlertHistory,

    changeAlertStatus,

    getNotes,

    createNote
};