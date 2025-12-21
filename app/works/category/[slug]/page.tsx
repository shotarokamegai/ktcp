// app/works/category/[slug]/page.tsx
import { notFound } from "next/navigation";
import FMLink from "@/components/FMLink";
import Footer from "@/components/Footer";
import ResponsiveImage from "@/components/ResponsiveImage";
import WorksCategoryNav from "@/components/WorksCategoryNav";
import WorksCard from "@/components/WorksCard";

import { fetchWorksByCategorySlug, fetchWorkCategories } from "@/lib/wp";

export const revalidate = 60;

export default async function WorksCategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  // exists チェック用（※Nav側でもカテゴリは取るけど、404判定のためだけにここで取得）
  const [categories, works] = await Promise.all([
    fetchWorkCategories(),
    fetchWorksByCategorySlug(slug),
  ]);

  const exists = categories?.some((c: any) => c.slug === slug);
  if (!exists) notFound();

  const latest = works.slice(0, 9);

  return (
    <main className="container pre:pt-[307px]">
      {/* ▼ タクソノミー一覧（共通コンポーネント） */}
      <WorksCategoryNav activeSlug={slug} allHref="/" />

      {/* ▼ Works一覧（UIはトップと同じ） */}
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
            const row = Math.floor(workIndex / 3);
            const indexInRow = workIndex % 3;

            const bigIndexForRow = row % 2 === 0 ? firstRowBigIndex : 1 - firstRowBigIndex;
            const isWide = indexInRow === bigIndexForRow;

            workIndex++;

            const widthClass = isWide
              ? "pre:w-[calc(2/4*100%)]"
              : "pre:w-[calc(1/4*100%)]";

            return (
              <WorksCard
                key={item.key}
                work={w}
                widthClass={widthClass}
                // このページだけ mb が 20px なので、上書きしたい場合は className で足す
                className="pre:mb-[20px] slide-out"
              />
            );
          });
        })()}
      </section>

      <Footer />
    </main>
  );
}
