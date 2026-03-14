package com.medassist.app.util

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.medassist.app.data.api.ApiService
import com.medassist.app.data.model.AdherenceLogRequest
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import javax.inject.Inject

@AndroidEntryPoint
class MarkTakenReceiver : BroadcastReceiver() {

    @Inject
    lateinit var apiService: ApiService

    override fun onReceive(context: Context, intent: Intent) {
        val medicationId = intent.getIntExtra(AlarmScheduler.EXTRA_MEDICATION_ID, -1)
        if (medicationId == -1) return

        // Dismiss notification
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(medicationId)

        // Log adherence in background
        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val currentTime = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"))

                apiService.logAdherence(
                    AdherenceLogRequest(
                        medication = medicationId,
                        status = "taken",
                        takenTime = currentTime
                    )
                )
            } catch (e: Exception) {
                // Silently fail - user can manually mark later
            } finally {
                pendingResult.finish()
            }
        }
    }
}
