package com.medassist.app.ui.caretaker

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.medassist.app.data.model.CreateMedicationRequest
import com.medassist.app.data.repository.MedicationRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AddMedicationUiState(
    val isLoading: Boolean = false,
    val success: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class AddMedicationViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val medicationRepository: MedicationRepository
) : ViewModel() {

    val patientId: Int = savedStateHandle.get<Int>("patientId") ?: 0

    private val _uiState = MutableStateFlow(AddMedicationUiState())
    val uiState: StateFlow<AddMedicationUiState> = _uiState.asStateFlow()

    fun createMedication(
        name: String,
        dosage: String,
        frequency: String,
        timings: List<String>,
        instructions: String?
    ) {
        viewModelScope.launch {
            _uiState.value = AddMedicationUiState(isLoading = true)

            val request = CreateMedicationRequest(
                name = name,
                dosage = dosage,
                frequency = frequency,
                timings = timings,
                instructions = instructions,
                patient = patientId
            )

            val result = medicationRepository.createMedication(request)

            result.fold(
                onSuccess = {
                    _uiState.value = AddMedicationUiState(success = true)
                },
                onFailure = { error ->
                    _uiState.value = AddMedicationUiState(
                        error = error.message ?: "Failed to create medication"
                    )
                }
            )
        }
    }
}
