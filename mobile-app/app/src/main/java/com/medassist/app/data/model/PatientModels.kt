package com.medassist.app.data.model

import com.google.gson.annotations.SerializedName

data class PatientListResponse(
    val count: Int,
    val results: List<Patient>
)

data class Patient(
    val id: Int,
    val user: PatientUser,
    val age: Int?,
    @SerializedName("medical_conditions")
    val medicalConditions: String?,
    @SerializedName("adherence_rate")
    val adherenceRate: Double?,
    val caretaker: Any? = null
)

data class PatientUser(
    val id: Int,
    val name: String,
    val email: String
)

data class CreatePatientRequest(
    @SerializedName("user_email")
    val userEmail: String,
    val age: Int,
    @SerializedName("medical_conditions")
    val medicalConditions: String
)

data class PatientDetailResponse(
    val id: Int,
    val user: PatientUser,
    val age: Int?,
    @SerializedName("medical_conditions")
    val medicalConditions: String?,
    @SerializedName("adherence_rate")
    val adherenceRate: Double,
    @SerializedName("adherence_stats")
    val adherenceStats: AdherenceStats,
    val medications: List<Medication>
)

data class AdherenceStats(
    val total: Int,
    val taken: Int,
    val missed: Int,
    val late: Int
)
