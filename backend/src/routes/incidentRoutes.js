const express = require("express");

const {
    getIncidents,
    getIncident,
    getIncidentHistory,
    changeIncidentStatus,
    getNotes,
    createNote
} = require("../controllers/incidentController");

const router = express.Router();


router.get(
    "/",
    getIncidents
);


router.get(
    "/:incidentId/history",
    getIncidentHistory
);


router.get(
    "/:incidentId/notes",
    getNotes
);


router.post(
    "/:incidentId/notes",
    createNote
);


router.patch(
    "/:incidentId/status",
    changeIncidentStatus
);


router.get(
    "/:incidentId",
    getIncident
);


module.exports = router;