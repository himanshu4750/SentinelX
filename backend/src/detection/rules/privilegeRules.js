const {
    saveAlert
} = require("../../services/alertService");

const {
    calculateRiskScore,
    getSeverityFromScore
} = require("../../risk/riskEngine");


// ==========================================
// PRIVILEGE CHANGE RULE
// ==========================================

const detectPrivilegeChange = async (
    newEvent
) => {

    if (
        newEvent.eventType !==
        "PRIVILEGE_CHANGE"
    ) {
        return null;
    }


    const riskScore =
        calculateRiskScore({

            alertType:
                "PRIVILEGE_CHANGE",

            username:
                newEvent.username
        });


    const severity =
        getSeverityFromScore(
            riskScore
        );


    const alert = {

        alertType:
            "PRIVILEGE_CHANGE",

        title:
            "Privilege Change Detected",

        username:
            newEvent.username,

        sourceIp:
            newEvent.sourceIp,

        severity:
            severity,

        riskScore:
            riskScore,

        mitreTactic:
            "Privilege Escalation",

        mitreTechnique:
            "Account Manipulation",

        mitreTechniqueId:
            "T1098",

        timestamp:
            newEvent.timestamp
    };


    return await saveAlert(
        alert
    );
};


module.exports = {
    detectPrivilegeChange
};