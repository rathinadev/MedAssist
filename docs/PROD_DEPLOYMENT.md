# 🚀 Zero-Domain Deployment Guide: Vercel + AWS

This guide outlines how to deploy MedAssist for free (zero domain cost) while keeping all secure features (Voice/Push) active.

---

## 🏗️ The "Zero-Domain" Architecture
Instead of buying a domain, we use **Vercel as a Secure Bridge**:
1.  **Frontend (Vercel)**: Has a free `https://xxx.vercel.app` URL.
2.  **Proxying**: Next.js "Rewrites" all `/api` calls to your AWS IP.
3.  **Security**: The browser sees a secure HTTPS connection, but the data flows to your AWS backend on the back-channel.

---

## 🗄️ Database Options
The backend supports two database modes via the `.env` file:
1.  **SQLite (Easiest)**: Zero setup, stores data in a `db.sqlite3` file. Best for quick demos.
2.  **PostgreSQL (Production)**: Requires installing `postgresql` on the EC2 or using AWS RDS.

**For your first deployment, use SQLite to get up and running quickly.**

---

## 🎨 Phase 1: AWS Backend Setup (Amazon Linux 2023)

### 1. Instance Configuration
- Your IP: **13.203.161.151**
- Open Port **8000** in your AWS Security Group.

### 2. Install Dependencies (AL2023)
```bash
sudo dnf update -y
sudo dnf install python3.11 python3.11-pip python3.11-devel git -y
```

### 3. Clone and Setup
```bash
git clone https://github.com/santoshi004/Backend backend_app
cd backend_app
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

## ⚡ Phase 2: Vercel Frontend Setup

### 1. Environment Variables
In the Vercel Dashboard, add these two variables:
- `NEXT_PUBLIC_API_URL`: `/api` (This tells the app to use the proxy).
- `AWS_BACKEND_URL`: `http://[YOUR_AWS_IP]:8000` (e.g., `http://13.233.4.5:8000`).

### 2. Deploy
- Vercel will build your app.
- Because of our `next.config.ts` update, any call to `/api/xxx` will be automatically forwarded to your AWS IP by Vercel.

---

## ✅ Why this is better?
- **Zero Cost**: No need to buy a `.com` domain.
- **Instant HTTPS**: Vercel handles the SSL certificate automatically.
- **Voice/Push Active**: All secure browser features work because the origin is HTTPS.

🦅🛡️🔥🏆

🦅🛡️🔥🏆
