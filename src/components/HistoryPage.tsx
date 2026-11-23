import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Download,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Reading, User } from '../types';
import { api } from '../api';

interface HistoryPageProps {
  user: User;
  onBackToDashboard: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ user, onBackToDashboard }) => {
  const [history, setHistory] = useState<Reading[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'invalid'>('all');

  const fetchHistory = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getHistory();
      setHistory(res.history || []);
    } catch (err: any) {
      if (isInitial) setErrorMessage(err.message || 'Failed to load temperature history from database.');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(true);

    // Auto-poll history every 1000ms so new readings appear 1 by 1 in real time
    const intervalTimer = setInterval(() => {
      fetchHistory(false);
    }, 1000);

    return () => clearInterval(intervalTimer);
  }, []);

  const handleClearHistory = async () => {
    setShowConfirmClear(false);
    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await api.clearHistory();
      setHistory([]);
      setSuccessMessage('All temperature history and dashboard data have been cleared successfully.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to clear temperature history.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    if (statusFilter === 'valid') return item.validation_status.includes('Valid') && !item.validation_status.includes('Invalid');
    if (statusFilter === 'invalid') return item.validation_status.includes('Invalid');
    return true;
  });

  const exportToCSV = () => {
    if (history.length === 0) return;
    const headers = ['Reading Number', 'Temperature', 'Scale', 'Kelvin (K)', 'Validation Status', 'Interval (s)', 'Date and Time'];
    const rows = history.map((r) => [
      r.reading_number,
      `${r.temperature}`,
      r.scale,
      `${r.kelvin}`,
      r.validation_status,
      r.interval_seconds,
      `"${r.timestamp}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `temperature_history_${user.username}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6">
      {/* Top Navigation & Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-800/80">
        <div>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors mb-2 cursor-pointer touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 flex-wrap">
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400 shrink-0" />
            <span>Temperature History Log</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-[11px] font-semibold text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Real-Time Sync</span>
            </span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Authenticated records strictly for <strong className="text-slate-200">{user.username}</strong>. Records are permanently stored in database.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fetchHistory(true)}
            disabled={loading || actionLoading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50 min-h-[40px] active:scale-95 touch-manipulation"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={exportToCSV}
            disabled={history.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm min-h-[40px] active:scale-95 touch-manipulation"
            title="Export CSV for academic laboratory reports"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Clear History Option */}
          <button
            type="button"
            onClick={() => setShowConfirmClear(true)}
            disabled={history.length === 0 || actionLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[40px] active:scale-95 touch-manipulation"
            title="Clear all stored temperature records for your account"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Clearing All History */}
      {showConfirmClear && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="leading-relaxed">
              Are you sure you want to <strong>clear all history</strong>? This will permanently delete all {history.length} temperature records from the database and also clear the dashboard data.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={actionLoading}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg transition-colors cursor-pointer"
            >
              {actionLoading ? 'Clearing...' : 'Yes, Clear All History'}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmClear(false)}
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

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Filter and Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Filter:</span>
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer touch-manipulation ${
                statusFilter === 'all' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('valid')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer touch-manipulation ${
                statusFilter === 'valid' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Valid ({history.filter((i) => i.validation_status.includes('Valid') && !i.validation_status.includes('Invalid')).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('invalid')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer touch-manipulation ${
                statusFilter === 'invalid' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Invalid ({history.filter((i) => i.validation_status.includes('Invalid')).length})
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-mono text-slate-200">{filteredHistory.length}</span> of{' '}
          <span className="font-mono text-slate-200">{history.length}</span> recorded readings
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-7 h-7 text-sky-400 animate-spin" />
            <p className="text-xs">Querying database for records...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-slate-300 mb-1">
              No temperature history available.
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {history.length > 0
                ? 'No readings match your filter criteria.'
                : 'Turn on the simulation in your dashboard to generate and save sensor readings.'}
            </p>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/50 rounded-lg cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 font-mono">Reading #</th>
                  <th className="py-3.5 px-4">Temperature</th>
                  <th className="py-3.5 px-4">Scale</th>
                  <th className="py-3.5 px-4">Kelvin (K)</th>
                  <th className="py-3.5 px-4">Validation Status</th>
                  <th className="py-3.5 px-4 font-mono">Interval</th>
                  <th className="py-3.5 px-4">Date and Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {filteredHistory.map((item) => {
                  const isValid = item.validation_status.includes('Valid') && !item.validation_status.includes('Invalid');
                  return (
                    <tr
                      key={item.id || item.reading_number}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Reading Number */}
                      <td className="py-3.5 px-4 font-mono text-slate-300 font-medium">
                        #{item.reading_number}
                      </td>

                      {/* Temperature */}
                      <td className="py-3.5 px-4 font-mono font-medium text-white tabular-nums">
                        {item.temperature.toFixed(2)}{' '}
                        <span className="text-sky-400 font-sans text-[11px]">
                          {item.scale === 'Celsius' ? '°C' : item.scale === 'Fahrenheit' ? '°F' : 'K'}
                        </span>
                      </td>

                      {/* Scale */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {item.scale}
                      </td>

                      {/* Converted Kelvin */}
                      <td className="py-3.5 px-4 font-mono font-semibold tabular-nums text-amber-300">
                        {item.kelvin.toFixed(2)} K
                      </td>

                      {/* Validation Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${
                            isValid
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                              : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                          }`}
                        >
                          {isValid ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span>{item.validation_status}</span>
                        </span>
                      </td>

                      {/* Time Interval */}
                      <td className="py-3.5 px-4 font-mono text-slate-400 tabular-nums">
                        {item.interval_seconds}s
                      </td>

                      {/* Date and Time */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {item.timestamp}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-500 flex items-center justify-between">
        <span>* Database: SQLite (instance/data.json)</span>
        <span>Strict isolation: User ID #{user.id}</span>
      </div>
    </div>
  );
};
