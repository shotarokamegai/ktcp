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
    <main className="container pre:pt-[580px]">
      <section className="pre:flex pre:justify-between pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto">
        {latest.map((w) => {
          const pc = pickThumb(w);
          const sp = pickThumbSp(w);

          return (
            <FMLink
              key={w.id}
              href={`/works/${w.slug}`}
              className="pre:w-[calc(339/1401*100%)] pre:mb-[20px]"
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

      {/* <p style={{ marginTop: 20 }}> */}
        {/* <Link href="/works">→ すべてのWorksを見る</Link> */}
      {/* </p> */}

      <footer className="pre:flex pre:items-center pre:justify-between pre:px-[20px]">
        <a href="mailto:info@ktcp.jp">info@ktcp.jp</a>
        <p>©Ketchup.inc all rights reserved.</p>
        <p>2025</p>
      </footer>
    </main>
  );
}
