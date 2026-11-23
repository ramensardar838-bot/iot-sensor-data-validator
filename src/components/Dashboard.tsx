import React, { useState, useEffect, useRef } from 'react';
import {
  Thermometer,
  Play,
  Square,
  AlertCircle,
  Clock,
  Hash,
  Activity,
  History as HistoryIcon,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { Reading, TemperatureScale, User } from '../types';
import { api } from '../api';

interface DashboardProps {
  user: User;
  onNavigateToHistory: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onNavigateToHistory,
}) => {
  const [scale, setScale] = useState<TemperatureScale>('Celsius');
  const [intervalInput, setIntervalInput] = useState<string>('2');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [latestReading, setLatestReading] = useState<Reading | null>(null);
  const [readingNumber, setReadingNumber] = useState<number>(0);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  const pollTimerRef = useRef<number | null>(null);

  // Load initial simulation status and last recorded reading from backend
  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const res = await api.getSimulationStatus();
        if (isMounted) {
          setIsSimulating(res.is_running);
          if (res.scale) setScale(res.scale);
          if (res.interval) setIntervalInput(String(res.interval));
          if (res.latest_reading) {
            setLatestReading(res.latest_reading);
            setReadingNumber(res.latest_reading.reading_number);
          }
        }
      } catch (err: any) {
        console.error('Failed to load initial data:', err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    }

    loadStatus();

    return () => {
      isMounted = false;
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  // Polling loop while simulation is running: updates telemetry 1 by 1 in real time
  useEffect(() => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    if (isSimulating) {
      const pollFreqMs = 800;
      pollTimerRef.current = window.setInterval(async () => {
        try {
          const res = await api.getSimulationStatus();
          if (res.is_running) {
            if (res.latest_reading) {
              setLatestReading(res.latest_reading);
              setReadingNumber(res.latest_reading.reading_number);
            }
          } else {
            setIsSimulating(false);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, pollFreqMs);
    }

    return () => {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [isSimulating]);

  // Mandatory Single Simulation ON/OFF toggle button handler
  const handleToggleSimulation = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isSimulating) {
      // Current is ON -> click to turn OFF
      setLoadingAction(true);
      try {
        const res = await api.stopSimulation();
        setIsSimulating(false);
        if (res.latest_reading) {
          setLatestReading(res.latest_reading);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to stop simulation.');
      } finally {
        setLoadingAction(false);
      }
    } else {
      // Current is OFF -> click to turn ON
      const trimmedInterval = intervalInput.trim();
      if (!trimmedInterval) {
        setErrorMessage('Time interval cannot be empty. Please enter a positive number of seconds.');
        return;
      }

      const parsedInterval = parseFloat(trimmedInterval);
      if (isNaN(parsedInterval) || !isFinite(parsedInterval)) {
        setErrorMessage('Invalid time interval. Please enter a valid number.');
        return;
      }

      if (parsedInterval <= 0) {
        setErrorMessage('Time interval must be a positive value greater than zero.');
        return;
      }

      setLoadingAction(true);
      try {
        const res = await api.startSimulation(scale, parsedInterval);
        setIsSimulating(true);
        if (res.latest_reading) {
          setLatestReading(res.latest_reading);
          setReadingNumber(res.latest_reading.reading_number);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to start simulation.');
      } finally {
        setLoadingAction(false);
      }
    }
  };

  // Remove All Data of Dashboard Page (Clears Dashboard display only, preserves History page data)
  const handleRemoveDashboardData = async () => {
    setShowConfirmReset(false);
    setLoadingAction(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await api.resetDashboard();
      setIsSimulating(false);
      setLatestReading(null);
      setReadingNumber(0);
      setSuccessMessage('Dashboard telemetry display cleared. Your History page records remain safely saved.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove dashboard data.');
    } finally {
      setLoadingAction(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-sm">Connecting to Temperature Engine...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400 shrink-0" />
            <span>Temperature Validation and Monitoring System</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
            Welcome, <strong className="text-sky-300 font-semibold">{user.username}</strong>. Real-time IoT sensor telemetry and physical Kelvin validation.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onNavigateToHistory}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all cursor-pointer min-h-[40px] active:scale-95 touch-manipulation"
          >
            <HistoryIcon className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="whitespace-nowrap">History Page</span>
          </button>

          {/* Remove / Reset Dashboard Data Option */}
          <button
            type="button"
            onClick={() => setShowConfirmReset(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-xl transition-all cursor-pointer min-h-[40px] active:scale-95 touch-manipulation"
            title="Clear dashboard display without affecting history page"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Remove Dashboard Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Removing Dashboard Data */}
      {showConfirmReset && (
        <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-800 text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <span className="leading-relaxed">
              Are you sure you want to <strong>remove dashboard data</strong>? This will clear the dashboard display without deleting any records from your History page.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRemoveDashboardData}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg transition-colors cursor-pointer"
            >
              Yes, Remove Dashboard Data
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmReset(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{successMessage}</div>
        </div>
      )}

      {/* Error Notification Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Control Panel Card: Scale, Interval, and Single ON/OFF Toggle */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-sky-400" />
            <span>Simulation Parameters &amp; Control</span>
          </h3>

          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSimulating ? 'bg-emerald-400 ring-4 ring-emerald-500/20 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span className="text-xs font-medium text-slate-300">
              {isSimulating ? 'Status: RUNNING' : 'Status: STOPPED'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-end">
          {/* Temperature Scale Dropdown */}
          <div className="space-y-2">
            <label htmlFor="temp-scale-select" className="block text-xs font-semibold text-slate-300">
              Select Temperature Scale
            </label>
            <select
              id="temp-scale-select"
              value={scale}
              onChange={(e) => setScale(e.target.value as TemperatureScale)}
              disabled={isSimulating}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer min-h-[48px]"
            >
              <option value="Celsius">Celsius (°C)</option>
              <option value="Fahrenheit">Fahrenheit (°F)</option>
              <option value="Kelvin">Kelvin (K)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              {scale === 'Celsius' && 'Range: -300.00°C to -246.30°C'}
              {scale === 'Fahrenheit' && 'Range: -500.00°F to -419.34°F'}
              {scale === 'Kelvin' && 'Range: -50.00 K to 50.00 K'}
            </p>
          </div>

          {/* Time Interval Input */}
          <div className="space-y-2">
            <label htmlFor="interval-input" className="block text-xs font-semibold text-slate-300">
              Time Interval (seconds)
            </label>
            <div className="relative">
              <input
                id="interval-input"
                type="number"
                min="0.1"
                step="0.5"
                value={intervalInput}
                onChange={(e) => setIntervalInput(e.target.value)}
                disabled={isSimulating}
                placeholder="e.g. 2"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 disabled:opacity-60 disabled:cursor-not-allowed tabular-nums min-h-[48px]"
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 pointer-events-none">
                sec
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Frequency for generating sensor readings (e.g. 2 seconds)
            </p>
          </div>

          {/* SINGLE SIMULATION ON/OFF TOGGLE BUTTON */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400">
              Simulation Control Button
            </label>
            <button
              type="button"
              onClick={handleToggleSimulation}
              disabled={loadingAction}
              className={`w-full py-3 px-4 rounded-xl text-sm sm:text-base font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-70 disabled:cursor-not-allowed min-h-[48px] active:scale-[0.98] touch-manipulation ${
                isSimulating
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-500/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/40'
              }`}
            >
              {loadingAction ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSimulating ? (
                <Square className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              <span>{isSimulating ? 'Simulation OFF' : 'Simulation ON'}</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center font-medium">
              {isSimulating ? 'Click "Simulation OFF" to stop' : 'Click "Simulation ON" to start'}
            </p>
          </div>
        </div>

        {/* Real-time simulation feedback alert */}
        {isSimulating && (
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 text-xs text-emerald-300 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="leading-relaxed">Simulation is active: Generating readings every {intervalInput}s and recording 1 by 1 into SQLite.</span>
            </div>
            <button
              type="button"
              onClick={onNavigateToHistory}
              className="text-[11px] text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
            >
              View in History Page →
            </button>
          </div>
        )}
      </section>

      {/* Live Temperature Telemetry Cards */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-white">Live Temperature Telemetry</h3>
          {latestReading && (
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Last Updated: <strong className="text-slate-300 font-mono text-[11px] sm:text-xs">{latestReading.timestamp}</strong></span>
              </span>
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove Data</span>
              </button>
            </div>
          )}
        </div>

        {latestReading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* 1. Current Temperature */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Current Temperature</span>
                <span className="text-slate-500 font-mono text-[11px]">{latestReading.scale}</span>
              </div>
              <div className="my-2">
                <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums tracking-tight">
                  {latestReading.temperature.toFixed(2)}{' '}
                  <span className="text-xl font-normal text-sky-400">{latestReading.unit}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500">
                Generated via random.uniform()
              </div>
            </div>

            {/* 2. Temperature in Kelvin */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Temperature in Kelvin</span>
                <span className="text-slate-500 font-mono text-[11px]">Converted</span>
              </div>
              <div className="my-2">
                <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums tracking-tight">
                  {latestReading.kelvin.toFixed(2)}{' '}
                  <span className="text-xl font-normal text-amber-400">K</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500">
                Formula: {latestReading.scale === 'Celsius' ? 'K = °C + 273.15' : latestReading.scale === 'Fahrenheit' ? 'K = (°F - 32) × 5/9 + 273.15' : 'K = K'}
              </div>
            </div>

            {/* 3. Validation Status */}
            <div
              className={`rounded-2xl p-5 border flex flex-col justify-between ${
                latestReading.is_valid
                  ? 'bg-emerald-950/20 border-emerald-800/60'
                  : 'bg-rose-950/20 border-rose-800/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Validation Status</span>
                {latestReading.is_valid ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <div className="my-2">
                <div
                  className={`text-2xl font-bold flex items-center gap-2 ${
                    latestReading.is_valid ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      latestReading.is_valid ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
                    }`}
                  />
                  <span>{latestReading.validation_status}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                {latestReading.kelvin < 0
                  ? 'Kelvin < 0 K (Physically impossible, below absolute zero)'
                  : 'Kelvin ≥ 0 K (Physically valid thermal state)'}
              </div>
            </div>

            {/* 4. Reading Number & Interval */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Reading Number</span>
                <Hash className="w-4 h-4 text-slate-500" />
              </div>
              <div className="my-2">
                <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums tracking-tight">
                  #{latestReading.reading_number}
                </div>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Interval: {latestReading.interval_seconds}s</span>
                <span className="text-slate-400 text-[11px]">Saved in History Page</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 text-center">
            <Thermometer className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-medium text-slate-300 mb-1">
              No temperature readings yet.
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Select your temperature scale and time interval, then click &quot;Simulation ON&quot; above to start generating readings.
            </p>
          </div>
        )}
      </section>

      {/* Academic IoT Sensor Specification Reference Card */}
      <section className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Academic Laboratory Validation Rules &amp; Predefined Ranges
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-semibold text-sky-400 block mb-1">Celsius Scale (°C)</span>
            <div className="text-slate-400 space-y-0.5">
              <div>Range: <strong className="text-slate-200 font-mono">-300.00°C to -246.30°C</strong></div>
              <div>Formula: <span className="font-mono text-slate-300">K = °C + 273.15</span></div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-semibold text-sky-400 block mb-1">Fahrenheit Scale (°F)</span>
            <div className="text-slate-400 space-y-0.5">
              <div>Range: <strong className="text-slate-200 font-mono">-500.00°F to -419.34°F</strong></div>
              <div>Formula: <span className="font-mono text-slate-300">K = (°F - 32) × 5/9 + 273.15</span></div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-semibold text-sky-400 block mb-1">Kelvin Scale (K)</span>
            <div className="text-slate-400 space-y-0.5">
              <div>Range: <strong className="text-slate-200 font-mono">-50.00 K to 50.00 K</strong></div>
              <div>Validation: <span className="font-mono text-slate-300">K &lt; 0: Invalid | K ≥ 0: Valid</span></div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-500 leading-relaxed">
          * Note: Negative Kelvin values are physically impossible (absolute zero is 0 K). In this IoT validation project, negative values are intentionally included in the test ranges to demonstrate the sensor validation algorithm correctly identifying anomalies.
        </p>
      </section>
    </div>
  );
};
