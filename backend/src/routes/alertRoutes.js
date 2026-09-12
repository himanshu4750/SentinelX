const express = require("express");

const {
    getAlerts,
    getAlertHistory,
    changeAlertStatus,
    getNotes,
    createNote
} = require("../controllers/alertController");

const router = express.Router();

router.get(
    "/",
    getAlerts
);

router.get(
    "/:id/history",
    getAlertHistory
);

router.patch(
    "/:id/status",
    changeAlertStatus
);

router.get(
    "/:id/notes",
    getNotes
);

router.post(
    "/:id/notes",
    createNote
);

module.exports = router;