import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Download, FileCode, Terminal, Loader2 } from 'lucide-react';
import { api } from '../api';

interface PythonCodeViewerProps {
  onBackToDashboard: () => void;
}

export const PythonCodeViewer: React.FC<PythonCodeViewerProps> = ({ onBackToDashboard }) => {
  const [code, setCode] = useState<string>('');
  const [filename, setFilename] = useState<string>('temperature_validator.py');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function fetchCode() {
      try {
        const res = await api.getPythonCode();
        setCode(res.code);
        setFilename(res.filename);
      } catch (err) {
        console.error('Failed to load python code:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCode();
  }, []);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const codeLines = code.split('\n');

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6">
      {/* Top Header */}
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
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileCode className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400 shrink-0" />
            <span className="truncate">Python Source Code: {filename}</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Original standalone Python code for terminal execution and academic evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer min-h-[40px] active:scale-95 touch-manipulation"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            <span className="whitespace-nowrap">{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-all cursor-pointer shadow-sm min-h-[40px] active:scale-95 touch-manipulation"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Download .py File</span>
          </button>
        </div>
      </div>

      {/* Terminal execution instructions */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-300 font-mono">
          <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>$ python3 temperature_validator.py</span>
        </div>
        <div className="text-slate-400 text-[11px]">
          Runs interactively in any Python 3 environment with CLI scale and interval selection.
        </div>
      </div>

      {/* Code Display Area */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs font-mono text-slate-300">{filename}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Python 3.x</span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-7 h-7 text-sky-400 animate-spin" />
            <p className="text-xs">Loading Python file...</p>
          </div>
        ) : (
          <div className="p-4 sm:p-6 overflow-x-auto font-mono text-xs leading-relaxed text-slate-200">
            <table className="w-full border-collapse">
              <tbody>
                {codeLines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="w-10 pr-4 text-right text-slate-600 select-none text-[11px] align-top">
                      {idx + 1}
                    </td>
                    <td className="whitespace-pre text-slate-100">
                      {line}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
