package com.medassist.app.data.api

import com.medassist.app.data.model.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ==================== Auth ====================

    @POST("auth/register/")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<RegisterResponse>

    @POST("auth/login/")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    @POST("auth/refresh/")
    suspend fun refreshToken(
        @Body request: RefreshTokenRequest
    ): Response<RefreshTokenResponse>

    @GET("auth/me/")
    suspend fun getMe(): Response<User>

    // ==================== Patients ====================

    @GET("patients/")
    suspend fun getPatients(): Response<PatientListResponse>

    @POST("patients/")
    suspend fun createPatient(
        @Body request: CreatePatientRequest
    ): Response<Patient>

    @GET("patients/{id}/")
    suspend fun getPatient(
        @Path("id") id: Int
    ): Response<Patient>

    @GET("patients/{id}/detail_with_data/")
    suspend fun getPatientDetailWithData(
        @Path("id") id: Int
    ): Response<PatientDetailResponse>

    // ==================== Medications ====================

    @GET("medications/")
    suspend fun getMedications(
        @Query("patient_id") patientId: Int
    ): Response<List<Medication>>

    @POST("medications/")
    suspend fun createMedication(
        @Body request: CreateMedicationRequest
    ): Response<Medication>

    @PUT("medications/{id}/")
    suspend fun updateMedication(
        @Path("id") id: Int,
        @Body request: UpdateMedicationRequest
    ): Response<Medication>

    @DELETE("medications/{id}/")
    suspend fun deleteMedication(
        @Path("id") id: Int
    ): Response<Unit>

    // ==================== Prescriptions ====================

    @Multipart
    @POST("prescriptions/scan/")
    suspend fun scanPrescription(
        @Part image: MultipartBody.Part,
        @Part("patient_id") patientId: RequestBody
    ): Response<Prescription>

    @GET("prescriptions/")
    suspend fun getPrescriptions(
        @Query("patient_id") patientId: Int
    ): Response<List<Prescription>>

    // ==================== Adherence ====================

    @POST("adherence/log/")
    suspend fun logAdherence(
        @Body request: AdherenceLogRequest
    ): Response<AdherenceLog>

    @GET("adherence/history/")
    suspend fun getAdherenceHistory(
        @Query("patient_id") patientId: Int,
        @Query("from") from: String? = null,
        @Query("to") to: String? = null
    ): Response<AdherenceHistoryResponse>

    @GET("adherence/stats/")
    suspend fun getAdherenceStats(
        @Query("patient_id") patientId: Int
    ): Response<AdherenceStatsResponse>

    // ==================== Schedule ====================

    @GET("schedule/today/")
    suspend fun getTodaySchedule(): Response<TodayScheduleResponse>

    // ==================== Predictions ====================

    @GET("predictions/{patientId}/")
    suspend fun getPredictions(
        @Path("patientId") patientId: Int
    ): Response<PredictionResponse>
}
