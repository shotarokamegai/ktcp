import FMLink from "@/components/FMLink";
import ResponsiveImage from "@/components/ResponsiveImage";
import { fetchWorks, pickThumb, pickThumbSp } from "@/lib/wp";

export const revalidate = 60;

export default async function WorksPage() {
  const works = await fetchWorks();

  return (
    <main className="container" style={{ padding: "80px 24px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Works</h1>

      <section
        style={{
          display: "grid",
          gap: "40px",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        }}
      >
        {works.map((w) => {
          const pc = pickThumb(w);
          const sp = pickThumbSp(w);

          return (
            <FMLink
              key={w.id}
              href={`/works/${w.slug}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
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
