# 📑 MedAssist Client Handoff: Credentials & Access

This document contains the official production access details for the MedAssist platform.

---

## 🌐 Production URLs
- **Main Dashboard (Next.js)**: `https://front-end-two-pearl.vercel.app`
- **Backend API (AWS EC2)**: `http://13.203.161.151:8000/api/`

---

## 🔑 Demo Access Credentials
**Master Password (All Accounts)**: `MedAssist2026!`

### **👩‍⚕️ Caretaker Accounts (Doctors/Nurses)**
| Name | Email login | Role |
| :--- | :--- | :--- |
| **Dr. Robert Smith** | `dr.smith@medassist.com` | Lead Clinician |
| **Dr. Priya Patel** | `dr.patel@medassist.com` | Senior Physician |

### **👴 Patient Accounts (Monitoring)**
| Name | Email login | Associated Doctor |
| :--- | :--- | :--- |
| **John Doe** | `john.doe@example.com` | Dr. Smith |
| **Mary Johnson** | `mary.johnson@example.com` | Dr. Smith |
| **James Wilson** | `james.wilson@example.com` | Dr. Smith |
| **Sarah Brown** | `sarah.brown@example.com` | Dr. Patel |
| **David Lee** | `david.lee@example.com` | Dr. Patel |

---

## 🛠️ Infrastructure Overview
- **Frontend**: Hosted on **Vercel** with global CDN and automatic SSL (HTTPS).
- **Backend**: Hosted on **AWS EC2 (t3.micro)** running Amazon Linux 2023.
- **Database**: Local high-performance **SQLite** for zero-cost maintenance.
- **Reminders**: Driven by a persistent **Background Monitor** service on AWS.

---

## 🔊 Important Note for Voice Alerts
For the **Voice Engine** to work, the user **MUST** click the **"Activate Voice Monitor"** button upon logging in for the first time on a new browser.

**Project Status**: Production Ready & Stable as of March 26, 2026.
🦅🛡️🔥🏆
