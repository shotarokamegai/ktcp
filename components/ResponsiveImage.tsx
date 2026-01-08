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

  /** ロジック用の比率（そのまま） */
  ratioKey?: RatioKey;

  /** 表示用の比率（上書き用） */
  displayRatio?: string; // e.g. "12/7", "12/15"

  once?: boolean;
  rootMargin?: string;

  hidePlaceholderAfterMs?: number;
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
  displayRatio,
  once = true,
  rootMargin = "200px 0px",
  hidePlaceholderAfterMs = 650,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [hidePlaceholder, setHidePlaceholder] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const placeholderBg = useMemo(() => {
    if (disablePlaceholder) return "transparent";
    return pc.placeholder_color || placeholder_color || "rgb(217, 217, 217)";
  }, [disablePlaceholder, pc.placeholder_color, placeholder_color]);

  // ✅ aspect-ratio 決定（displayRatio 最優先）
  const aspectRatio: CSSProperties["aspectRatio"] = useMemo(() => {
    if (displayRatio) return displayRatio.replace("/", " / ");
    if (ratioKey) return ratioKey.replace("/", " / ");
    if (pc.width && pc.height && pc.width > 0 && pc.height > 0) {
      return `${pc.width} / ${pc.height}`;
    }
    return "1 / 1";
  }, [displayRatio, ratioKey, pc.width, pc.height]);

  // load
  useEffect(() => {
    setLoaded(false);
    setHidePlaceholder(false);

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
        } else if (!once) {
          setInView(false);
        }
      },
      { root: null, rootMargin, threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin]);

  const showImg = loaded && inView;

  // 画像が出てから背景を消す
  useEffect(() => {
    if (!showImg) return;
    const t = window.setTimeout(
      () => setHidePlaceholder(true),
      hidePlaceholderAfterMs
    );
    return () => window.clearTimeout(t);
  }, [showImg, hidePlaceholderAfterMs]);

  return (
    <div
      ref={wrapRef}
      className={["responsive-image", className].filter(Boolean).join(" ")}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio,
        backgroundColor: "transparent",
        ...style,
      }}
    >
      <div
        className="responsive-image__clip"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
      >
        {!disablePlaceholder && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: placeholderBg,
              opacity: hidePlaceholder ? 0 : 1,
              transition: "opacity 250ms ease",
              pointerEvents: "none",
            }}
          />
        )}

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
            opacity: showImg ? 1 : 0,
            transition:
              "opacity 1s cubic-bezier(0.23, 1, 0.32, 1) .5s, transform .7s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      </div>
    </div>
  );
}
