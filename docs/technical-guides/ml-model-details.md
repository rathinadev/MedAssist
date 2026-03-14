# Technical Guide: ML Model Details

This document provides a technical deep-dive into the predictive analytics engine.

## 1. Machine Learning Architecture
MedAssist utilizes **Random Forest** models (via `scikit-learn`) to predict behavioral risks.

- **Classifier**: Categorizes patient risk as `low`, `medium`, or `high`.
- **Regressor**: Predicts the specific delay in minutes for the next dose.

## 2. Feature Vector (The 16 Inputs)
For every prediction, the system transforms adherence history into a 16-dimensional vector:

| Feature | Description |
| :--- | :--- |
| `miss_rate` | Ratio of missed doses to total scheduled. |
| `avg_delay` | Mean delay in minutes for all 'Taken' or 'Late' doses. |
| `consecutive_misses`| Maximum number of consecutive 'Missed' statuses. |
| `day_pattern_0-6` | Adherence rate per specific day of the week (7 features). |
| `time_pattern_*` | Adherence rate for Morning, Afternoon, Evening, and Night (4 features). |

## 3. Training & Inference Flow
**Source**: `backend/predictions/services/ml_service.py`

1. **Training**: The system uses `RandomForestClassifier(n_estimators=100)`. It learns by comparing feature vectors against historical outcomes.
2. **Inference**: When a dashboard is loaded, the current features are passed through the pre-trained `risk_classifier.pkl` and `delay_regressor.pkl` files.
3. **Fallback Logic**: If a patient has fewer than 5 data points, a rule-based engine is used (e.g., `Risk = High` if `miss_rate > 0.4`).

## 4. Model Selection Rationale
Random Forest was selected due to its excellence with non-linear tabular data and its resistance to overfitting. It allows the system to detect subtle patterns, such as "Patient is reliable on weekdays but misses doses on Sunday nights."
