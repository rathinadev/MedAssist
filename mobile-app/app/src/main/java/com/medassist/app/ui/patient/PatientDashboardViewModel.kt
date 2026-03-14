package com.medassist.app.ui.patient

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.medassist.app.data.model.AdherenceStatsResponse
import com.medassist.app.data.model.ScheduledMedication
import com.medassist.app.data.model.TodayScheduleResponse
import com.medassist.app.data.repository.AdherenceRepository
import com.medassist.app.data.repository.MedicationRepository
import com.medassist.app.util.AlarmScheduler
import com.medassist.app.util.TokenManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import javax.inject.Inject

data class PatientDashboardUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val userName: String = "",
    val todaySchedule: TodayScheduleResponse? = null,
    val adherenceStats: AdherenceStatsResponse? = null,
    val error: String? = null,
    val takeMedicationSuccess: Boolean = false
)

@HiltViewModel
class PatientDashboardViewModel @Inject constructor(
    private val medicationRepository: MedicationRepository,
    private val adherenceRepository: AdherenceRepository,
    private val tokenManager: TokenManager,
    private val alarmScheduler: AlarmScheduler
) : ViewModel() {

    private val _uiState = MutableStateFlow(PatientDashboardUiState())
    val uiState: StateFlow<PatientDashboardUiState> = _uiState.asStateFlow()

    init {
        _uiState.value = _uiState.value.copy(userName = tokenManager.getUserName() ?: "")
        loadDashboard()
    }

    fun loadDashboard() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            // Load today's schedule
            val scheduleResult = medicationRepository.getTodaySchedule()
            scheduleResult.fold(
                onSuccess = { schedule ->
                    _uiState.value = _uiState.value.copy(todaySchedule = schedule)
                    // Schedule alarms for pending medications
                    alarmScheduler.scheduleAlarms(schedule.medications)
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to load schedule"
                    )
                }
            )

            // Load adherence stats
            val patientId = tokenManager.getPatientId()
            if (patientId > 0) {
                val statsResult = adherenceRepository.getAdherenceStats(patientId)
                statsResult.fold(
                    onSuccess = { stats ->
                        _uiState.value = _uiState.value.copy(adherenceStats = stats)
                    },
                    onFailure = { /* Stats are optional, don't show error */ }
                )
            }

            _uiState.value = _uiState.value.copy(isLoading = false, isRefreshing = false)
        }
    }

    fun refresh() {
        _uiState.value = _uiState.value.copy(isRefreshing = true)
        loadDashboard()
    }

    fun takeMedication(medicationId: Int) {
        viewModelScope.launch {
            val currentTime = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"))

            val result = adherenceRepository.logAdherence(
                medicationId = medicationId,
                status = "taken",
                takenTime = currentTime
            )

            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(takeMedicationSuccess = true)
                    // Refresh the schedule
                    loadDashboard()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to log medication"
                    )
                }
            )
        }
    }

    fun clearTakeMedicationSuccess() {
        _uiState.value = _uiState.value.copy(takeMedicationSuccess = false)
    }
}
