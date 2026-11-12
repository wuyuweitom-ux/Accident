import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Plus,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { AccidentCase } from '../types/accident';
import { exportCasesToCsv, formatMoney, isNum, normalize, raw } from '../utils/calculator';

interface DatabaseViewProps {
  cases: AccidentCase[];
  onSelectCase: (c: AccidentCase) => void;
  onAddCase: (c: AccidentCase) => void;
  onResetToDefault: () => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  cases,
  onSelectCase,
  onAddCase,
  onResetToDefault,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // 新增案例表單狀態
  const [newCase, setNewCase] = useState<Partial<AccidentCase>>({
    '案例ID': `F${String(cases.length + 1).padStart(3, '0')}`,
    '事故日期（可能僅年月）': '2025-06-15',
    '事故名稱': '',
    '事故地點': '',
    '作業類別': '施工架',
    '墜落／作業高度(m)': 5.0,
    '護欄／開口防護': '防護不足',
    '安全帶／母索': '未確實勾掛',
    '施工架／設備狀況': '',
    '受傷人數': 1,
    '死亡人數': 0,
    '金額(元；依性質)': 1200000,
    '金額性質': '自建企業工傷慰問與和解金',
    '停工天數': 14,
    '事故可歸責實際延宕天數': 7,
    '風險分類': '施工架',
    '來源類型／名稱': '內部工安查驗紀錄',
    '來源網址': null,
    '資料驗證狀態': '已驗證',
    '資料批次': '使用者新增自訂資料',
    '事故敘述／原因': '',
    '備註與待查事項': '現場自行登錄案例',
  });

  // 唯一作業類別與狀態選單
  const workTypes = useMemo(() => {
    return Array.from(new Set(cases.map((c) => raw(c['作業類別'])).filter(Boolean))).sort();
  }, [cases]);

  const statuses = useMemo(() => {
    return Array.from(new Set(cases.map((c) => raw(c['資料驗證狀態'])).filter(Boolean))).sort();
  }, [cases]);

  // 篩選後資料
  const filteredCases = useMemo(() => {
    const q = normalize(searchTerm);
    return cases.filter((c) => {
      const matchQuery =
        !q ||
        Object.values(c).some((v) => normalize(v).includes(q));
      const matchType = !typeFilter || c['作業類別'] === typeFilter;
      const matchStatus = !statusFilter || c['資料驗證狀態'] === statusFilter;
      return matchQuery && matchType && matchStatus;
    });
  }, [cases, searchTerm, typeFilter, statusFilter]);

  // 統計數據
  const moneyCount = cases.filter((c) => isNum(c['金額(元；依性質)'])).length;
  const delayCount = cases.filter((c) => isNum(c['事故可歸責實際延宕天數'])).length;

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCase['事故名稱']) {
      alert('請填寫事故名稱');
      return;
    }
    onAddCase(newCase as AccidentCase);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 頂部說明與狀態卡 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              事故案例資料庫主清單
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              全欄位 22 欄完整保留
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            原始 Excel 27 筆墜落事故調查主清單與使用者新增紀錄；可全文檢索、多維篩選與匯出 CSV。
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportCasesToCsv(filteredCases)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>匯出 CSV (Excel 友善)</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>新增事故紀錄</span>
          </button>
        </div>
      </div>

      {/* 3 統計卡 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            事故候選資料庫總數
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {cases.length} <span className="text-xs font-medium text-slate-500">筆</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">含原始 27 筆及自訂案例</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            具有數字型金額紀錄
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {moneyCount} <span className="text-xs font-medium text-slate-500">筆</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">涵蓋和解、補償或罰鍰</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            實際工期延宕有填數值
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {delayCount} <span className="text-xs font-medium text-slate-500">筆</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">不可用停工天數直接冒充</div>
        </div>
      </div>

      {/* 篩選工具列 */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋案例編號、事故名稱、作業類別、地點或原因關鍵字..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">全部作業類別 ({workTypes.length})</option>
              {workTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">全部驗證狀態</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            顯示 <strong className="text-slate-800">{filteredCases.length}</strong> / {cases.length} 筆事故紀錄
          </div>
          {(searchTerm || typeFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('');
                setStatusFilter('');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>重設篩選條件</span>
            </button>
          )}
        </div>
      </div>

      {/* 事故清單表格 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-20">編號</th>
                <th className="px-4 py-3.5 min-w-[200px]">事故名稱與日期</th>
                <th className="px-4 py-3.5 w-28">作業類別</th>
                <th className="px-4 py-3.5 min-w-[150px]">事故地點</th>
                <th className="px-4 py-3.5 w-32">已記載金額</th>
                <th className="px-4 py-3.5 w-24">驗證狀態</th>
                <th className="px-4 py-3.5 w-24 text-right">詳情操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-xs">
                    查無符合條件的事故紀錄
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr
                    key={c['案例ID']}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectCase(c)}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">
                      {c['案例ID']}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {c['事故名稱']}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {c['事故日期（可能僅年月）'] || '日期待查'}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {c['作業類別']}
                    </td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-xs">
                      {c['事故地點'] || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-800">
                      {isNum(c['金額(元；依性質)']) ? (
                        <span className="text-blue-700 font-semibold">
                          {formatMoney(c['金額(元；依性質)'])}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          c['資料驗證狀態'] === '已驗證'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {c['資料驗證狀態'] || '待驗證'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(c);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs inline-flex items-center gap-0.5 group-hover:underline cursor-pointer"
                      >
                        <span>完整 22 欄 ›</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新增案例彈窗 */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-auto text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">新增事故案例至本地資料庫</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">案例ID</label>
                  <input
                    type="text"
                    value={newCase['案例ID']}
                    onChange={(e) => setNewCase({ ...newCase, '案例ID': e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">事故日期</label>
                  <input
                    type="text"
                    value={newCase['事故日期（可能僅年月）'] || ''}
                    onChange={(e) =>
                      setNewCase({ ...newCase, '事故日期（可能僅年月）': e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">事故名稱 *</label>
                <input
                  type="text"
                  value={newCase['事故名稱'] || ''}
                  onChange={(e) => setNewCase({ ...newCase, '事故名稱': e.target.value })}
                  placeholder="例：高科技廠房無塵室施工架墜落事故"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">作業類別</label>
                  <select
                    value={newCase['作業類別']}
                    onChange={(e) => setNewCase({ ...newCase, '作業類別': e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  >
                    <option value="施工架">施工架</option>
                    <option value="模板工程">模板工程</option>
                    <option value="鋼構作業">鋼構作業</option>
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
                  <label className="block font-semibold text-slate-700 mb-1">作業高度(m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCase['墜落／作業高度(m)'] ?? ''}
                    onChange={(e) =>
                      setNewCase({
                        ...newCase,
                        '墜落／作業高度(m)': e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">事故地點</label>
                <input
                  type="text"
                  value={newCase['事故地點'] || ''}
                  onChange={(e) => setNewCase({ ...newCase, '事故地點': e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">已記載金額 (NT$)</label>
                  <input
                    type="number"
                    value={newCase['金額(元；依性質)'] ?? ''}
                    onChange={(e) =>
                      setNewCase({
                        ...newCase,
                        '金額(元；依性質)': e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">停工天數</label>
                  <input
                    type="number"
                    value={newCase['停工天數'] ?? ''}
                    onChange={(e) =>
                      setNewCase({
                        ...newCase,
                        '停工天數': e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">事故敘述／原因</label>
                <textarea
                  rows={2}
                  value={newCase['事故敘述／原因'] || ''}
                  onChange={(e) =>
                    setNewCase({ ...newCase, '事故敘述／原因': e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                >
                  加入資料庫
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
