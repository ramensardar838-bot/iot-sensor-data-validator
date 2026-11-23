import React from 'react';
import { Thermometer, User as UserIcon, LogOut, LayoutDashboard, History } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  activeTab: 'dashboard' | 'history';
  onTabChange: (tab: 'dashboard' | 'history') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  onTabChange,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#091124]/95 backdrop-blur-md border-b border-slate-800/80 text-slate-100 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="h-16 flex items-center justify-between gap-3">
          {/* Brand Zone */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 shadow-inner">
              <Thermometer className="w-5 h-5 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-white leading-tight truncate">
                <span className="sm:hidden">IoT Temperature Validator</span>
                <span className="hidden sm:inline">Temperature Validation &amp; Monitoring</span>
              </h1>
              <p className="hidden md:block text-[11px] text-slate-400 leading-none truncate">
                IoT Sensor Telemetry · Academic Validation Laboratory
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on mobile/small tablets) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                activeTab === 'dashboard'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('history')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                activeTab === 'history'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
          </nav>

          {/* User Identity & Logout Zone */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-300 bg-slate-900/80 border border-slate-800 px-2.5 py-1.5 rounded-lg">
              <UserIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-none">
                <strong className="text-white font-medium">{user.username}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 rounded-lg transition-colors cursor-pointer min-h-[36px] active:scale-95"
              title="Log out of system"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Navigation Tabs (Optimized touch bar for phones and tablets) */}
        <div className="lg:hidden pb-3 pt-1">
          <nav className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800/90 shadow-inner">
            <button
              type="button"
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer min-h-[42px] touch-manipulation active:scale-[0.98] ${
                activeTab === 'dashboard'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('history')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer min-h-[42px] touch-manipulation active:scale-[0.98] ${
                activeTab === 'history'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">History</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
