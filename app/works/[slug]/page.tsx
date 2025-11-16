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
    <main className="container pre:mt-[284px]">
      <section className=" pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px]">
        {/* タイトル */}
        <h1 dangerouslySetInnerHTML={{ __html: work.title.rendered }} />

        {/* 日付 + カテゴリ */}
        {(dateTxt || (categories && categories.length > 0)) && (
          <div
            style={{
              margin: "8px 0 24px",
              lineHeight: 1.7,
              opacity: 0.9,
            }}
          >
            {dateTxt && (
              <p>
                <strong>Date:</strong> {dateTxt}
              </p>
            )}
            {Array.isArray(categories) && categories.length > 0 && (
              <p>
                <strong>Category:</strong>{" "}
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

        {/* images（ACF images の image.url を列挙） */}
        {gallery.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
              marginTop: 12,
            }}
          >
            {gallery.map((src, i) => (
              <ResponsiveImage
                key={i}
                pc={{ url: src }}
                alt={`image-${i}`}
                fallbackRatio="4 / 3"
              />
            ))}
          </div>
        )}

        <p style={{ marginTop: 20 }}>
          <Link href="/works">Back to works</Link>
        </p>
      </section>
      <Footer/>
    </main>
  );
}
