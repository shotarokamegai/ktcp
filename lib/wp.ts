// ここだけ posts -> work に変更
export async function fetchWorks() {
  return wpGet<Work[]>(`/work?per_page=100&_embed`);
}
export async function fetchWorkBySlug(slug: string) {
  const items = await wpGet<Work[]>(`/work?slug=${encodeURIComponent(slug)}&_embed`);
  return items[0] || null;
}

export function strip(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}