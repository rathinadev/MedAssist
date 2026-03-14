package com.medassist.app.data.model

import com.google.gson.annotations.SerializedName

data class AdherenceLogRequest(
    val medication: Int,
    val status: String,
    @SerializedName("taken_time")
    val takenTime: String? = null
)

data class AdherenceLog(
    val id: Int? = null,
    val medication: Int,
    @SerializedName("medication_name")
    val medicationName: String? = null,
    val status: String,
    @SerializedName("taken_time")
    val takenTime: String? = null,
    @SerializedName("scheduled_time")
    val scheduledTime: String? = null,
    val date: String? = null
)

data class AdherenceHistoryResponse(
    val logs: List<AdherenceLog>,
    val total: Int,
    val taken: Int,
    val missed: Int,
    val late: Int
)

data class AdherenceStatsResponse(
    @SerializedName("adherence_rate")
    val adherenceRate: Double,
    @SerializedName("current_streak")
    val currentStreak: Int,
    @SerializedName("best_streak")
    val bestStreak: Int,
    @SerializedName("total_taken")
    val totalTaken: Int,
    @SerializedName("total_missed")
    val totalMissed: Int,
    @SerializedName("total_late")
    val totalLate: Int
)
