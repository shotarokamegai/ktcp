import VideoAutoPlay from "@/components/VideoAutoPlay";
import WorksCard from "@/components/WorksCard";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { fetchWorkBySlug, strip, fetchWorks, pickEyecatchRandom } from "@/lib/wp";
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
  const title = work ? strip(work.title.rendered) : "Work";
  return { title, openGraph: { title } };
}

type MediaItem =
  | { kind: "image"; url: string; alt?: string }
  | { kind: "video"; url: string; mime?: string };

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
  // mp4/m4p/m4aなどもあるけど基本mp4でOK
  return "video/mp4";
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

  // works_cat（wp.ts で付与したもの）
  const categories = (work as any).works_cat as
    | { id: number; name: string; slug: string; acf?: any }[]
    | undefined;

  // ------------------------------------
  // images（repeater）内：画像 or 動画を両対応にする
  // 例）
  // - 画像: row.image = { url, mime_type? ... }
  // - 動画: row.image = { url, mime_type: "video/mp4" ... } など
  // ------------------------------------
  const gallery: MediaItem[] = [];
  const imagesRep = acf.images as any[] | undefined;

  if (Array.isArray(imagesRep)) {
    imagesRep.forEach((row, idx) => {
      const file = row?.image; // ← ACFのサブフィールド名が image の想定
      const url = file?.url;

      if (typeof url !== "string" || !url) return;

      const mime: string | undefined =
        typeof file?.mime_type === "string"
          ? file.mime_type
          : typeof file?.mime === "string"
          ? file.mime
          : undefined;

      if (isVideoByMimeOrUrl(mime, url)) {
        gallery.push({ kind: "video", url, mime: mime || guessVideoMime(url) });
      } else {
        gallery.push({ kind: "image", url, alt: `media-${idx}` });
      }
    });
  }

  // ▼ Featured works 用：全 works から4件ピックアップ（自分自身は除外）
  const allWorks = await fetchWorks();
  const featured = allWorks
    .filter((w: any) => w.slug !== (work as any).slug)
    .slice(0, 4);

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
        pre:sticky pre:top-[120px] pre:self-start
        pre:sm:w-full pre:sm:flex pre:sm:flex-col
        pre:sm:relative pre:sm:top-0
      "
    >
      {/* 日付 */}
      {dateTxt && (
        <div className="pre:mb-3.5 slide-in pre:sm:mb-0 pre:sm:order-2">
          <p className="pre:text-[24px] pre:font-gt pre:font-light pre:leading-none pre:sm:sp-fs-[16]">
            {dateTxt}
          </p>
        </div>
      )}

      {/* タイトル */}
      <h1
        dangerouslySetInnerHTML={{ __html: (work as any).title.rendered }}
        className="pre:text-[24px] pre:font-gt pre:font-light pre:leading-none slide-in pre:sm:order-1 pre:sm:sp-fs-[24] pre:sm:sp-mb-[10]"
      />

      {/* カテゴリー */}
      {categories && categories.length > 0 && (
        <div className="pre:mt-[426px] slide-in pre:sm:order-3 pre:sm:sp-mt-[110] pre:sm:sp-mb-[25]">
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
      {/* gallery：画像/動画 両対応 */}
      {gallery.length > 0 && (
        <div>
          {gallery.map((m, i) => (
            <div key={i} className="pre:mb-2.5 pre:last-child:mb-[10]">
              {m.kind === "image" ? (
                <ResponsiveImage pc={{ url: m.url }} alt={m.alt || `image-${i}`} />
              ) : (
                <VideoAutoPlay
                  src={m.url}
                  mime={m.mime || guessVideoMime(m.url)}
                  className="pre:w-full pre:h-auto"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </section>

  {/* ▼ Featured works セクション */}
  <section className="pre:mt-40 pre:mb-[180px] pre:sm:sp-mt-[170] pre:sm:sp-mb-[110] pre:sm:sp-w-[339] pre:sm:mx-auto">
    <div className="pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[26px] pre:sm:mx-auto pre:sm:sp-mb-[40] pre:sm:w-full">
      <h2 className="pre:text-[24px] pre:font-gt pre:font-light pre:sm:sp-fs-[24]">
        Featured works
      </h2>
    </div>

    {/* SP：Swiper */}
    <FeaturedWorksMobileSwiper works={featured} />

    {/* PC：今の4カラム（smでは非表示） */}
    <div className="pre:flex pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:sm:hidden">
      {featured.map((w: any, i: number) => {
        const ratioKey = (["1/1", "3/4", "4/3"] as const)[(Number(w?.id ?? 0) + i) % 3]
        const requiredPattern = ratioKey === "1/1" ? 1 : ratioKey === "3/4" ? 2 : 3

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
        )
      })}
    </div>
  </section>

  <Footer />
</main>
  );
}
