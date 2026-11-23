import { Reading, SimulationStatusResponse, StudentDailyRoutine, TemperatureScale, User } from './types';

const TOKEN_KEY = 'iot_temp_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type') || '';
  let data: any = {};
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = { error: await res.text() };
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/me');
  },

  async login(username: string, password: string): Promise<{ message: string; user: User; token: string }> {
    const res = await request<{ message: string; user: User; token: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async signup(username: string, password: string): Promise<{ message: string; user: User; token: string }> {
    const res = await request<{ message: string; user: User; token: string }>('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/api/logout', { method: 'POST' });
    } finally {
      setStoredToken(null);
    }
  },

  async startSimulation(scale: TemperatureScale, interval: number): Promise<SimulationStatusResponse> {
    return request<SimulationStatusResponse>('/api/simulation/start', {
      method: 'POST',
      body: JSON.stringify({ scale, interval }),
    });
  },

  async stopSimulation(): Promise<SimulationStatusResponse> {
    return request<SimulationStatusResponse>('/api/simulation/stop', {
      method: 'POST',
    });
  },

  async getSimulationStatus(): Promise<SimulationStatusResponse> {
    return request<SimulationStatusResponse>('/api/simulation/status');
  },

  async getHistory(): Promise<{ history: Reading[]; total: number; username: string }> {
    return request<{ history: Reading[]; total: number; username: string }>('/api/history');
  },

  async getPythonCode(): Promise<{ code: string; filename: string }> {
    return request<{ code: string; filename: string }>('/api/python-code');
  },

  async clearHistory(): Promise<{ message: string; total: number }> {
    return request<{ message: string; total: number }>('/api/history', {
      method: 'DELETE',
    });
  },

  async resetDashboard(): Promise<{ message: string; is_running: boolean; latest_reading: null }> {
    return request<{ message: string; is_running: boolean; latest_reading: null }>('/api/dashboard/reset', {
      method: 'POST',
    });
  },

  async getDailyRoutine(): Promise<StudentDailyRoutine> {
    return request<StudentDailyRoutine>('/api/student/daily-routine');
  },
};
