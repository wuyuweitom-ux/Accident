import React from 'react';
import {
  Activity,
  Database,
  BarChart3,
  CheckCheck,
  Binary,
  Search,
  BookOpenText,
} from 'lucide-react';

export type NavTabId = 'assess' | 'database' | 'analytics' | 'mae' | 'shap' | 'rag' | 'method';

interface NavigationProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: NavTabId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'assess', label: '⌁ 風險評估', icon: Activity },
    { id: 'database', label: '▤ 事故資料庫', icon: Database },
    { id: 'analytics', label: '▥ 事故統計', icon: BarChart3 },
    { id: 'mae', label: '▥ MAE 驗證', icon: CheckCheck },
    { id: 'shap', label: '◈ SHAP 解釋', icon: Binary },
    { id: 'rag', label: '⌕ RAG 檢索', icon: Search },
    { id: 'method', label: '◎ 技術與限制', icon: BookOpenText },
  ];

  return (
    <div className="border-b border-slate-200 bg-white sticky top-20 z-20 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
