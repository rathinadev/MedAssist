# MedAssist - AI-Powered Medication Adherence System

## Overview

System to help elderly patients adhere to medication schedules. Two roles: **Caretaker** (manages patients, reviews adherence) and **Patient** (takes medications, logs intake, scans prescriptions).

## Repo Structure

```
savitha/                          ← monorepo (rathinadev/-MedAssist.git)
├── backend/                      ← Django REST API (santoshi004/Backend)
├── frontend/                     ← Next.js web app (ramyaS1205/Front-end)
├── mobile-app/                   ← Kotlin Android app (Savita-debug/mobile-app.git)
├── api-spec.md                   ← shared API contract
└── CLAUDE.md                     ← this file
```

Each subdirectory is a git submodule pointing to a student's repo.

## Tech Stack

| Component | Tech |
|---|---|
| Backend | Django 5 + DRF + PostgreSQL |
| Auth | JWT (simplejwt) - access + refresh tokens |
| OCR | Azure Form Recognizer |
| ML | scikit-learn (inside Django) |
| Frontend | Next.js 14 + TypeScript + Tailwind + shadcn/ui |
| Mobile | Kotlin + Jetpack Compose + Retrofit + Room |
| Notifications | Polling + local Android alarms |

## Running Each Service

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

### Mobile
Open `mobile-app/` in Android Studio and run on emulator/device.

## Commit Convention

Format: `type: short description`

Types: `feat`, `fix`, `refactor`, `docs`, `chore`

Examples:
- `feat: add medication CRUD endpoints`
- `fix: jwt refresh token expiry handling`
- `docs: add API usage examples to README`

No co-authored-by lines. Frequent small commits after each logical unit.

## API Contract

See `api-spec.md` for the full API specification. All 3 repos build against this contract.
