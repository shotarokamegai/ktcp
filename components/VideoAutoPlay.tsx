"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  mime?: string;
  className?: string;
};

export default function VideoAutoPlay({
  src,
  mime = "video/mp4",
  className = "",
}: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // 念のため属性もJSで保証
    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // play() は Promise を返す（Safari対策で catch）
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );

    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      muted
      playsInline
      loop
      preload="metadata"
      // controls は付けない（自動再生用）
    >
      <source src={src} type={mime} />
    </video>
  );
}
