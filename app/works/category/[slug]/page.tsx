// app/works/category/[slug]/page.tsx
import { fetchWorks, pickThumb, pickThumbSp } from "@/lib/wp";
import { notFound } from "next/navigation";
import FMLink from "@/components/FMLink";
import Footer from "@/components/Footer";
import ResponsiveImage from "@/components/ResponsiveImage";
import {
  fetchWorksByCategorySlug,
  fetchWorkCategories,
  pickEyecatchRandom,
} from "@/lib/wp";

export const revalidate = 60;

export default async function WorksCategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  // カテゴリ一覧（上部フィルタ）と、カテゴリ絞り込み works を並列取得
  const [categories, works] = await Promise.all([
    fetchWorkCategories(),
    fetchWorksByCategorySlug(slug),
  ]);

  // slug が存在しない（=カテゴリが無い）っぽい場合は 404
  // ※ fetchWorksByCategorySlug 側で notFound してもOK。ここは安全策。
  const exists = categories?.some((c: any) => c.slug === slug);
  if (!exists) notFound();

  // 表示件数：トップのUI踏襲なら最新9件に合わせる（必要なら外してOK）
  const latest = works.slice(0, 9);

  return (
    <main className="container pre:pt-[307px]">
      {/* ▼ タクソノミー一覧 */}
      <section className="pre:flex pre:justify-end pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:pb-[18px] pre:mb-[18px] slide-in slide-out">
        <FMLink
          key="all"
          href="/works"
          className="pre:font-gt pre:font-light pre:text-[10px] pre:mr-[25px] pre:last:mr-0 pre:hover:text-black pre:transition-colors pre:text-gray-400"
        >
          ALL
        </FMLink>

        {categories.map((cat: any) => {
          const isActive = cat.slug === slug;

          return (
            <FMLink
              key={cat.id}
              href={`/works/category/${cat.slug}`}
              className={[
                "pre:font-gt pre:font-light pre:text-[10px] pre:mr-[25px] pre:last:mr-0 pre:hover:text-black pre:transition-colors",
                isActive ? "pre:text-black" : "pre:text-gray-400",
              ].join(" ")}
            >
              {cat.name}
            </FMLink>
          );
        })}
      </section>

      {/* ▼ Works一覧（UIはトップと同じ） */}
      <section className="pre:flex pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px]">
        {(() => {
          // 1) works と illust を混在させた items
          const items: { type: "work" | "illust"; work?: any; key: string }[] =
            [];

          latest.forEach((w: any, i: number) => {
            items.push({ type: "work", work: w, key: `work-${w.id}` });
            if ((i + 1) % 3 === 0) items.push({ type: "illust", key: `illust-${i}` });
          });

          // 2) ワイド位置を軽くランダム
          const firstRowBigIndex = Math.random() > 0.5 ? 0 : 1;
          let workIndex = 0;

          // 3) 描画
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

            const widthClass = isWide
              ? "pre:w-[calc(2/4*100%)]"
              : "pre:w-[calc(1/4*100%)]";

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
