import { AccidentCase, AssessmentInput, MaeResult, RagResultItem, ScenarioEstimate, ShapResult, SimilarityResult } from '../types/accident';

export const CASE_KEYS = {
  id: '案例ID',
  date: '事故日期（可能僅年月）',
  title: '事故名稱',
  place: '事故地點',
  work: '作業類別',
  height: '墜落／作業高度(m)',
  guard: '護欄／開口防護',
  belt: '安全帶／母索',
  scaffold: '施工架／設備狀況',
  injury: '受傷人數',
  deaths: '死亡人數',
  money: '金額(元；依性質)',
  moneyType: '金額性質',
  stop: '停工天數',
  delay: '事故可歸責實際延宕天數',
  risk: '風險分類',
  sourceType: '來源類型／名稱',
  url: '來源網址',
  status: '資料驗證狀態',
  batch: '資料批次',
  desc: '事故敘述／原因',
  notes: '備註與待查事項',
} as const;

export const raw = (x: unknown): string => {
  if (x === null || x === undefined) return '';
  return String(x).trim();
};

export const isNum = (x: unknown): x is number => {
  return typeof x === 'number' && Number.isFinite(x);
};

export const formatMoney = (n: number | null | undefined): string => {
  if (isNum(n)) {
    return 'NT$ ' + n.toLocaleString('zh-TW');
  }
  return '未提供';
};

export const normalize = (s: unknown): string => {
  return raw(s)
    .toLowerCase()
    .replace(/[\s／、・／｜/]/g, '');
};

export const workGroup = (s: unknown): string => {
  const t = normalize(s);
  if (/模板|板模/.test(t)) return '模板工程';
  if (/鋼構|鋼梁/.test(t)) return '鋼構作業';
  if (/施工架|鷹架/.test(t)) return '施工架';
  if (/屋頂|採光罩|浪板|太陽能/.test(t)) return '屋頂／採光罩';
  if (/開口|外牆/.test(t)) return '樓板開口／外牆';
  if (/合梯|移動梯|管架梯|梯具/.test(t)) return '梯具作業';
  if (/吊掛/.test(t)) return '吊掛作業';
  if (/電梯井/.test(t)) return '電梯井';
  if (/起重機|維修|高空作業車/.test(t)) return '設備維修';
  return raw(s) || '其他';
};

export const getHeight = (c: AccidentCase): number | null => {
  const x = c[CASE_KEYS.height as keyof AccidentCase];
  if (isNum(x)) return x;
  const m = raw(x).match(/\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};

export const beltCat = (v: unknown): string => {
  const t = normalize(v);
  if (!t || /未載|不明|無資料|未知|待查/.test(t)) return '';
  if (/未確實|未勾|未掛|未正確|沒有勾|未扣/.test(t)) return '未確實勾掛';
  if (/未使用|未繫|未穿|無安全帶|沒有安全帶|未配戴/.test(t)) return '未使用';
  if (/已使用|確實勾掛|正確勾掛|有使用/.test(t)) return '已使用';
  return '';
};

export const guardCat = (v: unknown): string => {
  const t = normalize(v);
  if (!t || /未載|不明|無資料|未知|待查/.test(t)) return '';
  if (/不足|缺|未設|未防護|無護欄|開口/.test(t)) return '不足';
  if (/完整|已設|符合/.test(t)) return '完整';
  return '';
};

// KNN 相似比對
export const computeSimilarity = (
  c: AccidentCase,
  inp: { work: string; height: number | null; belt: string; guard: string }
): SimilarityResult => {
  let total = 0;
  let max = 0;
  const matches: string[] = [];
  const diff: string[] = [];
  const missing: string[] = [];

  const compare = (
    label: string,
    user: string | number | null | undefined,
    caseValue: string | number | null | undefined,
    wt: number,
    fn: (a: any, b: any) => number
  ) => {
    if (user === null || user === undefined || user === '') return;
    max += wt;
    if (caseValue === null || caseValue === undefined || caseValue === '') {
      missing.push(label);
      return;
    }
    const score = fn(user, caseValue);
    total += wt * score;
    if (score > 0.75) matches.push(label);
    else if (score < 0.5) diff.push(label);
  };

  compare(
    '作業類型',
    inp.work,
    workGroup(c['作業類別']),
    4,
    (a: string, b: string) => {
      if (a === b) return 1;
      const combined = normalize(raw(c['作業類別']) + raw(c['風險分類']) + raw(c['事故名稱']));
      return combined.includes(normalize(a).slice(0, 2)) ? 0.65 : 0;
    }
  );

  compare(
    '作業高度',
    inp.height,
    getHeight(c),
    2,
    (a: number, b: number) => {
      return Math.max(0, 1 - Math.abs(a - b) / Math.max(5, a, b));
    }
  );

  compare(
    '安全帶',
    inp.belt,
    beltCat(raw(c['安全帶／母索']) + ' ' + raw(c['事故敘述／原因'])),
    3,
    (a: string, b: string) => (a === b ? 1 : 0)
  );

  compare(
    '護欄／開口防護',
    inp.guard,
    guardCat(raw(c['護欄／開口防護'])),
    2,
    (a: string, b: string) => (a === b ? 1 : 0)
  );

  const missingWeightSum = missing.reduce((sum, label) => {
    const weights: Record<string, number> = {
      作業類型: 4,
      作業高度: 2,
      安全帶: 3,
      '護欄／開口防護': 2,
    };
    return sum + (weights[label] || 0);
  }, 0);

  const coverage = max ? Math.min(1, (max - missingWeightSum) / max) : 0;
  const confidence = coverage > 0 ? (total / max) * (0.45 + 0.55 * coverage) : 0;

  const used = ['作業類型', '作業高度', '安全帶', '護欄／開口防護'].filter(
    (x) =>
      !missing.includes(x) &&
      ((x === '作業類型' && inp.work) ||
        (x === '作業高度' && inp.height !== null) ||
        (x === '安全帶' && inp.belt) ||
        (x === '護欄／開口防護' && inp.guard))
  ).length;

  return {
    case: c,
    score: confidence,
    coverage,
    matched: matches,
    different: diff,
    missing,
    used,
  };
};

export const median = (nums: number[]): number | null => {
  const a = nums.filter(Number.isFinite).sort((x, y) => x - y);
  if (!a.length) return null;
  return a.length % 2 === 1 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
};

// 規則式風險危害篩檢分數 (0 - 100)
export const calculateRiskRule = (i: {
  work: string;
  height: number | null;
  belt: string;
  guard: string;
}): number => {
  const v =
    (i.height === null ? 12 : i.height >= 10 ? 31 : i.height >= 5 ? 24 : i.height >= 2 ? 17 : 8) +
    (i.belt === '未使用' ? 29 : i.belt === '未確實勾掛' ? 24 : i.belt === '已使用' ? 3 : 12) +
    (i.guard === '不足' ? 28 : i.guard === '完整' ? 2 : 12) +
    (i.work === '屋頂／採光罩' || i.work === '電梯井' ? 12 : i.work === '施工架' ? 9 : 6);
  return Math.min(100, Math.max(0, v));
};

// 情境推估計算
export const computeScenarioEstimates = (
  inp: AssessmentInput,
  ranking: SimilarityResult[],
  cases: AccidentCase[]
): ScenarioEstimate => {
  const score = calculateRiskRule(inp);

  const allAmounts = cases
    .map((c) => c['金額(元；依性質)'])
    .filter((x): x is number => isNum(x) && x > 0);

  const similarAmounts = ranking
    .filter((r) => isNum(r.case['金額(元；依性質)']) && (r.case['金額(元；依性質)'] as number) > 0)
    .map((r) => r.case['金額(元；依性質)'] as number);

  const chosen = similarAmounts.length ? similarAmounts : allAmounts;
  const baseAmount = median(chosen);

  const multiplier = Math.max(
    0.5,
    Math.min(2.0, (0.75 + score / 200) * (inp.costFactor || 1))
  );

  const money = baseAmount === null ? null : Math.round((baseAmount * multiplier) / 1000) * 1000;

  const assumedStop = Math.max(0, Math.min(3650, inp.assumedStop || 0));
  const absorbed = Math.max(0, Math.min(100, inp.absorbed || 0));
  const delay = Math.round(assumedStop * (1 - absorbed / 100) * 10) / 10;
  const low = Math.round(delay * 0.5 * 10) / 10;
  const high = Math.round(delay * 1.5 * 10) / 10;

  return {
    score,
    money,
    moneySource: similarAmounts.length ? '相似案例' : '全部有金額紀錄的案例',
    moneyN: chosen.length,
    baseAmount,
    multiplier,
    assumedStop,
    absorbed,
    delay,
    low,
    high,
  };
};

// 精確 Shapley 值計算 (針對 4 因子規則)
export const SHAP_INPUT_LABELS = ['作業高度', '安全帶', '護欄開口', '作業類型'];

export const computeShapleyValues = (inp: {
  work: string;
  height: number | null;
  belt: string;
  guard: string;
}): ShapResult => {
  const reference = { height: null, belt: '', guard: '', work: '' };
  const keys: (keyof typeof reference)[] = ['height', 'belt', 'guard', 'work'];
  const vals: number[] = [];

  for (let mask = 0; mask < 16; mask++) {
    const x = { ...reference };
    keys.forEach((k, j) => {
      if (mask & (1 << j)) {
        (x as any)[k] = inp[k];
      }
    });
    vals[mask] = calculateRiskRule(x);
  }

  const weights = [1 / 4, 1 / 12, 1 / 12, 1 / 4];
  const contrib = keys.map((_, j) => {
    let phi = 0;
    for (let mask = 0; mask < 16; mask++) {
      if (mask & (1 << j)) continue;
      const cardinality = [0, 1, 2, 3].filter((z) => mask & (1 << z)).length;
      phi += weights[cardinality] * (vals[mask | (1 << j)] - vals[mask]);
    }
    return phi;
  });

  return {
    base: vals[0],
    pred: vals[15],
    contrib,
    labels: SHAP_INPUT_LABELS,
  };
};

// 留一法 MAE (針對有記載和解/調解金額之案例)
export const computeLeaveOneOutMae = (cases: AccidentCase[]): MaeResult => {
  const settlementRows = cases.filter(
    (c) =>
      isNum(c['金額(元；依性質)']) &&
      (c['金額(元；依性質)'] as number) > 0 &&
      /和解|調解/.test(raw(c['金額性質'])) &&
      !/違約金|罰鍰|已支付/.test(raw(c['金額性質']))
  );

  if (settlementRows.length < 3) {
    return { rows: settlementRows, mae: null, details: [] };
  }

  const sampleInput = (c: AccidentCase) => ({
    work: workGroup(c['作業類別']),
    height: getHeight(c),
    belt: beltCat(raw(c['安全帶／母索']) + ' ' + raw(c['事故敘述／原因'])),
    guard: guardCat(c['護欄／開口防護']),
  });

  const details = settlementRows.map((test) => {
    const others = settlementRows.filter((c) => c !== test);
    const inp = sampleInput(test);
    const ranked = others
      .map((c) => computeSimilarity(c, inp))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(3, others.length));

    const valid = ranked.filter((r) => r.used > 0 && r.score > 0);
    const pred = valid.length
      ? valid.reduce(
          (sum, r) => sum + (r.case['金額(元；依性質)'] as number) * Math.max(0.05, r.score),
          0
        ) / valid.reduce((sum, r) => sum + Math.max(0.05, r.score), 0)
      : median(others.map((c) => c['金額(元；依性質)'] as number)) || 0;

    const actual = test['金額(元；依性質)'] as number;
    return {
      id: test['案例ID'],
      title: test['事故名稱'],
      work: test['作業類別'],
      actual,
      pred,
      abs: Math.abs(actual - pred),
      neighbors: valid.length,
    };
  });

  const mae = details.reduce((s, r) => s + r.abs, 0) / details.length;
  return { rows: settlementRows, details, mae };
};

// 中文雙字組 (2-gram) TF-IDF 檢索 (本地無外部依賴 RAG)
export const ngrams = (text: unknown): string[] => {
  const t = raw(text)
    .toLowerCase()
    .replace(/[\s，。、「」【】（）()\-_:；、/]/g, '');
  const arr: string[] = [];
  for (let i = 0; i < t.length - 1; i++) {
    arr.push(t.slice(i, i + 2));
  }
  return [...new Set(arr)];
};

export const searchRag = (query: string, cases: AccidentCase[]): RagResultItem[] => {
  const words = ngrams(query);
  if (!words.length) return [];

  const docs = cases.map((c) => {
    const text = [
      c['事故名稱'],
      c['作業類別'],
      c['事故敘述／原因'],
      c['風險分類'],
      c['事故地點'],
      c['安全帶／母索'],
      c['護欄／開口防護'],
      c['備註與待查事項'],
    ]
      .map(raw)
      .join(' ');
    return { case: c, terms: ngrams(text) };
  });

  const df: Record<string, number> = {};
  docs.forEach((d) =>
    d.terms.forEach((t) => {
      df[t] = (df[t] || 0) + 1;
    })
  );

  const idf = (t: string) => Math.log(1 + (docs.length + 1) / (1 + (df[t] || 0)));

  const queryWeightSum = words.reduce((s, w) => s + Math.pow(idf(w), 2), 0) || 1;

  return docs
    .map((d) => {
      const overlap = words.filter((w) => d.terms.includes(w));
      const dotProduct = overlap.reduce((s, w) => s + Math.pow(idf(w), 2), 0);
      const docWeightSum = d.terms.reduce((s, w) => s + Math.pow(idf(w), 2), 0) || 1;
      const score = dotProduct / Math.sqrt(queryWeightSum * docWeightSum);
      return { case: d.case, score };
    })
    .filter((d) => d.score > 0.005)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
};

// 匯出 CSV (支援 UTF-8 BOM 避免 Excel 亂碼)
export const exportCasesToCsv = (cases: AccidentCase[]): void => {
  if (!cases.length) return;
  const keys = Object.keys(cases[0]) as (keyof AccidentCase)[];
  const csvContent = [
    keys.map((k) => `"${String(k).replace(/"/g, '""')}"`).join(','),
    ...cases.map((c) =>
      keys.map((k) => `"${String(c[k] ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\r\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Accident_Balancer_${cases.length}_Cases.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};
