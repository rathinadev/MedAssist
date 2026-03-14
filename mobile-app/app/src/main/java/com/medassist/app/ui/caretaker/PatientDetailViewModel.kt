package com.medassist.app.ui.caretaker

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.medassist.app.data.api.ApiService
import com.medassist.app.data.model.*
import com.medassist.app.data.repository.AdherenceRepository
import com.medassist.app.data.repository.MedicationRepository
import com.medassist.app.data.repository.PredictionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PatientDetailUiState(
    val isLoading: Boolean = true,
    val patient: Patient? = null,
    val patientDetail: PatientDetailResponse? = null,
    val medications: List<Medication> = emptyList(),
    val adherenceStats: AdherenceStatsResponse? = null,
    val adherenceHistory: AdherenceHistoryResponse? = null,
    val predictions: PredictionResponse? = null,
    val selectedTab: Int = 0,
    val error: String? = null,
    val deleteSuccess: Boolean = false
)

@HiltViewModel
class PatientDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val apiService: ApiService,
    private val medicationRepository: MedicationRepository,
    private val adherenceRepository: AdherenceRepository,
    private val predictionRepository: PredictionRepository
) : ViewModel() {

    private val patientId: Int = savedStateHandle.get<Int>("patientId") ?: 0

    private val _uiState = MutableStateFlow(PatientDetailUiState())
    val uiState: StateFlow<PatientDetailUiState> = _uiState.asStateFlow()

    init {
        loadPatientData()
    }

    fun loadPatientData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            try {
                val detailResponse = apiService.getPatientDetailWithData(patientId)
                if (detailResponse.isSuccessful) {
                    val detail = detailResponse.body()
                    _uiState.value = _uiState.value.copy(
                        patientDetail = detail,
                        medications = detail?.medications ?: emptyList()
                    )
                } else {
                    // Fallback to old method
                    val patientResponse = apiService.getPatient(patientId)
                    if (patientResponse.isSuccessful) {
                        _uiState.value = _uiState.value.copy(patient = patientResponse.body())
                    }
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message ?: "Failed to load patient"
                )
            }

            // Load medications if not from detail endpoint
            if (_uiState.value.medications.isEmpty()) {
                val medResult = medicationRepository.getMedications(patientId)
                medResult.fold(
                    onSuccess = { meds ->
                        _uiState.value = _uiState.value.copy(medications = meds)
                    },
                    onFailure = { /* non-critical */ }
                )
            }

            // Load adherence stats
            val statsResult = adherenceRepository.getAdherenceStats(patientId)
            statsResult.fold(
                onSuccess = { stats ->
                    _uiState.value = _uiState.value.copy(adherenceStats = stats)
                },
                onFailure = { /* non-critical */ }
            )

            // Load adherence history
            val historyResult = adherenceRepository.getAdherenceHistory(patientId)
            historyResult.fold(
                onSuccess = { history ->
                    _uiState.value = _uiState.value.copy(adherenceHistory = history)
                },
                onFailure = { /* non-critical */ }
            )

            // Load predictions
            val predResult = predictionRepository.getPredictions(patientId)
            predResult.fold(
                onSuccess = { preds ->
                    _uiState.value = _uiState.value.copy(predictions = preds)
                },
                onFailure = { /* non-critical */ }
            )

            _uiState.value = _uiState.value.copy(isLoading = false)
        }
    }

    fun selectTab(index: Int) {
        _uiState.value = _uiState.value.copy(selectedTab = index)
    }

    fun deleteMedication(medicationId: Int) {
        viewModelScope.launch {
            val result = medicationRepository.deleteMedication(medicationId)
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(deleteSuccess = true)
                    loadPatientData()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to delete medication"
                    )
                }
            )
        }
    }

    fun clearDeleteSuccess() {
        _uiState.value = _uiState.value.copy(deleteSuccess = false)
    }
}
