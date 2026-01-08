"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

export type ImageMeta = {
  url: string;
  width?: number;
  height?: number;
  placeholder_color?: string | null;
};

type RatioKey = "1/1" | "3/4" | "4/3";

type Props = {
  pc: ImageMeta;
  alt: string;

  fit?: CSSProperties["objectFit"];
  className?: string;

  placeholder_color?: string;
  disablePlaceholder?: boolean;
  style?: CSSProperties;

  // ★ 追加：patternが決まったらここを渡す
  ratioKey?: RatioKey;

  // viewport条件
  once?: boolean;
  rootMargin?: string;
};

export default function ResponsiveImage({
  pc,
  alt,
  fit = "cover",
  className = "",
  placeholder_color,
  disablePlaceholder = false,
  style,

  ratioKey,

  once = true,
  rootMargin = "200px 0px",
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const placeholderBg = useMemo(() => {
    if (disablePlaceholder) return "transparent";
    return pc.placeholder_color || placeholder_color || "rgb(217, 217, 217)";
  }, [disablePlaceholder, pc.placeholder_color, placeholder_color]);

  // load
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

  // inView
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else {
          if (!once) setInView(false);
        }
      },
      { root: null, rootMargin, threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin]);

  const shouldShow = loaded && inView;

  // ★ ratioKeyがあるなら先に枠を確保
const aspectRatio: CSSProperties["aspectRatio"] = useMemo(() => {
  // 1) ratioKey（pattern）優先
  if (ratioKey) return ratioKey.replace("/", " / ");

  // 2) メタがあるならそれで枠確保（CLS最小）
  if (pc.width && pc.height && pc.width > 0 && pc.height > 0) {
    return `${pc.width} / ${pc.height}`;
  }

  // 3) 最低限の保険（潰れ防止）
  return "1 / 1";
}, [ratioKey, pc.width, pc.height]);

  return (
    <div
      ref={wrapRef}
      className={["responsive-image", "group", className].filter(Boolean).join(" ")}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        background: placeholderBg,
        aspectRatio, // ★ ここで高さが先に決まる
        ...style,
      }}
    >
      <div className="responsive-image__clip" style={{ position: "absolute", inset: 0 }}>
        <img
          ref={imgRef}
          src={pc.url}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="responsive-image__img"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: fit,

            opacity: shouldShow ? 1 : 0,
            transition:
              "opacity 1s cubic-bezier(0.23, 1, 0.32, 1) .5s, transform .7s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      </div>
    </div>
  );
}
