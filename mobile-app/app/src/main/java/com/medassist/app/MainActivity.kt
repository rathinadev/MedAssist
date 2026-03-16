package com.medassist.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.medassist.app.ui.navigation.NavGraph
import com.medassist.app.ui.theme.MedAssistTheme
import com.medassist.app.worker.RemoteAlertWorker
import dagger.hilt.android.AndroidEntryPoint
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.ExistingPeriodicWorkPolicy
import java.util.concurrent.TimeUnit

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Schedule Remote Alert Sync
        val workRequest = PeriodicWorkRequestBuilder<RemoteAlertWorker>(15, TimeUnit.MINUTES)
            .build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "RemoteAlertSync",
            ExistingPeriodicWorkPolicy.KEEP,
            workRequest
        )

        setContent {
            MedAssistTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    NavGraph()
                }
            }
        }
    }
}
