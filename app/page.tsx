// app/page.tsx
import FMLink from "@/components/FMLink";
import Footer from "@/components/Footer";
import ResponsiveImage from "@/components/ResponsiveImage";
import WorksCategoryNav from "@/components/WorksCategoryNav";

import { fetchWorks, pickEyecatchRandom } from "@/lib/wp";

export const revalidate = 60; // /works と同じくISR

export default async function Home() {
  const works = await fetchWorks();
  const latest = works.slice(0, 9);

  return (
    <main className="container pre:pt-[307px]">
      {/* ▼ タクソノミー一覧（共通コンポーネントに置換） */}
      <WorksCategoryNav activeSlug={null} allHref="/works" />

      {/* ▼ 最新Works一覧 */}
      <section className="pre:flex pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px]">
        {(() => {
          const items: { type: "work" | "illust"; work?: any; key: string }[] = [];

          latest.forEach((w: any, i: number) => {
            items.push({ type: "work", work: w, key: `work-${w.id}` });
            if ((i + 1) % 3 === 0) items.push({ type: "illust", key: `illust-${i}` });
          });

          const firstRowBigIndex = Math.random() > 0.5 ? 0 : 1;
          let workIndex = 0;

          return items.map((item) => {
            if (item.type === "illust") {
              return (
                <div
                  key={item.key}
                  className="pre:w-[calc(1/4*100%)] pre:mb-[20px] pre:px-[calc(7.5/1401*100%)] slide-out"
                >
                  <ResponsiveImage
                    pc={{ url: "/illust.png", width: 1200, height: 900 } as any}
                    alt="Ketchup Illustration"
                    fallbackRatio="4 / 3"
                    disablePlaceholder
                  />
                </div>
              );
            }

            const w = item.work!;
            const picked = pickEyecatchRandom(w, { seed: w.id });
            if (!picked) return null;

            const row = Math.floor(workIndex / 3);
            const indexInRow = workIndex % 3;

            const bigIndexForRow = row % 2 === 0 ? firstRowBigIndex : 1 - firstRowBigIndex;
            const isWide = indexInRow === bigIndexForRow;

            workIndex++;

            const widthClass = isWide ? "pre:w-[calc(2/4*100%)]" : "pre:w-[calc(1/4*100%)]";

            return (
              <FMLink
                key={item.key}
                href={`/works/${w.slug}`}
                className={`${widthClass} pre:mb-[20px] pre:px-[calc(7.5/1401*100%)] pre:hover:text-ketchup pre:[&_.responsive-image]:[clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)] pre:hover:[&_.responsive-image]:[clip-path:polygon(10px_10px,calc(100%-10px)_10px,calc(100%-10px)_calc(100%-10px),10px_calc(100%-10px))] pre:hover:text-ketchup pre:[&_.responsive-image-content]:scale-[1] pre:hover:[&_.responsive-image-content]:scale-[1.1] slide-in slide-out`}
              >
                <ResponsiveImage
                  pc={picked.pc}
                  sp={picked.sp || undefined}
                  alt={w.title.rendered}
                  placeholder_color={w.acf.placeholder_color}
                  fallbackRatio="4 / 3"
                />

                <header className="pre:flex pre:mt-[10px]">
                  <p className="pre:text-[15px] pre:font-gt pre:font-light pre:w-[70px]">
                    {w.acf.date}
                  </p>

                  <h2
                    className="pre:text-[15px] pre:font-gt pre:font-light pre:w-[calc(100%-70px-105px)] pre:text-ellipsis pre:overflow-hidden pre:whitespace-nowrap"
                    dangerouslySetInnerHTML={{ __html: w.title.rendered }}
                  />

                  <p className="pre:text-[10px] pre:leading-[130%] pre:font-gt pre:font-light pre:w-[105px] pre:text-right">
                    {Array.isArray(w.works_cat) && w.works_cat.length > 0
                      ? w.works_cat.map((cat: any) => cat.name).join(" / ")
                      : ""}
                  </p>
                </header>
              </FMLink>
            );
          });
        })()}
      </section>

      <Footer />
    </main>
  );
}
