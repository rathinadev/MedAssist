package com.medassist.app.util

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.medassist.app.data.local.dao.ScheduleDao
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

@AndroidEntryPoint
class BootReceiver : BroadcastReceiver() {

    @Inject
    lateinit var scheduleDao: ScheduleDao

    @Inject
    lateinit var alarmScheduler: AlarmScheduler

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            // Reschedule alarms from cached data
            val pendingResult = goAsync()
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val today = LocalDate.now().toString()
                    val schedules = scheduleDao.getScheduleForDateOnce(today)
                    val scheduledMedications = schedules.map { it.toScheduledMedication() }
                    alarmScheduler.scheduleAlarms(scheduledMedications)
                } catch (e: Exception) {
                    // Silently fail
                } finally {
                    pendingResult.finish()
                }
            }
        }
    }
}
