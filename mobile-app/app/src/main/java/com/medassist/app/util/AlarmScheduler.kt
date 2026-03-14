package com.medassist.app.util

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.medassist.app.data.model.ScheduledMedication
import dagger.hilt.android.qualifiers.ApplicationContext
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AlarmScheduler @Inject constructor(
    @ApplicationContext private val context: Context
) {

    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    fun scheduleAlarms(medications: List<ScheduledMedication>) {
        // Only schedule for pending medications
        val pending = medications.filter { it.status.lowercase() == "pending" }

        pending.forEach { scheduled ->
            scheduleAlarm(scheduled)
        }
    }

    private fun scheduleAlarm(scheduled: ScheduledMedication) {
        val intent = Intent(context, MedicationAlarmReceiver::class.java).apply {
            putExtra(EXTRA_MEDICATION_ID, scheduled.medication.id)
            putExtra(EXTRA_MEDICATION_NAME, scheduled.medication.name)
            putExtra(EXTRA_MEDICATION_DOSAGE, scheduled.medication.dosage)
            putExtra(EXTRA_SCHEDULED_TIME, scheduled.scheduledTime)
        }

        val requestCode = generateRequestCode(scheduled.medication.id, scheduled.scheduledTime)

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Parse scheduled time
        val timeParts = scheduled.scheduledTime.split(":")
        if (timeParts.size < 2) return

        val hour = timeParts[0].toIntOrNull() ?: return
        val minute = timeParts[1].toIntOrNull() ?: return

        val scheduledTime = LocalTime.of(hour, minute)
        val now = LocalTime.now()

        // Only schedule if the time hasn't passed yet
        if (scheduledTime.isAfter(now)) {
            val triggerTime = LocalDate.now()
                .atTime(scheduledTime)
                .atZone(ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli()

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    if (alarmManager.canScheduleExactAlarms()) {
                        alarmManager.setExactAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            triggerTime,
                            pendingIntent
                        )
                    } else {
                        // Fall back to inexact alarm
                        alarmManager.setAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            triggerTime,
                            pendingIntent
                        )
                    }
                } else {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerTime,
                        pendingIntent
                    )
                }
            } catch (e: SecurityException) {
                // Fall back to inexact alarm
                alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerTime,
                    pendingIntent
                )
            }
        }
    }

    fun cancelAllAlarms(medications: List<ScheduledMedication>) {
        medications.forEach { scheduled ->
            val intent = Intent(context, MedicationAlarmReceiver::class.java)
            val requestCode = generateRequestCode(
                scheduled.medication.id,
                scheduled.scheduledTime
            )
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager.cancel(pendingIntent)
        }
    }

    private fun generateRequestCode(medicationId: Int, time: String): Int {
        return "$medicationId$time".hashCode()
    }

    companion object {
        const val EXTRA_MEDICATION_ID = "medication_id"
        const val EXTRA_MEDICATION_NAME = "medication_name"
        const val EXTRA_MEDICATION_DOSAGE = "medication_dosage"
        const val EXTRA_SCHEDULED_TIME = "scheduled_time"
    }
}
