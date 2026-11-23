export type TemperatureScale = 'Celsius' | 'Fahrenheit' | 'Kelvin';

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Reading {
  id?: number;
  reading_number: number;
  temperature: number;
  unit: string;
  scale: TemperatureScale;
  kelvin: number;
  validation_status: 'Valid Temperature' | 'Invalid Temperature' | string;
  is_valid: boolean;
  interval_seconds: number;
  timestamp: string;
}

export interface SimulationStatusResponse {
  is_running: boolean;
  scale?: TemperatureScale;
  interval?: number;
  latest_reading: Reading | null;
  reading_number: number;
  message?: string;
  recent_history?: Reading[];
  total_readings?: number;
}

export interface StudentDailyRoutine {
  date: string;
  username: string;
  student_id: number;
  total_today: number;
  valid_today: number;
  invalid_today: number;
  valid_ratio: number;
  latest_timestamp: string | null;
  privacy_status: string;
}
