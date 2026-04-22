## 🚀 Quick Start: One-Command Setup
For a fresh environment (AWS EC2 or Local), simply run the following command from the root of the repository:

```bash
bash setup.sh
```

**What this does:**
1. Sets up the Python Virtual Environment (`venv`).
2. Installs all required backend dependencies.
3. Initializes the database and creates the demo accounts (`Frank`, `Alice`, etc.).
4. **Starts the API Server & Voice Monitor** automatically in the background using Linux Screens.

---

## 🔐 Universal Credentials
> [!IMPORTANT]
> **Authentication**: All accounts use the same password for ease of demonstration.
> - **Password**: `MedAssist2026!`

---

## 👨‍⚕️ Caretaker Accounts (Doctors)
Use these accounts to view the **Caretaker Dashboard**, analyze patient risk, and use the ML Playground.

| Name | Email | Focus |
| :--- | :--- | :--- |
| **Dr. Robert Smith** | `dr.smith@medassist.com` | Primary Care, Star Students |
| **Dr. Sarah Miller** | `dr.miller@medassist.com` | Troubleshooting, Risk Cases |

---

## 💊 Patient Accounts
Each patient is seeded with 90 days of unique historical data to demonstrate different behavioral traits.

| Email | Name | Behavioral Trait | Demo Notes |
| :--- | :--- | :--- | :--- |
| `p1@medassist.com` | **Alice** | ⭐ Star Student | Perfect 100% adherence logs. |
| `p2@medassist.com` | **Bob** | 🏖️ Weekend Socialite | Misses most Saturday/Sunday doses. |
| `p3@medassist.com` | **Charlie** | 🏃 Morning Rusher | Frequently misses 08:00 AM doses. |
| `p4@medassist.com` | **David** | 📈 Recoverer | Performance starts at 20% and improves to 90%. |
| `p5@medassist.com` | **Eve** | ❓ Forgetter | Random 40% miss rate (Ideal for Chatbot). |
| `p6@medassist.com` | **Frank** | 🐢 Lagger | **RECOMMENDED FOR DEMO**. Always 6 hours late. |

---

## 🚀 Key Stabilization Features (April 22nd Update)

### 1. Robust Identity Resolution
- **Mobile Scanning**: Patients can now scan prescriptions without manual ID entry. The backend automatically resolves the identity from the auth token.
- **Role Detection**: Case-insensitive role matching ensures "Patient" and "patient" work seamlessly across all platforms.

### 2. Smart Multi-Dose Notifications
- **Simultaneous Alerts**: Fixed the race condition where the mobile app's polling would block the desktop notification.
- **Time-Specific Matching**: The system now correctly distinguishes between 08:00 and 20:00 doses. Taking the morning dose no longer suppresses the night reminder.

### 3. Audio & UI Feedback
- **Voice Synthesis**: The dashboard now features explicit "Enable Voice" permissions to satisfy browser policies.
- **Empty States**: Professional "No Results" cards added to the prescription scanner for a premium feel.

## 🛡️ Production Architecture: The "Zero-Domain" Bridge

To handle the security requirements of modern browsers (which block HTTPS-to-HTTP communication), MedAssist uses a **Next.js Rewrite Proxy** on Vercel:

1. **Frontend (Vercel)**: Runs on **HTTPS**.
2. **Backend (AWS EC2)**: Runs on **HTTP** (Port 8000).
3. **The Bridge**: The frontend sends all API requests to the relative `/api/` path on its own domain.
4. **Next Config**: `next.config.ts` intercepts `/api/*` and proxies them to the `AWS_BACKEND_URL` on the backend server.

This ensures the platform remains secure and functional without needing to maintain complex SSL certificates on the AWS EC2 instance during the demo phase.

---

## 🛠️ Developer Commands
- **Seed Data**: `python3 manage.py seed_demo_data`
- **Real-time Monitor**: `python3 manage.py check_reminders --loop`
- **ML Retraining**: `python3 manage.py train_ml` (Automatically ran after seeding)
