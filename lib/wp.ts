const WP_API_BASE = process.env.WP_API_BASE || "https://xs849487.xsrv.jp";
const API_BASE = `${WP_API_BASE.replace(/\/$/, "")}/wp-json/wp/v2`;

// 型定義
export type Work = {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  _embedded?: any;
};

// 共通fetch関数
async function wpGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`WP fetch failed: ${res.status}`);
  return (await res.json()) as T;
}

// 一覧取得
export async function fetchWorks(): Promise<Work[]> {
  return wpGet<Work[]>(`/work?per_page=100&_embed`);
}

// 詳細取得
export async function fetchWorkBySlug(slug: string): Promise<Work | null> {
  const items = await wpGet<Work[]>(`/work?slug=${encodeURIComponent(slug)}&_embed`);
  return items[0] || null;
}

// ✅ これを追加
export function pickThumb(work: Work): string | null {
  const media = work?._embedded?.["wp:featuredmedia"]?.[0];
  return media?.source_url ?? null;
}

// ✅ ついでにstripも残してOK
export function strip(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
