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

### BroadcastReceivers
- **`MedicationAlarmReceiver`**: Triggered by the OS when a dose is due. It builds and displays a high-priority system notification.
- **`BootReceiver`**: Listens for the `ACTION_BOOT_COMPLETED` system event. This allows the app to automatically reschedule all medication alarms if the user's phone is restarted.

## 4. Networking and Security

- **Retrofit & OkHttp**: Used for type-safe API communication. Includes a custom interceptor that handles JWT token injection and auto-refresh logic matching the Web frontend.
- **Encrypted SharedPreferences**: Stores sensitive authentication tokens to prevent unauthorized access by other apps on the device.

## 5. Component Structure

- **`com.medassist.app.ui.patient`**: Screens for the daily schedule and logging intake.
- **`com.medassist.app.data.local`**: DAOs and Entity definitions for the Room database.
- **`com.medassist.app.notifications`**: Management logic for system-level notifications and alarm scheduling.

## 6. Setup

1. Open in **Android Studio**.
2. Update the `Constants.BASE_URL` with your local machine's IP address (e.g., `192.168.x.x`).
3. Build and deploy to an Emulator or Physical Device (API Level 26+).

## 7. Technical Implementation Guides

- [**Sync & Alarm Logic**](./docs/technical-guides/mobile-architecture-sync.md): Room DB and AlarmManager mechanics.
- [**Data Mapping**](./docs/technical-guides/data-dictionary.md): Mobile to API field mapping.

---
*Technical Lead: Savita*
