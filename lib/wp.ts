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
  if (!res.ok) throw new Error(`WP fetch failed: ${res.status}`);
  return (await res.json()) as T;
}

// posts→CPT work に差し替え可
export async function fetchWorks(): Promise<Work[]> {
  return wpGet<Work[]>(`/posts?per_page=100&_embed`);
}

export async function fetchWorkBySlug(slug: string): Promise<Work | null> {
  const items = await wpGet<Work[]>(`/posts?slug=${encodeURIComponent(slug)}&_embed`);
  return items[0] || null;
}

export function pickThumb(work: Work): string | null {
  // 優先順位: pc_thumbnail → アイキャッチ
  const acfPc = work.acf?.pc_thumbnail;
  const media = work?._embedded?.["wp:featuredmedia"]?.[0];
  const defaultImg = media?.source_url ?? null;
  return acfPc || defaultImg;
}

export function pickThumbSp(work: Work): string | null {
  return work.acf?.sp_thumbnail ?? null;
}

export function strip(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

// 固定ページをスラッグで取得
export async function fetchPageBySlug(slug: string): Promise<any | null> {
  const items = await wpGet<any[]>(`/pages?slug=${encodeURIComponent(slug)}`);
  return items[0] || null;
}