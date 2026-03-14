package com.medassist.app.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.medassist.app.data.local.dao.MedicationDao
import com.medassist.app.data.local.dao.ScheduleDao
import com.medassist.app.data.local.entity.MedicationEntity
import com.medassist.app.data.local.entity.ScheduleEntity

@Database(
    entities = [
        MedicationEntity::class,
        ScheduleEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class MedAssistDatabase : RoomDatabase() {
    abstract fun medicationDao(): MedicationDao
    abstract fun scheduleDao(): ScheduleDao
}
