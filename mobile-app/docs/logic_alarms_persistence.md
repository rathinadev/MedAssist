# Mobile Service & Persistence Deep-Dive

This document explains the "Invisible" services that make the MedAssist Android app reliable.

## 1. The Offline-First Strategy
**Pattern**: Repository Pattern (Remote + Local)

Students often struggle with "No Internet" scenarios. MedAssist avoids this by using a **Room Database**.

**Sync Flow**:
1. **App Opens**: The UI immediately shows data from the local **Room SQLite** database.
2. **Network Fetch**: In the background, `Retrofit` pulls the latest data from the Django API.
3. **Cache Update**: The repository saves the new data into Room.
4. **Reactive UI**: Because the UI is "observing" the Room database, it automatically refreshes when the cache updates.

---

## 2. The Alarm System
**File**: `MedicationAlarmReceiver.kt`

Alarms are the most technically difficult part of the app because Android kills background apps to save battery.

### How we "Beat" the System:
1. **AlarmManager**: We use `setExactAndAllowWhileIdle`. This tells Android: "I don't care about battery saving, you MUST wake me up at 08:00 AM."
2. **BroadcastReceiver**: A small, invisible peace of code that wakes up for 10 seconds, builds a `Notification`, and then goes back to sleep.

---

## 3. Persistence Across Reboots
If a user turns their phone off and on, normally all alarms are lost. 

**The Solution**:
- We use a **BootReceiver** that listens for the `RECEIVE_BOOT_COMPLETED` intent.
- When the phone turns on, our app wakes up silently, reads the Room DB, and reschedules every single alarm for the rest of the day.

---

## 4. MVVM Implementation
- **View**: Jetpack Compose (Modern UI).
- **ViewModel**: Holds the data for the screen.
- **Repository**: The decision-maker (Does the data come from API or DB?).
- **Room/Retrofit**: The technical workers.

---

## 5. Security
The app stores the JWT tokens in **Encrypted SharedPreferences**. This ensures that even if a phone is compromised, other apps cannot steal the medical access tokens.

---

## 6. Remote Sync & Voice Logic
**File**: `RemoteAlertWorker.kt`

To ensure the patient never misses a dose due to network drops, the app uses **WorkManager** for background polling:
1. **The Worker**: Runs every 15 minutes to fetch missed adherence alerts from the API.
2. **Audible Logic**: If an alert is found, the worker initializes the **Android Text-to-Speech (TTS)** engine.
3. **Execution**: It speaks the reminder (e.g., *"Time for your Aspirin"*) even if the app is in the background or the screen is locked.
