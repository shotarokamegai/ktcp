"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

export type ImageMeta = {
  url: string;
  width?: number;
  height?: number;
  placeholder_color?: string | null; // ← ACF想定
};

type Props = {
  pc: ImageMeta;
  alt: string;

  /** 画像の見せ方 */
  fit?: CSSProperties["objectFit"]; // "cover" | "contain" etc

  /** wrapper の class（横幅はここで指定する） */
  className?: string;

  /** 明示的に上書きしたい placeholder 色（任意） */
  placeholder_color?: string;

  /** placeholder を完全に無効化 */
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

  /**
   * placeholder 背景色の決定
   *
   * 優先順位：
   * 1. disablePlaceholder → transparent
   * 2. ACF（pc.placeholder_color）
   * 3. props（placeholder_color）
   * 4. fallback
   */
  const placeholderBg = useMemo(() => {
    if (disablePlaceholder) return "transparent";

    return (
      pc.placeholder_color ||
      placeholder_color ||
      "rgb(217, 217, 217)"
    );
  }, [disablePlaceholder, pc.placeholder_color, placeholder_color]);

  useEffect(() => {
    setLoaded(false);

    const img = imgRef.current;
    if (!img) return;

    const markLoaded = () => setLoaded(true);

    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
      return;
    }

    img.addEventListener("load", markLoaded);
    img.addEventListener("error", markLoaded);

    return () => {
      img.removeEventListener("load", markLoaded);
      img.removeEventListener("error", markLoaded);
    };
  }, [pc.url]);

  return (
    <div
      className={["responsive-image", "group", className]
        .filter(Boolean)
        .join(" ")}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        background: placeholderBg, // ← ★ ACF由来の色がここに反映
        ...style,
      }}
    >
      {/* clip-path 対象 */}
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
