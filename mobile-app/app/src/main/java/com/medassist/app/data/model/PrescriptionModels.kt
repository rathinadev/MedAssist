package com.medassist.app.data.model

import com.google.gson.annotations.SerializedName

data class Prescription(
    val id: Int,
    @SerializedName("extracted_data")
    val extractedData: ExtractedData?,
    val image: String?,
    @SerializedName("patient_id")
    val patientId: Int? = null,
    @SerializedName("created_at")
    val createdAt: String? = null
)

data class ExtractedData(
    val medications: List<ExtractedMedication>?,
    @SerializedName("doctor_name")
    val doctorName: String?,
    val date: String?
)

data class ExtractedMedication(
    val name: String?,
    val dosage: String?,
    val frequency: String?,
    val instructions: String?
)
