package com.medassist.app.data.model

import com.google.gson.annotations.SerializedName

data class Medication(
    val id: Int,
    val name: String,
    val dosage: String,
    val frequency: String,
    val timings: List<String>,
    val instructions: String?,
    val patient: Any,
    @SerializedName("is_active")
    val isActive: Boolean
)

data class CreateMedicationRequest(
    val name: String,
    val dosage: String,
    val frequency: String,
    val timings: List<String>,
    val instructions: String?,
    val patient: Int
)

data class UpdateMedicationRequest(
    val name: String? = null,
    val dosage: String? = null,
    val frequency: String? = null,
    val timings: List<String>? = null,
    val instructions: String? = null,
    @SerializedName("is_active")
    val isActive: Boolean? = null
)
