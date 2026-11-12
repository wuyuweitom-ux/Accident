import React, { useMemo } from 'react';
import { CheckCheck, AlertTriangle, Scale, HelpCircle } from 'lucide-react';
import { AccidentCase } from '../types/accident';
import { computeLeaveOneOutMae, formatMoney } from '../utils/calculator';

interface MaeViewProps {
  cases: AccidentCase[];
  onSelectCase: (c: AccidentCase) => void;
}

export const MaeView: React.FC<MaeViewProps> = ({ cases, onSelectCase }) => {
  const result = useMemo(() => {
    return computeLeaveOneOutMae(cases);
  }, [cases]);

  return (
    <div className="space-y-6">
      {/* 標題與標籤 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              MAE｜真實模型誤差驗證 (Leave-One-Out 留一法)
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              探索性跨案例驗證
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            針對具有同類型「和解／調解金額」紀錄的事故，執行嚴謹的留一法預測與平均絕對誤差（MAE）實際計算。
          </p>
        </div>
      </div>

      {result.mae === null ? (
        <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
          具有和解／調解金額的案例少於 3 筆，無法進行留一法 MAE 驗證。
        </div>
      ) : (
        <>
          {/* 指標卡 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                和解／調解金額 留一法 MAE
              </span>
              <div className="text-2xl font-black text-blue-700 font-mono">
                {formatMoney(Math.round(result.mae))}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                逐筆排除自身後之平均絕對預測誤差
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                參與驗證案例數
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {result.rows.length} <span className="text-xs font-medium text-slate-500">筆</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                已排除單純違約金或罰鍰等異質金額
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                工期延宕 MAE 計算狀態
              </span>
              <div className="text-xl font-bold text-rose-600 font-mono">
                無法計算 (無標籤)
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                因資料中無可歸責工期真實紀錄
              </div>
            </div>
          </div>

          {/* 方法與侷限說明 */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs space-y-2 leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>真實演算法計算 · 非正式損失模型效能</span>
            </div>
            <p>
              <strong>驗證原理：</strong>將資料集中的每筆案例單獨取出作為測試集（Test Case），使用其餘所有案例以 KNN 相似度加權預測該案例之和解金。
            </p>
            <p>
              <strong>重要限制公開：</strong>此 MAE 是以有限的和解紀錄作類比評估；由於各訴訟和解範圍可能包含不同親屬扶養費、喪葬費或強制保險抵扣，且來源尚待逐筆官方驗證，因此<strong>這個 MAE 不能用來證明事故總體經濟損失之準確預測能力，亦不能冒稱為隨機森林或梯度提升的訓練指標</strong>。
            </p>
          </div>

          {/* 詳細逐筆測試表格 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">
                留一法（Leave-One-Out）逐筆測試明細
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                共 {result.details.length} 筆測試案例
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3.5 w-20">編號</th>
                    <th className="px-4 py-3.5">事故名稱</th>
                    <th className="px-4 py-3.5 w-28">作業類別</th>
                    <th className="px-4 py-3.5 w-32 font-mono">已記載和解金</th>
                    <th className="px-4 py-3.5 w-32 font-mono">留一法估算值</th>
                    <th className="px-4 py-3.5 w-32 font-mono">絕對誤差 |Error|</th>
                    <th className="px-4 py-3.5 w-24 text-center">參考鄰居數</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.details.map((d) => {
                    const matchedCase = cases.find((c) => c['案例ID'] === d.id);
                    return (
                      <tr
                        key={d.id}
                        onClick={() => matchedCase && onSelectCase(matchedCase)}
                        className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3 font-mono font-bold text-slate-800">
                          {d.id}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 group-hover:text-blue-700">
                          {d.title}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{d.work}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                          {formatMoney(d.actual)}
                        </td>
                        <td className="px-4 py-3 font-mono text-blue-700">
                          {formatMoney(Math.round(d.pred))}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-rose-600">
                          {formatMoney(Math.round(d.abs))}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-slate-500">
                          {d.neighbors} 筆
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
