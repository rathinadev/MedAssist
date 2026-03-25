# MedAssist Universal Voice Engine 🔊🤖

MedAssist features a proprietary-free, zero-cost audible reminder system that works across Desktop, Web, and Android. This document explains the architecture and how to trigger alerts.

---

## 🏗️ Multi-Platform Architecture

The voice system is distributed across three layers to ensure reliability even when applications are closed.

### 1. The Backend Heartbeat (`check_reminders`)
The backend is the "Scheduler." It continuously monitors the database for medication timings.
- **Trigger**: `python3 manage.py check_reminders --loop`
- **Logic**: Every 60 seconds, it fetches medications due in the current minute (synchronized to `Asia/Kolkata` time).
- **Action**: It sends a **WebPush** notification to the patient's registered devices.

### 2. Desktop & Web Voice (Web Speech API)
When the browser receives a Push Notification, the **Service Worker** (`sw.js`) takes over.
- **Service Worker Layer**: Intercepts the push and broadcasts a `SPEAK_REMINDER` message to all open dashboard tabs.
- **UI Layer**: The dashboard receives the message and invokes `window.speechSynthesis`.
- **Speech Pattern**: *"It's time for your medication: [Name]. Please take [Dosage]."*
- **Manual Test**: A **"Test Voice"** button in the sidebar allows developers to verify the browser's audio engine independently of the push system.

### 3. Mobile Voice (Android TTS)
The Android app uses a polling-based "Safety Net" for 100% reliability.
- **Worker**: `RemoteAlertWorker` (WorkManager).
- **Frequency**: Runs every 15 minutes in the background.
- **Logic**: Fetches pending reminders from `/api/adherence/reminders/`.
- **Action**: Directly invokes the native Android `TextToSpeech` engine to speak the reminder out loud, even if the phone is locked.

---

## 🛠️ Verification & Maintenance

### **How to Trigger an Automatic Alert (Demo Path)**
1. Ensure the backend monitor is running: `python3 manage.py check_reminders --loop`.
2. As a patient, set a medication for **2 minutes into the future**.
3. Keep the dashboard open or the phone nearby.
4. At the scheduled minute, the backend will fire the push, and the voice will activate.

### **Diagnostic Tools**
- **Web**: Click "Test Voice" in the sidebar. If you hear audio, the browser is ready.
- **Android**: Check the "Worker Log" in the app settings to see the last successful sync time.
- **Backend**: Watch the monitor terminal; it will log `[SUCCESS] Reminder sent...` when a trigger occurs.

---

## 🔒 Security & Privacy
- **Local Synthesis**: Voice is generated **on the device**. No audio data is ever sent to or from the cloud, ensuring patient privacy and zero latency.
- **VAPID Secure Handshake**: All push messages are signed using VAPID keys, preventing "Spoofing" or unauthorized alerts.

---
*MedAssist Voice System v1.0 - Optimized for clinical accessibility.*
