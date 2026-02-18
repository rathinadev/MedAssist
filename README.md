# MedAssist Backend

AI-Powered Medication Adherence System - Django REST API backend.

## Tech Stack

- **Framework:** Django 5 + Django REST Framework
- **Database:** PostgreSQL (SQLite fallback for development)
- **Authentication:** JWT via djangorestframework-simplejwt
- **ML:** scikit-learn (RandomForest for risk prediction)
- **OCR:** Azure Form Recognizer (with mock fallback)
- **CORS:** django-cors-headers

## Setup

### Prerequisites

- Python 3.10+
- PostgreSQL (optional, SQLite works for development)

### Installation

```bash
# Clone and navigate
cd backend/

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Create database (if using PostgreSQL)
createdb medassist

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Seed demo data
python manage.py seed_demo_data

# Run development server
python manage.py runserver
```

### Demo Credentials

After running `seed_demo_data`:

| Role      | Email                        | Password       |
|-----------|------------------------------|----------------|
| Caretaker | dr.smith@medassist.com       | MedAssist2026! |
| Caretaker | dr.patel@medassist.com       | MedAssist2026! |
| Patient   | john.doe@example.com         | MedAssist2026! |
| Patient   | mary.johnson@example.com     | MedAssist2026! |
| Patient   | james.wilson@example.com     | MedAssist2026! |
| Patient   | sarah.brown@example.com      | MedAssist2026! |
| Patient   | david.lee@example.com        | MedAssist2026! |

## API Overview

Base URL: `http://localhost:8000/api/`

### Authentication (`/api/auth/`)

| Method | Endpoint          | Description              | Auth |
|--------|-------------------|--------------------------|------|
| POST   | `/auth/register/` | Register new user        | No   |
| POST   | `/auth/login/`    | Login, get JWT tokens    | No   |
| POST   | `/auth/refresh/`  | Refresh access token     | No   |
| GET    | `/auth/me/`       | Get current user profile | Yes  |

### Patients (`/api/patients/`)

| Method | Endpoint          | Description                    | Auth       |
|--------|-------------------|--------------------------------|------------|
| GET    | `/patients/`      | List patients                  | Yes        |
| POST   | `/patients/`      | Create patient profile         | Caretaker  |
| GET    | `/patients/{id}/` | Get patient profile detail     | Yes        |
| PUT    | `/patients/{id}/` | Update patient profile         | Yes        |
| DELETE | `/patients/{id}/` | Delete patient profile         | Caretaker  |

### Medications (`/api/medications/`)

| Method | Endpoint              | Description               | Auth       |
|--------|-----------------------|---------------------------|------------|
| GET    | `/medications/`       | List medications          | Yes        |
| POST   | `/medications/`       | Create medication         | Caretaker  |
| GET    | `/medications/{id}/`  | Get medication detail     | Yes        |
| PUT    | `/medications/{id}/`  | Update medication         | Caretaker  |
| DELETE | `/medications/{id}/`  | Soft-delete medication    | Caretaker  |

### Adherence (`/api/adherence/`)

| Method | Endpoint              | Description                          | Auth |
|--------|-----------------------|--------------------------------------|------|
| POST   | `/adherence/log/`     | Log medication intake                | Yes  |
| GET    | `/adherence/history/` | Get adherence history (date filters) | Yes  |
| GET    | `/adherence/stats/`   | Get adherence statistics & streaks   | Yes  |
| GET    | `/schedule/today/`    | Get today's medication schedule      | Yes  |

### Prescriptions (`/api/prescriptions/`)

| Method | Endpoint                 | Description                     | Auth |
|--------|--------------------------|---------------------------------|------|
| POST   | `/prescriptions/scan/`   | Upload & OCR scan prescription  | Yes  |
| GET    | `/prescriptions/`        | List prescriptions              | Yes  |
| GET    | `/prescriptions/{id}/`   | Get prescription detail         | Yes  |
| DELETE | `/prescriptions/{id}/`   | Delete prescription             | Yes  |

### Predictions (`/api/predictions/`)

| Method | Endpoint                       | Description                         | Auth |
|--------|--------------------------------|-------------------------------------|------|
| GET    | `/predictions/{patient_id}/`   | Get predictions for a patient       | Yes  |
| POST   | `/predictions/generate/`       | Train model & generate predictions  | Yes  |

## Management Commands

```bash
# Seed demo data
python manage.py seed_demo_data
python manage.py seed_demo_data --clear  # Clear first

# Generate synthetic ML training data
python manage.py generate_training_data
python manage.py generate_training_data --patients 20 --days 60
python manage.py generate_training_data --clear
```

## Project Structure

```
backend/
  manage.py
  medassist_backend/     # Project config (settings, urls, wsgi)
  accounts/              # Custom User model, auth endpoints
  medications/           # PatientProfile, Medication CRUD
  adherence/             # AdherenceLog, schedule, stats
  prescriptions/         # Prescription OCR scanning
  predictions/           # ML risk prediction
  ml_models/             # Trained ML model files (auto-generated)
  media/                 # Uploaded files
  requirements.txt
  .env.example
```
