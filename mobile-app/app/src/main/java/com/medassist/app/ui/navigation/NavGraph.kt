package com.medassist.app.ui.navigation

import androidx.compose.runtime.*
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.medassist.app.ui.auth.AuthViewModel
import com.medassist.app.ui.auth.LoginScreen
import com.medassist.app.ui.auth.RegisterScreen
import com.medassist.app.ui.caretaker.CaretakerDashboardScreen
import com.medassist.app.ui.caretaker.AddMedicationScreen
import com.medassist.app.ui.caretaker.PatientDetailScreen
import com.medassist.app.ui.patient.PatientDashboardScreen
import com.medassist.app.ui.patient.MedicationListScreen
import com.medassist.app.ui.patient.ScanPrescriptionScreen
import com.medassist.app.ui.patient.HistoryScreen

object Routes {
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val PATIENT_DASHBOARD = "patient/dashboard"
    const val PATIENT_MEDICATIONS = "patient/medications"
    const val PATIENT_SCAN = "patient/scan"
    const val PATIENT_HISTORY = "patient/history"
    const val CARETAKER_DASHBOARD = "caretaker/dashboard"
    const val CARETAKER_PATIENT_DETAIL = "caretaker/patient/{patientId}"
    const val CARETAKER_ADD_MEDICATION = "caretaker/patient/{patientId}/add-medication"

    fun patientDetail(patientId: Int) = "caretaker/patient/$patientId"
    fun addMedication(patientId: Int) = "caretaker/patient/$patientId/add-medication"
}

@Composable
fun NavGraph(
    navController: NavHostController = rememberNavController(),
    authViewModel: AuthViewModel = hiltViewModel()
) {
    val authState by authViewModel.uiState.collectAsState()

    // Determine start destination
    val startDestination = when {
        authState.isLoggedIn && authState.userRole == "caretaker" -> Routes.CARETAKER_DASHBOARD
        authState.isLoggedIn && authState.userRole == "patient" -> Routes.PATIENT_DASHBOARD
        else -> Routes.LOGIN
    }

    // Handle navigation after login/register
    LaunchedEffect(authState.loginSuccess, authState.registerSuccess) {
        if (authState.loginSuccess || authState.registerSuccess) {
            val destination = when (authState.userRole) {
                "caretaker" -> Routes.CARETAKER_DASHBOARD
                else -> Routes.PATIENT_DASHBOARD
            }
            navController.navigate(destination) {
                popUpTo(0) { inclusive = true }
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // Auth screens
        composable(Routes.LOGIN) {
            LoginScreen(
                uiState = authState,
                onLogin = { email, password ->
                    authViewModel.login(email, password)
                },
                onNavigateToRegister = {
                    navController.navigate(Routes.REGISTER)
                },
                onClearError = { authViewModel.clearError() }
            )
        }

        composable(Routes.REGISTER) {
            RegisterScreen(
                uiState = authState,
                onRegister = { email, password, name, phone, role ->
                    authViewModel.register(email, password, name, phone, role)
                },
                onNavigateToLogin = {
                    navController.popBackStack()
                },
                onClearError = { authViewModel.clearError() }
            )
        }

        // Patient screens
        composable(Routes.PATIENT_DASHBOARD) {
            PatientDashboardScreen(
                onNavigateToMedications = {
                    navController.navigate(Routes.PATIENT_MEDICATIONS)
                },
                onNavigateToScan = {
                    navController.navigate(Routes.PATIENT_SCAN)
                },
                onNavigateToHistory = {
                    navController.navigate(Routes.PATIENT_HISTORY)
                },
                onLogout = {
                    authViewModel.logout()
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.PATIENT_MEDICATIONS) {
            MedicationListScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Routes.PATIENT_SCAN) {
            ScanPrescriptionScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Routes.PATIENT_HISTORY) {
            HistoryScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // Caretaker screens
        composable(Routes.CARETAKER_DASHBOARD) {
            CaretakerDashboardScreen(
                onNavigateToPatientDetail = { patientId ->
                    navController.navigate(Routes.patientDetail(patientId))
                },
                onLogout = {
                    authViewModel.logout()
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(
            route = Routes.CARETAKER_PATIENT_DETAIL,
            arguments = listOf(
                navArgument("patientId") { type = NavType.IntType }
            )
        ) { backStackEntry ->
            val patientId = backStackEntry.arguments?.getInt("patientId") ?: 0
            PatientDetailScreen(
                patientId = patientId,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToAddMedication = {
                    navController.navigate(Routes.addMedication(patientId))
                }
            )
        }

        composable(
            route = Routes.CARETAKER_ADD_MEDICATION,
            arguments = listOf(
                navArgument("patientId") { type = NavType.IntType }
            )
        ) { backStackEntry ->
            val patientId = backStackEntry.arguments?.getInt("patientId") ?: 0
            AddMedicationScreen(
                patientId = patientId,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
