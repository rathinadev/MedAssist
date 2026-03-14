package com.medassist.app.data.repository

import com.medassist.app.data.api.ApiService
import com.medassist.app.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AdherenceRepository @Inject constructor(
    private val apiService: ApiService
) {

    suspend fun logAdherence(
        medicationId: Int,
        status: String,
        takenTime: String? = null
    ): Result<AdherenceLog> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.logAdherence(
                AdherenceLogRequest(
                    medication = medicationId,
                    status = status,
                    takenTime = takenTime
                )
            )
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to log adherence: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAdherenceHistory(
        patientId: Int,
        from: String? = null,
        to: String? = null
    ): Result<AdherenceHistoryResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getAdherenceHistory(patientId, from, to)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to fetch adherence history: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAdherenceStats(patientId: Int): Result<AdherenceStatsResponse> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.getAdherenceStats(patientId)
                if (response.isSuccessful) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception("Failed to fetch adherence stats: ${response.code()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
}
