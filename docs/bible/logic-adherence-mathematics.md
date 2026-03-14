# Bible Module: Adherence Mathematics & Logic

For students handling the analytics and reporting sections, this document explains the code-level math behind streaks and adherence scores.

## 1. Defining "Adherence Score"
The "Score" you see in the UI (e.g., 94%) is not stored in any database field. It is recalculated in real-time.

**Code Reference**: `backend/medications/serializers.py` -> `get_adherence_rate()`

### The Logic:
```python
logs = AdherenceLog.objects.filter(patient=obj.user)
total = logs.count()
taken = logs.filter(status="taken").count()
late = logs.filter(status="late").count()

# Success is any dose that was consumed
score = (taken + late) / total * 100
```
- **Why?**: The system credits the patient for "Late" doses, though they are flagged differently. "Missed" doses are the only ones that penalize the score.

---

## 2. The Streak Calculation (Mastering the Algorithm)
**Code Reference**: `backend/adherence/views.py` -> `AdherenceStatsView`

This is the most complex logic in the adherence module. We calculate **Perfect Days**.

### The Flow:
1. **Initialize**: `dates_with_logs = {}`
2. **Iterate & Map**:
   - For every log in history:
     - Get the date (e.g., `2026-03-14`).
     - Default the date to `True` (Healthy).
     - **Constraint**: If *any* log on that date has `status != 'taken'`, the *entire* date is set to `False`.
3. **Sort**: Sort all dates chronologically.
4. **Calculated Longest Streak**:
    - Loop through sorted dates. Increment a counter for every `True`.
    - Record the maximum value the counter reached.
5. **Calculate Current Streak**:
    - Loop **backwards** from the most recent date. 
    - Stop as soon as you hit a `False` date or a gap in the timeline.

---

## 3. State Management transitions
Students need to understand how a medication changes its "look" on the dashboard.

| Initial State | Event | Trigger | Result |
| :--- | :--- | :--- | :--- |
| `Pending` | Time passes | Current Time > Scheduled Time | UI shows "Due" or "Missed" indicator. |
| `Pending` | Click "Take" | Frontend `POST` to `/adherence/log/` | Entry saved as `taken`, UI updates to green. |
| `Missed` | Click "Take" | Patient takes it late | Entry saved as `late`, Streak resets for that day. |

---
### Technical Takeaway for Students:
- All metrics are **derived**. The `AdherenceLog` is the only source of truth. If you want to change the score, you change the log.
