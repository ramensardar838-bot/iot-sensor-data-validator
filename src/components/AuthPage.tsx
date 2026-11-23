import React, { useState } from 'react';
import {
  Thermometer,
  Wifi,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { api } from '../api';
import { User } from '../types';

interface AuthPageProps {
  onSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Client-side username rule validation helpers
  const usernameOnlyLetters = /^[A-Za-z]+$/.test(username.trim());
  const usernameHasUpper = /[A-Z]/.test(username);
  const usernameHasLower = /[a-z]/.test(username);
  const usernameValid = username.trim().length > 0 && usernameOnlyLetters && usernameHasUpper && usernameHasLower;

  // Client-side password rule validation helpers
  const pwdMinLength = password.length >= 8;
  const pwdHasUpper = /[A-Z]/.test(password);
  const pwdHasLower = /[a-z]/.test(password);
  const pwdHasDigit = /[0-9]/.test(password);
  const pwdHasSpecial = /[@#$%!&*_+\-=~^()[\]{}|;:,.<>?/]/.test(password);
  const passwordValid = pwdMinLength && pwdHasUpper && pwdHasLower && pwdHasDigit && pwdHasSpecial;
  const passwordsMatch = isLogin || password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUser = username.trim();

    // Validate inputs
    if (!cleanUser) {
      setErrorMessage('Please enter a username.');
      return;
    }

    if (!usernameOnlyLetters) {
      if (/[0-9]/.test(cleanUser)) {
        setErrorMessage('Username cannot contain numbers. Only English letters (A-Z, a-z) are allowed.');
        return;
      }
      setErrorMessage('Username can only contain English uppercase and lowercase letters (no spaces or symbols).');
      return;
    }

    if (!usernameHasUpper || !usernameHasLower) {
      setErrorMessage('Username must contain at least one uppercase letter (A-Z) and one lowercase letter (a-z).');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (!isLogin) {
      if (!passwordValid) {
        setErrorMessage('Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login(cleanUser, password);
        onSuccess(res.user);
      } else {
        const res = await api.signup(cleanUser, password);
        setSuccessMessage('Account created successfully! Logging you in...');
        setTimeout(() => {
          onSuccess(res.user);
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between text-slate-400 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-slate-300">
          <Thermometer className="w-5 h-5 text-sky-400" />
          <span className="font-medium tracking-wide">Temperature Check Only</span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="w-5 h-5 text-sky-400" />
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-4 flex flex-col items-center justify-center flex-grow">
        {/* Emblem and Title Section */}
        <div className="flex flex-col items-center mb-6 text-center">
          {/* Circular IoT Thermometer Emblem */}
          <div className="relative mb-4 flex items-center justify-center">
            {/* Radiating wifi wave on top */}
            <div className="absolute -top-3 w-8 flex justify-center text-sky-400">
              <svg viewBox="0 0 24 12" fill="none" className="w-6 h-3 stroke-current stroke-2">
                <path d="M2 10C5 5 19 5 22 10" strokeLinecap="round" />
                <path d="M6 11C8 8 16 8 18 11" strokeLinecap="round" />
              </svg>
            </div>

            {/* Circuit side traces */}
            <div className="absolute -left-7 flex flex-col gap-1.5 items-end opacity-85">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 ring-2 ring-sky-400/30" />
                <div className="w-4 h-[1.5px] bg-sky-400/80" />
              </div>
              <div className="flex items-center gap-1 mr-1">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 ring-2 ring-sky-400/30" />
                <div className="w-5 h-[1.5px] bg-sky-400/80" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 ring-2 ring-sky-400/30" />
                <div className="w-4 h-[1.5px] bg-sky-400/80" />
              </div>
            </div>

            {/* Center Circle with Thermometer */}
            <div className="w-20 h-20 rounded-full border-2 border-sky-400/60 bg-[#0d1633] flex items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.25)] ring-4 ring-sky-500/10">
              <div className="relative flex flex-col items-center">
                {/* Custom thermometer with mercury level */}
                <div className="w-4 h-11 border border-slate-200 rounded-full flex flex-col items-center justify-end p-0.5 bg-slate-900/60 overflow-hidden">
                  <div className="w-2 h-6 bg-rose-500 rounded-t-sm" />
                  <div className="w-3 h-3 rounded-full bg-rose-500 -mt-0.5" />
                </div>
              </div>
            </div>

            {/* Circuit right traces */}
            <div className="absolute -right-7 flex flex-col gap-1.5 items-start opacity-85">
              <div className="flex items-center gap-1">
                <div className="w-4 h-[1.5px] bg-sky-400/80" />
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 ring-2 ring-sky-400/30" />
              </div>
              <div className="flex items-center gap-1 ml-1">
                <div className="w-5 h-[1.5px] bg-sky-400/80" />
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 ring-2 ring-sky-400/30" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-[1.5px] bg-sky-400/80" />
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 ring-2 ring-sky-400/30" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            IoT Sensor
            <br />
            Data Validator
          </h1>

          {/* Subtitle with lines */}
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 font-medium">
            <span className="w-8 h-[1px] bg-slate-600" />
            <span>Temperature Check Only</span>
            <span className="w-8 h-[1px] bg-slate-600" />
          </div>
        </div>

        {/* Auth Form Card */}
        <div className="w-full bg-[#0d1633]/90 backdrop-blur-md border border-[#1b2a59] rounded-2xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-1">
              {isLogin ? 'Login' : 'Sign Up'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isLogin ? 'Enter your credentials to continue' : 'Create your student account to continue'}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  className="w-full bg-[#080f26] border border-[#213467] text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Requirement Hint for Signup */}
              {!isLogin && username.length > 0 && (
                <div className="text-[11px] px-1 space-y-0.5 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    {usernameOnlyLetters ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-rose-400" />
                    )}
                    <span className={usernameOnlyLetters ? 'text-emerald-300' : 'text-slate-400'}>
                      Letters only (A-Z, a-z). No numbers or symbols.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {usernameHasUpper && usernameHasLower ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-rose-400" />
                    )}
                    <span className={usernameHasUpper && usernameHasLower ? 'text-emerald-300' : 'text-slate-400'}>
                      Must contain at least 1 uppercase and 1 lowercase letter.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  className="w-full bg-[#080f26] border border-[#213467] text-white placeholder-slate-500 rounded-xl pl-11 pr-11 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-200 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Requirement Hint for Signup */}
              {!isLogin && password.length > 0 && (
                <div className="text-[11px] px-1 grid grid-cols-2 gap-1 text-slate-400">
                  <div className={`flex items-center gap-1 ${pwdMinLength ? 'text-emerald-300' : ''}`}>
                    {pwdMinLength ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-slate-500" />}
                    <span>Min 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1 ${pwdHasUpper ? 'text-emerald-300' : ''}`}>
                    {pwdHasUpper ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-slate-500" />}
                    <span>1 uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1 ${pwdHasLower ? 'text-emerald-300' : ''}`}>
                    {pwdHasLower ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-slate-500" />}
                    <span>1 lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1 ${pwdHasDigit ? 'text-emerald-300' : ''}`}>
                    {pwdHasDigit ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-slate-500" />}
                    <span>1 number (0-9)</span>
                  </div>
                  <div className={`col-span-2 flex items-center gap-1 ${pwdHasSpecial ? 'text-emerald-300' : ''}`}>
                    {pwdHasSpecial ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-slate-500" />}
                    <span>Special character (@, #, $, %, !, &amp;)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password for Signup */}
            {!isLogin && (
              <div className="space-y-1.5">
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="w-full bg-[#080f26] border border-[#213467] text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                {confirmPassword.length > 0 && (
                  <div className="text-[11px] px-1 flex items-center gap-1">
                    {passwordsMatch ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-rose-400" />
                        <span className="text-rose-400">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#2866e3] hover:bg-[#1f56c7] active:bg-[#1948ad] text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isLogin ? 'Login' : 'Sign Up'}</span>
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="mt-6 text-center text-xs text-slate-400">
            <span>{isLogin ? "Don't have an account? " : 'Already have an account? '}</span>
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-sky-400 hover:text-sky-300 font-medium hover:underline focus:outline-none cursor-pointer"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Footer Section */}
      <footer className="relative z-10 w-full px-4 py-4 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400 tracking-wide font-medium">
          <Thermometer className="w-4 h-4 text-sky-400" />
          <span>Monitor</span>
          <span className="text-slate-600">|</span>
          <span>Validate</span>
          <span className="text-slate-600">|</span>
          <span>Keep Safe</span>
        </div>

        {/* Subtle decorative bottom wave silhouettes */}
        <div className="w-full max-w-2xl h-8 opacity-25 overflow-hidden">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-sky-600">
            <path d="M0,0 C150,90 350,-40 500,40 C650,120 900,10 1200,40 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </footer>
    </div>
  );
};
