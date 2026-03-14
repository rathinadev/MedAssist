package com.medassist.app.util

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.medassist.app.MainActivity
import com.medassist.app.MedAssistApp
import com.medassist.app.R

class MedicationAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val medicationId = intent.getIntExtra(AlarmScheduler.EXTRA_MEDICATION_ID, -1)
        val medicationName = intent.getStringExtra(AlarmScheduler.EXTRA_MEDICATION_NAME) ?: "Medication"
        val medicationDosage = intent.getStringExtra(AlarmScheduler.EXTRA_MEDICATION_DOSAGE) ?: ""
        val scheduledTime = intent.getStringExtra(AlarmScheduler.EXTRA_SCHEDULED_TIME) ?: ""

        if (medicationId == -1) return

        showNotification(context, medicationId, medicationName, medicationDosage, scheduledTime)
    }

    private fun showNotification(
        context: Context,
        medicationId: Int,
        name: String,
        dosage: String,
        time: String
    ) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Intent to open the app
        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val openAppPendingIntent = PendingIntent.getActivity(
            context,
            medicationId,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Mark as taken action intent
        val markTakenIntent = Intent(context, MarkTakenReceiver::class.java).apply {
            putExtra(AlarmScheduler.EXTRA_MEDICATION_ID, medicationId)
        }
        val markTakenPendingIntent = PendingIntent.getBroadcast(
            context,
            medicationId + 10000,
            markTakenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, MedAssistApp.NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Medication Reminder")
            .setContentText("Time to take $name - $dosage")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("Time to take $name - $dosage\nScheduled at $time")
            )
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setContentIntent(openAppPendingIntent)
            .addAction(
                android.R.drawable.ic_menu_send,
                "Mark as Taken",
                markTakenPendingIntent
            )
            .setAutoCancel(true)
            .setVibrate(longArrayOf(0, 500, 250, 500))
            .build()

        notificationManager.notify(medicationId, notification)
    }
}
