// app/page.tsx
import Link from "next/link";
import FMLink from "@/components/FMLink";
import ResponsiveImage from "@/components/ResponsiveImage";
import { fetchWorks, pickThumb, pickThumbSp } from "@/lib/wp";

export const revalidate = 60; // /works と同じくISR

export default async function Home() {
  const works = await fetchWorks();           // WPから取得
  const latest = works.slice(0, 9);           // トップでは最新9件だけ表示（お好みで調整）

  return (
    <main className="container">
      <h1>Ketchup Portfolio</h1>

      <section className="grid" style={{ marginTop: 16 }}>
        {latest.map((w) => {
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

      <p style={{ marginTop: 20 }}>
        <Link href="/works">→ すべてのWorksを見る</Link>
      </p>

      <footer>© Ketchup Inc.</footer>
    </main>
  );
}
