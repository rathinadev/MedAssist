package com.medassist.app.ui.patient

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.medassist.app.data.model.Medication
import com.medassist.app.data.repository.MedicationRepository
import com.medassist.app.util.TokenManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class MedicationListUiState(
    val isLoading: Boolean = true,
    val medications: List<Medication> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class MedicationListViewModel @Inject constructor(
    private val medicationRepository: MedicationRepository,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(MedicationListUiState())
    val uiState: StateFlow<MedicationListUiState> = _uiState.asStateFlow()

    init {
        loadMedications()
    }

    fun loadMedications() {
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

            val result = medicationRepository.getMedications(patientId)

            result.fold(
                onSuccess = { medications ->
                    _uiState.value = MedicationListUiState(
                        isLoading = false,
                        medications = medications.filter { it.isActive }
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Failed to load medications"
                    )
                }
            )
        }
    }
}
