# MedAssist Mobile: Android System Implementation

The MedAssist mobile app is a robust, offline-first native Android application built with **Kotlin** and **Jetpack Compose**.

## 1. Software Architecture (MVVM)

The app follows the **Model-View-ViewModel** pattern to ensure clean separation of concerns and testability.

- **Model (Data Layer)**: Handles data retrieval from the Django API and the local Room database.
- **ViewModel (State Layer)**: Manages UI state and survives configuration changes (like screen rotation). Uses `StateFlow` to provide reactive updates to the UI.
- **View (UI Layer)**: Built entirely with Jetpack Compose, emphasizing a declarative UI approach.

## 2. Persistence Layer (Room DB)

To ensure reliability in low-connectivity environments, MedAssist utilizes an **Offline-First** strategy:
- **Local Cache**: Every medication and schedule item pulled from the API is mirrored in a local SQLite database (via Room).
- **Synchronization**: The code uses a repository pattern that first checks the local cache for immediate display, then triggers a background network fetch to reconcile data with the server.

## 3. System-Level Integration (Alarms & Notifications)

The most critical feature of the mobile app is the medication reminder system:

### AlarmManager Logic
Unlike standard timers, `AlarmManager` communicates directly with the Android OS to schedule "Exact Alarms". This ensures the phone wakes up to notify the patient even when in deep battery-saving mode.

### RemoteAlertWorker
Uses **WorkManager** to perform background sync. It has been stabilized to support **Multi-Dose Schedules**:
- It fetches remote adherence alerts even if the laptop is also active (Synchronized Alerts).
- Triggers the local **Android Text-to-Speech (TTS)** engine for audible reminders.

## 4. Prescription Scanning (Enhanced Review & Edit)
Patients can now scan prescriptions using the on-device AI camera. The system features a **Review & Edit** flow allowing users to finalize names and timings before they are synced to the cloud schedule. Identity is automatically resolved via the JWT token.

## 5. Networking and Security

- **Retrofit & OkHttp**: Used for type-safe API communication. Includes a custom interceptor that handles JWT token injection and auto-refresh logic matching the Web frontend.
- **Encrypted SharedPreferences**: Stores sensitive authentication tokens to prevent unauthorized access by other apps on the device.

## 5. Component Structure

- **`com.medassist.app.ui.patient`**: Screens for the daily schedule and logging intake.
- **`com.medassist.app.data.local`**: DAOs and Entity definitions for the Room database.
- **`com.medassist.app.notifications`**: Management logic for system-level notifications and alarm scheduling.

## 6. Distribution & Setup

1. **Production Deployment**: The app is pre-configured to point to the MedAssist Cloud at `3.110.178.65`.
2. **Install APK**: Download and install the latest build from the **[`releases/`](../releases/)** folder.
3. **Internal Build**: Open in **Android Studio** if you need to modify the `BASE_URL` in `build.gradle.kts`.

## 7. Technical Implementation Guides

- [**Sync & Voice Architecture**](./docs/VOICE_SYSTEM.md): Room DB, WorkManager, and Android TTS mechanics.
- [**Data Mapping**](./docs/technical-guides/data-dictionary.md): Mobile to API field mapping.

---
*Technical Lead: Savita*
