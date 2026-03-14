package com.medassist.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.medassist.app.data.model.ScheduleMedicationInfo
import com.medassist.app.data.model.ScheduledMedication

@Entity(tableName = "schedule")
data class ScheduleEntity(
    @PrimaryKey(autoGenerate = true)
    val localId: Int = 0,
    val date: String,
    val medicationId: Int,
    val medicationName: String,
    val medicationDosage: String,
    val scheduledTime: String,
    val status: String,
    val takenTime: String?
) {
    fun toScheduledMedication(): ScheduledMedication {
        return ScheduledMedication(
            medication = ScheduleMedicationInfo(
                id = medicationId,
                name = medicationName,
                dosage = medicationDosage
            ),
            scheduledTime = scheduledTime,
            status = status,
            takenTime = takenTime
        )
    }

    companion object {
        fun fromScheduledMedication(
            date: String,
            scheduled: ScheduledMedication
        ): ScheduleEntity {
            return ScheduleEntity(
                date = date,
                medicationId = scheduled.medication.id,
                medicationName = scheduled.medication.name,
                medicationDosage = scheduled.medication.dosage,
                scheduledTime = scheduled.scheduledTime,
                status = scheduled.status,
                takenTime = scheduled.takenTime
            )
        }
    }
}
