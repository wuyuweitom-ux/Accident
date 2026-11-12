import React from 'react';
import { ShieldAlert, Database, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  caseCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, caseCount }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-700 via-sky-800 to-teal-800 flex items-center justify-center text-white shadow-md shadow-blue-900/10 font-bold text-xl tracking-tight">
            AB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Accident Balancer
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                臺灣營造工程專用
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              高處墜落勞安風險智慧評估與事故大數據決策系統
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200/80 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span>已載入 {caseCount} 筆真實事故調查主資料</span>
          </div>

          <button
            onClick={() => setActiveTab('database')}
            className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 border ${
              activeTab === 'database'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">事故主資料庫</span>
          </button>
        </div>
      </div>
    </header>
  );
};
