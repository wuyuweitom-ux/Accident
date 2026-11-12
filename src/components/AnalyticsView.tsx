import React, { useMemo } from 'react';
import { BarChart3, AlertCircle, CheckCircle2, TrendingUp, PieChart, ShieldAlert } from 'lucide-react';
import { AccidentCase } from '../types/accident';
import { isNum, raw, workGroup } from '../utils/calculator';

interface AnalyticsViewProps {
  cases: AccidentCase[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ cases }) => {
  // 作業類別統計
  const workCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cases.forEach((c) => {
      const g = workGroup(c['作業類別']);
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [cases]);

  const maxWorkCount = Math.max(...workCounts.map((x) => x[1]), 1);

  // 資料品質審查
  const qualityDimensions = useMemo(() => {
    const list: { label: string; count: number; note: string }[] = [
      {
        label: '來源網址',
        count: cases.filter((c) => raw(c['來源網址']).startsWith('http')).length,
        note: '可直接查證官方公告或新聞',
      },
      {
        label: '墜落／作業高度(m)',
        count: cases.filter((c) => c['墜落／作業高度(m)'] !== null && raw(c['墜落／作業高度(m)']) !== '').length,
        note: '具有作業或墜落米數標記',
      },
      {
        label: '安全帶／母索紀錄',
        count: cases.filter((c) => raw(c['安全帶／母索']) !== '').length,
        note: '記載有無使用或確實勾掛',
      },
      {
        label: '金額（數字型）',
        count: cases.filter((c) => isNum(c['金額(元；依性質)'])).length,
        note: '具體記載損失或和解金額',
      },
      {
        label: '停工天數',
        count: cases.filter((c) => isNum(c['停工天數'])).length,
        note: '主管機關命停工或內部停工日',
      },
      {
        label: '實際工期延宕天數',
        count: cases.filter((c) => isNum(c['事故可歸責實際延宕天數'])).length,
        note: '扣除趕工後可歸責延誤日',
      },
    ];
    return list;
  }, [cases]);

  // 金額性質統計
  const moneyTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    cases.forEach((c) => {
      if (isNum(c['金額(元；依性質)'])) {
        const t = raw(c['金額性質']) || '未標註性質';
        counts[t] = (counts[t] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [cases]);

  return (
    <div className="space-y-6">
      {/* 頂部標題 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              事故資料統計與品質審計
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              真實匯入資料計算
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            從目前 {cases.length} 筆資料即時動態統計，嚴格區分「未提供」與「數值為零」，維持學術誠實度。
          </p>
        </div>
      </div>

      {/* 關鍵指標 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">候選案例總數</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {cases.length} <span className="text-xs font-medium text-slate-500">筆</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">基礎墜落事故資料集</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">已填金額紀錄</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {cases.filter((c) => isNum(c['金額(元；依性質)'])).length}{' '}
            <span className="text-xs font-medium text-slate-500">筆</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            佔比 {((cases.filter((c) => isNum(c['金額(元；依性質)'])).length / cases.length) * 100).toFixed(0)}%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">實際延宕天數</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {cases.filter((c) => isNum(c['事故可歸責實際延宕天數'])).length}{' '}
            <span className="text-xs font-medium text-slate-500">筆</span>
          </div>
          <div className="text-[11px] text-rose-500 font-semibold mt-1">
            目前無法直接訓練工期預測模型
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">具作業高度記錄</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {cases.filter((c) => c['墜落／作業高度(m)'] !== null && raw(c['墜落／作業高度(m)']) !== '').length}{' '}
            <span className="text-xs font-medium text-slate-500">筆</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">可供 KNN 高度距離計算</div>
        </div>
      </div>

      {/* 兩大圖表：作業類別分佈 & 資料品質審計 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 作業類別分佈 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>依作業類別分布頻率</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              共 {workCounts.length} 類作業
            </span>
          </div>

          <div className="space-y-3">
            {workCounts.map(([name, count]) => {
              const pct = (count / cases.length) * 100;
              return (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{name}</span>
                    <span className="font-mono text-slate-500">
                      <strong>{count}</strong> 筆 ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(count / maxWorkCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            註：施工架、樓板開口及屋頂採光罩為臺灣營造重大職業災害墜落最常見之三大類型。
          </p>
        </div>

        {/* 資料品質與缺失值檢驗 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>關鍵特徵資料品質與填答覆蓋率</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">6 項核心屬性</span>
          </div>

          <div className="space-y-3">
            {qualityDimensions.map((q) => {
              const pct = (q.count / cases.length) * 100;
              const isLow = pct < 30;
              return (
                <div key={q.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">
                      {q.label} <span className="text-slate-400 font-normal">({q.note})</span>
                    </span>
                    <span className="font-mono font-bold text-slate-700">
                      {q.count} / {cases.length} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isLow ? 'bg-amber-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
            <strong>學術資料審查結論：</strong>
            多數公部門職災通報常欠缺完整法律判決金額與後續可歸責工期追蹤，此即為何本系統採用<strong>「已知特徵覆蓋率懲罰之 KNN」</strong>與<strong>「留一法 MAE」</strong>，避免在缺失值嚴重的情境下盲目擬合深度神經網絡。
          </div>
        </div>
      </div>

      {/* 金額性質細部拆解 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <PieChart className="w-4 h-4 text-purple-600" />
          <span>已記載事故金額之性質構成</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {moneyTypes.map(([type, count]) => (
            <div key={type} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="text-slate-500 block mb-1 truncate">{type}</span>
              <div className="font-mono font-bold text-slate-800 text-base">{count} 筆</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
