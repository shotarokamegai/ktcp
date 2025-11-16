// app/works/[slug]/page.tsx
import Link from "next/link";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { fetchWorkBySlug, strip } from "@/lib/wp";
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

  return (
    <main className="container pre:pt-[307px]">
      <section className=" pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px] pre:flex pre:justify-between">
        <div className="pre:w-[calc(339/1401*100%)]">
          {/* 日付 */}
          {(dateTxt) && (
            <div className="pre:mb-[14px] slide-in slide-out">
              {dateTxt && (
                <p className="pre:text-[24px] pre:font-gt pre:font-light pre:leading-[1]">
                  {dateTxt}
                </p>
              )}
            </div>
          )}
          {/* タイトル */}
          <h1 dangerouslySetInnerHTML={{ __html: work.title.rendered }} className="pre:text-[24px] pre:font-gt pre:font-light pre:leading-[1] slide-in slide-out" />
          {/* カテゴリー */}
          {((categories && categories.length > 0)) && (
            <div className="pre:mt-[426px] slide-in slide-out">
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
                <div className="pre:mb-[10px] pre:last-child:mb-[10] slide-out">
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
      <Footer/>
    </main>
  );
}
