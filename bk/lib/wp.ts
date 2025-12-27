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
  ...
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

// =========================================
// pickEyecatchRandom（pattern1〜3から選ぶ）
// =========================================
function hash32(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function extractPattern(p: any): { pc: ImageMeta | null; sp: ImageMeta | null } | null {
  if (!p) return null;

  // ACFの形がどう来ても落ちないように保険
  const pc = p?.pc ?? p?.PC ?? p?.desktop ?? p?.image ?? p ?? null;
  const sp = p?.sp ?? p?.SP ?? p?.mobile ?? null;

  const toMeta = (x: any): ImageMeta | null => {
    if (!x) return null;
    if (typeof x === "string") return { url: x };
    const url = x?.url || x?.source_url;
    if (!url) return null;
    return { url, width: x?.width, height: x?.height };
  };

  const pcMeta = toMeta(pc);
  const spMeta = toMeta(sp);

  // pcもspも無いなら候補から除外
  if (!pcMeta && !spMeta) return null;
  return { pc: pcMeta, sp: spMeta };
}

export function pickEyecatchRandom(
  w: Work,
  opts?: { seed?: string | number }
): { pc: ImageMeta; sp?: ImageMeta | null } | null {
  const g = w?.acf?.eyecatch ?? {};

  // ★ pattern1〜3 だけ
  const keys = ["pattern1", "pattern2", "pattern3"] as const;

  const candidates: Array<{ pc: ImageMeta | null; sp: ImageMeta | null }> = [];
  for (const k of keys) {
    const got = extractPattern((g as any)[k]);
    if (got) candidates.push(got);
  }
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
