package com.medassist.app.di

import android.content.Context
import androidx.room.Room
import com.medassist.app.data.local.MedAssistDatabase
import com.medassist.app.data.local.dao.MedicationDao
import com.medassist.app.data.local.dao.ScheduleDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideDatabase(
        @ApplicationContext context: Context
    ): MedAssistDatabase {
        return Room.databaseBuilder(
            context,
            MedAssistDatabase::class.java,
            "medassist_database"
        )
            .fallbackToDestructiveMigration()
            .build()
    }

    @Provides
    @Singleton
    fun provideMedicationDao(database: MedAssistDatabase): MedicationDao {
        return database.medicationDao()
    }

    @Provides
    @Singleton
    fun provideScheduleDao(database: MedAssistDatabase): ScheduleDao {
        return database.scheduleDao()
    }
}
