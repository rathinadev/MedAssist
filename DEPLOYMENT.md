# MedAssist Deployment & Handover Guide

This document provides technical instructions for moving the MedAssist system from a local development environment to a production server.

## 🚀 Key Deployment Requirements

### **1. HTTPS is Mandatory**
Due to browser security policies, the following features will **ONLY** work over a secure HTTPS connection:
- **Web Speech API**: Browser-side medication reminders.
- **Service Workers**: Background WebPush notifications.
- **Camera Access**: Using the mobile device for prescription scanning.

> [!IMPORTANT]
> Ensure you have an SSL certificate (e.g., Let's Encrypt) installed on your production server.

### **2. Environment Configuration**
Update the following variables to match your production domain/IP:

#### **Backend (`backend/medassist_backend/settings.py`)**
- `ALLOWED_HOSTS`: Add your production domain or IP.
- `CORS_ALLOWED_ORIGINS`: Include the production URL of your Next.js application.
- `TIME_ZONE`: Currently set to `"Asia/Kolkata"`. Adjust if your client is in a different region.

#### **Frontend (`frontend/.env`)**
- `NEXT_PUBLIC_API_URL`: Change to `https://your-api-domain.com/api`.

#### **Mobile (`mobile-app/`)**
- Update the `BASE_URL` in `BuildConfig` or your networking module to point to your public API.

---

## 🛠️ Essential Commands

### **Running the WebPush Monitor**
To enable automatic voice reminders, the backend must be "Listening" 24/7. Run this command in a background process (using `tmux`, `screen`, or `systemd`):

```bash
python3 manage.py check_reminders --loop
```

### **Building the Mobile APK**
We have already provided a build at `releases/medassist-v1.0-debug.apk`. If you need to rebuild:

```bash
./gradlew assembleDebug
```

---

## 🔊 Testing the Voice Engine
To verify the system is ready for the client:
1. Log in to the **Patient Dashboard**.
2. Locate the **"Test Voice"** button in the sidebar.
3. If you hear "MedAssist Voice System is active," your browser's audio engine is correctly configured.

## 🛡️ VAPID Key Management
The system uses pre-generated VAPID keys for WebPush. These are stored in `backend/medassist_backend/settings.py` and `frontend/src/components/WebPushRegistration.tsx`. 
- **DO NOT** change these keys unless you regenerate them on both ends simultaneously, as it will break existing patient registrations.

---

**Handover Status**: All systems are 100% stable as of March 26, 2026.
🦅🛡️🔥🏆
