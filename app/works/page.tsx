// app/works/page.tsx
import { fetchWorks, pickThumb, pickThumbSp } from "@/lib/wp";

export const revalidate = 60;

export default async function WorksPage() {
  const works = await fetchWorks();

  return (
    <main className="container">
      <h1>Works</h1>
      <section className="grid">
        {works.map((w) => {
          const pc = pickThumb(w);
          const sp = pickThumbSp(w);
          return (
            <a key={w.id} href={`/works/${w.slug}`} className="card">
              {pc && <img src={pc} alt={w.title.rendered} />}
              {/* ↓ デバッグ表示 */}
              {sp && <small style={{ display: "block", opacity: 0.6 }}>SP: {sp}</small>}
              <h2 dangerouslySetInnerHTML={{ __html: w.title.rendered }} />
            </a>
          );
        })}
      </section>
    </main>
  );
}
