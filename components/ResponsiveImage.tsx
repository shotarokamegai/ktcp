// components/ResponsiveImage.tsx
"use client";
import { useState, useMemo } from "react";
import type { ImageMeta } from "@/lib/wp";

export default function ResponsiveImage({
  pc,
  sp,
  alt,
  fallbackRatio = "4 / 3",
  radius = 12,
  fit = "cover",
}: {
  pc: ImageMeta;
  sp?: ImageMeta | null;
  alt: string;
  fallbackRatio?: string;
  radius?: number;
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
        borderRadius: radius,
        overflow: "hidden",
      }}
    >
      {/* Skeleton */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(255,255,255,.06) 0, rgba(255,255,255,.12) 20%, rgba(255,255,255,.06) 40%)",
          backgroundSize: "200% 100%",
          animation: "shim 1.2s linear infinite",
          opacity: loaded ? 0 : 1,
          transition: "opacity .25s ease",
        }}
      />

      {/* PC用 */}
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
          display: "block",
        }}
        className="img-pc"
      />

      {/* SP用 */}
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
            display: "block",
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

      <style jsx global>{`
        @keyframes shim {
          0% { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </div>
  );
}
