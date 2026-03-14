package com.medassist.app.data.repository

import com.medassist.app.data.api.ApiService
import com.medassist.app.data.local.dao.MedicationDao
import com.medassist.app.data.local.dao.ScheduleDao
import com.medassist.app.data.local.entity.MedicationEntity
import com.medassist.app.data.local.entity.ScheduleEntity
import com.medassist.app.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MedicationRepository @Inject constructor(
    private val apiService: ApiService,
    private val medicationDao: MedicationDao,
    private val scheduleDao: ScheduleDao
) {

    suspend fun getMedications(patientId: Int): Result<List<Medication>> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.getMedications(patientId)
                if (response.isSuccessful) {
                    val medications = response.body()!!
                    // Cache in Room
                    medicationDao.deleteAllForPatient(patientId)
                    medicationDao.insertAll(medications.map { MedicationEntity.fromMedication(it) })
                    Result.success(medications)
                } else {
                    // Fall back to cached data
                    val cached = medicationDao.getMedicationsForPatientOnce(patientId)
                    if (cached.isNotEmpty()) {
                        Result.success(cached.map { it.toMedication() })
                    } else {
                        Result.failure(Exception("Failed to fetch medications: ${response.code()}"))
                    }
                }
            } catch (e: Exception) {
                // Fall back to cached data
                val cached = medicationDao.getMedicationsForPatientOnce(patientId)
                if (cached.isNotEmpty()) {
                    Result.success(cached.map { it.toMedication() })
                } else {
                    Result.failure(e)
                }
            }
        }

    fun getMedicationsFlow(patientId: Int): Flow<List<Medication>> {
        return medicationDao.getMedicationsForPatient(patientId).map { entities ->
            entities.map { it.toMedication() }
        }
    }

    suspend fun createMedication(request: CreateMedicationRequest): Result<Medication> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.createMedication(request)
                if (response.isSuccessful) {
                    val medication = response.body()!!
                    medicationDao.insert(MedicationEntity.fromMedication(medication))
                    Result.success(medication)
                } else {
                    Result.failure(Exception("Failed to create medication: ${response.code()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun updateMedication(id: Int, request: UpdateMedicationRequest): Result<Medication> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.updateMedication(id, request)
                if (response.isSuccessful) {
                    val medication = response.body()!!
                    medicationDao.insert(MedicationEntity.fromMedication(medication))
                    Result.success(medication)
                } else {
                    Result.failure(Exception("Failed to update medication: ${response.code()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun deleteMedication(id: Int): Result<Unit> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.deleteMedication(id)
                if (response.isSuccessful) {
                    val entity = medicationDao.getMedicationById(id)
                    if (entity != null) medicationDao.delete(entity)
                    Result.success(Unit)
                } else {
                    Result.failure(Exception("Failed to delete medication: ${response.code()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun getTodaySchedule(): Result<TodayScheduleResponse> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.getTodaySchedule()
                if (response.isSuccessful) {
                    val schedule = response.body()!!
                    // Cache in Room
                    scheduleDao.deleteForDate(schedule.date)
                    scheduleDao.insertAll(
                        schedule.medications.map {
                            ScheduleEntity.fromScheduledMedication(schedule.date, it)
                        }
                    )
                    Result.success(schedule)
                } else {
                    // Fall back to cached
                    val today = java.time.LocalDate.now().toString()
                    val cached = scheduleDao.getScheduleForDateOnce(today)
                    if (cached.isNotEmpty()) {
                        Result.success(
                            TodayScheduleResponse(
                                date = today,
                                medications = cached.map { it.toScheduledMedication() }
                            )
                        )
                    } else {
                        Result.failure(Exception("Failed to fetch schedule: ${response.code()}"))
                    }
                }
            } catch (e: Exception) {
                val today = java.time.LocalDate.now().toString()
                val cached = scheduleDao.getScheduleForDateOnce(today)
                if (cached.isNotEmpty()) {
                    Result.success(
                        TodayScheduleResponse(
                            date = today,
                            medications = cached.map { it.toScheduledMedication() }
                        )
                    )
                } else {
                    Result.failure(e)
                }
            }
        }

    fun getTodayScheduleFlow(date: String): Flow<List<ScheduledMedication>> {
        return scheduleDao.getScheduleForDate(date).map { entities ->
            entities.map { it.toScheduledMedication() }
        }
    }
}
