// app/page.tsx
import Link from "next/link";
import { fetchWorks, pickThumb } from "@/lib/wp";

export const revalidate = 60; // /works と同じくISR

export default async function Home() {
  const works = await fetchWorks();           // WPから取得
  const latest = works.slice(0, 9);           // トップでは最新9件だけ表示（お好みで調整）

  return (
    <main className="container">
      <h1>Ketchup Portfolio</h1>

      <section className="grid" style={{ marginTop: 16 }}>
        {latest.map((w) => {
          const img = pickThumb(w);
          return (
            <a key={w.id} href={`/works/${w.slug}`} className="card">
              {img && <img src={img} alt={w.title.rendered} />}
              <h2
                dangerouslySetInnerHTML={{ __html: w.title.rendered }}
              />
            </a>
          );
        })}
      </section>

      <p style={{ marginTop: 20 }}>
        <Link href="/works">→ すべてのWorksを見る</Link>
      </p>

      <footer>© Ketchup Inc.</footer>
    </main>
  );
}
