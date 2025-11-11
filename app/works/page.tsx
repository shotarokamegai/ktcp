import FMLink from "@/components/FMLink";
import ResponsiveImage from "@/components/ResponsiveImage";
import { fetchWorks, pickThumb, pickThumbSp } from "@/lib/wp";

export const revalidate = 60;

export default async function WorksPage() {
  const works = await fetchWorks();

  return (
    <main className="container" style={{ padding: "80px 24px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Works</h1>

      <section className="pre:flex pre:justify-between pre:flex-wrap">
        {works.map((w) => {
          const pc = pickThumb(w);
          const sp = pickThumbSp(w);

          return (
            <FMLink
              key={w.id}
              href={`/works/${w.slug}`}
              className="pre:w-[calc(339/1401*100%)]"
            >
              {pc && (
                <ResponsiveImage
                  pc={pc}
                  sp={sp}
                  alt={w.title.rendered}
                  fallbackRatio="4 / 3"
                />
              )}
              <h2
                dangerouslySetInnerHTML={{ __html: w.title.rendered }}
                style={{ fontSize: "1rem", lineHeight: 1.4 }}
              />
            </FMLink>
          );
        })}
      </section>
    </main>
  );
}
