package com.medassist.app.worker

import android.content.Context
import android.speech.tts.TextToSpeech
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.medassist.app.MedAssistApp
import com.medassist.app.BuildConfig
import com.medassist.app.util.TokenManager
import dagger.hilt.EntryPoint
import dagger.hilt.InstallIn
import dagger.hilt.android.EntryPointAccessors
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.util.Locale
import android.app.NotificationManager
import androidx.core.app.NotificationCompat

class RemoteAlertWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    private var tts: TextToSpeech? = null

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val token = TokenManager(applicationContext).getAccessToken() ?: return@withContext Result.failure()
            
            val client = OkHttpClient()
            val request = Request.Builder()
                .url("${BuildConfig.BASE_URL}/adherence/reminders/")
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) return@withContext Result.retry()

            val responseData = response.body?.string() ?: return@withContext Result.success()
            val jsonArray = JSONObject(responseData).getJSONArray("reminders")

            for (i in 0 until jsonArray.length()) {
                val reminder = jsonArray.getJSONObject(i)
                val title = reminder.getString("title")
                val message = reminder.getString("message")
                val speechText = reminder.optString("speech_text", message)
                
                showNotification(title, message)
                speak(speechText)
            }

            Result.success()
        } catch (e: Exception) {
            Log.e("RemoteAlertWorker", "Error fetching reminders", e)
            Result.retry()
        }
    }

    private fun showNotification(title: String, message: String) {
        val notificationManager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notification = NotificationCompat.Builder(applicationContext, MedAssistApp.NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()
        
        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }

    private fun speak(text: String) {
        // Initialize TTS only when needed
        if (tts == null) {
            tts = TextToSpeech(applicationContext) { status ->
                if (status == TextToSpeech.SUCCESS) {
                    tts?.language = Locale.US
                    tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
                }
            }
        } else {
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
        }
    }
}
