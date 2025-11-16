// components/SlideInOnLoad.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// 表示アニメ用
const IN_BASE_DELAY = 600;
const IN_MIN_DELAY = 0;
const IN_MAX_DELAY = 600;

// 離脱アニメ用
const OUT_MIN_DELAY = 0;
const OUT_MAX_DELAY = 300;
const TRANSITION_DURATION = 600;

// ▼ 追加：ランダム or 順番
const IN_MODE: "random" | "sequence" = "sequence";
// const IN_MODE: "random" | "sequence" = "random";
const OUT_MODE: "random" | "sequence" = "random";

export default function SlideInOnLoad() {
  const pathname = usePathname();
  const router = useRouter();

  // ▼ delay を mode ごとに返す関数
  const getDelay = (index: number, min: number, max: number, mode: "random" | "sequence") => {
    if (mode === "sequence") {
      // 順番パターン
      const step = (max - min) /  (index + 1);
      return min + step * index;
    }

    // ランダムパターン
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // ① 表示アニメ
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("#page .slide-in"));

    els.forEach((el) => {
      el.classList.remove("is-shown");
      el.classList.remove("is-hidden");
      el.style.transitionDelay = "0ms";
    });

    const timer = setTimeout(() => {
      els.forEach((el, i) => {
        const delay = getDelay(i, IN_MIN_DELAY, IN_MAX_DELAY, IN_MODE);
        el.style.transitionDelay = `${delay}ms`;

        requestAnimationFrame(() => {
          el.classList.add("is-shown");
        });
      });
    }, IN_BASE_DELAY);

    return () => {
      clearTimeout(timer);
      els.forEach((el) => {
        el.classList.remove("is-shown");
        el.style.transitionDelay = "0ms";
      });
    };
  }, [pathname]);

  // ② 離脱アニメ
  useEffect(() => {
    const handler = (e: Event) => {
      const href = (e as CustomEvent).detail?.href;
      if (!href) return;

      const els = Array.from(document.querySelectorAll<HTMLElement>("#page .slide-out"));
      if (els.length === 0) {
        router.push(href);
        return;
      }

      let maxDelay = 0;

      els.forEach((el, i) => {
        const delay = getDelay(i, OUT_MIN_DELAY, OUT_MAX_DELAY, OUT_MODE);
        if (delay > maxDelay) maxDelay = delay;

        el.style.transitionDelay = `${delay}ms`;
        el.classList.remove("is-shown");
        el.classList.add("is-hidden");
      });

      const total = maxDelay + TRANSITION_DURATION;

      setTimeout(() => {
        router.push(href);
      }, total + 50);
    };

    window.addEventListener("fm:start", handler);
    return () => window.removeEventListener("fm:start", handler);
  }, [router]);

  return null;
}
