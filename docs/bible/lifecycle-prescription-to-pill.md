# Bible Module: Lifecycle of a Prescription (Code Trace)

How does a physical piece of paper become a digital medication schedule? This document traces the code execution step-by-step across the entire stack.

## Phase 1: The Capture (Frontend)
**Source**: `frontend/src/components/shared/prescription-scanner.tsx`

1. **User Action**: The Caretaker selects an image and clicks "Scan".
2. **Data Packaging**: The frontend creates a `FormData` object containing the image file and the `patient_id`.
3. **API Call**: `api.post("/prescriptions/scan/", formData)` sends the request to the Django backend.

---

## Phase 2: The Logic (Backend)
**Source**: `backend/prescriptions/views.py` -> `PrescriptionScanView`

1. **Authentication Check**: The `permission_classes` verify the user is logged in.
2. **Validation**: `PrescriptionScanSerializer` ensures the image is valid and the `patient_id` exists.
3. **Intelligence Engine Call**: The view calls `extract_prescription_data(image)`.

---

## Phase 3: The AI Engine (Backend Services)
**Source**: `backend/prescriptions/services/ocr_service.py`

1. **Azure OCR**: The system sends the image to **Azure Form Recognizer**. 
   - *Result*: A massive blob of unstructured text (every word found on the paper).
2. **Gemini Refinement**: The system sends that raw text to **Google Gemini** with a specific medical prompt.
   - *Instruction*: "Extract structured JSON with name, dosage, and frequency."
   - *Result*: A clean JSON object: `{"medications": [{"name": "Amoxicillin", ...}]}`.

---

## Phase 4: The Verification (Full Cycle)
**Source**: `frontend/src/app/(dashboard)/caretaker/scan/page.tsx`

1. **Review State**: The backend returns the JSON to the frontend.
2. **UI Mapping**: The frontend displays a list of cards where the caretaker can edit the results (in case the AI made a mistake).
3. **Final Save**: When the caretaker clicks "Save All Medications", the frontend calls `api.post("/medications/", medData)`.

---

## Phase 5: The Schedule (Persistence)
**Source**: `backend/medications/serializers.py` -> `MedicationCreateUpdateSerializer`

1. **DB Record**: The `Medication` is saved to the PostgreSQL table.
2. **Schedule Generation**: The user now sees these medications in their Dashboard. 
   - **Crucial**: No `TodaySchedule` objects are saved in the DB. Instead, the `TodayScheduleView` (in the `adherence` module) looks at the `Medication.timings` list and *dynamically* builds the daily list every time the app is opened.

---
### Technical Takeaway for Students:
- **Pixels** (Image) -> **Text** (Azure) -> **JSON** (Gemini) -> **Verification** (Frontend) -> **Database** (Django) -> **Schedule** (Logic).
