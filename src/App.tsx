import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Navigation, NavTabId } from './components/Navigation';
import { AssessmentView } from './components/AssessmentView';
import { DatabaseView } from './components/DatabaseView';
import { AnalyticsView } from './components/AnalyticsView';
import { MaeView } from './components/MaeView';
import { ShapView } from './components/ShapView';
import { RagView } from './components/RagView';
import { MethodologyView } from './components/MethodologyView';
import { CaseDetailModal } from './components/CaseDetailModal';
import { AccidentCase } from './types/accident';
import { INITIAL_ACCIDENT_DATA } from './data/accidentData';

const STORAGE_KEY = 'accident_balancer_cases_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('assess');
  const [cases, setCases] = useState<AccidentCase[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 27) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load cases from localStorage:', e);
    }
    return INITIAL_ACCIDENT_DATA;
  });

  const [selectedCase, setSelectedCase] = useState<AccidentCase | null>(null);

  // 用於從評估頁同步條件至 SHAP 實驗室
  const [shapSyncInput, setShapSyncInput] = useState<{
    work: string;
    height: number | null;
    belt: string;
    guard: string;
  }>({
    work: '施工架',
    height: 7.5,
    belt: '未使用',
    guard: '不足',
  });

  // 儲存 cases 至 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch (e) {
      console.warn('Failed to save cases to localStorage:', e);
    }
  }, [cases]);

  // 新增案例
  const handleAddCase = (newCase: AccidentCase) => {
    setCases((prev) => [newCase, ...prev]);
  };

  // 重設為預設 27 筆
  const handleResetToDefault = () => {
    if (confirm('確定要將資料庫重設回原始 27 筆墜落事故資料嗎？')) {
      setCases(INITIAL_ACCIDENT_DATA);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // ignore
      }
    }
  };

  // 一鍵從評估頁同步至 SHAP 實驗室並切換 tab
  const handleSyncToShap = (input: {
    work: string;
    height: number | null;
    belt: string;
    guard: string;
  }) => {
    setShapSyncInput(input);
    setActiveTab('shap');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* 頂部導航列 */}
      <Header
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t as NavTabId)}
        caseCount={cases.length}
      />

      {/* 英雄區塊 */}
      <Hero
        onQuickStart={() => {
          setActiveTab('assess');
          window.scrollTo({ top: 180, behavior: 'smooth' });
        }}
        caseCount={cases.length}
      />

      {/* 頁籤導覽列 */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 主要內容區 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grow w-full">
        {activeTab === 'assess' && (
          <AssessmentView
            cases={cases}
            onSelectCase={setSelectedCase}
            onSyncToShap={handleSyncToShap}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseView
            cases={cases}
            onSelectCase={setSelectedCase}
            onAddCase={handleAddCase}
            onResetToDefault={handleResetToDefault}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView cases={cases} />}

        {activeTab === 'mae' && (
          <MaeView cases={cases} onSelectCase={setSelectedCase} />
        )}

        {activeTab === 'shap' && <ShapView initialInput={shapSyncInput} />}

        {activeTab === 'rag' && (
          <RagView cases={cases} onSelectCase={setSelectedCase} />
        )}

        {activeTab === 'method' && <MethodologyView />}
      </main>

      {/* 頁尾 */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 space-y-1 print:hidden">
        <p className="font-semibold text-slate-700">
          Accident Balancer · 營造工程高處墜落勞安風險智慧評估平台
        </p>
        <p className="text-[11px] text-slate-400">
          研究情境推估不是經驗證預測、事故發生機率、實際工期或法定賠償金額 · 完整 22 欄事故屬性已保留
        </p>
      </footer>

      {/* 22 欄事故詳情彈窗 */}
      <CaseDetailModal
        accident={selectedCase}
        onClose={() => setSelectedCase(null)}
      />
    </div>
  );
}
