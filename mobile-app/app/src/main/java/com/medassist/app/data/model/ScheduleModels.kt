package com.medassist.app.data.model

import com.google.gson.annotations.SerializedName

data class TodayScheduleResponse(
    val date: String,
    val medications: List<ScheduledMedication>
)

data class ScheduledMedication(
    val medication: ScheduleMedicationInfo,
    @SerializedName("scheduled_time")
    val scheduledTime: String,
    val status: String,
    @SerializedName("taken_time")
    val takenTime: String?
)

data class ScheduleMedicationInfo(
    val id: Int,
    val name: String,
    val dosage: String
)
