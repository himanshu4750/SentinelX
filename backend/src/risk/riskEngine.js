const calculateRiskScore = ({
    alertType,
    username,
    failedAttempts = 0
}) => {

    let score = 0;


    // ==========================================
    // BASE SCORE BASED ON ALERT TYPE
    // ==========================================

    if (alertType === "REPEATED_LOGIN_FAILURES") {
        score += 30;
    }

    if (alertType === "SUCCESS_AFTER_FAILED_LOGINS") {
        score += 50;
    }
    if (alertType === "PRIVILEGE_CHANGE") {
    score += 60;
}
if (alertType === "NEW_SOURCE_LOGIN") {
    score += 40;
}
if (
    alertType ===
    "SUSPICIOUS_WEB_REQUEST"
) {
    score += 55;
}


    // ==========================================
    // MORE FAILED ATTEMPTS = HIGHER RISK
    // ==========================================

    if (failedAttempts >= 5) {
        score += 15;
    }

    if (failedAttempts >= 10) {
        score += 10;
    }

    if (failedAttempts >= 20) {
        score += 10;
    }


    // ==========================================
    // PRIVILEGED ACCOUNTS
    // ==========================================

    const privilegedUsers = [
        "admin",
        "administrator",
        "root"
    ];

    if (
        username &&
        privilegedUsers.includes(
            username.toLowerCase()
        )
    ) {
        score += 20;
    }


    // ==========================================
    // MAXIMUM SCORE MUST BE 100
    // ==========================================

    if (score > 100) {
        score = 100;
    }

    return score;
};


// ==========================================
// CONVERT SCORE INTO SEVERITY
// ==========================================

const getSeverityFromScore = (score) => {

    if (score >= 85) {
        return "CRITICAL";
    }

    if (score >= 65) {
        return "HIGH";
    }

    if (score >= 40) {
        return "MEDIUM";
    }

    return "LOW";
};


module.exports = {
    calculateRiskScore,
    getSeverityFromScore
};