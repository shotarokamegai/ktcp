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

  /** 例: "1 / 1" "3 / 4" "4 / 3" を外から固定 */
  aspectRatio?: string;

  /** aspectRatio未指定のときの保険 */
  fallbackRatio?: string;

  fit?: CSSProperties["objectFit"];
  placeholder_color?: string;
  disablePlaceholder?: boolean;
  className?: string;
};

export default function ResponsiveImage({
  pc,
  alt,
  aspectRatio,
  fallbackRatio = "4 / 3",
  fit = "cover",
  placeholder_color,
  disablePlaceholder = false,
  className = "",
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const placeholderBg = useMemo(() => {
    if (disablePlaceholder) return "transparent";
    return placeholder_color || pc.placeholder_color || "rgb(217, 217, 217)";
  }, [disablePlaceholder, placeholder_color, pc.placeholder_color]);

  const ratio = useMemo(() => {
    if (aspectRatio) return aspectRatio;
    if (pc?.width && pc?.height) return `${pc.width} / ${pc.height}`;
    return fallbackRatio;
  }, [aspectRatio, pc, fallbackRatio]);

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
      className={["responsive-image", className].filter(Boolean).join(" ")}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio,
        overflow: "hidden",
        background: placeholderBg,
      }}
    >
      <img
        ref={imgRef}
        src={pc.url}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: fit,
          opacity: loaded ? 1 : 0,
          transition:
            "opacity .35s ease, transform .7s cubic-bezier(0.23, 1, 0.32, 1)",
          display: "block",
        }}
      />
    </div>
  );
}
