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
  // 新ページでを表示するとき
  useEffect(() => {
    controls.start({ x: window.innerWidth, opacity: 1, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } });
  }, [pathname, controls]);

  useEffect(() => {
    const handler = (e: Event) => {
      const href = (e as CustomEvent).detail?.href as string;
      // 隠す時
      controls
        .start({ x: 0, opacity: 1, transition: { duration: 0.45, ease: [0.4, 0, 1, 1] } })
        .then(() => router.push(href));
    };
    window.addEventListener("fm:start", handler as EventListener);
    return () => window.removeEventListener("fm:start", handler as EventListener);
  }, [controls, router]);

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 1, x: window.innerWidth }}
      animate={controls}
      style={{
        position: "absolute", // ★ fixed → absolute
        inset: 0,             // ★ 親(main)の範囲だけ
        // background: "#ffffff)",
        background: "#ffffff",
        zIndex: 100,          // main内では最前面
        pointerEvents: "none",
      }}
    />
  );
}
