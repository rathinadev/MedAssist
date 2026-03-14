# Bible Module: Predictive Analytics & ML Internals

This is the deep-dive for students working on the Machine Learning and predictive aspects of the system.

## 1. Feature Engineering: Turning Logs into Numbers
A Machine Learning model cannot read a "Taken" status. We must use **Feature Extraction**.

**Code Reference**: `backend/predictions/services/ml_service.py` -> `_extract_features()`

### The 16 Data Points (The ML Vector):
For every medication a patient takes, we calculate:
1.  **avg_delay**: The average minutes between "Should have taken" and "Did take".
2.  **miss_rate**: `doses_missed / total_doses`.
3.  **late_rate**: `doses_late / total_doses`.
4.  **consecutive_misses**: The highest number of doses missed in a row (indicator of fatigue).
5.  **total_logs**: The sample size (how much do we know about this patient?).
6.  **day_pattern_0 to 6**: Adherence rate for each day of the week (Mon-Sun).
7.  **time_pattern_morning/afternoon/evening/night**: Adherence rate for different times of day.

---

## 2. Risk Level logic (The "Answer")
The model doesn't just "guess." We define **Ground Truth** during training.

**How we define "High Risk" during training**:
- If `miss_rate >= 0.4` (40% of doses missed) -> Risk is categorized as **High**.
- If `miss_rate >= 0.15` -> Risk is categorized as **Medium**.
- Otherwise -> Risk is categorized as **Low**.

The model (Random Forest) learns these patterns so it can predict them for the *next* dose before it even happens.

---

## 3. The Lifecycle of a Prediction
1. **Trigger**: A caretaker views the Patient Detail page.
2. **Processing**:
   - The backend pulls all `AdherenceLog` data for that patient.
   - It runs the `_extract_features` function to get the 16 numbers.
3. **Execution**:
   - The **Classifier** model runs and outputs a string: `"high"`, `"medium"`, or `"low"`.
   - The **Regressor** model runs and outputs an integer: e.g., `45` (predicted minutes late).
4. **Output**: These two values are sent to the frontend to highlight the patient's card in **Red** or **Yellow**.

---

## 4. Why Random Forest?
We chose Random Forest over simpler models (like Linear Regression) because patient behavior is **non-linear**. 
- *Scenario*: A patient might be perfect on weekdays but terrible on Sundays. Or they might be perfect for 20 days and then miss 5 in a row. 
- Random Forest is an "Ensemble" method—it uses 100 different decision trees to "vote" on the risk, making it much more resilient to outliers.

---
### Technical Takeaway for Students:
- The ML is only as good as the logs. If the patient doesn't log their meds, the `total_logs` feature is low, and the system falls back to safe "Rule-Based" logic.
