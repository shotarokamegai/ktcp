"use client";
import { useState, useMemo } from "react";
import type { ImageMeta } from "@/lib/wp";

export default function ResponsiveImage({
  pc,
  sp,
  alt,
  fallbackRatio = "4 / 3",
  fit = "cover",
}: {
  pc: ImageMeta;
  sp?: ImageMeta | null;
  alt: string;
  fallbackRatio?: string;
  fit?: React.CSSProperties["objectFit"];
}) {
  const [loaded, setLoaded] = useState(false);

  const ratio = useMemo(() => {
    const r = (m?: ImageMeta | null) =>
      m?.width && m?.height ? `${m.width} / ${m.height}` : undefined;
    return r(pc) || r(sp) || fallbackRatio;
  }, [pc, sp, fallbackRatio]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio,
        overflow: "hidden",
      }}
    >
    {/* ▼ BLUR プレースホルダー */}
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        background: "#D9D9D9",
        filter: "blur(20px)",
        opacity: loaded ? 0 : 1,
        transition: "opacity .4s ease 1s",
        zIndex: 0,
      }}
    />

    {/* ▼ PC画像 */}
    <img
      src={pc.url}
      alt={alt}
      onLoad={() => setLoaded(true)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: fit,
        opacity: loaded ? 1 : 0,
        transition: "opacity .4s ease",
        zIndex: 1,
      }}
      className="img-pc"
    />

      {/* ▼ SP画像（ある場合のみ） */}
      {sp?.url && (
        <img
          src={sp.url}
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: fit,
            opacity: loaded ? 1 : 0,
            transition: "opacity .4s ease",
        }}
        className="img-sp"
        />
      )}

      <style jsx>{`
        .img-pc { display: block; }
        .img-sp { display: none; }
        @media (max-width: 767px) {
          .img-pc { display: none; }
          .img-sp { display: block; }
        }
      `}</style>
    </div>
  );
}
