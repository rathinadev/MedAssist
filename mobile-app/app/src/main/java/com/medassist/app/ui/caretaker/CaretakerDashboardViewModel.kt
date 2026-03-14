package com.medassist.app.ui.caretaker

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.medassist.app.data.api.ApiService
import com.medassist.app.data.model.CreatePatientRequest
import com.medassist.app.data.model.Patient
import com.medassist.app.util.TokenManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CaretakerDashboardUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val userName: String = "",
    val patients: List<Patient> = emptyList(),
    val filteredPatients: List<Patient> = emptyList(),
    val searchQuery: String = "",
    val totalPatients: Int = 0,
    val averageAdherence: Double = 0.0,
    val highRiskCount: Int = 0,
    val error: String? = null,
    val addPatientSuccess: Boolean = false,
    val addPatientError: String? = null
)

@HiltViewModel
class CaretakerDashboardViewModel @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(CaretakerDashboardUiState())
    val uiState: StateFlow<CaretakerDashboardUiState> = _uiState.asStateFlow()

    init {
        _uiState.value = _uiState.value.copy(userName = tokenManager.getUserName() ?: "")
        loadPatients()
    }

    fun loadPatients() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            try {
                val response = apiService.getPatients()
                if (response.isSuccessful) {
                    val patients = response.body()?.results ?: emptyList()
                    val avgAdherence = if (patients.isNotEmpty()) {
                        patients.mapNotNull { it.adherenceRate }.average()
                    } else 0.0
                    val highRisk = patients.count { (it.adherenceRate ?: 0.0) < 50.0 }

                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        patients = patients,
                        filteredPatients = patients,
                        totalPatients = patients.size,
                        averageAdherence = avgAdherence,
                        highRiskCount = highRisk
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        error = "Failed to load patients: ${response.code()}"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isRefreshing = false,
                    error = e.message ?: "Failed to load patients"
                )
            }
        }
    }

    fun refresh() {
        _uiState.value = _uiState.value.copy(isRefreshing = true)
        loadPatients()
    }

    fun searchPatients(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        val filtered = if (query.isBlank()) {
            _uiState.value.patients
        } else {
            _uiState.value.patients.filter { patient ->
                patient.user.name.contains(query, ignoreCase = true) ||
                        patient.user.email.contains(query, ignoreCase = true) ||
                        (patient.medicalConditions?.contains(query, ignoreCase = true) == true)
            }
        }
        _uiState.value = _uiState.value.copy(filteredPatients = filtered)
    }

    fun addPatient(email: String, age: Int, medicalConditions: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(addPatientError = null)

            try {
                val response = apiService.createPatient(
                    CreatePatientRequest(
                        userEmail = email,
                        age = age,
                        medicalConditions = medicalConditions
                    )
                )
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(addPatientSuccess = true)
                    loadPatients()
                } else {
                    _uiState.value = _uiState.value.copy(
                        addPatientError = "Failed to add patient: ${response.code()}"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    addPatientError = e.message ?: "Failed to add patient"
                )
            }
        }
    }

    fun clearAddPatientSuccess() {
        _uiState.value = _uiState.value.copy(addPatientSuccess = false)
    }
}
