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

  // ✅ 追加：SP画像（任意）
  sp?: ImageMeta;

  alt: string;

  /** 例: "1 / 1" "3 / 4" "4 / 3" を外から固定 */
  aspectRatio?: string;

  /** aspectRatio未指定のときの保険 */
  fallbackRatio?: string;

  fit?: CSSProperties["objectFit"];
  placeholder_color?: string;
  disablePlaceholder?: boolean;
  className?: string;

  /** どの幅からPC扱いにするか（任意） */
  smWidth?: number; // default 768
};

export default function ResponsiveImage({
  pc,
  sp,
  alt,
  aspectRatio,
  fallbackRatio = "4 / 3",
  fit = "cover",
  placeholder_color,
  disablePlaceholder = false,
  className = "",
  smWidth = 768,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  // ✅ SSR/CSRの差を避けるため、初期は必ずPCを採用
  const [srcMeta, setSrcMeta] = useState<ImageMeta>(pc);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const placeholderBg = useMemo(() => {
    if (disablePlaceholder) return "transparent";
    return placeholder_color || srcMeta.placeholder_color || pc.placeholder_color || "rgb(217, 217, 217)";
  }, [disablePlaceholder, placeholder_color, srcMeta.placeholder_color, pc.placeholder_color]);

  const ratio = useMemo(() => {
    if (aspectRatio) return aspectRatio;
    if (srcMeta?.width && srcMeta?.height) return `${srcMeta.width} / ${srcMeta.height}`;
    if (pc?.width && pc?.height) return `${pc.width} / ${pc.height}`;
    return fallbackRatio;
  }, [aspectRatio, srcMeta, pc, fallbackRatio]);

  // ✅ 幅で pc/sp を切替（spがある時だけ）
  useEffect(() => {
    if (!sp?.url) {
      setSrcMeta(pc);
      return;
    }

    const mq = window.matchMedia(`(min-width: ${smWidth}px)`);

    const apply = () => {
      setSrcMeta(mq.matches ? pc : sp);
    };

    apply();

    // Safari含め互換のため両対応
    if ("addEventListener" in mq) {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    } else {
      // @ts-ignore
      mq.addListener(apply);
      // @ts-ignore
      return () => mq.removeListener(apply);
    }
  }, [pc, sp, smWidth]);

  // ✅ 画像切替時のロード状態管理
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
  }, [srcMeta.url]);

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
        src={srcMeta.url}
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
          transition: "opacity .35s ease, transform .7s cubic-bezier(0.23, 1, 0.32, 1)",
          display: "block",
        }}
      />
    </div>
  );
}
