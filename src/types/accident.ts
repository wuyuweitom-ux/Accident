export interface AccidentCase {
  "案例ID": string;
  "事故日期（可能僅年月）": string | null;
  "事故名稱": string;
  "事故地點": string | null;
  "作業類別": string;
  "墜落／作業高度(m)": number | string | null;
  "護欄／開口防護": string | null;
  "安全帶／母索": string | null;
  "施工架／設備狀況": string | null;
  "受傷人數": number | null;
  "死亡人數": number | null;
  "金額(元；依性質)": number | null;
  "金額性質": string | null;
  "停工天數": number | null;
  "事故可歸責實際延宕天數": number | null;
  "風險分類": string | null;
  "來源類型／名稱": string | null;
  "來源網址": string | null;
  "資料驗證狀態": string | null;
  "資料批次": string | null;
  "事故敘述／原因": string | null;
  "備註與待查事項": string | null;
}

export interface AssessmentInput {
  projectName: string;
  projectCost: number | null;
  work: string;
  height: number | null;
  belt: string; // "未使用" | "未確實勾掛" | "已使用" | ""
  guard: string; // "不足" | "完整" | ""
  assumedStop: number; // 停工天數假設
  absorbed: number; // 工期吸收率 %
  costFactor: number; // 事故規模調整係數
}

export interface SimilarityResult {
  case: AccidentCase;
  score: number;
  coverage: number;
  matched: string[];
  different: string[];
  missing: string[];
  used: number;
}

export interface ScenarioEstimate {
  score: number;
  money: number | null;
  moneySource: string;
  moneyN: number;
  baseAmount: number | null;
  multiplier: number;
  assumedStop: number;
  absorbed: number;
  delay: number;
  low: number;
  high: number;
}

export interface ShapResult {
  base: number;
  pred: number;
  contrib: number[];
  labels: string[];
}

export interface MaeDetail {
  id: string;
  title: string;
  work: string;
  actual: number;
  pred: number;
  abs: number;
  neighbors: number;
}

export interface MaeResult {
  rows: AccidentCase[];
  details: MaeDetail[];
  mae: number | null;
}

export interface RagResultItem {
  case: AccidentCase;
  score: number;
}
