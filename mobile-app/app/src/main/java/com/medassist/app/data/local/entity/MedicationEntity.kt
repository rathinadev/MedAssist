package com.medassist.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.medassist.app.data.model.Medication

@Entity(tableName = "medications")
data class MedicationEntity(
    @PrimaryKey
    val id: Int,
    val name: String,
    val dosage: String,
    val frequency: String,
    val timings: String, // JSON string of List<String>
    val instructions: String?,
    val patient: Int,
    val isActive: Boolean
) {
    fun toMedication(): Medication {
        val timingsList = timings
            .removeSurrounding("[", "]")
            .split(",")
            .map { it.trim().removeSurrounding("\"") }
            .filter { it.isNotEmpty() }

        return Medication(
            id = id,
            name = name,
            dosage = dosage,
            frequency = frequency,
            timings = timingsList,
            instructions = instructions,
            patient = patient,
            isActive = isActive
        )
    }

    companion object {
        fun fromMedication(medication: Medication): MedicationEntity {
            val patientId = when (val p = medication.patient) {
                is Int -> p
                is Map<*, *> -> (p["id"] as? Number)?.toInt() ?: 0
                else -> 0
            }
            return MedicationEntity(
                id = medication.id,
                name = medication.name,
                dosage = medication.dosage,
                frequency = medication.frequency,
                timings = medication.timings.joinToString(",", "[", "]") { "\"$it\"" },
                instructions = medication.instructions,
                patient = patientId,
                isActive = medication.isActive
            )
        }
    }
}
