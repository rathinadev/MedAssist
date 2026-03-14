package com.medassist.app.data.model

import com.google.gson.annotations.SerializedName

data class PredictionResponse(
    @SerializedName("patient_id")
    val patientId: Int,
    val predictions: List<Prediction>,
    @SerializedName("overall_risk")
    val overallRisk: String
)

data class Prediction(
    val medication: PredictionMedication,
    @SerializedName("predicted_delay_minutes")
    val predictedDelayMinutes: Int,
    @SerializedName("risk_level")
    val riskLevel: String,
    val message: String
)

data class PredictionMedication(
    val id: Int,
    val name: String
)
