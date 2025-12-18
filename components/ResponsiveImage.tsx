"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { ImageMeta } from "@/lib/wp";

type ExtendedImageMeta = ImageMeta & {
  placeholder_color?: string | null;
};

export default function ResponsiveImage({
  pc,
  sp,
  alt,
  fallbackRatio = "4 / 3",
  fit = "cover",
  placeholder_color,
  disablePlaceholder = false,
}: {
  pc: ExtendedImageMeta;
  sp?: ExtendedImageMeta | null;
  alt: string;
  fallbackRatio?: string;
  fit?: React.CSSProperties["objectFit"];
  placeholder_color?: string;
  disablePlaceholder?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

  const [placeholderBg, setPlaceholderBg] = useState<string>(() => {
    return (
      placeholder_color ||
      pc.placeholder_color ||
      sp?.placeholder_color ||
      "rgb(217, 217, 217)"
    );
  });

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    setPlaceholderBg(
      placeholder_color ||
        pc.placeholder_color ||
        sp?.placeholder_color ||
        "rgb(217, 217, 217)"
    );
  }, [placeholder_color, pc.placeholder_color, sp?.placeholder_color]);

  // inView 判定（初期表示で見えてる場合も true）
  useEffect(() => {
    const checkInView = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top + 100 <= window.innerHeight) setInView(true);
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        checkInView();
        ticking.current = false;
      });
    };

    checkInView();
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const ratio = useMemo(() => {
    const r = (m?: ExtendedImageMeta | null) =>
      m?.width && m?.height ? `${m.width} / ${m.height}` : undefined;
    return r(pc) || r(sp || null) || fallbackRatio;
  }, [pc, sp, fallbackRatio]);

  const enablePlaceholder = !disablePlaceholder;

  // placeholder を外す条件：ロード済み & inView
  // ※ inView になる前にロード完了しても、inView が true になったら表示される
  const showImage = loaded && inView;

  return (
    <div
      ref={wrapperRef}
      className="responsive-image"
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
          background: enablePlaceholder ? placeholderBg : "transparent",
          filter: enablePlaceholder ? "blur(20px)" : "none",
          opacity: enablePlaceholder ? (showImage ? 0 : 1) : 0,
          transition: "opacity .4s ease .4s",
          zIndex: 0,
        }}
      />

      {/* ▼ PC/SP を picture で出し分け（表示される1枚だけロードされる） */}
      <picture>
        {sp?.url && <source media="(max-width: 767px)" srcSet={sp.url} />}
        <img
          src={pc.url}
          alt={alt}
          onLoad={() => setLoaded(true)}
          loading="lazy"
          style={{
            position: "absolute",
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
