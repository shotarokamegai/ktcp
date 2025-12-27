// lib/wp.ts
const WP_API_BASE = process.env.WP_API_BASE || "https://xs849487.xsrv.jp";
const API_BASE = `${WP_API_BASE.replace(/\/$/, "")}/wp-json/wp/v2`;

// =========================================
// 型定義
// =========================================
export type WorkTerm = {
  id: number;
  name: string;
  slug: string;
  taxonomy?: string;
  [key: string]: any;
};

export type Work = {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  acf?: {
    eyecatch?: {
      pattern1?: any;
      pattern2?: any;
      pattern3?: any;
      pattern4?: any;
    };
    // ここは page.tsx 側で参照してるので型に残しておく
    placeholder_color?: string | null;
    date?: string;
  };
  _embedded?: any;
  // ★ works_cat ターム配列（mapWorkFromApiで詰める）
  works_cat?: WorkTerm[];
};

export type ImageMeta = {
  url: string;
  width?: number;
  height?: number;
};

// =========================================
// 基本fetch関数
// =========================================
async function wpGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`WP fetch failed: ${res.status} ${path}`);
  return (await res.json()) as T;
}

/** CPTのrest_baseが "works" か "work" かを両方試す */
async function wpGetFirst<T>(paths: string[]): Promise<T> {
  let lastErr: unknown;
  for (const p of paths) {
    try {
      return await wpGet<T>(p);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("All CPT endpoints failed");
}

// =========================================
// Work 用のマッピングヘルパー
// =========================================
function mapWorkFromApi(item: any): Work {
  const embeddedTerms = (item._embedded?.["wp:term"] || []).flat?.() || [];
  const worksCat =
    Array.isArray(embeddedTerms)
      ? embeddedTerms.filter((t: any) => t.taxonomy === "works_cat")
      : [];

  const work: Work = {
    ...item,
    works_cat: worksCat,
  };

  return work;
}

// =========================================
// データ取得系
// =========================================
export async function fetchWorks(): Promise<Work[]> {
  const raw = await wpGetFirst<any[]>([
    `/works?per_page=100&_embed`,
    `/work?per_page=100&_embed`,
  ]);
  return raw.map(mapWorkFromApi);
}

export async function fetchWorkCategories(): Promise<WorkTerm[]> {
  const res = await fetch(
    `${API_BASE}/works_cat?per_page=100&_fields=id,name,slug,taxonomy`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error("Failed to fetch work categories");
  return res.json();
}

export async function fetchWorkBySlug(slug: string): Promise<Work | null> {
  const encoded = encodeURIComponent(slug);
  const raw = await wpGetFirst<any[]>([
    `/works?slug=${encoded}&_embed`,
    `/work?slug=${encoded}&_embed`,
  ]);
  if (!raw[0]) return null;
  return mapWorkFromApi(raw[0]);
}

/**
 * ★追加：カテゴリslugで works 一覧取得
 * - works_cat を slug で検索して termId を得る
 * - termId で works を絞り込む
 */
export async function fetchWorksByCategorySlug(slug: string): Promise<Work[]> {
  const encoded = encodeURIComponent(slug);

  // 1) works_cat term を slug で引く（存在しなければ空配列）
  const termArr = await wpGet<any[]>(
    `/works_cat?slug=${encoded}&per_page=1&_fields=id,slug`
  );
  const termId = termArr?.[0]?.id;
  if (!termId) return [];

  // 2) CPT 側を termId で絞り込み（works/work 両対応）
  //    WP標準の挙動：taxonomy query は「タクソノミーのrest_base名=termId」で動くことが多い
  //    もし動かない場合は「filter」やカスタム実装が必要（その時はエンドポイント仕様教えて）
  const raw = await wpGetFirst<any[]>([
    `/works?per_page=100&_embed&works_cat=${termId}`,
    `/work?per_page=100&_embed&works_cat=${termId}`,
  ]);

  return raw.map(mapWorkFromApi);
}

// 固定ページ取得
export async function fetchPageBySlug(slug: string): Promise<any | null> {
  const items = await wpGet<any[]>(`/pages?slug=${encodeURIComponent(slug)}`);
  return items[0] || null;
}

// HTMLタグ除去
export function strip(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

// =========================================
// eyecatch pattern1〜4 ランダムピッカー
// =========================================
type WpAcfImage =
  | { url: string; width?: number; height?: number; sizes?: Record<string, string | number> }
  | string
  | number;

function toImageMeta(img: WpAcfImage | null | undefined): ImageMeta | null {
  if (!img) return null;
  if (typeof img === "string") return { url: img };
  if (typeof img === "object" && "url" in img && typeof img.url === "string") {
    const width =
      (img as any).width ??
      (typeof (img as any).sizes?.width === "number" ? (img as any).sizes.width : undefined);
    const height =
      (img as any).height ??
      (typeof (img as any).sizes?.height === "number" ? (img as any).sizes.height : undefined);
    return { url: (img as any).url, width, height };
  }
  return null;
}

function extractPattern(ec: any): { pc: ImageMeta | null; sp: ImageMeta | null } | null {
  if (!ec) return null;
  if (typeof ec === "object" && ("pc" in ec || "sp" in ec)) {
    const pc = toImageMeta(ec.pc ?? null);
    const sp = toImageMeta(ec.sp ?? null);
    if (pc || sp) return { pc, sp };
    return null;
  }
  const single = toImageMeta(ec);
  return single ? { pc: single, sp: null } : null;
}

// 文字列→32bitハッシュ
function hash32(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// seed → 0..1 の擬似乱数
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * pattern1〜4 の中から存在するパターンをランダムに1つ選んで返す
 * 同じ seed を渡せば毎回同じ結果（安定乱数）
 */
export function pickEyecatchRandom(
  w: Work,
  opts?: { seed?: string | number }
): { pc: ImageMeta; sp?: ImageMeta | null } | null {
  const g = w?.acf?.eyecatch ?? {};
  const keys = ["pattern1", "pattern2", "pattern3", "pattern4"] as const;

  const candidates: Array<{ pc: ImageMeta | null; sp: ImageMeta | null }> = [];
  for (const k of keys) {
    const got = extractPattern((g as any)[k]);
    if (got) candidates.push(got);
  }
    console.log(
    "work:",
    w?.id,
    "candidates:",
    candidates.map(c => c.pc || c.sp),
    "seed:",
    opts?.seed
  );
  if (candidates.length === 0) return null;

  const seedNum =
    typeof opts?.seed === "number"
      ? opts.seed
      : typeof opts?.seed === "string"
      ? hash32(opts.seed)
      : Math.floor(Math.random() * 2 ** 32);
  const rnd = mulberry32(seedNum)();

  const pick = candidates[Math.floor(rnd * candidates.length)];
  const pc = pick.pc ?? pick.sp;
  if (!pc) return null;
  return { pc, sp: pick.sp && pick.pc ? pick.sp : null };
}
