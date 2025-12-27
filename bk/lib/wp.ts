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
  title?: { rendered?: string };
  acf?: any;
  works_cat?: any[];
  eyecatch?: any;
  [key: string]: any;
};

// =========================================
// fetch helpers
// =========================================
function qs(params: Record<string, any>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    usp.set(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : "";
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`fetch failed: ${res.status} ${res.statusText} (${url})`);
  }
  return (await res.json()) as T;
}

// =========================================
// WP API
// =========================================
export async function fetchWorks(params: {
  per_page?: number;
  page?: number;
  works_cat?: number;
  _embed?: 1;
  orderby?: string;
  order?: "asc" | "desc";
}) {
  const url = `${API_BASE}/works${qs({
    per_page: params.per_page ?? 100,
    page: params.page ?? 1,
    works_cat: params.works_cat,
    _embed: params._embed ?? 1,
    orderby: params.orderby ?? "date",
    order: params.order ?? "desc",
  })}`;

  return fetchJson<Work[]>(url, { cache: "no-store" });
}

export async function fetchWorksCategories(params?: { per_page?: number }) {
  const url = `${API_BASE}/works_cat${qs({
    per_page: params?.per_page ?? 100,
  })}`;

  return fetchJson<WorkTerm[]>(url, { cache: "no-store" });
}

// =========================================
// Image picker (fallback)
// =========================================
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toImageMeta(x: any): { url: string; width?: number; height?: number } | null {
  if (!x) return null;
  if (typeof x === "string") return { url: x };
  if (typeof x === "object") {
    const url = x.url || x.src || x.source_url;
    if (typeof url !== "string" || !url) return null;
    const width = typeof x.width === "number" ? x.width : undefined;
    const height = typeof x.height === "number" ? x.height : undefined;
    return { url, width, height };
  }
  return null;
}

/**
 * 作品データから「それっぽい」画像をランダムに選ぶ（SSR/CSRズレ防止で seed 必須）
 * - WorksCard側で pattern画像が無い時の保険に使う
 */
export function pickEyecatchRandom(
  work: any,
  opts: { seed: number }
): { pc: { url: string; width?: number; height?: number }; sp?: { url: string; width?: number; height?: number } } | null {
  const seed = opts.seed >>> 0;
  const rand = mulberry32(seed);

  const candidates: Array<{ pc: any; sp?: any }> = [];

  // 1) acf.patternX
  if (work?.acf) {
    const p1 = work.acf.pattern1;
    const p2 = work.acf.pattern2;
    const p3 = work.acf.pattern3;

    if (p1) candidates.push({ pc: p1?.pc ?? p1, sp: p1?.sp });
    if (p2) candidates.push({ pc: p2?.pc ?? p2, sp: p2?.sp });
    if (p3) candidates.push({ pc: p3?.pc ?? p3, sp: p3?.sp });

    // 2) その他候補
    if (work.acf.eyecatch) candidates.push({ pc: work.acf.eyecatch });
    if (work.acf.thumbnail) candidates.push({ pc: work.acf.thumbnail });
  }

  // 3) wp標準
  if (work?.eyecatch) candidates.push({ pc: work.eyecatch });
  if (work?._embedded?.["wp:featuredmedia"]?.[0]) {
    candidates.push({ pc: work._embedded["wp:featuredmedia"][0] });
  }

  const normalized = candidates
    .map((c) => ({
      pc: toImageMeta(c.pc),
      sp: toImageMeta(c.sp),
    }))
    .filter((c) => c.pc?.url);

  if (!normalized.length) return null;

  const idx = Math.floor(rand() * normalized.length);
  const pick = normalized[idx];
  if (!pick?.pc?.url) return null;

  return { pc: pick.pc, sp: pick.sp || undefined };
}
