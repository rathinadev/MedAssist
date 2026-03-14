package com.medassist.app.data.repository

import com.medassist.app.data.api.ApiService
import com.medassist.app.data.model.PredictionResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PredictionRepository @Inject constructor(
    private val apiService: ApiService
) {

    suspend fun getPredictions(patientId: Int): Result<PredictionResponse> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.getPredictions(patientId)
                if (response.isSuccessful) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception("Failed to fetch predictions: ${response.code()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
}
