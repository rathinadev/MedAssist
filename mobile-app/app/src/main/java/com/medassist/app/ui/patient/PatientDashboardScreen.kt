package com.medassist.app.ui.patient

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.medassist.app.ui.common.*
import com.medassist.app.ui.theme.Success
import com.medassist.app.ui.theme.Warning

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatientDashboardScreen(
    onNavigateToMedications: () -> Unit,
    onNavigateToScan: () -> Unit,
    onNavigateToHistory: () -> Unit,
    onLogout: () -> Unit,
    viewModel: PatientDashboardViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    // Show success snackbar
    LaunchedEffect(uiState.takeMedicationSuccess) {
        if (uiState.takeMedicationSuccess) {
            snackbarHostState.showSnackbar("Medication marked as taken!")
            viewModel.clearTakeMedicationSuccess()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Good ${getGreetingTime()}!",
                            style = MaterialTheme.typography.titleMedium
                        )
                        if (uiState.userName.isNotBlank()) {
                            Text(
                                text = uiState.userName,
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                },
                actions = {
                    IconButton(onClick = onLogout) {
                        Icon(Icons.Default.Logout, contentDescription = "Logout")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = null) },
                    label = { Text("Dashboard") },
                    selected = true,
                    onClick = { }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Medication, contentDescription = null) },
                    label = { Text("Medications") },
                    selected = false,
                    onClick = onNavigateToMedications
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.CameraAlt, contentDescription = null) },
                    label = { Text("Scan") },
                    selected = false,
                    onClick = onNavigateToScan
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.History, contentDescription = null) },
                    label = { Text("History") },
                    selected = false,
                    onClick = onNavigateToHistory
                )
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        if (uiState.isLoading && !uiState.isRefreshing) {
            LoadingScreen(modifier = Modifier.padding(paddingValues))
        } else if (uiState.error != null && uiState.todaySchedule == null) {
            ErrorScreen(
                message = uiState.error!!,
                onRetry = { viewModel.loadDashboard() },
                modifier = Modifier.padding(paddingValues)
            )
        } else {
            Box(
                modifier = Modifier.padding(paddingValues)
            ) {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Adherence streak badge
                    uiState.adherenceStats?.let { stats ->
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.primaryContainer
                                )
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column {
                                        Text(
                                            text = "Current Streak",
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                                        )
                                        Text(
                                            text = "${stats.currentStreak} days",
                                            style = MaterialTheme.typography.headlineMedium,
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.onPrimaryContainer
                                        )
                                    }
                                    AdherenceRingChart(
                                        adherenceRate = stats.adherenceRate,
                                        size = 80
                                    )
                                }
                            }
                        }
                    }

                    // Today's Medications header
                    item {
                        Text(
                            text = "Today's Medications",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }

                    val medications = uiState.todaySchedule?.medications ?: emptyList()

                    if (medications.isEmpty()) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                                )
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(32.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "No medications scheduled for today",
                                        style = MaterialTheme.typography.bodyLarge,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    } else {
                        items(medications) { scheduled ->
                            MedicationScheduleCard(
                                scheduledMedication = scheduled,
                                onTakeMedication = {
                                    viewModel.takeMedication(scheduled.medication.id)
                                }
                            )
                        }
                    }

                    // Bottom stats row
                    uiState.adherenceStats?.let { stats ->
                        item {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Your Stats",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        item {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceEvenly
                            ) {
                                Card(modifier = Modifier.weight(1f)) {
                                    StatCard(
                                        title = "Adherence\nRate",
                                        value = "${stats.adherenceRate.toInt()}%",
                                        color = when {
                                            stats.adherenceRate >= 80 -> Success
                                            stats.adherenceRate >= 50 -> Warning
                                            else -> MaterialTheme.colorScheme.error
                                        }
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Card(modifier = Modifier.weight(1f)) {
                                    StatCard(
                                        title = "Total\nTaken",
                                        value = "${stats.totalTaken}",
                                        color = Success
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Card(modifier = Modifier.weight(1f)) {
                                    StatCard(
                                        title = "Best\nStreak",
                                        value = "${stats.bestStreak}",
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                }
                            }
                        }
                    }

                    // Bottom spacing
                    item { Spacer(modifier = Modifier.height(16.dp)) }
                }
            }
        }
    }
}

private fun getGreetingTime(): String {
    val hour = java.time.LocalTime.now().hour
    return when {
        hour < 12 -> "Morning"
        hour < 17 -> "Afternoon"
        else -> "Evening"
    }
}
