import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import ResponsiveImage from "@/components/ResponsiveImage";
import WorksCategoryNav from "@/components/WorksCategoryNav";
import WorksCard from "@/components/WorksCard";
import { fetchWorksByCategorySlug, fetchWorkCategories } from "@/lib/wp";

export const revalidate = 60;

/* ===============================
   ratio / pattern absolute rule
================================ */
type RatioKey = "1/1" | "3/4" | "4/3";
type Pattern = 1 | 2 | 3;

const RATIO_TO_PATTERN: Record<RatioKey, Pattern> = {
  "1/1": 1,
  "3/4": 2,
  "4/3": 3,
};

/* 安定した疑似乱数（SSR/CSR一致） */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeSeed(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickRatioKey(seed: number, workId: number): RatioKey {
  const r = mulberry32(seed ^ workId)();
  if (r < 0.33) return "1/1";
  if (r < 0.66) return "3/4";
  return "4/3";
}

export default async function WorksCategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  const [categories, works] = await Promise.all([
    fetchWorkCategories(),
    fetchWorksByCategorySlug(slug),
  ]);

  const exists = categories?.some((c: any) => c.slug === slug);
  if (!exists) notFound();

  const latest = works.slice(0, 9);
  const seed = makeSeed(slug);

  return (
    <main className="container pre:pt-[307px]">
      <WorksCategoryNav activeSlug={slug} />

      <section className="pre:flex pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px]">
        {(() => {
          const items: { type: "work" | "illust"; work?: any; key: string }[] = [];

          latest.forEach((w: any, i: number) => {
            items.push({ type: "work", work: w, key: `work-${w.id}` });
            if ((i + 1) % 3 === 0) {
              items.push({ type: "illust", key: `illust-${i}` });
            }
          });

          let workIndex = 0;

          return items.map((item) => {
            if (item.type === "illust") {
              return (
                <div
                  key={item.key}
                  className="pre:w-[calc(1/4*100%)] pre:mb-[20px] pre:px-[calc(7.5/1401*100%)]"
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

            // row3構成：1つだけwide
            const isWide = indexInRow === (row % 2 === 0 ? 0 : 1);
            workIndex++;

            const widthClass = isWide
              ? "pre:w-[calc(2/4*100%)]"
              : "pre:w-[calc(1/4*100%)]";

            // ✅ ratio → pattern を必ずここで確定
            const ratioKey = pickRatioKey(seed, Number(w.id));
            const requiredPattern = RATIO_TO_PATTERN[ratioKey];

            return (
              <WorksCard
                key={item.key}
                work={w}
                widthClass={widthClass}
                className="pre:mb-[20px]"
                isWide={isWide}
                ratioKey={ratioKey}
                requiredPattern={requiredPattern}
              />
            );
          });
        })()}
      </section>

      <Footer />
    </main>
  );
}
