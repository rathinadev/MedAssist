export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: "caretaker" | "patient";
}

export interface Tokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: Tokens;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: "caretaker" | "patient";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PatientProfile {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  age: number;
  medical_conditions: string;
  adherence_rate: number | null;
  caretaker: number | null;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  timings: string[];
  instructions: string;
  patient: number;
  is_active: boolean;
}

export interface MedicationInput {
  name: string;
  dosage: string;
  frequency: string;
  timings: string[];
  instructions: string;
  patient: number;
}

export interface Prescription {
  id: number;
  extracted_data: {
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      timings: string[];
      instructions: string;
    }>;
    doctor_name: string;
    date: string;
  };
  image: string;
}

export interface AdherenceLog {
  id: number;
  medication: number;
  medication_name?: string;
  status: "taken" | "missed" | "late";
  taken_time: string;
  scheduled_time?: string;
  date?: string;
}

export interface AdherenceHistory {
  logs: AdherenceLog[];
  summary: {
    total: number;
    taken: number;
    missed: number;
    late: number;
  };
}

export interface AdherenceStats {
  adherence_rate: number;
  current_streak: number;
  best_streak: number;
  total_taken: number;
  total_missed: number;
  total_late: number;
  most_missed_medication: string | null;
  best_time_slot: string | null;
}

export interface ScheduleItem {
  medication: {
    id: number;
    name: string;
    dosage: string;
  };
  scheduled_time: string;
  status: "pending" | "taken" | "missed" | "late";
  taken_time: string | null;
}

export interface TodaySchedule {
  date: string;
  medications: ScheduleItem[];
}

export interface Prediction {
  medication: {
    id: number;
    name: string;
  };
  predicted_delay_minutes: number;
  risk_level: "low" | "medium" | "high";
  message: string;
}

export interface PredictionResponse {
  patient_id: number;
  predictions: Prediction[];
  overall_risk: "low" | "medium" | "high";
}
