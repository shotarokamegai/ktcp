"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { ImageMeta } from "@/lib/wp";

type ExtendedImageMeta = ImageMeta & {
  placeholder_color?: string | null;
};

type Props = {
  pc: ExtendedImageMeta;
  sp?: ExtendedImageMeta | null;
  alt: string;
  fallbackRatio?: string;
  fit?: CSSProperties["objectFit"];
  placeholder_color?: string;
  disablePlaceholder?: boolean;
};

export default function ResponsiveImage({
  pc,
  sp,
  alt,
  fallbackRatio = "4 / 3",
  fit = "cover",
  placeholder_color,
  disablePlaceholder = false,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const placeholderBg = useMemo(() => {
    if (disablePlaceholder) return "transparent";
    return (
      placeholder_color ||
      pc.placeholder_color ||
      sp?.placeholder_color ||
      "rgb(217, 217, 217)"
    );
  }, [disablePlaceholder, placeholder_color, pc.placeholder_color, sp?.placeholder_color]);

  const ratio = useMemo(() => {
    const r = (m?: ExtendedImageMeta | null) =>
      m?.width && m?.height ? `${m.width} / ${m.height}` : undefined;
    return r(pc) || r(sp || null) || fallbackRatio;
  }, [pc, sp, fallbackRatio]);

  // ─────────────────────────────────────────────
  // 1) InView（必要なら loaded && inView に戻せるよう残す）
  // ─────────────────────────────────────────────
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    // 初回の取りこぼし防止（少し先読み）
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight + 200) setInView(true);

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { root: null, rootMargin: "200px 0px", threshold: 0.01 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ─────────────────────────────────────────────
  // 2) loaded（SSRで onLoad 取り逃した場合も拾う）
  // ─────────────────────────────────────────────
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const markLoaded = () => setLoaded(true);

    // ✅ ここが肝：hydrate前に読み込み完了してるケース
    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
      return;
    }

    img.addEventListener("load", markLoaded);
    img.addEventListener("error", markLoaded); // エラーでも透明固定にならない保険
    return () => {
      img.removeEventListener("load", markLoaded);
      img.removeEventListener("error", markLoaded);
    };
  }, [pc.url]); // URLが変わるケースにも対応

  // いまは loaded のみ（必要なら loaded && inView に戻せる）
  const showImage = loaded; // or: loaded && inView;

  return (
    <div
      ref={wrapperRef}
      className="responsive-image"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio,
        overflow: "hidden",
        background: placeholderBg,
      }}
    >
      <picture>
        {sp?.url && <source media="(max-width: 767px)" srcSet={sp.url} />}
        <img
          ref={imgRef}
          src={pc.url}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)} // CSR遷移用の保険（上のcomplete拾いが本命）
          style={{
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: fit,
            opacity: showImage ? 1 : 0,
            transition: "opacity .4s ease",
            zIndex: 1,
            display: "block",
          }}
        />
      </picture>
    </div>
  );
}
