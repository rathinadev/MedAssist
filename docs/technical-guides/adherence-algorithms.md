# Technical Guide: Adherence & Streak Algorithms (Exhaustive)

This document explains the deep numerical logic used to calculate patient health metrics in MedAssist.

---

## 1. The Adherence Score Logic (Refined Time-Decay)
**Reference**: `backend/adherence/utils/rates.py` -> `calculate_adherence_rate()`

Adherence in MedAssist isn't just binary; it uses a **Continuous Decay Function** to represent the clinical impact of late doses.

### The Math (Linear Decay Formula):
1. **Dose Credit**:
    - **Penalty Calculation**: `penalty = hours_late * 0.1` (10% credit drop per hour delay).
    - **Score Calculation**: `score = max(0.4, 1.0 - penalty)`.
    - **Result**: Taking a medication 1 hour late yields **90% credit**; taking it 4+ hours late yields a floor of **40% credit** (clinical value of actually taking the drug).
2. **Cumulative Rate**: `(Sum of Scores / Total Expected Doses) * 100`.

---

## 6. Audible Reminder System (Zero-Cost Architecture)
**Reference**: `frontend/sw.js` (Web) & `RemoteAlertWorker.kt` (Mobile)

To ensure maximum accessibility without recurring cloud costs (e.g., Google Cloud TTS), MedAssist uses **Local Speech Engines**.

### Multi-Platform Implementation:
- **Desktop (Web Speech API)**: Uses `window.speechSynthesis`. When a background Service Worker receives a VAPID push message, it transmits a `SPEAK_REMINDER` signal to the dashboard.
- **Mobile (Android TTS)**: Uses `android.speech.tts.TextToSpeech`. The background `RemoteAlertWorker` polls the adherence endpoint and triggers the local Android engine directly, even when the app is closed.

---

*Developer Note: This ensures "slightly late" and "very late" have different impacts on the patient's score, encouraging punctuality while rewarding compliance.*

---

## 2. The Streak Algorithm (The "Perfect Day" logic)
**Reference**: `backend/adherence/views.py` -> `AdherenceStatsView.get`

A streak is NOT based on individual doses, but on **Perfect Days**. 

### Step 1: Normalization and Validation
The code creates a dictionary where each key is a unique **Date**:
```python
dates_with_logs = {}
for log in logs:
    date_key = log.scheduled_time.date()
    # Initialize as True (Perfect)
    if date_key not in dates_with_logs:
        dates_with_logs[date_key] = True
    # Invalidation: If ANY dose on this date was missed or late
    if log.status != 'taken':
        dates_with_logs[date_key] = False
```

### Step 2: Historical Peak (Longest Streak)
We iterate through the sorted list of dates:
- If a date is `True`, `temp_streak` increases by 1.
- `longest_streak` is updated using `max(longest_streak, temp_streak)`.
- If a date is `False`, `temp_streak` resets to 0.

### Step 3: Predictive Persistence (Current Streak)
We iterate **backwards** from the latest logged date:
- Count consecutive `True` dates.
- Stop immediately when a `False` date or a "Gap" (a day with no logs) is found.

---

## 3. Dynamic Schedule Generator
**Reference**: `backend/adherence/views.py` -> `TodayScheduleView`

MedAssist does not store a "Tomorrow" schedule. It builds it on-the-fly when requested.

1. **Timings Pull**: Pulls the `timings` list (e.g., `["08:00", "22:00"]`) from the active `Medication` records.
2. **Construction**: For "Today," it combines the Date with each Timing string to create a `scheduled_dt`.
3. **Matching**: It performs a filtered query on `AdherenceLog` for today's date and links the logs to the generated times.
4. **Defaulting**: If no log exists for a specific timing, it defaults the status to `pending` in the JSON response.

---

## 4. State Transitions & Edge Cases
| Status | Time Logic | Description |
| :--- | :--- | :--- |
| `pending` | `Now < ScheduledTime` | Medication is due in the future. |
| `taken` | `Within 60 mins` | Recorded as a successful on-time intake. |
| `late` | `> 60 mins after` | Patient forgot but took it eventually. Resets daily streak. |
| `missed` | `> 4 hours after` | Dose completely skipped. Triggers high-risk flag. |

---
## 5. AI Laboratory: Hybrid Intelligence Engine
**Reference**: `backend/predictions/services/ml_service.py` -> `_rule_based_prediction` & `views.py`

In the AI Lab, we utilize a **Hybrid Intelligence** approach to compensate for small datasets during demonstration. 

### The Feature Vector (17 Features):
The AI model processes a 17-dimensional vector for every patient-medication pair:
- **Baseline Metrics**: Hour of day, Day of week, Medication type.
- **Behavioral Metrics**: Consecutive misses (count), Miss Rate (float).
- **The 17th Feature**: `weighted_adherence` (calculated via the Time-Decay formula).

### Hybrid Decision Logic:
To ensure the demo remains sensitive to high-risk behavior even when the Random Forest is "conservative," we use the following hierarchy:
1. **Clinical Engine (First Pass)**: Checks if `weighted_adherence < 45%` or `consecutive_misses >= 4`. If so, flags **HIGH RISK** immediately as a safety net.
2. **ML Random Forest (Second Pass)**: Analyzes historical patterns. If the ML model detects a risk level *higher* than the clinical rules, it overwrites the classification to trust the AI's pattern recognition.

---

### Technical Summary for Student Presenters:
> "Our system uses a **Hybrid Intelligence** architecture. We don't just 'blindly' trust an ML model trained on limited data. Instead, we use a Clinical Ruleset as a deterministic ground-truth, which is then augmented by a **17-feature Random Forest** that learns to identify abandonment patterns before they become critical."
