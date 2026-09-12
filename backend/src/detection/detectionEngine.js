const {
    detectSuspiciousWebRequest
} = require("./rules/webRules");

const {
    detectRepeatedLoginFailures,
    detectSuccessAfterFailures,
    detectNewSourceLogin
} = require("./rules/authenticationRules");

const {
    detectPrivilegeChange
} = require("./rules/privilegeRules");


// ==========================================
// MAIN DETECTION ENGINE
// ==========================================

const runDetection = async (
    newEvent,
    events
) => {

    // ======================================
    // AUTHENTICATION RULES
    // ======================================

    let alert = await detectRepeatedLoginFailures(
        newEvent,
        events
    );

    if (alert) {
        return alert;
    }


    alert = await detectSuccessAfterFailures(
        newEvent,
        events
    );

    if (alert) {
        return alert;
    }


    alert = await detectNewSourceLogin(
        newEvent,
        events
    );

    if (alert) {
        return alert;
    }


    // ======================================
    // PRIVILEGE RULES
    // ======================================

    alert = await detectPrivilegeChange(
        newEvent
    );

    if (alert) {
        return alert;
    }


    // ======================================
    // WEB SECURITY RULES
    // ======================================

    alert = await detectSuspiciousWebRequest(
        newEvent
    );

    if (alert) {
        return alert;
    }


    // ======================================
    // NO DETECTION RULE MATCHED
    // ======================================

    return null;
};


module.exports = {
    runDetection
};