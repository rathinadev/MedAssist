# MedAssist API Specification

Base URL: `http://localhost:8000/api`

All endpoints return JSON. Auth endpoints are public; all others require `Authorization: Bearer <access_token>` header.

---

## Data Models

### User
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "caretaker",  // "caretaker" | "patient"
  "created_at": "2026-02-18T10:00:00Z"
}
```

### PatientProfile
```json
{
  "id": 1,
  "user": 2,
  "age": 72,
  "medical_conditions": "Diabetes, Hypertension",
  "caretaker": 1,
  "created_at": "2026-02-18T10:00:00Z"
}
```

### Medication
```json
{
  "id": 1,
  "name": "Metformin",
  "dosage": "500mg",
  "frequency": "twice_daily",  // "once_daily" | "twice_daily" | "thrice_daily" | "custom"
  "timings": ["08:00", "20:00"],
  "instructions": "Take after meals",
  "patient": 2,
  "created_by": 1,
  "is_active": true,
  "created_at": "2026-02-18T10:00:00Z"
}
```

### Prescription
```json
{
  "id": 1,
  "image": "http://localhost:8000/media/prescriptions/rx001.jpg",
  "extracted_data": {
    "medications": [
      {"name": "Metformin", "dosage": "500mg", "frequency": "twice daily"},
      {"name": "Amlodipine", "dosage": "5mg", "frequency": "once daily"}
    ],
    "doctor_name": "Dr. Smith",
    "date": "2026-02-15"
  },
  "uploaded_by": 1,
  "patient": 2,
  "created_at": "2026-02-18T10:00:00Z"
}
```

### AdherenceLog
```json
{
  "id": 1,
  "medication": 1,
  "patient": 2,
  "scheduled_time": "2026-02-18T08:00:00Z",
  "taken_time": "2026-02-18T08:15:00Z",  // null if missed
  "status": "late",  // "taken" | "missed" | "late"
  "created_at": "2026-02-18T08:15:00Z"
}
```

### Prediction
```json
{
  "id": 1,
  "patient": 2,
  "medication": 1,
  "predicted_delay_minutes": 25,
  "risk_level": "medium",  // "low" | "medium" | "high"
  "message": "Patient tends to take evening medication 25 minutes late",
  "generated_at": "2026-02-18T10:00:00Z"
}
```

---

## Endpoints

### Authentication

#### POST /api/auth/register/
Register a new user.
```
Request:
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "caretaker"
}

Response (201):
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "caretaker",
  "tokens": {
    "access": "eyJ...",
    "refresh": "eyJ..."
  }
}
```

#### POST /api/auth/login/
```
Request:
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response (200):
{
  "user": { "id": 1, "email": "...", "name": "...", "role": "..." },
  "tokens": {
    "access": "eyJ...",
    "refresh": "eyJ..."
  }
}
```

#### POST /api/auth/refresh/
```
Request:
{ "refresh": "eyJ..." }

Response (200):
{ "access": "eyJ..." }
```

#### GET /api/auth/me/
Get current user profile.
```
Response (200):
{ "id": 1, "email": "...", "name": "...", "phone": "...", "role": "..." }
```

---

### Patients

#### GET /api/patients/
- Caretaker: returns their linked patients
- Patient: returns own profile
```
Response (200):
[
  {
    "id": 1,
    "user": { "id": 2, "name": "Jane Doe", "email": "..." },
    "age": 72,
    "medical_conditions": "Diabetes",
    "adherence_rate": 85.5,
    "caretaker": 1
  }
]
```

#### POST /api/patients/
Caretaker links/creates a patient profile.
```
Request:
{
  "user_email": "patient@example.com",
  "age": 72,
  "medical_conditions": "Diabetes, Hypertension"
}

Response (201): { ...patient object }
```

#### GET /api/patients/:id/
Get patient detail with recent adherence summary.

---

### Medications

#### GET /api/medications/?patient_id=2
List medications. Filtered by patient.

#### POST /api/medications/
```
Request:
{
  "name": "Metformin",
  "dosage": "500mg",
  "frequency": "twice_daily",
  "timings": ["08:00", "20:00"],
  "instructions": "Take after meals",
  "patient": 2
}
```

#### PUT /api/medications/:id/
Update medication.

#### DELETE /api/medications/:id/
Deactivate medication (soft delete, sets `is_active: false`).

---

### Prescriptions

#### POST /api/prescriptions/scan/
Upload prescription image for OCR.
```
Request: multipart/form-data
  - image: (file)
  - patient_id: 2

Response (200):
{
  "id": 1,
  "extracted_data": {
    "medications": [...],
    "doctor_name": "...",
    "date": "..."
  },
  "image": "http://..."
}
```

#### GET /api/prescriptions/?patient_id=2
List prescriptions for a patient.

---

### Adherence

#### POST /api/adherence/log/
Patient logs medication intake.
```
Request:
{
  "medication": 1,
  "status": "taken",
  "taken_time": "2026-02-18T08:15:00Z"
}
```

#### GET /api/adherence/history/?patient_id=2&from=2026-02-01&to=2026-02-18
```
Response (200):
{
  "logs": [ ...adherence log objects ],
  "total": 50,
  "taken": 40,
  "missed": 5,
  "late": 5
}
```

#### GET /api/adherence/stats/?patient_id=2
```
Response (200):
{
  "adherence_rate": 85.5,
  "current_streak": 3,
  "best_streak": 12,
  "total_taken": 140,
  "total_missed": 15,
  "total_late": 10,
  "most_missed_medication": "Amlodipine",
  "best_time_slot": "morning"
}
```

---

### Schedule

#### GET /api/schedule/today/
Get today's medication schedule for the authenticated patient.
```
Response (200):
{
  "date": "2026-02-18",
  "medications": [
    {
      "medication": { "id": 1, "name": "Metformin", "dosage": "500mg" },
      "scheduled_time": "08:00",
      "status": "taken",
      "taken_time": "08:10"
    },
    {
      "medication": { "id": 2, "name": "Amlodipine", "dosage": "5mg" },
      "scheduled_time": "09:00",
      "status": "pending",
      "taken_time": null
    }
  ]
}
```

---

### Predictions

#### GET /api/predictions/:patient_id/
Get ML predictions for a patient.
```
Response (200):
{
  "patient_id": 2,
  "predictions": [
    {
      "medication": { "id": 1, "name": "Metformin" },
      "predicted_delay_minutes": 25,
      "risk_level": "medium",
      "message": "Patient tends to take evening medication 25 minutes late"
    }
  ],
  "overall_risk": "medium",
  "generated_at": "2026-02-18T10:00:00Z"
}
```

#### POST /api/predictions/generate/
Trigger model re-run for a patient.
```
Request:
{ "patient_id": 2 }

Response (200):
{ "status": "success", "predictions": [...] }
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Short error code",
  "message": "Human readable description",
  "details": {}  // optional field-level errors
}
```

Common status codes:
- `400` - Bad request / validation error
- `401` - Unauthorized (missing/expired token)
- `403` - Forbidden (wrong role)
- `404` - Not found
- `500` - Server error
