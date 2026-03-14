package com.medassist.app.ui.patient

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.medassist.app.data.model.AdherenceHistoryResponse
import com.medassist.app.data.model.AdherenceLog
import com.medassist.app.data.repository.AdherenceRepository
import com.medassist.app.util.TokenManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.inject.Inject

data class HistoryUiState(
    val isLoading: Boolean = true,
    val historyResponse: AdherenceHistoryResponse? = null,
    val groupedLogs: Map<String, List<AdherenceLog>> = emptyMap(),
    val fromDate: LocalDate = LocalDate.now().minusDays(30),
    val toDate: LocalDate = LocalDate.now(),
    val error: String? = null
)

@HiltViewModel
class HistoryViewModel @Inject constructor(
    private val adherenceRepository: AdherenceRepository,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(HistoryUiState())
    val uiState: StateFlow<HistoryUiState> = _uiState.asStateFlow()

    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")

    init {
        loadHistory()
    }

    fun loadHistory() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            val patientId = tokenManager.getPatientId()
            if (patientId <= 0) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Patient ID not found. Please log in again."
                )
                return@launch
            }

            val from = _uiState.value.fromDate.format(dateFormatter)
            val to = _uiState.value.toDate.format(dateFormatter)

            val result = adherenceRepository.getAdherenceHistory(patientId, from, to)

            result.fold(
                onSuccess = { response ->
                    val grouped = response.logs.groupBy { log ->
                        log.date ?: "Unknown"
                    }.toSortedMap(compareByDescending { it })

                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        historyResponse = response,
                        groupedLogs = grouped
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Failed to load history"
                    )
                }
            )
        }
    }

    fun updateDateRange(from: LocalDate, to: LocalDate) {
        _uiState.value = _uiState.value.copy(fromDate = from, toDate = to)
        loadHistory()
    }
}
