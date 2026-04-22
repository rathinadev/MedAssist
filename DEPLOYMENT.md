# 🏥 MedAssist: Master Deployment & Handover Guide (April 2026) 🚀

This document is the **Single Source of Truth** for deploying and handing over the MedAssist ecosystem. It covers the Backend, Frontend (Vercel Proxy), and Mobile platforms.

---

## 🏗️ 1. Backend: High-Performance AWS Setup
The backend serves as the central hub for data, OCR, and real-time notifications.

### **The "One-Command" Setup**
From the root of the repository, execute:
```bash
# This bootstraps venv, dependencies, migrations, and starts background services
bash setup.sh
```

### **Manual Service Verification**
After setup, ensure these background services are running in `screen`:
- **API Server** (Port 8000): `screen -r api`
- **Voice Monitor** (Real-time triggers): `screen -r monitor`

---

## 🌉 2. Frontend: The "Zero-Domain" Vercel Proxy
To bypass browser **Mixed Content** blocks (HTTPS site talking to HTTP backend), we use a server-side proxy strategy.

### **Vercel Configuration**
1. **Root Directory**: Set to `frontend`.
2. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Set to `/api` (Crucial for the proxy bridge).
   - `AWS_BACKEND_URL`: Set to `http://[YOUR_AWS_IP]:8000`.

### **How it works**:
Your Vercel site (`https://...`) sends requests to `/api/*`. Next.js intercepts these on its server and forwards them to your AWS Server (`http://...`). The browser only sees the secure HTTPS connection.

---

## 📱 3. Mobile: Android Native Deployment
The mobile app is built for offline-first reliability and synchronized alerts.

### **Installation**
1. Locate the stabilized APK: `releases/MedAssist-Stabilized.apk`.
2. Sideload to any Android device (API 26+).
3. Ensure the `Constants.BASE_URL` in the code matches your current AWS IP.

### **Build from Source**
```bash
cd mobile-app
./gradlew assembleDebug
```

---

## 🔊 4. The "Double-Voice" Test
To verify the system is ready for the client:
1. Log in to the **Web Dashboard** on a laptop.
2. Log in to the **Mobile App** on a phone.
3. Mark a medication as "Due" in one minute.
4. **Verification**: 
   - At the scheduled minute, the **Laptop** will speak the reminder.
   - Simultaneously, the **Phone** will show a notification and speak the reminder.

---

## 🔐 5. Demo Credentials
- **Universal Password**: `MedAssist2026!`
- **Primary Patient**: `p6@medassist.com` (Frank)
- **Primary Caretaker**: `dr.smith@medassist.com`

---
*Maintained by the MedAssist Engineering Team. Optimized for Healthcare Excellence.* 🦅🛡️🔥🏆
