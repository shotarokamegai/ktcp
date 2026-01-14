import VideoAutoPlay from "@/components/VideoAutoPlay";
import WorksCard from "@/components/WorksCard";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { fetchWorkBySlug, strip, fetchWorks } from "@/lib/wp";
import ResponsiveImage from "@/components/ResponsiveImage";
import FeaturedWorksMobileSwiper from "@/components/FeaturedWorksMobileSwiper";

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const work = await fetchWorkBySlug(params.slug);
  const title = work ? strip((work as any).title?.rendered) : "Work";
  return { title, openGraph: { title } };
}

type RatioValue = "1000x1000" | "1080x1440" | "1600x900";

type MediaItem =
  | { kind: "image"; url: string; alt?: string; ratio?: RatioValue }
  | { kind: "video"; url: string; mime?: string; ratio?: RatioValue };

function isVideoByMimeOrUrl(mime?: string, url?: string) {
  const m = (mime || "").toLowerCase();
  if (m.startsWith("video/")) return true;

  const u = (url || "").toLowerCase().split("?")[0].split("#")[0];
  return /\.(mp4|webm|mov|m4v|ogv)$/i.test(u);
}

function guessVideoMime(url: string) {
  const u = url.toLowerCase().split("?")[0].split("#")[0];
  if (u.endsWith(".webm")) return "video/webm";
  if (u.endsWith(".ogv")) return "video/ogg";
  if (u.endsWith(".mov")) return "video/quicktime";
  if (u.endsWith(".m4v")) return "video/x-m4v";
  return "video/mp4";
}

function toUrl(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

// ratio → width class（レイアウトはここで決まるので触らない）
const RATIO_WIDTH_CLASS: Record<RatioValue, string> = {
  "1000x1000": "pre:w-[calc(690/870*100%)]",
  "1080x1440": "pre:w-[calc(516/870*100%)]",
  "1600x900": "pre:w-full",
};

// ✅ 表示用 aspect-ratio（ResponsiveImage の displayRatio に渡す）
const RATIO_DISPLAY: Record<RatioValue, string> = {
  "1000x1000": "1/1",
  "1080x1440": "12/15",
  "1600x900": "12/7",
};

// center → right → left → repeat（既存ロジック維持）
function getAlignClass(ruleIndex: number) {
  const mod = ((ruleIndex % 3) + 3) % 3;
  if (mod === 0) return "pre:justify-end";
  if (mod === 1) return "pre:justify-center";
  return "pre:justify-start";
}

export default async function WorkDetail({
  params,
}: {
  params: { slug: string };
}) {
  const work = await fetchWorkBySlug(params.slug);
  if (!work) return <main className="container">Not Found</main>;

  const acf = (work as any).acf ?? {};
  const dateTxt: string | undefined = acf.date;

  const categories = (work as any).works_cat as
    | { id: number; name: string; slug: string; acf?: any }[]
    | undefined;

  const eyecatchPattern3Url = toUrl(acf?.eyecatch?.pattern3);

  // gallery
  const gallery: MediaItem[] = [];
  const imagesRep = acf.images as any[] | undefined;

  if (Array.isArray(imagesRep)) {
    imagesRep.forEach((row, idx) => {
      const file = row?.image;
      const url = file?.url;
      if (typeof url !== "string" || !url) return;

      const ratio = row?.ratio as RatioValue | undefined;

      const mime: string | undefined =
        typeof file?.mime_type === "string"
          ? file.mime_type
          : typeof file?.mime === "string"
          ? file.mime
          : undefined;

      if (isVideoByMimeOrUrl(mime, url)) {
        gallery.push({
          kind: "video",
          url,
          mime: mime || guessVideoMime(url),
          ratio,
        });
      } else {
        gallery.push({
          kind: "image",
          url,
          alt: `media-${idx}`,
          ratio,
        });
      }
    });
  }

  const dedupedGallery =
    eyecatchPattern3Url && gallery.length
      ? gallery.filter((m) => !(m.kind === "image" && m.url === eyecatchPattern3Url))
      : gallery;

  const allWorks = await fetchWorks();
  const featured = allWorks.filter((w: any) => w.slug !== (work as any).slug).slice(0, 4);

  const ruleStartIndex = 0;

  return (
    <main className="container pre:pt-[307px] slide-out pre:sm:sp-pt-[110]">
      <section
        className="
          pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px]
          pre:grid
          pre:grid-cols-[calc(375/1401*100%)_calc(870/1401*100%)]
          pre:gap-x-[calc(156/1401*100%)]
          pre:sm:sp-w-[339] pre:sm:block
        "
      >

        <div
          className="
            pre:sticky pre:top-[120px] pre:self-start pre:h-[calc(100vh-120px)] pre:pb-[33px]  pre:sm:pb-0 pre:sm:h-auto
            pre:sm:w-full pre:flex pre:flex-col
            pre:sm:relative pre:sm:top-0
          "
        >
          <h1
            dangerouslySetInnerHTML={{ __html: (work as any).title.rendered }}
            className="pre:text-[24px] pre:font-gt pre:font-light pre:leading-[130%] slide-in pre:sm:order-1 pre:sm:sp-fs-[24] pre:mb-3.5 pre:sm:sp-mb-[10]"
          />
          {dateTxt && (
            <div className="slide-in pre:sm:mb-0 pre:sm:order-2">
              <p className="pre:text-[16px] pre:font-gt pre:font-light pre:leading-none pre:sm:sp-fs-[16]">
                {dateTxt}
              </p>
            </div>
          )}


          {categories && categories.length > 0 && (
            <div className="slide-in pre:mt-auto pre:sm:order-3 pre:sm:sp-mt-[110] pre:sm:sp-mb-[25]">
              <p className="pre:text-[15px] pre:font-gt pre:font-light pre:sm:sp-fs-[14]">
                {categories.map((cat: any, i: number) => (
                  <span key={cat.id}>
                    {cat.name}
                    {i < categories.length - 1 && " / "}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>

        <div className="slide-in pre:sm:w-full">
          {/* ✅ 1枚目：pattern3 は「横長表示」したいので displayRatio=12/7 を追加（レイアウトは触らない） */}
          {eyecatchPattern3Url && (
            <div className="pre:mb-2.5">
              <ResponsiveImage
                pc={{ url: eyecatchPattern3Url }}
                alt="eyecatch-pattern3"
                displayRatio="12/7"
              />
            </div>
          )}

          {dedupedGallery.length > 0 && (
            <div>
              {dedupedGallery.map((m, i) => {
                const ratio = m.ratio;
                const widthClass = ratio ? RATIO_WIDTH_CLASS[ratio] : "pre:w-full";

                const ruleIndex = i - ruleStartIndex;
                const alignClass = getAlignClass(ruleIndex);

                // ✅ ratio があるものだけ displayRatio を渡す（widthClass/alignClassはそのまま）
                const displayRatio = ratio ? RATIO_DISPLAY[ratio] : undefined;

                return (
                  <div
                    key={i}
                    className={`pre:flex ${alignClass} pre:mb-2.5 pre:last-child:mb-[10]`}
                  >
                    <div className={widthClass}>
                      {m.kind === "image" ? (
                        <ResponsiveImage
                          pc={{ url: m.url }}
                          alt={m.alt || `image-${i}`}
                          displayRatio={displayRatio}
                        />
                      ) : (
                        <VideoAutoPlay
                          src={m.url}
                          mime={m.mime || guessVideoMime(m.url)}
                          className="pre:w-full pre:h-auto"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured works はそのまま */}
      <section className="pre:mt-40 pre:mb-[180px] pre:sm:sp-mt-[170] pre:sm:sp-mb-[110] pre:sm:sp-w-[339] pre:sm:mx-auto">
        <div className="pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[26px] pre:sm:mx-auto pre:sm:sp-mb-[40] pre:sm:w-full">
          <h2 className="pre:text-[24px] pre:font-gt pre:font-light pre:sm:sp-fs-[24]">
            Featured works
          </h2>
        </div>

        <FeaturedWorksMobileSwiper works={featured} />

        <div className="pre:flex pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:sm:hidden">
          {featured.map((w: any, i: number) => {
            const ratioKey = (["1/1", "3/4", "4/3"] as const)[(Number(w?.id ?? 0) + i) % 3];
            const requiredPattern = ratioKey === "1/1" ? 1 : ratioKey === "3/4" ? 2 : 3;

            return (
              <WorksCard
                key={`featured-${w.id}`}
                work={w}
                isWide={false}
                widthClass="pre:w-1/4"
                className="pre:mb-5 pre:px-[calc(7.5/1401*100%)]"
                ratioKey={ratioKey}
                requiredPattern={requiredPattern}
              />
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
