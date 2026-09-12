const {
    saveAlert
} = require("../../services/alertService");

const {
    calculateRiskScore,
    getSeverityFromScore
} = require("../../risk/riskEngine");


const TWO_MINUTES = 2 * 60 * 1000;


// Temporary duplicate-alert tracker
const authenticationAlerts = [];


// ==========================================
// RULE 1
// REPEATED LOGIN FAILURES
// ==========================================

const detectRepeatedLoginFailures = async (
    newEvent,
    events
) => {

    if (newEvent.eventType !== "LOGIN_FAILED") {
        return null;
    }

    const now =
        new Date(
            newEvent.timestamp
        ).getTime();


    const recentFailedLogins =
        events.filter((event) => {

            const eventTime =
                new Date(
                    event.timestamp
                ).getTime();

            return (
                event.eventType ===
                    "LOGIN_FAILED" &&

                event.username ===
                    newEvent.username &&

                event.sourceIp ===
                    newEvent.sourceIp &&

                now - eventTime <=
                    TWO_MINUTES
            );
        });


    if (recentFailedLogins.length < 5) {
        return null;
    }


    // Check duplicate
    const duplicateAlert =
        authenticationAlerts.find(
            (alert) => {

                const alertTime =
                    new Date(
                        alert.timestamp
                    ).getTime();

                return (
                    alert.alertType ===
                        "REPEATED_LOGIN_FAILURES" &&

                    alert.username ===
                        newEvent.username &&

                    alert.sourceIp ===
                        newEvent.sourceIp &&

                    now - alertTime <=
                        TWO_MINUTES
                );
            }
        );


    if (duplicateAlert) {
        return null;
    }


    const riskScore =
        calculateRiskScore({

            alertType:
                "REPEATED_LOGIN_FAILURES",

            username:
                newEvent.username,

            failedAttempts:
                recentFailedLogins.length
        });


    const severity =
        getSeverityFromScore(
            riskScore
        );


    const alert = {

        alertType:
            "REPEATED_LOGIN_FAILURES",

        title:
            "Repeated Login Failures Detected",

        username:
            newEvent.username,

        sourceIp:
            newEvent.sourceIp,

        severity:
            severity,

        riskScore:
            riskScore,

        mitreTactic:
            "Credential Access",

        mitreTechnique:
            "Brute Force",

        mitreTechniqueId:
            "T1110",

        timestamp:
            newEvent.timestamp
    };


    const savedAlert =
        await saveAlert(alert);


    authenticationAlerts.push({

        alertType:
            alert.alertType,

        username:
            alert.username,

        sourceIp:
            alert.sourceIp,

        timestamp:
            alert.timestamp

    });


    return savedAlert;
};


// ==========================================
// RULE 2
// SUCCESS AFTER FAILED LOGINS
// ==========================================

const detectSuccessAfterFailures = async (
    newEvent,
    events
) => {

    if (newEvent.eventType !== "LOGIN_SUCCESS") {
        return null;
    }


    const now =
        new Date(
            newEvent.timestamp
        ).getTime();


    const recentFailedLogins =
        events.filter((event) => {

            const eventTime =
                new Date(
                    event.timestamp
                ).getTime();

            return (
                event.eventType ===
                    "LOGIN_FAILED" &&

                event.username ===
                    newEvent.username &&

                event.sourceIp ===
                    newEvent.sourceIp &&

                now - eventTime <=
                    TWO_MINUTES
            );
        });


    if (recentFailedLogins.length < 5) {
        return null;
    }


    const duplicateAlert =
        authenticationAlerts.find(
            (alert) => {

                const alertTime =
                    new Date(
                        alert.timestamp
                    ).getTime();

                return (
                    alert.alertType ===
                        "SUCCESS_AFTER_FAILED_LOGINS" &&

                    alert.username ===
                        newEvent.username &&

                    alert.sourceIp ===
                        newEvent.sourceIp &&

                    now - alertTime <=
                        TWO_MINUTES
                );
            }
        );


    if (duplicateAlert) {
        return null;
    }


    const riskScore =
        calculateRiskScore({

            alertType:
                "SUCCESS_AFTER_FAILED_LOGINS",

            username:
                newEvent.username,

            failedAttempts:
                recentFailedLogins.length
        });


    const severity =
        getSeverityFromScore(
            riskScore
        );


    const alert = {

        alertType:
            "SUCCESS_AFTER_FAILED_LOGINS",

        title:
            "Successful Login After Repeated Failures",

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
            "Valid Accounts",

        mitreTechniqueId:
            "T1078",

        timestamp:
            newEvent.timestamp
    };


    const savedAlert =
        await saveAlert(alert);


    authenticationAlerts.push({

        alertType:
            alert.alertType,

        username:
            alert.username,

        sourceIp:
            alert.sourceIp,

        timestamp:
            alert.timestamp
    });


    return savedAlert;
};


// ==========================================
// RULE 3
// LOGIN FROM NEW SOURCE
// ==========================================

const detectNewSourceLogin = async (
    newEvent,
    events
) => {

    if (newEvent.eventType !== "LOGIN_SUCCESS") {
        return null;
    }


    const previousSuccessfulLogins =
        events.filter((event) => {

            return (
                event.eventType ===
                    "LOGIN_SUCCESS" &&

                event.username ===
                    newEvent.username &&

                event.id !==
                    newEvent.id
            );
        });


    // First login for this user
    if (previousSuccessfulLogins.length === 0) {
        return null;
    }


    const sourceSeenBefore =
        previousSuccessfulLogins.some(
            (event) => {

                return (
                    event.sourceIp ===
                    newEvent.sourceIp
                );
            }
        );


    if (sourceSeenBefore) {
        return null;
    }


    const riskScore =
        calculateRiskScore({

            alertType:
                "NEW_SOURCE_LOGIN",

            username:
                newEvent.username
        });


    const severity =
        getSeverityFromScore(
            riskScore
        );


    const alert = {

        alertType:
            "NEW_SOURCE_LOGIN",

        title:
            "Login From New Source Detected",

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
            "Valid Accounts",

        mitreTechniqueId:
            "T1078",

        timestamp:
            newEvent.timestamp
    };


    return await saveAlert(
        alert
    );
};


module.exports = {
    detectRepeatedLoginFailures,
    detectSuccessAfterFailures,
    detectNewSourceLogin
};