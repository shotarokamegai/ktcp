"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

export type ImageMeta = {
  url: string;
  width?: number;
  height?: number;
  placeholder_color?: string | null;
};

type Props = {
  pc: ImageMeta;
  alt: string;

  /** 画像の見せ方 */
  fit?: CSSProperties["objectFit"]; // "cover" | "contain" etc

  /** wrapper の class（横幅はここで指定する） */
  className?: string;

  placeholder_color?: string;
  disablePlaceholder?: boolean;

  /** 任意：ラッパーに足す style */
  style?: CSSProperties;
};

export default function ResponsiveImage({
  pc,
  alt,
  fit = "cover",
  className = "",
  placeholder_color,
  disablePlaceholder = false,
  style,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const placeholderBg = useMemo(() => {
    if (disablePlaceholder) return "transparent";
    return placeholder_color || pc.placeholder_color || "rgb(217, 217, 217)";
  }, [disablePlaceholder, placeholder_color, pc.placeholder_color]);

  useEffect(() => {
    setLoaded(false);
    const img = imgRef.current;
    if (!img) return;

    const mark = () => setLoaded(true);

    if (img.complete && img.naturalWidth > 0) {
      mark();
      return;
    }

    img.addEventListener("load", mark);
    img.addEventListener("error", mark);
    return () => {
      img.removeEventListener("load", mark);
      img.removeEventListener("error", mark);
    };
  }, [pc.url]);

  return (
    <div
      className={["responsive-image", "group", className].filter(Boolean).join(" ")}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        background: placeholderBg,
        ...style,
      }}
    >
    {/* ✅ clip-path を当てる対象 */}
    <div className="responsive-image__clip">
      <img
        ref={imgRef}
        src={pc.url}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="responsive-image__img"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          objectFit: fit,
          opacity: loaded ? 1 : 0,
          transition:
            "opacity .35s ease, transform .7s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      />
    </div>
    </div>
  );
}
