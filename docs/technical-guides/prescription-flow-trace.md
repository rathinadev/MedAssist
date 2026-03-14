# Technical Guide: Prescription Flow Trace

This document traces the code execution path for converting a physical prescription image into a digital medication schedule.

## Phase 1: Image Capture (Client Side)
**Component**: `frontend/src/components/shared/prescription-scanner.tsx`

1. **User Action**: The Caretaker uploads an image for a specific patient.
2. **Data Packaging**: The client creates a `MultiPart` form request containing the image file and `patient_id`.
3. **API Interaction**: A `POST` request is sent to `/api/prescriptions/scan/`.

## Phase 2: Processing & Extraction (Server Side)
**Component**: `backend/prescriptions/views.py` -> `PrescriptionScanView`

1. **Permissions**: The system validates that the caretaker has access to the specified patient.
2. **OCR Integration**: The backend calls `ocr_service.py` to process the image.
3. **AI Layer**: 
   - **Azure Form Recognizer**: Extracts raw text blocks from the image.
   - **Google Gemini**: Parses the raw text into structured JSON (Medication name, dosage, frequency).
4. **Persistence**: The extracted JSON is saved in the `Prescription` model's `extracted_data` field.

## Phase 3: Verification & Integration
**Component**: `frontend/src/app/(dashboard)/caretaker/scan/page.tsx`

1. **Review**: The extracted JSON is returned to the UI for caretaker validation.
2. **Refinement**: Caretakers can correct any AI extraction errors.
3. **Commitment**: Approved medications are saved via a `POST` to `/api/medications/`, creating permanent records in the `Medication` model.

## Phase 4: Dynamic Scheduling
**Component**: `backend/adherence/views.py` -> `TodayScheduleView`

The system does not store daily schedules in the database. Instead:
1. The view identifies the patient's active medications.
2. It iterates through the `timings` field (e.g., `["08:00", "20:00"]`).
3. It cross-references existing `AdherenceLog` entries to determine the status (Pending, Taken, Late, Missed) for the current date.
