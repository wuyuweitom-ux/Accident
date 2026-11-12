import React from 'react';
import { X, ExternalLink, Copy, Check, AlertTriangle, Building2, Calendar, MapPin } from 'lucide-react';
import { AccidentCase } from '../types/accident';
import { formatMoney, isNum, raw } from '../utils/calculator';

interface CaseDetailModalProps {
  accident: AccidentCase | null;
  onClose: () => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({ accident, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!accident) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(accident['案例ID']);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fields: { key: keyof AccidentCase; label: string; isHighlight?: boolean }[] = [
    { key: '案例ID', label: '案例編號' },
    { key: '事故日期（可能僅年月）', label: '事故日期' },
    { key: '事故名稱', label: '事故名稱', isHighlight: true },
    { key: '事故地點', label: '事故地點' },
    { key: '作業類別', label: '作業類別', isHighlight: true },
    { key: '墜落／作業高度(m)', label: '墜落／作業高度 (m)' },
    { key: '護欄／開口防護', label: '護欄／開口防護' },
    { key: '安全帶／母索', label: '安全帶／母索狀況' },
    { key: '施工架／設備狀況', label: '施工架／設備狀況' },
    { key: '受傷人數', label: '受傷人數' },
    { key: '死亡人數', label: '死亡人數' },
    { key: '金額(元；依性質)', label: '金額 (新臺幣元)', isHighlight: true },
    { key: '金額性質', label: '金額性質' },
    { key: '停工天數', label: '停工天數' },
    { key: '事故可歸責實際延宕天數', label: '可歸責實際延宕天數' },
    { key: '風險分類', label: '風險分類' },
    { key: '來源類型／名稱', label: '來源類型／名稱' },
    { key: '來源網址', label: '來源網址' },
    { key: '資料驗證狀態', label: '資料驗證狀態' },
    { key: '資料批次', label: '資料批次' },
    { key: '事故敘述／原因', label: '事故敘述／發生原因', isHighlight: true },
    { key: '備註與待查事項', label: '備註與待查事項' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                {accident['案例ID']}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                  accident['資料驗證狀態'] === '已驗證'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {accident['資料驗證狀態'] || '待驗證'}
              </span>
              <button
                onClick={handleCopyId}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors ml-1"
                title="複製編號"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copied ? '已複製' : '複製ID'}</span>
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {accident['事故名稱']}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {accident['事故日期（可能僅年月）'] || '日期待查'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {accident['事故地點'] || '地點未詳'}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 22 attributes */}
        <div className="px-6 py-5 overflow-y-auto space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-100">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block mb-1">作業類別與高度</span>
              <div className="font-bold text-slate-800 text-sm">
                {accident['作業類別'] || '—'}
                {accident['墜落／作業高度(m)'] ? ` (${accident['墜落／作業高度(m)']} 公尺)` : ''}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block mb-1">已記載金額（若有）</span>
              <div className="font-bold text-slate-800 text-sm">
                {isNum(accident['金額(元；依性質)'])
                  ? formatMoney(accident['金額(元；依性質)'])
                  : '未記載金額'}
              </div>
              {accident['金額性質'] && (
                <div className="text-[11px] text-slate-500 mt-0.5">{accident['金額性質']}</div>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            {fields.map(({ key, label, isHighlight }) => {
              const val = accident[key];
              const isUrl = key === '來源網址' && typeof val === 'string' && val.startsWith('http');
              const isMoneyField = key === '金額(元；依性質)';

              return (
                <div
                  key={key}
                  className={`flex flex-col sm:flex-row sm:items-start justify-between py-1.5 px-2 rounded-lg gap-1 sm:gap-4 ${
                    isHighlight ? 'bg-sky-50/60 font-medium' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <span className="text-slate-500 shrink-0 font-medium w-36">
                    {label}
                  </span>
                  <div className="text-slate-800 grow sm:text-right break-words">
                    {isUrl ? (
                      <a
                        href={val as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1 font-medium"
                      >
                        <span>開啟原始調查來源</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : isMoneyField ? (
                      isNum(val) ? (
                        <span className="font-mono font-bold text-blue-700">
                          {formatMoney(val as number)}
                        </span>
                      ) : (
                        <span className="text-slate-400">未提供</span>
                      )
                    ) : val !== null && val !== undefined && raw(val) !== '' ? (
                      String(val)
                    ) : (
                      <span className="text-slate-400">未提供 / 無紀錄</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2 mt-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>資料學術與實務聲明：</strong>
              本清單為工程專題與實務案例彙整，部分欄位標示「待驗證」或無逐筆官方裁罰/判決連結；使用於現場風險評估時，應由各工程之專業專任工程人員及職業安全衛生人員親自查驗法規符合性。
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
