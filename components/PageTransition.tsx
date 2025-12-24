"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * ポイント
 * - mode="wait" … 旧ページの exit 完了を待ってから新ページを mount
 * - initial={false} … 初回描画はアニメ無効（SSR→Hydrationのチラつき防止）
 * - 親: relative + overflow:hidden + minHeight … 高さ消失による“下のページが見える”を防止
 * - 子: absolute + inset:0 … 新旧ページを同じ座標に重ね、チラ見えを根本回避
 * - exit を animate より長く … 「先にゆっくり消えて→次が出る」
 */

const easeIn = [0.22, 1, 0.36, 1];
const easeOut = [0.4, 0, 1, 1];

const variants = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: easeIn },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: { duration: 0.55, ease: easeOut }, // ← 出をゆっくり
  },
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mounted = useRef(false);

  useEffect(() => {
    // ページ確定後にトップへ（必要なければ消してOK）
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    mounted.current = true;
  }, []);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100dvh",
        background: "var(--bg, #0b0b0b)",        // 透け防止
        scrollbarGutter: "stable both-edges",     // スクロール幅変動によるズレ対策
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          // variants={variants}
          initial={mounted.current ? "initial" : false}
          animate="animate"
          exit="exit"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            transform: "translateZ(0)",
            willChange: "opacity, transform, filter",
            backfaceVisibility: "hidden",
          }}
          // デバッグ用（必要なら開放）
          // onAnimationStart={() => console.log("start", pathname)}
          // onAnimationComplete={() => console.log("end", pathname)}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
