import React, { useState, useEffect } from 'react';
import { Binary, RefreshCw, Sparkles, Sliders, Info, ArrowLeftRight } from 'lucide-react';
import { computeShapleyValues, SHAP_INPUT_LABELS } from '../utils/calculator';
import { ShapResult } from '../types/accident';

interface ShapViewProps {
  initialInput?: {
    work: string;
    height: number | null;
    belt: string;
    guard: string;
  };
}

export const ShapView: React.FC<ShapViewProps> = ({ initialInput }) => {
  const [work, setWork] = useState(initialInput?.work || '施工架');
  const [height, setHeight] = useState<number | null>(
    initialInput?.height !== undefined ? initialInput.height : 7.0
  );
  const [belt, setBelt] = useState(initialInput?.belt || '未使用');
  const [guard, setGuard] = useState(initialInput?.guard || '不足');
  const [statusMessage, setStatusMessage] = useState('操作示範（精確 Shapley 數值分解）');
  const [shapResult, setShapResult] = useState<ShapResult | null>(null);

  // 當輸入更動時即時重算
  useEffect(() => {
    const res = computeShapleyValues({
      work,
      height,
      belt,
      guard,
    });
    setShapResult(res);
    const sumContrib = res.contrib.reduce((a, b) => a + b, 0);
    setStatusMessage(
      `已即時計算｜基準 ${res.base} 分 → 最終評分 ${res.pred} 分；貢獻總和 ${sumContrib >= 0 ? '+' : ''}${sumContrib.toFixed(1)} 分`
    );
  }, [work, height, belt, guard]);

  // 更新 initialInput 時同步
  useEffect(() => {
    if (initialInput) {
      setWork(initialInput.work || '');
      setHeight(initialInput.height);
      setBelt(initialInput.belt || '');
      setGuard(initialInput.guard || '');
    }
  }, [initialInput]);

  const handleLoadDemo = () => {
    setWork('施工架');
    setHeight(7.0);
    setBelt('未使用');
    setGuard('不足');
  };

  const handleLoadSafeDemo = () => {
    setWork('模板工程');
    setHeight(2.5);
    setBelt('已使用');
    setGuard('完整');
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              SHAP｜風險評分貢獻分析實驗室
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
              精確 Shapley 數學分解
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            針對規則式危害篩檢評分，透過 16 種特徵子集枚舉計算嚴謹 Shapley 貢獻值，不冒充已訓練之隨機森林或黑箱神經網絡。
          </p>
        </div>
      </div>

      {/* 控制面板卡片 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-sm">
              即時調整施工條件 (SHAP 圖表將毫秒級重新計算)
            </h4>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleLoadDemo}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              載入高風險示範
            </button>
            <button
              onClick={handleLoadSafeDemo}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              載入安全達標示範
            </button>
          </div>
        </div>

        {/* 4 輸入項 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">作業類型</label>
            <select
              value={work}
              onChange={(e) => setWork(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">不指定／未知</option>
              <option value="模板工程">模板工程</option>
              <option value="鋼構作業">鋼構作業</option>
              <option value="施工架">施工架</option>
              <option value="屋頂／採光罩">屋頂／採光罩</option>
              <option value="樓板開口／外牆">樓板開口／外牆</option>
              <option value="梯具作業">梯具作業</option>
              <option value="吊掛作業">吊掛作業</option>
              <option value="設備維修">設備維修</option>
              <option value="電梯井">電梯井</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700">作業高度 (m)</label>
              <span className="font-mono text-slate-400 text-[11px]">
                {height !== null ? `${height} m` : '未指定'}
              </span>
            </div>
            <input
              type="number"
              min="0"
              max="50"
              step="0.5"
              value={height ?? ''}
              onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">安全帶使用狀況</label>
            <select
              value={belt}
              onChange={(e) => setBelt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">不指定／未知</option>
              <option value="未使用">未使用 (無防護具)</option>
              <option value="未確實勾掛">未確實勾掛</option>
              <option value="已使用">正確使用並勾掛</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">護欄及開口防護</label>
            <select
              value={guard}
              onChange={(e) => setGuard(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">不指定／未知</option>
              <option value="不足">防護不足 (開口未防)</option>
              <option value="完整">防護完整 (設合格護欄)</option>
            </select>
          </div>
        </div>

        {/* 狀態條 */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
          <span>{statusMessage}</span>
        </div>
      </div>

      {/* SHAP 成果瀑布圖 */}
      {shapResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">
                參考情境基準分數 (E[f(x)])
              </span>
              <div className="text-3xl font-black text-slate-800 font-mono">
                {shapResult.base} <span className="text-sm font-semibold">分</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                4 特徵皆處於空白未知狀態時的基準預測
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">
                目前輸入風險評分 (f(x))
              </span>
              <div className="text-3xl font-black text-blue-700 font-mono">
                {shapResult.pred} <span className="text-sm font-semibold">分</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {shapResult.pred >= 70
                  ? '高度危害缺失警示'
                  : shapResult.pred >= 45
                  ? '中度危害需排查'
                  : '目前條件風險相對受控'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">
                各因子 Shapley 貢獻總和 (∑ φi)
              </span>
              <div
                className={`text-3xl font-black font-mono ${
                  shapResult.pred >= shapResult.base ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {shapResult.pred - shapResult.base >= 0 ? '+' : ''}
                {(shapResult.pred - shapResult.base).toFixed(1)}{' '}
                <span className="text-sm font-semibold">分</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                嚴格等於目前分數與基準分數之差額
              </div>
            </div>
          </div>

          {/* 各特徵分解水平長條圖 */}
          <div className="space-y-4 pt-2">
            <h4 className="font-bold text-slate-900 text-sm">
              各安全要素邊際貢獻分解 (Shapley Values)
            </h4>

            <div className="space-y-3.5">
              {shapResult.contrib.map((phi, idx) => {
                const label = SHAP_INPUT_LABELS[idx];
                const isPositive = phi >= 0;
                const widthPct = Math.max(4, Math.min(100, Math.abs(phi) * 2.8));

                return (
                  <div key={label} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-slate-800 text-sm">{label}</strong>
                        <span className="text-slate-500 ml-2">
                          {idx === 0 && (height !== null ? `(${height} 公尺)` : '(未指定)')}
                          {idx === 1 && `(${belt || '未指定'})`}
                          {idx === 2 && `(${guard || '未指定'})`}
                          {idx === 3 && `(${work || '未指定'})`}
                        </span>
                      </div>
                      <div
                        className={`font-mono font-bold text-sm ${
                          isPositive ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isPositive ? `+${phi.toFixed(1)}` : phi.toFixed(1)} 分
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isPositive ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${widthPct}%` }}
                      ></div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>{isPositive ? '推高墜落危害風險' : '有助於降低現場風險'}</span>
                      <span>貢獻佔比約 {((Math.abs(phi) / 50) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 數學與學術嚴謹性透明聲明 */}
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 text-sky-950 text-xs leading-relaxed space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-sky-900">
              <Info className="w-4 h-4 text-sky-700 shrink-0" />
              <span>精確 Shapley 數學分解之公理滿足</span>
            </div>
            <p>
              本系統計算的是 1953 年由諾貝爾經濟學獎得主 Lloyd Shapley 提出的精確博弈論分配解。在 4 個施工輸入因子的全排列（共 16 種特徵子集遮罩）中，計算各特徵在各集合邊際變化並賦予對稱加權權重：
            </p>
            <div className="font-mono text-[11px] bg-white/70 p-2 rounded border border-sky-200 text-sky-900">
              φ_i = ∑_{'{S ⊆ F \\ {i}}'} [ |S|!(|F| - |S| - 1)! / |F|! ] × [ v(S ∪ {'{i}'}) - v(S) ]
            </div>
            <p>
              <strong>公理保證：</strong>完美滿足「有效性（Efficiency, 總和等於 f(x) - E[f(x)]）」、「對稱性（Symmetry）」與「虛無參與者（Dummy player）」公理。請注意：此模型解釋的是<strong>內建安衛專家規則系統</strong>，並非假冒隨機森林或神經網絡之 SHAP，亦不代表醫學因果關係。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
