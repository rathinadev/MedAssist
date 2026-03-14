package com.medassist.app.ui.patient

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.medassist.app.ui.common.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MedicationListScreen(
    onNavigateBack: () -> Unit,
    viewModel: MedicationListViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Medications") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        when {
            uiState.isLoading -> {
                LoadingScreen(modifier = Modifier.padding(paddingValues))
            }
            uiState.error != null && uiState.medications.isEmpty() -> {
                ErrorScreen(
                    message = uiState.error!!,
                    onRetry = { viewModel.loadMedications() },
                    modifier = Modifier.padding(paddingValues)
                )
            }
            uiState.medications.isEmpty() -> {
                EmptyStateScreen(
                    message = "No medications found.\nAsk your caretaker to add medications or scan a prescription.",
                    modifier = Modifier.padding(paddingValues)
                )
            }
            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(uiState.medications) { medication ->
                        MedicationInfoCard(
                            name = medication.name,
                            dosage = medication.dosage,
                            frequency = medication.frequency,
                            timings = medication.timings,
                            instructions = medication.instructions
                        )
                    }
                }
            }
        }
    }
}
