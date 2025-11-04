// app/works/[slug]/page.tsx
import type { Metadata } from "next";
import { fetchWorkBySlug, strip } from "@/lib/wp";
import { pickThumb, pickThumbSp } from "@/lib/wp";
import ResponsiveImage from "@/components/ResponsiveImage";
import FMLink from "@/components/FMLink";

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
  const videoUrl: string | undefined = acf.video; // file(url)

  // PC/SP サムネ（ACF優先、PCは無ければアイキャッチにフォールバック）
  const pcMeta = pickThumb(work);     // { url, width?, height? } | null
  const spMeta = pickThumbSp(work);   // { url } | null

  // images（repeater -> imgs（repeater）-> img（image: return_format=array or url））
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
      {/* ヒーロー：PC/SP 出し分け + プレースホルダー（高さ確保） */}
      {pcMeta && (
        <div style={{ marginBottom: 20 }}>
          <ResponsiveImage
            pc={pcMeta}
            sp={spMeta ?? undefined}
            alt={strip(work.title.rendered)}
            fallbackRatio="16 / 9"
          />
        </div>
      )}

      <h1 dangerouslySetInnerHTML={{ __html: work.title.rendered }} />

      {/* メタ情報（ACF） */}
      {(client || dateTxt || skills || url) && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "8px 0 24px",
            lineHeight: 1.7,
            opacity: 0.9,
          }}
        >
          {client && (
            <li>
              <strong>Client:</strong> {client}
            </li>
          )}
          {dateTxt && (
            <li>
              <strong>Date:</strong> {dateTxt}
            </li>
          )}
          {skills && (
            <li>
              <strong>Skills:</strong> {skills}
            </li>
          )}
          {url && (
            <li>
              <strong>URL:</strong>{" "}
              <a href={url} target="_blank" rel="noreferrer">
                {url}
              </a>
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
          <video
            src={videoUrl}
            controls
            playsInline
            style={{ width: "100%", borderRadius: 12 }}
          />
        </div>
      )}

      {/* 画像ギャラリー（新images）— 読み込み時も高さ確保 */}
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
              <ResponsiveImage
                key={i}
                pc={{ url: src }}
                alt={`image-${i}`}
                fallbackRatio="4 / 3"
              />
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
              <ResponsiveImage
                key={i}
                pc={{ url: it.url }}
                alt={`old-${i}`}
                fallbackRatio="4 / 3"
              />
            ))}
          </div>
        </>
      )}

      <p style={{ marginTop: 20 }}>
        <FMLink href="/works">Back to works</FMLink>
      </p>
    </main>
  );
}
