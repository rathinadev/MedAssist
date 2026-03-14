package com.medassist.app.data.local.dao

import androidx.room.*
import com.medassist.app.data.local.entity.ScheduleEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ScheduleDao {

    @Query("SELECT * FROM schedule WHERE date = :date ORDER BY scheduledTime ASC")
    fun getScheduleForDate(date: String): Flow<List<ScheduleEntity>>

    @Query("SELECT * FROM schedule WHERE date = :date ORDER BY scheduledTime ASC")
    suspend fun getScheduleForDateOnce(date: String): List<ScheduleEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(schedules: List<ScheduleEntity>)

    @Query("UPDATE schedule SET status = :status, takenTime = :takenTime WHERE medicationId = :medicationId AND date = :date AND scheduledTime = :scheduledTime")
    suspend fun updateStatus(medicationId: Int, date: String, scheduledTime: String, status: String, takenTime: String?)

    @Query("DELETE FROM schedule WHERE date = :date")
    suspend fun deleteForDate(date: String)

    @Query("DELETE FROM schedule")
    suspend fun deleteAll()
}
