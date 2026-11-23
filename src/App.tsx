/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User } from './types';
import { api, getStoredToken } from './api';
import { AuthPage } from './components/AuthPage';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { HistoryPage } from './components/HistoryPage';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  useEffect(() => {
    async function checkAuth() {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.user) {
          setUser(res.user);
        }
      } catch (err) {
        console.warn('Session expired or unauthorized:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setActiveTab('dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070d1e] text-slate-200 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading IoT Temperature Validator...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div className="min-h-screen bg-[#070e1e] text-slate-100 flex flex-col font-sans">
      <Header
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {activeTab === 'dashboard' ? (
          <Dashboard
            user={user}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        ) : (
          <HistoryPage
            user={user}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>
          Temperature Validation and Monitoring System · Academic IoT Sensor Laboratory Project
        </p>
      </footer>
    </div>
  );
}
