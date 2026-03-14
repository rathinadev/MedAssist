# Technical Guide: Mobile Architecture & Sync

This document explains the offline-first implementation and system integration of the native Android application.

## 1. Architecture: MVVM + Repository
The app uses the **Model-View-ViewModel** pattern for clear separation of concerns.

- **Room DB (Local Model)**: Acts as the primary source of truth for the UI.
- **Retrofit (Remote Model)**: Handles background synchronization with the Django API.
- **Repository**: Managed the logic of "Local First, Then Remote."

## 2. Persistence Strategy
**Flow**:
1. User opens the app.
2. The UI immediately displays data from the local **Room SQLite** cache.
3. In the background, the Repository triggers a network request.
4. Upon success, the local database is updated, and the UI (using `StateFlow`) refreshes automatically.

## 3. System Alarm Management
**Component**: `com.medassist.app.notifications.AlarmScheduler`

To guarantee notifications trigger even in "Doze Mode," the app utilizes the Android **AlarmManager**.

1. **Exact Alarms**: The app schedules intents with `setExactAndAllowWhileIdle`.
2. **Broadcast Receivers**: When the alarm time is reached, the OS wakes a `MedicationAlarmReceiver` to show a push notification.
3. **Persistence Across Reboot**: The app registers a `BootReceiver` that reschedules all alarms immediately after a device restart by reading the local Room database.

## 4. Authentication Security
JWT (JSON Web Tokens) are stored in **Encrypted SharedPreferences**. This hardware-backed security ensures that access tokens cannot be extracted by unauthorized applications or processes on the device.
