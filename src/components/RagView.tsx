import React, { useState } from 'react';
import { Search, Sparkles, BookOpen, ExternalLink, HelpCircle, ArrowRight } from 'lucide-react';
import { AccidentCase, RagResultItem } from '../types/accident';
import { raw, searchRag } from '../utils/calculator';

interface RagViewProps {
  cases: AccidentCase[];
  onSelectCase: (c: AccidentCase) => void;
}

export const RagView: React.FC<RagViewProps> = ({ cases, onSelectCase }) => {
  const [query, setQuery] = useState('未繫安全帶從施工架墜落的事故有哪些？');
  const [results, setResults] = useState<RagResultItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const sampleQueries = [
    '未繫安全帶從施工架墜落',
    '屋頂採光罩踏穿墜落',
    '樓板開口邊緣防護不足',
    '吊掛作業高空墜落',
    '合梯與梯具作業墜落',
    '中油煉油廠吊掛工安事故',
  ];

  const handleSearch = (qText?: string) => {
    const q = (qText !== undefined ? qText : query).trim();
    if (!q) return;
    const hits = searchRag(q, cases);
    setResults(hits);
    setHasSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* 標題 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              RAG｜有來源的相似事故檢索問答
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              本地中文雙字組 TF-IDF 檢索增強摘要
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            由資料庫 {cases.length} 筆原始事故文字自動檢索，精準比對自然語言問題，僅以命中案例的文字整理回答，保證 0 幻覺。
          </p>
        </div>
      </div>

      {/* 搜尋卡片 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例如：未繫安全帶從施工架墜落的事故有哪些？"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>檢索案例</span>
          </button>
        </div>

        {/* 推薦問題快捷標籤 */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            試試常見事故情境：
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sq) => (
              <button
                key={sq}
                onClick={() => {
                  setQuery(sq);
                  handleSearch(sq);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200/80 text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{sq}</span>
                <ArrowRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 檢索結果展示 */}
      {!hasSearched ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-10 text-center space-y-2 text-slate-500 text-xs">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">輸入問題後，系統將比對所有事故敘述與防護紀錄</p>
          <p className="text-slate-400">所有引述皆標註來源案例編號與原始文字</p>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-8 text-center text-slate-500 text-xs">
          目前的事故資料庫中沒有足夠吻合的描述，無法據此回答。請嘗試其他關鍵字。
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-950 text-xs leading-relaxed">
            <strong>檢索增強式摘要報告：</strong>
            依問題「<strong>{query}</strong>」，從現有資料庫中檢索出{' '}
            <strong>{results.length} 筆</strong> 相關事故紀錄。下方每段摘要直接摘用原始案例欄位，未填資料不推測；部分來源尚待查證。
          </div>

          <div className="space-y-3.5">
            {results.map(({ case: c, score }) => (
              <div
                key={c['案例ID']}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3 hover:border-purple-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      {c['案例ID']}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {c['事故名稱']}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-mono">
                      TF-IDF 吻合分數：{(score * 100).toFixed(1)}
                    </span>
                    <button
                      onClick={() => onSelectCase(c)}
                      className="text-purple-600 hover:text-purple-800 font-bold hover:underline cursor-pointer"
                    >
                      查看 22 欄詳情 ›
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    <strong className="text-slate-800">事故敘述／發生原因：</strong>
                    <span className="text-slate-700">{c['事故敘述／原因'] || '未提供詳細敘述'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <div>
                      <strong>作業類型：</strong> {c['作業類別']}
                      {c['墜落／作業高度(m)'] ? ` (${c['墜落／作業高度(m)']} 公尺)` : ''}
                    </div>
                    <div>
                      <strong>安全防護紀錄：</strong>
                      安全帶[{c['安全帶／母索'] || '無紀錄'}] ／ 護欄[{c['護欄／開口防護'] || '無紀錄'}]
                    </div>
                    <div>
                      <strong>事故地點：</strong> {c['事故地點'] || '未詳'}
                    </div>
                    <div>
                      <strong>來源網址與狀態：</strong>
                      <span className="mr-1">[{c['資料驗證狀態'] || '待驗證'}]</span>
                      {raw(c['來源網址']).startsWith('http') ? (
                        <a
                          href={c['來源網址']!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>查看官方/報導來源</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400">未附有效來源網址</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <strong>演算法透明聲明：</strong>
            本功能使用客戶端純 JavaScript 運算之「中文雙字組（2-gram）字元切分」與 TF-IDF 逆文件頻率矩陣計算餘弦相似度，並以確定性模板直接抽取命中之欄位內容。<strong>這是有來源支撐的檢索增強式摘要，並非具備任意生成能力的大型語言模型，絕不會無中生有產生資料庫以外的未證實內容。</strong>
          </div>
        </div>
      )}
    </div>
  );
};
