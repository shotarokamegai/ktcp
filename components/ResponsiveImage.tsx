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

  /** viewport 判定を一度だけにする（デフォ true） */
  once?: boolean;

  /** どれくらい手前で inView 扱いにするか */
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
  once = true,
  rootMargin = "200px 0px",
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

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
    return pc.placeholder_color || placeholder_color || "rgb(217, 217, 217)";
  }, [disablePlaceholder, pc.placeholder_color, placeholder_color]);

  // --------------------------
  // load 判定
  // --------------------------
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

  // --------------------------
  // viewport 判定（IntersectionObserver）
  // --------------------------
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    // IO がない環境は「常に表示扱い」
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    let didSet = false;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;

        if (e.isIntersecting) {
          setInView(true);
          didSet = true;
          if (once) io.disconnect();
        } else {
          // once=false の時だけ外れたら false に戻す
          if (!once) setInView(false);
        }
      },
      { root: null, rootMargin, threshold: 0 }
    );

    io.observe(el);

    return () => {
      // once=true の場合でも、mount直後に intersect しなかったケースに備えて掃除
      if (!didSet) io.disconnect();
      else io.disconnect();
    };
  }, [once, rootMargin, pc.url]);

  // ★ 表示条件：loaded かつ inView
  const shouldShow = loaded && inView;

  return (
    <div
      ref={wrapRef}
      className={["responsive-image", "group", className].filter(Boolean).join(" ")}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        background: placeholderBg,
        ...style,
      }}
    >
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
            opacity: shouldShow ? 1 : 0,
            transition:
              "opacity 1s cubic-bezier(0.23, 1, 0.32, 1) .5s, transform .7s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      </div>
    </div>
  );
}
