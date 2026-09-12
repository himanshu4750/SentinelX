const {
    createIncident,
    updateIncident,
    getOpenIncident,
    linkAlertToIncident
} = require("../services/incidentService");

const {
    getSeverityFromScore
} = require("../risk/riskEngine");


// ==========================================
// CALCULATE INCIDENT RISK
// ==========================================

const calculateIncidentRisk = (
    currentRisk,
    newAlertRisk
) => {

    const oldRisk = Number(currentRisk || 0);
    const alertRisk = Number(newAlertRisk || 0);

    // Keep the highest risk as the base
    let finalRisk = Math.max(
        oldRisk,
        alertRisk
    );

    // If an incident already exists and another
    // alert is added, increase the risk slightly
    if (oldRisk > 0 && alertRisk > 0) {
        finalRisk += 10;
    }

    // Never go above 100
    if (finalRisk > 100) {
        finalRisk = 100;
    }

    return finalRisk;
};


// ==========================================
// CREATE OR UPDATE INCIDENT
// ==========================================

const createOrUpdateIncident = async (alert) => {

    if (!alert) {
        return null;
    }

    const username =
        alert.username;

    const sourceIp =
        alert.source_ip ||
        alert.sourceIp;

    const alertRisk =
        Number(
            alert.risk_score ??
            alert.riskScore ??
            0
        );


    // ======================================
    // CHECK FOR EXISTING OPEN INCIDENT
    // ======================================

    const existingIncident =
        await getOpenIncident(
            username,
            sourceIp
        );


    // ======================================
    // UPDATE EXISTING INCIDENT
    // ======================================

    if (existingIncident) {

        const newRiskScore =
            calculateIncidentRisk(
                existingIncident.risk_score,
                alertRisk
            );

        const newSeverity =
            getSeverityFromScore(
                newRiskScore
            );

        const updatedIncident =
            await updateIncident(
                existingIncident.id,
                newSeverity,
                newRiskScore
            );

        await linkAlertToIncident(
            existingIncident.id,
            alert.id
        );

        return updatedIncident;
    }


    // ======================================
    // CREATE NEW INCIDENT
    // ======================================

    let title = "Security Incident";


    if (
        alert.alert_type ===
        "REPEATED_LOGIN_FAILURES"
    ) {
        title =
            "Suspicious Authentication Activity";
    }


    if (
        alert.alert_type ===
        "SUCCESS_AFTER_FAILED_LOGINS"
    ) {
        title =
            "Potential Account Compromise";
    }


    const riskScore =
        alertRisk;


    const severity =
        getSeverityFromScore(
            riskScore
        );


    const timestamp =
        new Date().toISOString();


    // Generate simple unique ID
    const incidentNumber =
        Date.now();


    const incident = {

        incidentId:
            `SX-${incidentNumber}`,

        title:
            title,

        username:
            username,

        sourceIp:
            sourceIp,

        severity:
            severity,

        riskScore:
            riskScore,

        status:
            "OPEN",

        createdAt:
            timestamp,

        updatedAt:
            timestamp
    };


    const savedIncident =
        await createIncident(
            incident
        );


    await linkAlertToIncident(
        savedIncident.id,
        alert.id
    );


    return savedIncident;
};


module.exports = {
    createOrUpdateIncident
};