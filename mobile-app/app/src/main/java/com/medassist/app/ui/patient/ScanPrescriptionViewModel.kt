package com.medassist.app.ui.patient

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.medassist.app.data.model.CreateMedicationRequest
import com.medassist.app.data.model.ExtractedMedication
import com.medassist.app.data.model.Prescription
import com.medassist.app.data.repository.MedicationRepository
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
    private val medicationRepository: MedicationRepository,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(ScanPrescriptionUiState())
    val uiState: StateFlow<ScanPrescriptionUiState> = _uiState.asStateFlow()

    private val _isSaving = MutableStateFlow(false)
    val isSaving: StateFlow<Boolean> = _isSaving.asStateFlow()

    fun scanPrescription(imageFile: File) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isScanning = true, error = null)

            val managedPatientId = tokenManager.getPatientId()
            val currentUserId = tokenManager.getUserId()
            val finalPatientId = if (managedPatientId > 0) managedPatientId else currentUserId

            if (finalPatientId <= 0) {
                _uiState.value = _uiState.value.copy(
                    isScanning = false,
                    error = "User identity not found. Please log in again."
                )
                return@launch
            }

            val result = prescriptionRepository.scanPrescription(imageFile, finalPatientId)

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

    fun updateMedication(index: Int, medication: ExtractedMedication) {
        val currentList = _uiState.value.extractedMedications.toMutableList()
        if (index in currentList.indices) {
            currentList[index] = medication
            _uiState.value = _uiState.value.copy(extractedMedications = currentList)
        }
    }

    fun removeMedication(index: Int) {
        val currentList = _uiState.value.extractedMedications.toMutableList()
        if (index in currentList.indices) {
            currentList.removeAt(index)
            _uiState.value = _uiState.value.copy(extractedMedications = currentList)
        }
    }

    fun saveAllMedications(onComplete: () -> Unit) {
        viewModelScope.launch {
            _isSaving.value = true
            val patientId = tokenManager.getPatientId().let { if (it > 0) it else tokenManager.getUserId() }

            uiState.value.extractedMedications.forEach { extracted ->
                // Smart Defaults for missing data
                val frequency = if (extracted.frequency.isNullOrBlank()) "once_daily" else extracted.frequency
                val timings = when (frequency) {
                    "once_daily" -> listOf("09:00")
                    "twice_daily" -> listOf("09:00", "21:00")
                    "thrice_daily" -> listOf("08:00", "14:00", "20:00")
                    else -> listOf("09:00")
                }

                val request = CreateMedicationRequest(
                    name = extracted.name ?: "Unknown Medication",
                    dosage = extracted.dosage ?: "",
                    frequency = frequency,
                    timings = timings,
                    instructions = extracted.instructions ?: "",
                    patientId = patientId
                )
                medicationRepository.createMedication(request)
            }
            
            _isSaving.value = false
            onComplete()
        }
    }

    fun resetState() {
        _uiState.value = ScanPrescriptionUiState()
    }
}
