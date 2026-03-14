package com.medassist.app.data.repository

import com.medassist.app.data.api.ApiService
import com.medassist.app.data.model.Prescription
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PrescriptionRepository @Inject constructor(
    private val apiService: ApiService
) {

    suspend fun scanPrescription(
        imageFile: File,
        patientId: Int
    ): Result<Prescription> = withContext(Dispatchers.IO) {
        try {
            val requestBody = imageFile.asRequestBody("image/*".toMediaType())
            val imagePart = MultipartBody.Part.createFormData("image", imageFile.name, requestBody)
            val patientIdBody = patientId.toString().toRequestBody("text/plain".toMediaType())

            val response = apiService.scanPrescription(imagePart, patientIdBody)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to scan prescription: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getPrescriptions(patientId: Int): Result<List<Prescription>> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.getPrescriptions(patientId)
                if (response.isSuccessful) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception("Failed to fetch prescriptions: ${response.code()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
}
