// app/works/[slug]/page.tsx
import Link from "next/link";
import FMLink from "@/components/FMLink";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { fetchWorkBySlug, strip, fetchWorks, pickEyecatchRandom } from "@/lib/wp";
import ResponsiveImage from "@/components/ResponsiveImage";

export const revalidate = 60;

export async function generateStaticParams() {
  // 大量ビルドを避けるなら空配列でOK（動的ISR）
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
    | { id: number; name: string; slug: string }[]
    | undefined;

  // ------------------------------------
  // images（repeater）内の sub field: image（画像配列）
  // acf.images: [{ image: { url: string, ... } }, ...]
  // ------------------------------------
  const gallery: string[] = [];
  const imagesRep = acf.images as any[] | undefined;
  if (Array.isArray(imagesRep)) {
    imagesRep.forEach((row) => {
      const img = row?.image;
      if (img && typeof img === "object" && typeof img.url === "string") {
        gallery.push(img.url);
      }
    });
  }

  // ▼ Featured works 用：全 works から4件ピックアップ（自分自身は除外）
  const allWorks = await fetchWorks();
  const featured = allWorks
    .filter((w: any) => w.slug !== work.slug) // 自分自身は除く
    .slice(0, 4);     

  return (
    <main className="container pre:pt-[307px] slide-out">
      <section className=" pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px] pre:flex pre:justify-between">
        <div className="pre:w-[calc(375/1401*100%)]">
          {/* 日付 */}
          {(dateTxt) && (
            <div className="pre:mb-[14px] slide-in">
              {dateTxt && (
                <p className="pre:text-[24px] pre:font-gt pre:font-light pre:leading-[1]">
                  {dateTxt}
                </p>
              )}
            </div>
          )}
          {/* タイトル */}
          <h1 dangerouslySetInnerHTML={{ __html: work.title.rendered }} className="pre:text-[24px] pre:font-gt pre:font-light pre:leading-[1] slide-in" />
          {/* カテゴリー */}
          {((categories && categories.length > 0)) && (
            <div className="pre:mt-[426px] slide-in">
              {Array.isArray(categories) && categories.length > 0 && (
                <p className="pre:text-[15px] pre:font-gt pre:font-light">
                  {categories.map((cat, i) => (
                    <span key={cat.id}>
                      {cat.name}
                      {i < categories.length - 1 && " / "}
                    </span>
                  ))}
                </p>
              )}
            </div>
          )}
          </div>
        <div className="pre:w-[calc(870/1401*100%)] slide-in">
          {/* images（ACF images の image.url を列挙） */}
          {gallery.length > 0 && (
            <div>
              {gallery.map((src, i) => (
                <div className="pre:mb-2.5 pre:last-child:mb-[10]">
                  <ResponsiveImage
                    key={i}
                    pc={{ url: src }}
                    alt={`image-${i}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ▼ ここから Featured works セクションを追加 */}
      <section className="pre:mt-[160px] pre:mb-[180px]">
        <div className="pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[26px]">
          <h2 className="pre:text-[24px] pre:font-gt pre:font-light">
            Featured works
          </h2>
        </div>

        <div className="pre:flex pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto">
          {featured.map((w: any) => {
            const picked = pickEyecatchRandom(w, { seed: w.id });
            if (!picked) return null;

            return (
              <FMLink
                key={w.id}
                href={`/works/${w.slug}`}
                className={
                  [
                    "pre:w-[calc(1/4*100%)]", // ★ 全部1/4幅
                    "pre:mb-[20px]",
                    "pre:px-[calc(7.5/1401*100%)]",
                    "pre:hover:text-ketchup",
                    // ホバー時のResponsiveImageアニメ（トップと合わせたければそのまま）
                    "pre:[&_.responsive-image]:[clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)]",
                    "pre:hover:[&_.responsive-image]:[clip-path:polygon(10px_10px,calc(100%-10px)_10px,calc(100%-10px)_calc(100%-10px),10px_calc(100%-10px))]",
                    "pre:[&_.responsive-image-content]:scale-[1]",
                    "pre:hover:[&_.responsive-image-content]:scale-[1.1]",
                    "slide-in",
                  ].join(" ")
                }
              >
                <ResponsiveImage
                  pc={picked.pc}
                  sp={picked.sp || undefined}
                  alt={w.title.rendered}
                  placeholder_color={w.acf?.placeholder_color}
                  fallbackRatio="4 / 3"
                />

                <header className="pre:flex pre:mt-[10px]">
                  <p className="pre:text-[15px] pre:font-gt pre:font-light pre:w-[70px]">
                    {w.acf?.date}
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
          })}
        </div>
      </section>
      <Footer/>
    </main>
  );
}
