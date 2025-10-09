import { fetchWorks, pickThumb } from "@/lib/wp";

export const revalidate = 60;

export default async function WorksPage() {
  const works = await fetchWorks();
  return (
    <main className="container">
      <h1>Works</h1>
      <section className="grid">
        {works.map((w) => {
          const img = pickThumb(w);
          return (
            <a key={w.id} href={`/works/${w.slug}`} className="card">
              {img && <img src={img} alt={w.title.rendered} />}
              <h2 dangerouslySetInnerHTML={{ __html: w.title.rendered }} />
            </a>
          );
        })}
      </section>
    </main>
  );
}
