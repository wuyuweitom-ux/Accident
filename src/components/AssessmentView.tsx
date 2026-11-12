import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  Clock,
  DollarSign,
  Printer,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Info,
  ChevronRight,
  Flame,
  Check,
} from 'lucide-react';
import { AccidentCase, AssessmentInput, ScenarioEstimate, ShapResult, SimilarityResult } from '../types/accident';
import {
  computeScenarioEstimates,
  computeShapleyValues,
  computeSimilarity,
  formatMoney,
  SHAP_INPUT_LABELS,
} from '../utils/calculator';

interface AssessmentViewProps {
  cases: AccidentCase[];
  onSelectCase: (c: AccidentCase) => void;
  onSyncToShap: (input: { work: string; height: number | null; belt: string; guard: string }) => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  cases,
  onSelectCase,
  onSyncToShap,
}) => {
  const [input, setInput] = useState<AssessmentInput>({
    projectName: '施工現場高處作業風險評估',
    projectCost: 85000000,
    work: '施工架',
    height: 7.5,
    belt: '未使用',
    guard: '不足',
    assumedStop: 30,
    absorbed: 20,
    costFactor: 1.0,
  });

  const [hasEvaluated, setHasEvaluated] = useState(true);
  const [ranking, setRanking] = useState<SimilarityResult[]>([]);
  const [estimate, setEstimate] = useState<ScenarioEstimate | null>(null);
  const [shap, setShap] = useState<ShapResult | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);

  // 執行評估
  const runAssessment = (customInput?: AssessmentInput) => {
    const currentInput = customInput || input;

    if (
      !currentInput.work &&
      currentInput.height === null &&
      !currentInput.belt &&
      !currentInput.guard
    ) {
      setHasEvaluated(false);
      return;
    }

    // KNN 比對
    const ranked = cases
      .map((c) => computeSimilarity(c, currentInput))
      .filter((r) => r.used > 0)
      .sort((a, b) => b.score - a.score || b.used - a.used)
      .slice(0, 5);

    // 警示項目
    const alertList: string[] = [];
    if (currentInput.belt === '未使用') {
      alertList.push('🚨 未使用安全帶：嚴重違反防墜規定，須立即要求背負式安全帶與防墜索');
    } else if (currentInput.belt === '未確實勾掛') {
      alertList.push('⚠️ 安全帶未確實勾掛：僅穿戴未掛於母索或錨定點，不具防墜保護效能');
    }
    if (currentInput.guard === '不足') {
      alertList.push('🚨 護欄／開口防護不足：墜落邊緣無標準90cm護欄或安全網，屬重大危害');
    }
    if (currentInput.height !== null && currentInput.height >= 2) {
      alertList.push(
        `📌 高處作業（${currentInput.height}m）：達法規2公尺以上高處作業標準，應落實個人防護具與監督`
      );
    }
    if (currentInput.work === '屋頂／採光罩') {
      alertList.push('⚠️ 脆弱屋頂危害：易發生踏穿採光罩事故，應鋪設走道板與張掛安全網');
    }

    const est = computeScenarioEstimates(currentInput, ranked, cases);
    const sh = computeShapleyValues(currentInput);

    setRanking(ranked);
    setEstimate(est);
    setShap(sh);
    setAlerts(alertList);
    setHasEvaluated(true);
  };

  // 初始載入時評估一次
  React.useEffect(() => {
    runAssessment();
  }, [cases]);

  // 示範案例
  const loadHighRiskDemo = () => {
    const demo: AssessmentInput = {
      projectName: '外牆帷幕與施工架維修作業（高風險示範）',
      projectCost: 120000000,
      work: '施工架',
      height: 12.0,
      belt: '未使用',
      guard: '不足',
      assumedStop: 45,
      absorbed: 15,
      costFactor: 1.2,
    };
    setInput(demo);
    runAssessment(demo);
  };

  const loadStandardDemo = () => {
    const demo: AssessmentInput = {
      projectName: '結構體模板施工作業（標準達標示範）',
      projectCost: 65000000,
      work: '模板工程',
      height: 3.5,
      belt: '已使用',
      guard: '完整',
      assumedStop: 14,
      absorbed: 40,
      costFactor: 0.9,
    };
    setInput(demo);
    runAssessment(demo);
  };

  const handleReset = () => {
    const empty: AssessmentInput = {
      projectName: '',
      projectCost: null,
      work: '',
      height: null,
      belt: '',
      guard: '',
      assumedStop: 30,
      absorbed: 20,
      costFactor: 1.0,
    };
    setInput(empty);
    setHasEvaluated(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* 左側：參數輸入面板 */}
      <div className="lg:col-span-5 space-y-5 print:hidden">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h3 className="font-bold text-slate-900 text-sm">施工現場條件輸入面板</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">現場查核參數</span>
          </div>

          <div className="p-5 space-y-4 text-xs">
            {/* 專案基本資料 */}
            <div className="border-b border-slate-100 pb-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                工程基本資料
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    專案名稱
                  </label>
                  <input
                    type="text"
                    value={input.projectName}
                    onChange={(e) => setInput({ ...input, projectName: e.target.value })}
                    placeholder="例：信義區新建工程第3工區"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    工程總造價 (新臺幣元)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={input.projectCost ?? ''}
                    onChange={(e) =>
                      setInput({
                        ...input,
                        projectCost: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="例：80,000,000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 施工高處作業環境 */}
            <div className="border-b border-slate-100 pb-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                高處作業條件 (影響 KNN 與風險分數)
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    作業類型 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={input.work}
                    onChange={(e) => setInput({ ...input, work: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">請選擇作業類型（或不指定）</option>
                    <option value="模板工程">模板工程 (組模、拆模、支撐架設)</option>
                    <option value="鋼構作業">鋼構作業 (梁柱吊裝、高空螺栓接合)</option>
                    <option value="施工架">施工架 (外牆鷹架組拆、踏板作業)</option>
                    <option value="屋頂／採光罩">屋頂／採光罩 (浪板修繕、採光天窗)</option>
                    <option value="樓板開口／外牆">樓板開口／外牆 (電梯口、管道間、邊緣)</option>
                    <option value="梯具作業">梯具作業 (合梯、移動梯、登高梯)</option>
                    <option value="吊掛作業">吊掛作業 (起重機吊裝、吊籠作業)</option>
                    <option value="設備維修">設備維修 (高空管線、機電設備檢修)</option>
                    <option value="電梯井">電梯井 (軌道安裝、井道施工)</option>
                    <option value="其他">其他營造工程作業</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-700">
                      作業高度 (公尺)
                    </label>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {input.height !== null ? `${input.height} m` : '未指定'}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      step="0.5"
                      value={input.height ?? ''}
                      onChange={(e) =>
                        setInput({
                          ...input,
                          height: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="例：7.5"
                      className="w-28 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-mono"
                    />
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="0.5"
                      value={input.height ?? 0}
                      onChange={(e) =>
                        setInput({ ...input, height: Number(e.target.value) })
                      }
                      className="grow accent-blue-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    法規依據：依《職業安全衛生設施規則》第225條，高度2公尺以上即屬高處作業。
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      安全帶配戴與使用
                    </label>
                    <select
                      value={input.belt}
                      onChange={(e) => setInput({ ...input, belt: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">不指定／未知</option>
                      <option value="未使用">未使用安全帶 (嚴重缺失)</option>
                      <option value="未確實勾掛">未確實勾掛 (有穿但未鉤安全母索)</option>
                      <option value="已使用">正確使用並確實勾掛錨定</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      護欄及開口防護
                    </label>
                    <select
                      value={input.guard}
                      onChange={(e) => setInput({ ...input, guard: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">不指定／未知</option>
                      <option value="不足">防護不足 (無護欄或有未覆蓋開口)</option>
                      <option value="完整">防護完整 (設有符合規範護欄/安全網)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 衍生影響試算假設 (延宕與財務) */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                情境試算假設參數 (非經驗證模型)
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    假設停工天數 (天)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={input.assumedStop}
                    onChange={(e) =>
                      setInput({ ...input, assumedStop: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    趕工可吸收天數比例 (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={input.absorbed}
                    onChange={(e) =>
                      setInput({
                        ...input,
                        absorbed: Math.min(100, Math.max(0, Number(e.target.value))),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  造價或事故規模調整係數
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={input.costFactor}
                    onChange={(e) =>
                      setInput({ ...input, costFactor: Math.max(0.1, Number(e.target.value)) })
                    }
                    className="w-24 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-mono"
                  />
                  <span className="text-[11px] text-slate-500">
                    （基準 1.0；大型統包或深開挖工程可調高至 1.2~1.5）
                  </span>
                </div>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => runAssessment()}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>執行勞安風險情境試算</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={loadHighRiskDemo}
                  className="py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  <span>載入高風險示範</span>
                </button>
                <button
                  type="button"
                  onClick={loadStandardDemo}
                  className="py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>載入達標示範</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full py-1.5 text-center text-slate-400 hover:text-slate-600 text-[11px] flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>清空並重設為空白輸入</span>
              </button>
            </div>
          </div>
        </div>

        {/* 提示小卡 */}
        <div className="p-4 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-600 text-xs space-y-1.5">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>演算法設計哲學</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            本系統比照工程界嚴謹標準：不使用未經驗證之不透明深度學習模型假冒事故機率，而是以<strong>「透明規則危害篩檢」</strong>結合<strong>「真實案例已知欄位 KNN 距離」</strong>，為安衛人員提供具備可追溯來源的決策依據。
          </p>
        </div>
      </div>

      {/* 右側：評估成果與深度報告 */}
      <div className="lg:col-span-7 space-y-6">
        {!hasEvaluated ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">請先於左側輸入作業條件</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
              請至少輸入作業類型、高度、安全帶或護欄狀況中的一項，系統將即時於資料庫中比對相似真實事故並產生情境推估。
            </p>
            <button
              onClick={loadHighRiskDemo}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>載入高風險示範情境試算</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6" id="printableReport">
            {/* 報告首部 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      研究情境推估 · 未經驗證預測
                    </span>
                    <span className="text-xs text-slate-400">
                      基於 {cases.length} 筆候選事故比對
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {input.projectName || '施工現場'} · 勞安風險篩檢與情境試算報告
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>列印 / 匯出 PDF</span>
                  </button>
                  <button
                    onClick={() => onSyncToShap(input)}
                    className="px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="在 SHAP 實驗室手動微調各特徵"
                  >
                    <span>同步至 SHAP 實驗室</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 重要學術提示 */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs leading-relaxed">
                <strong>重要法律與專業聲明：</strong>
                本評估產出之危害篩檢分數、情境金額與工期天數，是基於透明公式的<strong>情境試算</strong>，並非由大數據自動訓練出的黑箱隨機森林或梯度提升機器學習模型，亦<strong>不等同事故實際發生機率或法規符合性判斷</strong>。各工程現場仍應由專任工程人員及職業安全衛生人員親至現場查證。
              </div>

              {/* 雙指標儀表盤 */}
              {estimate && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div
                    className={`p-4 rounded-xl border ${
                      estimate.score >= 70
                        ? 'bg-rose-50/70 border-rose-200'
                        : estimate.score >= 45
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-emerald-50/70 border-emerald-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-slate-600">
                        墜落危害篩檢分數 (0–100)
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          estimate.score >= 70
                            ? 'bg-rose-100 text-rose-800'
                            : estimate.score >= 45
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {estimate.score >= 70
                          ? '防護缺失警示多'
                          : estimate.score >= 45
                          ? '需進一步改善'
                          : '暫無重大警示'}
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 font-mono mt-1">
                      {estimate.score}{' '}
                      <span className="text-sm font-semibold text-slate-500">分</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full transition-all duration-500 ${
                          estimate.score >= 70
                            ? 'bg-rose-600'
                            : estimate.score >= 45
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${estimate.score}%` }}
                      ></div>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2">
                      依作業高度({input.height ?? '未填'}m)、安全帶({input.belt || '未填'})、護欄(
                      {input.guard || '未填'})等規則式加權。
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/60">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-slate-600">
                        最高真實案例相似度
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                        KNN 雙方已知欄位比對
                      </span>
                    </div>
                    <div className="text-3xl font-black text-blue-900 font-mono mt-1">
                      {ranking.length ? `${Math.round(ranking[0].score * 100)}%` : '無法比對'}
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{
                          width: `${ranking.length ? Math.round(ranking[0].score * 100) : 0}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2">
                      {ranking.length
                        ? `最吻合事故：${ranking[0].case['案例ID']} ${ranking[0].case['事故名稱']}`
                        : '尚無足夠已知欄位比對'}
                    </div>
                  </div>
                </div>
              )}

              {/* 安全缺失警示清單 */}
              {alerts.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="text-xs font-bold text-slate-700">現場優先防護排查重點：</div>
                  <div className="flex flex-wrap gap-2">
                    {alerts.map((alt, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/90 shadow-2xs"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ① 事故經濟損失：情境金額試算 */}
            {estimate && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    ①
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    事故經濟損失：情境金額試算
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block mb-1">
                      情境推估金額（非保證實際損失）
                    </span>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {estimate.money !== null ? formatMoney(estimate.money) : '無金額紀錄可參考'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      以相似案例中位數 × 危害係數 ({estimate.multiplier.toFixed(2)}) 試算
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block mb-1">
                      參考資料統計來源
                    </span>
                    <div className="text-lg font-bold text-slate-800">
                      {estimate.moneySource} ({estimate.moneyN} 筆)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      基準中位數金額：{formatMoney(estimate.baseAmount)}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  <strong>推估性質說明：</strong>原始資料中記載的金額來源包含民事和解金、勞基法補償金與違約金等，性質混雜；故此數值<strong>不可作為法院判決保證或實際意外總損失之預測</strong>，僅供工程管理之情境風險敏感度衡量。
                </p>
              </div>
            )}

            {/* ② 工期延宕：假設式情境試算 */}
            {estimate && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    ②
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    工期延宕：假設式情境試算
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block mb-1">
                      事故工期延宕推估
                    </span>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {estimate.delay} <span className="text-sm font-semibold">天</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      公式：假設停工 {estimate.assumedStop} 天 × (1 − {estimate.absorbed}% 吸收)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block mb-1">
                      敏感度情境範圍 (非統計信賴區間)
                    </span>
                    <div className="text-xl font-bold text-slate-800 font-mono">
                      {estimate.low} ～ {estimate.high} 天
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      依 ±50% 趕工與排程調配彈性試算
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  <strong>資料集邊界聲明：</strong>原始 27 筆資料中「事故可歸責實際延宕天數」欄位全為空值（僅有局部停工天數記載），因此<strong>目前無真實歷史工期延宕數據可供訓練驗證</strong>。此結果純屬排程管理假設公式。
                </p>
              </div>
            )}

            {/* ③ 最相近的真實事故候選案例 (KNN) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    ③
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    最相近的真實事故候選案例 (KNN 雙向已知欄位排名)
                  </h4>
                </div>
                <span className="text-xs text-slate-400">點擊查看 22 欄詳細紀錄</span>
              </div>

              {ranking.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">無相近案例</div>
              ) : (
                <div className="space-y-2.5">
                  {ranking.map((r) => {
                    const c = r.case;
                    return (
                      <button
                        key={c['案例ID']}
                        onClick={() => onSelectCase(c)}
                        className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex items-center justify-between gap-4 group cursor-pointer"
                      >
                        <div className="space-y-1 grow min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                              {c['案例ID']}
                            </span>
                            <h5 className="font-bold text-slate-900 text-sm truncate">
                              {c['事故名稱']}
                            </h5>
                          </div>
                          <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                            <span>日期：{c['事故日期（可能僅年月）'] || '待查'}</span>
                            <span>類別：{c['作業類別']}</span>
                            {c['墜落／作業高度(m)'] && (
                              <span>高度：{c['墜落／作業高度(m)']}m</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            相同欄位：{r.matched.join('、') || '無明確吻合'}（共比對 {r.used} 欄）
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="text-lg font-black text-blue-700 font-mono">
                            {Math.round(r.score * 100)}%
                          </div>
                          <div className="text-[10px] text-slate-400">相似度分數</div>
                          <div className="text-xs text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 justify-end mt-1">
                            <span>詳情</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ④ SHAP 本次危害評分因素貢獻 */}
            {shap && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      ④
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      SHAP｜本次危害評分因素貢獻 (精確 Shapley 分解)
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    4 因子 16 組合枚舉
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-100">
                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="text-[11px] text-slate-500 block">基準情境分數</span>
                    <div className="text-xl font-black text-slate-800 font-mono">
                      {shap.base} 分
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="text-[11px] text-slate-500 block">本次評估總分</span>
                    <div className="text-xl font-black text-blue-800 font-mono">
                      {shap.pred} 分
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {shap.contrib.map((pt, idx) => {
                    const isPositive = pt >= 0;
                    const widthPct = Math.max(5, Math.min(100, Math.abs(pt) * 2.8));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700">
                            {SHAP_INPUT_LABELS[idx]}
                          </span>
                          <span
                            className={`font-mono font-bold ${
                              isPositive ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {isPositive ? `+${pt.toFixed(1)}` : pt.toFixed(1)} 分
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isPositive ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${widthPct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  <strong>Shapley 數學特性驗證：</strong>本分析經枚舉全域 16 種特徵子集子空間計算邊際貢獻，嚴格滿足局域精確性（總貢獻和 = 目前分數 − 基準分數）。此解釋針對內建規則危害篩檢函數，不假裝為隨機森林或黑箱神經網絡之 SHAP。
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
