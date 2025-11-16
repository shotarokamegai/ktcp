"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import type { ImageMeta } from "@/lib/wp";

type ExtendedImageMeta = ImageMeta & {
  // ACF 側のフィールド名に合わせている
  placeholder_color?: string | null;
};

export default function ResponsiveImage({
  pc,
  sp,
  alt,
  fallbackRatio = "4 / 3",
  fit = "cover",
  // ACF などから直接色を渡したいとき用（例: "#f0f0f0"）
  placeholder_color,
  // ▼ これが true のときは placeholder を一切出さない
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

  // props / ACF の値が変わったら placeholder 色を更新
  useEffect(() => {
    setPlaceholderBg(
      placeholder_color ||
        pc.placeholder_color ||
        sp?.placeholder_color ||
        "rgb(217, 217, 217)"
    );
  }, [placeholder_color, pc.placeholder_color, sp?.placeholder_color]);

  // ▼ 要素の bottom が window の bottom より上に来たら inView = true
  useEffect(() => {
    const checkInView = () => {
      const el = wrapperRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      // 「要素の一番下」が「ウィンドウの一番下」より上に来たら
      if (rect.top + 100 <= window.innerHeight) {
        setInView(true);
      }
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        checkInView();
        ticking.current = false;
      });
    };

    // 初期チェック（読み込み時点で条件満たしている可能性もあるので）
    checkInView();

    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const handleImageLoad = () => {
    setLoaded(true);
  };

  // ▼ aspect-ratio
  const ratio = useMemo(() => {
    const r = (m?: ExtendedImageMeta | null) =>
      m?.width && m?.height ? `${m.width} / ${m.height}` : undefined;
    return r(pc) || r(sp || null) || fallbackRatio;
  }, [pc, sp, fallbackRatio]);

  // ▼ placeholder を外す条件：ロード済み & inView
  const showImage = loaded && inView;

  // ▼ placeholder を描画するかどうか
  const enablePlaceholder = !disablePlaceholder;

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
          transition: "opacity .4s ease 0.4s",
          zIndex: 0,
        }}
      />

<div
  className="responsive-image-content"
  style={{
    width: "100%",
    height: "100%",
  }}
>
      {/* ▼ PC画像 */}
      <img
        src={pc.url}
        alt={alt}
        onLoad={handleImageLoad}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: fit,
          opacity: showImage ? 1 : 0,
          transition: "opacity .4s ease",
          zIndex: 1,
        }}
        className="img-pc"
      />

      {/* ▼ SP画像（ある場合のみ） */}
      {sp?.url && (
        <img
          src={sp.url}
          alt={alt}
          onLoad={handleImageLoad}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: fit,
            opacity: showImage ? 1 : 0,
            transition: "opacity .4s ease",
            zIndex: 1,
          }}
          className="img-sp"
        />
      )}
</div>

      <style jsx>{`
        .img-pc { display: block; }
        .img-sp { display: none; }
        @media (max-width: 767px) {
          .img-pc { display: none; }
          .img-sp { display: block; }
        }
      `}</style>
    </div>
  );
}
