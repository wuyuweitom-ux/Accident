import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  Code2,
  FileCheck,
  Binary,
  Layers,
} from 'lucide-react';

export const MethodologyView: React.FC = () => {
  const methods = [
    {
      status: '✓ 已完成',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: '事故資料匯入與結構化檢索',
      desc: '包含原始 Excel 主清單的 27 筆墜落事故、完整 22 欄資料；所有欄位在案例詳情彈窗中原封不動保留。具備全文檢索、作業類別篩選、驗證狀態過濾與 UTF-8 BOM CSV 匯出，全功能皆於瀏覽器端即時運算。',
    },
    {
      status: '✓ 已完成',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: '缺失值友善的 KNN 類比對演算法',
      desc: '比對作業類別（權重 4）、作業高度（權重 2）、安全帶（權重 3）及護欄開口（權重 2），僅使用使用者與案例雙方「已知有效欄位」計算距離。相似分數同時納入「共同欄位覆蓋率懲罰」，避免僅一欄吻合即誤判為高度相近；此為規則式距離排名，並非黑箱機器學習。',
    },
    {
      status: '△ 專家規則',
      statusClass: 'bg-blue-100 text-blue-800 border-blue-200',
      title: '規則式防護警示與法規排查',
      desc: '依使用者填入的防護缺失（如未使用安全帶、開口未設護欄、高度超過 2 公尺）提示需要優先檢查的法規項目（如《職業安全衛生設施規則》第 225 條、《營造安全衛生設施標準》第 19 條）；不輸出偽稱之事故發生機率，亦不等同法律合規之終局判定，仍需安衛人員現場查核。',
    },
    {
      status: '△ 情境推估',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      title: '經濟損失與工期延宕敏感度試算',
      desc: '金額以已知案例之中位數與透明危害調整係數進行情境試算，惟原始金額性質混雜（和解金、補償金、罰鍰）；工期則以使用者輸入之「假設停工天數 × (1 − 吸收比例)」試算，原始資料全無可歸責實際延宕天數標籤。兩者均不可視為歷史模型驗證之預測結果。',
    },
    {
      status: '△ 數學分解',
      statusClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      title: '精確 Shapley 分解與留一法 MAE',
      desc: '實作了和解紀錄的探索性 KNN 留一法 MAE（排除自身後以鄰居加權估算），以及針對 4 個規則因子的 16 種組合枚舉之精確 Shapley 數值分解（SHAP）。嚴正聲明隨機森林與梯度提升等大數據模型尚未受訓；這兩項成果不可冒稱為上述機器學習模型之 MAE 或 SHAP。',
    },
    {
      status: '△ 本地檢索',
      statusClass: 'bg-purple-100 text-purple-800 border-purple-200',
      title: '中文雙字組 TF-IDF 檢索增強式摘要 (RAG)',
      desc: '支援輸入自然語言關鍵字，以字元 2-gram 切分與逆文件頻率矩陣（TF-IDF）進行餘弦相似度比對，並用引用原始事故欄位的結構化模板產出有來源之客觀摘要；不包含任意幻覺生成之未受約束 LLM，確保所有文字皆有據可循。',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              運算方法、架構設計與研究限制
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              工程科學誠信原則
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            哪些功能已經完整實作、哪些尚缺實測資料標籤，向工程從業人員與審查委員全部公開透明。
          </p>
        </div>
      </div>

      {/* 6 大模組狀態清單 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((m, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${m.statusClass}`}
              >
                {m.status}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">模組 0{idx + 1}</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* 架構與部署說明卡 */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-600" />
          <span>架構設計與資料治理策略</span>
        </h4>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <strong className="text-slate-800 block mb-1">
              ① 零依賴、純前端可離線原型 (Offline Capable Prototype)
            </strong>
            所有資料庫查詢、KNN 距離運算、Shapley 組合枚舉、TF-IDF 文本向量比對均在現代瀏覽器 JavaScript 執行環境（V8）內直接完成，無需上傳至不可控之第三方後端，保障工地私密資訊不外洩。
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <strong className="text-slate-800 block mb-1">
              ② 支援自建企業專屬工傷事故資料庫 (Custom Incident Extension)
            </strong>
            安衛管理員可在「事故資料庫」頁面點選「新增事故紀錄」，新增後即時納入 KNN 比對、SHAP 分析與 RAG 檢索之資料池中，亦可一鍵匯出為標準 CSV。
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <strong className="text-slate-800 block mb-1">
              ③ 邁向第二階段生產版之工程建議 (Future Production Roadmap)
            </strong>
            若後續需要多工區、跨協力廠商共同協作，建議接入 PostgreSQL / Cloud SQL 並對「可歸責實際延宕天數」進行標準化欄位採集，方能正式訓練隨機森林回歸或 XGBoost 模型。
          </div>
        </div>
      </div>

      {/* 頁尾學術聲明 */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center text-[11px] text-slate-500">
        Accident Balancer · 營造工程高處墜落勞安風險評估原型系統　｜　情境試算不是經驗證預測、事故機率、實際工期或法定賠償金額
      </div>
    </div>
  );
};
