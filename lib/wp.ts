const WP_API_BASE = process.env.WP_API_BASE || "https://xs849487.xsrv.jp";
const API_BASE = `${WP_API_BASE.replace(/\/$/, "")}/wp-json/wp/v2`;

export type Work = {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  acf?: {
    pc_thumbnail?: string;
    sp_thumbnail?: string;
  };
  _embedded?: any;
};

async function wpGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`WP fetch failed: ${res.status} ${path}`);
  return (await res.json()) as T;
}

/**
 * CPTのrest_baseが "works" か "work" かを両方試すヘルパー
 * 例: cptPaths(['/works?...', '/work?...'])
 */
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

// ▼ posts → works/work(CPT) に差し替え
export async function fetchWorks(): Promise<Work[]> {
  return wpGetFirst<Work[]>([
    `/works?per_page=100&_embed`,
    `/work?per_page=100&_embed`,
  ]);
}

export async function fetchWorkBySlug(slug: string): Promise<Work | null> {
  const encoded = encodeURIComponent(slug);
  const items = await wpGetFirst<Work[]>([
    `/works?slug=${encoded}&_embed`,
    `/work?slug=${encoded}&_embed`,
  ]);
  return items[0] || null;
}

export type ImageMeta = {
  url: string;
  width?: number;
  height?: number;
};

// PC（優先：ACF → アイキャッチ）
export function pickThumb(work: Work): ImageMeta | null {
  const acfPc = work.acf?.pc_thumbnail;
  const media = work?._embedded?.["wp:featuredmedia"]?.[0];
  const defaultImg = media?.source_url ?? null;
  const width = media?.media_details?.width;
  const height = media?.media_details?.height;

  if (acfPc) return { url: acfPc };
  if (defaultImg) return { url: defaultImg, width, height };
  return null;
}

// SP（ACFのみ）
export function pickThumbSp(work: Work): ImageMeta | null {
  const acfSp = work.acf?.sp_thumbnail;
  return acfSp ? { url: acfSp } : null;
}

export function strip(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

// 固定ページをスラッグで取得（従来どおり）
export async function fetchPageBySlug(slug: string): Promise<any | null> {
  const items = await wpGet<any[]>(`/pages?slug=${encodeURIComponent(slug)}`);
  return items[0] || null;
}