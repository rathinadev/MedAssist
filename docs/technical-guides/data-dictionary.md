# Technical Guide: Data Dictionary

This document provides a field-level mapping of every significant data point in the system.

## 1. User & Authentication Identity
**Source**: `frontend/src/app/(auth)/register` or `mobile-app`

| Frontend Field | Backend Model (`User`) | Type | Purpose |
| :--- | :--- | :--- | :--- |
| `name` | `name` | String | Display name for dashboards. |
| `email` | `email` | String (Unique) | Primary login identifier. |
| `password` | `password` | Hash (Argon2) | Securely stored using Django's `set_password`. |
| `role` | `role` | Choice | `caretaker` or `patient`. |

---

## 2. Medication Discovery (OCR)
**Flow**: Image -> Azure -> Gemini -> UI Review -> Database

| Raw Extraction (Azure/Gemini) | Django Model (`Medication`) | UI Element | Logic / Transformation |
| :--- | :--- | :--- | :--- |
| `name` | `name` | Text Heading | Literal name of the drug. |
| `dosage` | `dosage` | Subtext | Parsed from the line. |
| `frequency` | `frequency` | Dropdown | Mapped to `once_daily`, `twice_daily`, etc. |
| N/A | `timings` | Time Pickers | JSON list of hours. |

---

## 3. Adherence Tracking
| Interaction | Logic / Change | Target Backend Field | Resulting State |
| :--- | :--- | :--- | :--- |
| Click "Take" | Records timestamp. | `AdherenceLog.taken_time` | Changes `status` to `taken`. |
| Click "Take" (Late) | Compares `taken_time` vs `scheduled_time`. | `AdherenceLog.status` | Set to `late` if delta > 60 mins. |
| Time Passes | Background query. | `AdherenceLog.status` | Set to `missed` if time > scheduled + 4 hrs. |

---

## 4. Calculated Fields (Derived Metrics)
### Adherence Rate
- **Location**: `backend/medications/serializers.py`
- **Logic**: `(Count of 'taken' + Count of 'late') / (Total scheduled logs) * 100`.

### Streak (Current/Longest)
- **Location**: `backend/adherence/views.py`
- **Logic**: Calculates consecutive "Perfect Days" where every scheduled med was `taken`.

---

## 5. ML Predictive Features
| Feature | Logic |
| :--- | :--- |
| `miss_rate` | `missed_doses / total_doses`. |
| `avg_delay` | Average minutes between `scheduled` and `taken`. |
| `consecutive_misses` | Longest string of 'missed' status logs. |
