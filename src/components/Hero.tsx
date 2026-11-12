import React from 'react';
import { ShieldCheck, Scale, Cpu, Search, Sparkles } from 'lucide-react';

interface HeroProps {
  onQuickStart: () => void;
  caseCount: number;
}

export const Hero: React.FC<HeroProps> = ({ onQuickStart, caseCount }) => {
  return (
    <section className="bg-gradient-to-r from-slate-900 via-sky-950 to-cyan-950 text-white py-9 px-4 sm:px-6 lg:px-8 border-b border-slate-800 print:hidden shadow-inner">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-teal-300 bg-teal-950/60 border border-teal-700/40 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>透明科學演算法 · 拒絕不可解釋黑箱</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
              營造工程高處墜落勞安風險情境推估與案例比對系統
            </h2>

            <p className="text-sm text-sky-200/90 leading-relaxed font-normal">
              以真實 <strong className="text-white font-semibold">{caseCount} 筆</strong> 營造墜落重大事故為基準，透過「<strong className="text-teal-300">缺失值友善 KNN 距離排名</strong>」比對施工條件，並整合「<strong className="text-teal-300">精確 Shapley 數值分解 (SHAP)</strong>」、「<strong className="text-teal-300">留一法 MAE 驗證</strong>」與「<strong className="text-teal-300">本地 TF-IDF 檢索摘要</strong>」。所有計算公式、假設條件及資料限制皆 100% 公開透明。
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 text-sky-100 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                防墜防護缺失警示
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 text-sky-100 border border-white/10">
                <Scale className="w-3.5 h-3.5 text-amber-300" />
                事故和解金額情境試算
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 text-sky-100 border border-white/10">
                <Cpu className="w-3.5 h-3.5 text-cyan-300" />
                Shapley 貢獻值即時解析
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 text-sky-100 border border-white/10">
                <Search className="w-3.5 h-3.5 text-purple-300" />
                本地雙字組 TF-IDF 檢索
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col gap-3 shrink-0">
            <button
              onClick={onQuickStart}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>立即開始風險評估</span>
            </button>
            <div className="text-[11px] text-sky-300/80 text-center sm:text-right">
              已保留完整 22 欄事故屬性
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
