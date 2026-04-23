# MedAssist: Unified Medical Platform - Ultimate Delivery Guide 🩺📦

Welcome to the production-ready MedAssist platform. This project is a state-of-the-art healthcare ecosystem featuring AI-driven prescription scanning, real-time cloud synchronization, and a dual-interface dashboard.

---

## 🏗️ Repository & Project Organization

The project is structured as a **High-Shield Monorepo**. This allows for unified version control while maintaining the ability to deploy each component as an independent microservice.

### **1. Folder Structure**
| Component | Technology | Role |
| :--- | :--- | :--- |
| **`/backend`** | Python / Django REST | The Central Intelligence. Handles OCR, Auth, and ML. |
| **`/frontend`** | Next.js / React | The Clinician Dashboard. Real-time patient monitoring. |
| **`/mobile-app`** | Kotlin / Jetpack Compose | The Patient Client. AI-camera scanner & reminders. |
| **`/releases`** | Android APK | Production-ready distribution files. |

---

## 🚀 Deployment & Cloud Infrastructure

The platform is fully cloud-hosted using a specialized "Zero-Domain" bridge to ensure maximum functionality on any budget.

### **🌐 Backend (AWS EC2)**
- **Host**: `http://3.110.178.65:8000`
- **Configuration**: Hosted on Amazon Linux 2023 with a custom Nginx reverse proxy.
- **AI Engine**: Integrated with Azure Form Recognizer and Google Gemini for ultra-accurate prescription extraction.

### **✨ Frontend (Vercel)**
- **Architecture**: Specialized Next.js 16 build.
- **Vercel Proxy Bridge**: The frontend uses an internal proxy (`/api` route) to securely tunnel data to the AWS server, bypassing browser "Mixed Content" security blocks.

### **📱 Mobile (Android Native)**
- **Hardcoded Sync**: The application is pre-configured to talk to the AWS production server out of the box.
- **Build**: Located at `releases/MedAssist-Production-V2.apk`.

---

## 🔐 Demonstration Credentials (THE FULL LIST)

**Master Password for ALL accounts:** `MedAssist2026!`

### **👨‍⚕️ Doctors (Web Access)**
- `dr.smith@medassist.com`
- `dr.miller@medassist.com`

### **📱 Patients (Mobile/Web Access)**
- `p1@medassist.com` (Star Student - Perfect Adherence)
- `p2@medassist.com` (Weekend Socialite - Fails on Sat/Sun)
- `p3@medassist.com` (Morning Rusher - Fails AM doses)
- `p4@medassist.com` (The Recoverer - Pattern improving over time)
- `p5@medassist.com` (The Forgetter - Random failure pattern)
- `p6@medassist.com` (The Lagger - Always 6 hours late)

---

## ✅ Feature Highlight: "Review & Edit" Scan Flow
The crown jewel of the system is the **AI-to-Schedule bridge**.
1. **Scan**: Capture any prescription image.
2. **Review**: The system returns the AI results in an editable form.
3. **Correct**: The user can manually fix any AI hallucinations (e.g., dosage or name).
4. **Finalize**: Single-tap addition to the cloud schedule with "Smart Timing" (automatically setting 09:00 AM for medications without timing data).

---
*Verified Production Build: April 23, 2026* 🛡️🔥✨🎬
