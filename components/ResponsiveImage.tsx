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

  const showImage = loaded && inView;

  return (
    <div
      ref={wrapperRef}
      className="responsive-image pre:bg-black"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio, // ✅ 高さ固定を有効化（ここが肝） :contentReference[oaicite:3]{index=3}
        overflow: "hidden",
        background: placeholderBg,
      }}
    >
      <picture>
        {sp?.url && <source media="(max-width: 767px)" srcSet={sp.url} />}
        <img
          src={pc.url}
          alt={alt}
          onLoad={() => setLoaded(true)}
          loading="lazy"
          decoding="async"
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
