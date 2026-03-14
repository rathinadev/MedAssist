package com.medassist.app.data.local.dao

import androidx.room.*
import com.medassist.app.data.local.entity.MedicationEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MedicationDao {

    @Query("SELECT * FROM medications WHERE patient = :patientId AND isActive = 1")
    fun getMedicationsForPatient(patientId: Int): Flow<List<MedicationEntity>>

    @Query("SELECT * FROM medications WHERE patient = :patientId AND isActive = 1")
    suspend fun getMedicationsForPatientOnce(patientId: Int): List<MedicationEntity>

    @Query("SELECT * FROM medications WHERE id = :id")
    suspend fun getMedicationById(id: Int): MedicationEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(medications: List<MedicationEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(medication: MedicationEntity)

    @Delete
    suspend fun delete(medication: MedicationEntity)

    @Query("DELETE FROM medications WHERE patient = :patientId")
    suspend fun deleteAllForPatient(patientId: Int)

    @Query("DELETE FROM medications")
    suspend fun deleteAll()
}
