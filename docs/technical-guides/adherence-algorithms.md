# Technical Guide: Adherence Algorithms

This document details the mathematical logic for patient adherence tracking and streak calculation.

## 1. Adherence Score Calculation
**Reference**: `backend/medications/serializers.py` -> `get_adherence_rate()`

The score is calculated as a percentage of successful medication intakes.

**Logic**:
```python
score = (total_taken + total_late) / total_scheduled * 100
```
- **Inputs**: All historic `AdherenceLog` entries for the patient.
- **Criteria**: "Taken" and "Late" statuses are counted as successes. "Missed" doses are failures.

## 2. Streak Algorithm (Perfect Days)
**Reference**: `backend/adherence/views.py` -> `AdherenceStatsView`

The system tracks consecutive "Perfect Days." A day is perfect if every scheduled medication for that date has a `taken` status.

**Step-by-Step Flow**:
1. **Normalization**: Logs are grouped by their `scheduled_time` date.
2. **Daily Validation**: A date is flagged as `False` if *any* med scheduled for that day is `missed`, `late`, or still `pending`.
3. **Longest Streak**: The system iterates through the chronological list of dates and finds the longest continuous sequence of `True` (Perfect) flags.
4. **Current Streak**: The system iterates backwards from today's date, counting consecutive `True` flags until a failure or a gap is encountered.

## 3. State Transitions
| Interaction | Event | Resulting Status |
| :--- | :--- | :--- |
| Initial State | Scheduled time reached | `pending` |
| Patient logged within 60m | Intake timestamp recorded | `taken` |
| Patient logged after 60m | Intake timestamp recorded | `late` |
| Time > Scheduled + 4h | Automated check | `missed` |
