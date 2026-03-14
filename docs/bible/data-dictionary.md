# MedAssist Technical Bible: The Data Dictionary

This document provides a field-level mapping of every significant data point in the system. If you are a student wondering "Where does this button's value go?", this is your reference.

## 1. User & Authentication Identity
**Source**: `frontend/src/app/(auth)/register` or `mobile-app/.../RegisterFragment`

| Frontend Field | Backend Model (`User`) | Type | Purpose |
| :--- | :--- | :--- | :--- |
| `name` | `name` | String | Display name for dashboards. |
| `email` | `email` | String (Unique) | Primary login identifier. |
| `password` | `password` | Hash (Argon2) | Securely stored using Django's `set_password`. |
| `role` | `role` | Choice | `caretaker` (manager) or `patient` (end-user). |
| `phone` | `phone` | String | Used for future notification integrations. |

---

## 2. Medication Discovery (OCR)
**Flow**: Image -> Azure -> Gemini -> UI Review -> Database

| Raw Extraction (Azure/Gemini) | Django Model (`Medication`) | UI Element | Logic / Transformation |
| :--- | :--- | :--- | :--- |
| `name` | `name` | Text Heading | The literal name of the drug. |
| `dosage` | `dosage` | Subtext | e.g., "500mg". Parsed from the line. |
| `frequency` | `frequency` | Dropdown | Mapped to `once_daily`, `twice_daily`, etc. |
| N/A | `timings` | Time Pickers | A JSON list of hours (e.g., `["08:00"]`). |
| `doctor_name` | `Prescription.doctor_name` | Info Card | Stored in the prescription log, not the med itself. |

---

## 3. Adherence Tracking (The Daily Loop)
**Source**: Patient clicks "Take" on Web/Mobile.

| Interaction | Logic / Change | Target Backend Field | Resulting State |
| :--- | :--- | :--- | :--- |
| Click "Take" | Records the current timestamp. | `AdherenceLog.taken_time` | Changes `status` to `taken`. |
| Click "Take" (Late) | Backend compares `taken_time` vs `scheduled_time`. | `AdherenceLog.status` | Set to `late` if delta > 60 mins. |
| Time Passes | Background query checks elapsed time. | `AdherenceLog.status` | Set to `missed` if time > scheduled + 4 hrs. |

---

## 4. Derived Intelligence (Calculated Fields)
These fields do **not** exist in the database; they are calculated "on-the-fly" by the Backend Serializers.

### Adherence Rate
- **Calculation Location**: `backend/medications/serializers.py` -> `get_adherence_rate()`
- **Logic**: `(Count of 'taken' + Count of 'late') / (Total scheduled logs) * 100`.

### Streak (Current/Longest)
- **Calculation Location**: `backend/adherence/views.py` -> `AdherenceStatsView`
- **Logic**: 
    1. Group logs by Date.
    2. A date is "Healthy" ONLY if all meds for that day are `taken`.
    3. The algorithm counts consecutive "Healthy" dates.

---

## 5. ML Predictive Features
Every time a caretaker views a patient, the system transforms logs into these 16 features:

| Feature | Code Variable | Logic |
| :--- | :--- | :--- |
| **Miss Rate** | `miss_rate` | `missed_doses / total_doses` (Float 0.0 to 1.0) |
| **Punctuality** | `avg_delay` | Average minutes between `scheduled` and `taken`. |
| **Reliability** | `consecutive_misses` | The longest string of 'missed' status logs. |
| **Temporal** | `day_pattern_0-6` | Adherence performance specific to Monday, Tuesday, etc. |

---
*This dictionary ensures that any student can trace data from the moment it is typed to the moment it influences an AI prediction.*
