# Bible Module: Sync, Persistence & Alarms (Mobile)

This document is for the student managing the Android application. It explains the complex system-level logic of the mobile client.

## 1. The Offline-First Sync Cycle
The mobile app doesn't trust the internet. It trusts the **Local Database**.

**Architecture Pattern**: Repository Pattern.

### Flow:
1. **Request**: The UI asks for "Today's Schedule".
2. **Local First**: The `MedicationRepository` immediately returns whatever is in the **Room DB**.
3. **Remote Fetch**: Simultaneously, it starts a network call using `Retrofit` to the Django API.
4. **Reconciliation**: When the API responds, the app updates the Room DB.
5. **Auto-Refresh**: Since the UI uses `StateFlow` to "listen" to the Database, the screen updates automatically without the user clicking refresh.

---

## 2. The Alarm Scheduling Engine
**File**: `com.medassist.app.notifications.AlarmScheduler`

Android's "Doze Mode" kills background tasks. We use the **AlarmManager** to ensure reminders always trigger.

### The Lifecycle of a Reminder:
1. **Schedule Event**: When the app syncs medications, it calculates the "Next occurrence" for every med timing.
2. **OS Intent**: The app sends a `PendingIntent` to the Android OS with the exact millisecond required.
3. **The Wakeup**: At the exact time, the Android OS sends a broadcast back to our app.
4. **Execution**: The `MedicationAlarmReceiver` wakes up, creates a high-priority `NotificationChannel`, and makes the phone vibrate.

---

## 3. Resilience: The Boot Receiver
**Question**: What if the patient restarts their phone? Alarms are deleted by the OS on reboot!

**The Technical Solution**:
- We registered a `BroadcastReceiver` in the `AndroidManifest.xml` that listens for `BOOT_COMPLETED`.
- When the phone turns on, our app is briefly woken up by the OS.
- We run a `WorkManager` task that reads the Room DB and "re-hydrates" every single alarm.

---

## 4. Data Protection
Because medical data is sensitive, we use **Encrypted SharedPreferences** to store:
- User JWT Tokens.
- Patient IDs.
- Local configuration.

This ensures that even if another app is compromised on the user's phone, it cannot read the MedAssist credentials or data.

---
### Technical Takeaway for Students:
- The Mobile app is a **Cache** of the Backend. The most important code is the code that handles "What if the API is down?".
