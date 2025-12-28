// app/works/[slug]/page.tsx
import Link from "next/link";
import FMLink from "@/components/FMLink";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { fetchWorkBySlug, strip, fetchWorks, pickEyecatchRandom } from "@/lib/wp";
import ResponsiveImage from "@/components/ResponsiveImage";

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
      <section className=" pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px] pre:flex pre:justify-between pre:sm:sp-w-[339] pre:sm:block">
        <div className="pre:w-[calc(375/1401*100%)] pre:sm:w-full pre:sm:flex pre:sm:flex-col">
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
                    {/* ryaku 優先（なければ name） */}
                    {cat?.acf?.ryaku || cat?.ryaku || cat.name}
                    {i < categories.length - 1 && " / "}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>

        <div className="pre:w-[calc(870/1401*100%)] slide-in pre:sm:w-full">
          {/* gallery：画像/動画 両対応 */}
          {gallery.length > 0 && (
            <div>
              {gallery.map((m, i) => (
                <div key={i} className="pre:mb-2.5 pre:last-child:mb-[10]">
                  {m.kind === "image" ? (
                    <ResponsiveImage pc={{ url: m.url }} alt={m.alt || `image-${i}`} />
                  ) : (
                    <video
                      className="pre:w-full pre:h-auto"
                      controls
                      playsInline
                      preload="metadata"
                      // 必要なら以下も（自動再生したい場合）
                      // muted
                      // autoPlay
                      // loop
                    >
                      <source src={m.url} type={m.mime || guessVideoMime(m.url)} />
                    </video>
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

        <div className="pre:flex pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:sm:w-full pre:sm:justify-between">
          {featured.map((w: any) => {
            const picked = pickEyecatchRandom(w, { seed: w.id });
            if (!picked) return null;

            return (
              <FMLink
                key={w.id}
                href={`/works/${w.slug}`}
                className={[
                  "pre:w-1/4",
                  "pre:sm:sp-w-[160]",
                  "pre:mb-5",
                  "pre:px-[calc(7.5/1401*100%)]",
                  "pre:hover:text-ketchup",
                  "pre:[&_.responsive-image]:[clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)]",
                  "pre:hover:[&_.responsive-image]:[clip-path:polygon(10px_10px,calc(100%-10px)_10px,calc(100%-10px)_calc(100%-10px),10px_calc(100%-10px))]",
                  "pre:[&_.responsive-image-content]:scale-[1]",
                  "pre:hover:[&_.responsive-image-content]:scale-[1.1]",
                  "slide-in",
                ].join(" ")}
              >
                <ResponsiveImage
                  pc={picked.pc}
                  sp={picked.sp || undefined}
                  alt={w.title.rendered}
                  placeholder_color={w.acf?.placeholder_color}
                  fallbackRatio="4 / 3"
                />

                <header className="pre:flex pre:mt-2.5 pre:justify-between pre:sm:block pre:sm:sp-mt-[6]">
                  <h2
                    className="pre:text-[15px] pre:font-gt pre:font-light pre:w-[calc(222/338*100%)] pre:sm:w-full pre:sm:sp-fs-[14] pre:sm:leading-[130%]"
                    dangerouslySetInnerHTML={{ __html: w.title.rendered }}
                  />

                  <p className="pre:text-[10px] pre:leading-[130%] pre:font-gt pre:font-light pre:w-[calc(58/338*100%)] pre:text-right pre:sm:w-full pre:sm:text-left pre:sm:sp-fs-[10]">
                    {(() => {
                      const catLabel = Array.isArray(w?.works_cat)
                        ? w.works_cat
                            .map((c: any) => c?.acf?.ryaku || c?.ryaku || c?.name)
                            .filter(Boolean)
                            .join(" / ")
                        : "";
                      return catLabel;
                    })()}
                  </p>
                </header>
              </FMLink>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
