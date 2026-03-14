package com.medassist.app.util

object Constants {
    // Date/Time formats
    const val API_DATE_FORMAT = "yyyy-MM-dd"
    const val API_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss"
    const val DISPLAY_DATE_FORMAT = "MMM dd, yyyy"
    const val DISPLAY_TIME_FORMAT = "hh:mm a"

    // Adherence status
    const val STATUS_TAKEN = "taken"
    const val STATUS_MISSED = "missed"
    const val STATUS_LATE = "late"
    const val STATUS_PENDING = "pending"

    // User roles
    const val ROLE_PATIENT = "patient"
    const val ROLE_CARETAKER = "caretaker"

    // Risk levels
    const val RISK_LOW = "low"
    const val RISK_MEDIUM = "medium"
    const val RISK_HIGH = "high"

    // UI
    const val MIN_TAP_TARGET_DP = 48
    const val MIN_BODY_FONT_SP = 16
}
