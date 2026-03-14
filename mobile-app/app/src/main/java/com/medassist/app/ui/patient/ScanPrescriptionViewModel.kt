package com.medassist.app.ui.patient

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.medassist.app.data.model.ExtractedMedication
import com.medassist.app.data.model.Prescription
import com.medassist.app.data.repository.PrescriptionRepository
import com.medassist.app.util.TokenManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

data class ScanPrescriptionUiState(
    val isScanning: Boolean = false,
    val prescription: Prescription? = null,
    val extractedMedications: List<ExtractedMedication> = emptyList(),
    val error: String? = null,
    val scanSuccess: Boolean = false
)

@HiltViewModel
class ScanPrescriptionViewModel @Inject constructor(
    private val prescriptionRepository: PrescriptionRepository,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(ScanPrescriptionUiState())
    val uiState: StateFlow<ScanPrescriptionUiState> = _uiState.asStateFlow()

    fun scanPrescription(imageFile: File) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isScanning = true, error = null)

            val patientId = tokenManager.getPatientId()
            if (patientId <= 0) {
                _uiState.value = _uiState.value.copy(
                    isScanning = false,
                    error = "Patient ID not found. Please log in again."
                )
                return@launch
            }

            val result = prescriptionRepository.scanPrescription(imageFile, patientId)

            result.fold(
                onSuccess = { prescription ->
                    _uiState.value = ScanPrescriptionUiState(
                        isScanning = false,
                        prescription = prescription,
                        extractedMedications = prescription.extractedData?.medications ?: emptyList(),
                        scanSuccess = true
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isScanning = false,
                        error = error.message ?: "Failed to scan prescription"
                    )
                }
            )
        }
    }

    fun resetState() {
        _uiState.value = ScanPrescriptionUiState()
    }
}
