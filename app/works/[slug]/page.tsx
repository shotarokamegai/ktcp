// app/works/[slug]/page.tsx
import Link from "next/link";
import { fetchWorkBySlug, strip } from "@/lib/wp";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  // 大量ビルドを避けるなら空配列でOK（動的ISR）
  return [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const work = await fetchWorkBySlug(params.slug);
  const title = work ? strip(work.title.rendered) : "Work";
  return { title, openGraph: { title } };
}

export default async function WorkDetail({ params }: { params: { slug: string } }) {
  const work = await fetchWorkBySlug(params.slug);
  if (!work) return <main className="container">Not Found</main>;

  const acf = (work as any).acf ?? {};

  const url: string | undefined = acf.url;
  const dateTxt: string | undefined = acf.date;
  const skills: string | undefined = acf.skills;
  const client: string | undefined = acf.client;
  const pcThumb: string | undefined = acf.pc_thumbnail; // image(url)
  const spThumb: string | undefined = acf.sp_thumbnail; // image(url)
  const videoUrl: string | undefined = acf.video;        // file(url)

  // images（repeater -> imgs（repeater）-> img（image: return_format=array））
  const gallery: string[] = [];
  const imagesRep = acf.images as any[] | undefined;
  if (Array.isArray(imagesRep)) {
    imagesRep.forEach((row) => {
      const imgs = row?.imgs as any[] | undefined;
      if (Array.isArray(imgs)) {
        imgs.forEach((it) => {
          const v = it?.img;
          if (!v) return;
          if (typeof v === "string") gallery.push(v);
          else if (typeof v?.url === "string") gallery.push(v.url);
        });
      }
    });
  }

  // images_（old）：img_（file: return_format=array, urlプロパティ）＋ classname_
  const galleryOld: { url: string; className?: string }[] = [];
  const imagesOld = acf.images_ as any[] | undefined;
  if (Array.isArray(imagesOld)) {
    imagesOld.forEach((row) => {
      const file = row?.img_;
      const cn = row?.classname_;
      const url = typeof file === "string" ? file : file?.url;
      if (typeof url === "string") galleryOld.push({ url, className: cn });
    });
  }

  return (
    <main className="container" style={{ maxWidth: 940 }}>
      {/* ヒーロー：pc/spサムネがあれば<picture>で */}
      {(pcThumb || spThumb) && (
        <picture style={{ display: "block", marginBottom: 20 }}>
          {spThumb && <source media="(max-width: 767px)" srcSet={spThumb} />}
          {pcThumb && <img src={pcThumb} alt={strip(work.title.rendered)} style={{ width: "100%", borderRadius: 12 }} />}
          {!pcThumb && spThumb && <img src={spThumb} alt={strip(work.title.rendered)} style={{ width: "100%", borderRadius: 12 }} />}
        </picture>
      )}

      <h1 dangerouslySetInnerHTML={{ __html: work.title.rendered }} />

      {/* メタ情報（ACF） */}
      {(client || dateTxt || skills || url) && (
        <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 24px", lineHeight: 1.7, opacity: 0.9 }}>
          {client && <li><strong>Client:</strong> {client}</li>}
          {dateTxt && <li><strong>Date:</strong> {dateTxt}</li>}
          {skills && <li><strong>Skills:</strong> {skills}</li>}
          {url && (
            <li>
              <strong>URL:</strong>{" "}
              <a href={url} target="_blank" rel="noreferrer">{url}</a>
            </li>
          )}
        </ul>
      )}

      {/* 本文（WP本文） */}
      <section
        className="prose"
        style={{ margin: "24px 0" }}
        dangerouslySetInnerHTML={{ __html: work.content.rendered }}
      />

      {/* 動画（ACF file=url） */}
      {videoUrl && (
        <div style={{ margin: "24px 0" }}>
          <video src={videoUrl} controls playsInline style={{ width: "100%", borderRadius: 12 }} />
        </div>
      )}

      {/* 画像ギャラリー（新images） */}
      {gallery.length > 0 && (
        <>
          <h2 style={{ marginTop: 32, fontSize: 18 }}>Gallery</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
              marginTop: 12,
            }}
          >
            {gallery.map((src, i) => (
              <img key={i} src={src} alt={`image-${i}`} style={{ width: "100%", borderRadius: 12 }} />
            ))}
          </div>
        </>
      )}

      {/* 旧images_（必要なら表示） */}
      {galleryOld.length > 0 && (
        <>
          <h2 style={{ marginTop: 32, fontSize: 18 }}>Gallery (Old)</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
              marginTop: 12,
            }}
          >
            {galleryOld.map((it, i) => (
              <img
                key={i}
                src={it.url}
                alt={`old-${i}`}
                className={it.className}
                style={{ width: "100%", borderRadius: 12 }}
              />
            ))}
          </div>
        </>
      )}
      <p style={{ marginTop: 20 }}>
        <Link href="/works">Back to works</Link>
      </p>
    </main>
  );
}
