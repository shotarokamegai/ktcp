"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * 修正点：
 * - position: "absolute", inset: 0 に変更（親 main の中だけ覆う）
 * - z-index は十分大きく（ヘッダーは別レイヤーなので影響しない）
 */
export default function TransitionCover() {
  const controls = useAnimationControls();
  const router = useRouter();
  const pathname = usePathname();

  // 新ページでマウントされたらカバーを外す
  useEffect(() => {
    controls.start({ opacity: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } });
  }, [pathname, controls]);

  useEffect(() => {
    const handler = (e: Event) => {
      const href = (e as CustomEvent).detail?.href as string;
      controls
        .start({ opacity: 1, transition: { duration: 0.45, ease: [0.4, 0, 1, 1] } })
        .then(() => router.push(href));
    };
    window.addEventListener("fm:start", handler as EventListener);
    return () => window.removeEventListener("fm:start", handler as EventListener);
  }, [controls, router]);

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={controls}
      style={{
        position: "absolute", // ★ fixed → absolute
        inset: 0,             // ★ 親(main)の範囲だけ
        background: "var(--bg, #0b0b0b)",
        zIndex: 100,          // main内では最前面
        pointerEvents: "none",
      }}
    />
  );
}
