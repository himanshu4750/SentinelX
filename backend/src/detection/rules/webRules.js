const {
    calculateRiskScore,
    getSeverityFromScore
} = require("../../risk/riskEngine");
const {
    saveAlert
} = require("../../services/alertService");


// ==========================================
// SUSPICIOUS WEB REQUEST RULE
// ==========================================

const detectSuspiciousWebRequest = async (
    newEvent
) => {

    if (
        newEvent.eventType !==
        "SUSPICIOUS_WEB_REQUEST"
    ) {
        return null;
    }


    const riskScore =
        calculateRiskScore({

            alertType:
                "SUSPICIOUS_WEB_REQUEST",

            username:
                newEvent.username
        });


    const severity =
        getSeverityFromScore(
            riskScore
        );


    const alert = {

        alertType:
            "SUSPICIOUS_WEB_REQUEST",

        title:
            "Suspicious Web Request Detected",

        username:
            newEvent.username,

        sourceIp:
            newEvent.sourceIp,

        severity:
            severity,

        riskScore:
            riskScore,

        mitreTactic:
            "Initial Access",

        mitreTechnique:
            "Exploit Public-Facing Application",

        mitreTechniqueId:
            "T1190",

        timestamp:
            newEvent.timestamp
    };


    return await saveAlert(
        alert
    );
};


module.exports = {
    detectSuspiciousWebRequest
};