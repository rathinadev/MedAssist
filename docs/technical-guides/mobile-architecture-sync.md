# Technical Guide: Mobile Persistence & Synchronization (Deep-Dive)

This document explains the technical implementation of MedAssist's "Offline-First" Android application.

---

## 1. Local-First Persistence Layer
**Architecture**: Jetpack Room (SQLite Wrapper)

MedAssist stores a complete replica of the patient's data locally to ensure functionality without internet access.

| Entity | Description |
| :--- | :--- |
| `MedicationEntity` | Local storage of drug name, dosage, and timing JSON. |
| `AdherenceLogEntity` | Local log of taken/missed medications. |
| `UserEntity` | Encrypted storage of the user profile and current role. |

---

## 2. The Repository Blueprint
Students should focus on the **Repository Pattern** used here.

**Files**: `com.medassist.app.data.repository.MedicationRepository`

1. **The Request**: UI requests `getTodaySchedule()`.
2. **The Cache**: Repository returns a `Flow` observable from the **Room Database**.
3. **The Sync**: Simultaneously, it triggers a background network fetch via **Retrofit**.
4. **The Merge**: When the API returns data, the Repository updates the local Room DB.
5. **The Reactivity**: Because the UI is "observing" the Room DB, it automatically updates as soon as the sync completes.

---

## 3. Remote Alert Synchronization (WorkManager)
**Worker**: `com.medassist.app.worker.RemoteAlertWorker`

We use **WorkManager** to handle background tasks that must succeed even if the app is killed.

1. **The Sync**: Runs every 15 minutes.
2. **Function**: Polls `/api/adherence/reminders/` for any missed dose alerts.
3. **Audible Alert**: Initializes the Android `TextToSpeech` engine to read the alert text aloud.

---

## 4. Persistent Alarm Scheduling
**Files**: `com.medassist.app.util.AlarmScheduler`

Android's "Power Management" often kills background tasks. We use the **AlarmManager** to bypass this.

### The Algorithm:
1. **Timing Logic**: The scheduler reads the `timings` JSON (e.g., `["08:00"]`).
2. **Intent Crafting**: It creates a `PendingIntent` specifically for the `MedicationAlarmReceiver`.
3. **Registration**: It registers an **Exact Alarm** (`setExactAndAllowWhileIdle`). 
4. **The Wakeup**: Even if the phone is in "Doze Mode" (sleep), the Android OS wakes our specific BroadcastReceiver at the exact millisecond.
5. **Notification**: The Receiver uses `NotificationManager` to create a high-priority channel and vibrate the phone.

---

## 4. Resilience: The Boot Recovery
If a patient restarts their phone, all active Alarms in the Android OS are erased. 

**Component**: `com.medassist.app.util.BootReceiver`

- **Trigger**: Listens for the `ACTION_BOOT_COMPLETED` system event.
- **Process**: 
    - Wakes up the app silently in the background.
    - Reads all medications from the **Room DB**.
    - Re-runs the `AlarmScheduler` for every timing today.
    - This ensures that a battery death or restart never results in a missed dose.

---

## 5. Security Tier
- **Encrypted SharedPreferences**: Stores JWT tokens. The encryption key is tied to the device's hardware, preventing tokens from being copied off the phone.
- **Interceptor**: Every Retrofit request passes through a `HeaderInterceptor` that automatically injects the Bearer Token.

---
### Technical Summary for Student Presenters:
> "Our mobile strategy is 'Offline-First'. By using a local Room Database as our primary source of truth and the Android AlarmManager for system-level persistence, we ensure that MedAssist remains a life-critical tool regardless of network or power state."
