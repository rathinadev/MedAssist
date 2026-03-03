# MedAssist - AI-Powered Medication Adherence System

## Problem Statement

Elderly patients frequently forget or mismanage their medication schedules, leading to health complications. Existing solutions like pill organizers and phone alarms lack intelligence, personalization, and caretaker oversight.

## Proposed Solution

An AI-powered medication adherence system with two user roles:
- **Caretaker** - Manages patients, sets medication schedules, monitors adherence, receives risk alerts
- **Patient** - Views medication schedule, logs intake, scans prescriptions, receives reminders

The system uses OCR to extract medication details from prescription images and an ML model to predict patient behavior (late doses, missed doses) and alert caretakers proactively.

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js Web   │     │  Kotlin Android │     │  Django REST    │
│   (Caretaker +  │────▶│  (Patient +     │────▶│  API Backend    │
│    Patient UI)  │     │   Caretaker UI) │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                          ┌──────────────┼──────────────┐
                                          │              │              │
                                   ┌──────▼──┐    ┌──────▼──┐   ┌──────▼──────┐
                                   │PostgreSQL│    │  Azure  │   │ scikit-learn│
                                   │    DB    │    │Form Rec.│   │  ML Model   │
                                   └─────────┘    └─────────┘   └─────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Backend | Django 5 + Django REST Framework | REST API, business logic, auth |
| Database | PostgreSQL | Relational data storage |
| Authentication | JWT (SimpleJWT) | Access + refresh token based auth |
| OCR | Azure Form Recognizer | Prescription image text extraction |
| Machine Learning | scikit-learn (RandomForest) | Adherence behavior prediction |
| Web Frontend | Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui | Caretaker & patient web dashboard |
| Mobile App | Kotlin + Jetpack Compose + Retrofit + Room | Android app with offline support |
| Notifications | AlarmManager + local notifications | Medication reminders on Android |

## Key Features

### Authentication & Authorization
- Email-based registration with role selection (Caretaker/Patient)
- JWT token authentication with auto-refresh
- Role-based access control on all endpoints

### Medication Management
- Caretaker creates/edits/deletes medications for patients
- Configurable frequency (once/twice/thrice daily or custom)
- Multiple timing slots per medication

### Prescription OCR Scanning
- Upload prescription image (camera or gallery)
- Azure Form Recognizer extracts medication names, dosages, frequency
- Review extracted data and save as medications

### Adherence Tracking
- Patient marks medications as taken from dashboard or notification
- Tracks taken/missed/late status for every scheduled dose
- Statistics: adherence rate, current streak, best streak, most missed medication
- History view with date range filtering

### ML Behavior Prediction
- 16 engineered features per patient-medication pair (avg delay, miss rate, day-of-week patterns, time-of-day patterns, consecutive misses)
- RandomForestClassifier for risk level (low/medium/high)
- RandomForestRegressor for predicted delay in minutes
- Caretaker sees risk alerts and predicted behavior on patient detail page

### Mobile Reminders
- AlarmManager schedules exact alarms for each pending medication
- Notification with "Mark as Taken" action button
- Alarms survive device reboot (BootReceiver)

### Offline Support (Mobile)
- Room database caches medications and today's schedule
- Falls back to cached data when network is unavailable
- Syncs when connectivity is restored

## Module Breakdown

| Module | Description | App |
|---|---|---|
| accounts | Custom User model, JWT auth, role-based permissions | Backend |
| medications | PatientProfile, Medication CRUD, caretaker-patient linking | Backend |
| adherence | AdherenceLog, stats, streaks, today's schedule | Backend |
| prescriptions | Prescription model, Azure OCR integration | Backend |
| predictions | ML model training, feature engineering, risk prediction | Backend |
| Auth pages | Login, register with role selection | Web + Mobile |
| Caretaker dashboard | Patient list, detail, medication management, charts | Web + Mobile |
| Patient dashboard | Today's schedule, take medication, history, scan | Web + Mobile |

## API Endpoints Summary

| Category | Endpoints | Count |
|---|---|---|
| Authentication | register, login, refresh, profile | 4 |
| Patients | list, create, detail, update, delete | 5 |
| Medications | list, create, detail, update, delete | 5 |
| Adherence | log intake, history, stats, today schedule | 4 |
| Prescriptions | scan (OCR), list, detail, delete | 4 |
| Predictions | get predictions, generate/train | 2 |
| **Total** | | **24** |

## Hardware & Software Requirements

### Development
- Python 3.11+, Node.js 18+, Android Studio
- PostgreSQL 15+
- Azure account (for Form Recognizer)

### Deployment
- Backend: Any Linux server with Python + PostgreSQL
- Frontend: Vercel / any Node.js hosting
- Mobile: Android 8.0+ (API level 26)
