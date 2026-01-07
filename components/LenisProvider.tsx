"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "@studio-freight/lenis";

export const LenisProvider = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  const isTouchDevice = () =>
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  const hardScrollTop = () => {
    // iOSで input/textarea にフォーカスが残ってると scrollTo が負けることがある
    const ae = document.activeElement as HTMLElement | null;
    if (ae && typeof ae.blur === "function") ae.blur();

    // できるだけ多方面に「0」を刺す
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const scrollToTop = () => {
    const lenis = lenisRef.current;

    // Lenisあり（PC）
    if (lenis) {
      lenis.stop();
      lenis.scrollTo(0, { immediate: true });
      hardScrollTop();

      requestAnimationFrame(() => {
        lenis.scrollTo(0, { immediate: true });
        hardScrollTop();
        lenis.start();
      });
      return;
    }

    // Lenisなし（スマホ）
    hardScrollTop();
    requestAnimationFrame(hardScrollTop);
  };

  useEffect(() => {
    // ブラウザの勝手な復元をオフ
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // スマホは Lenis 生成しない（元仕様のまま）
    if (isTouchDevice()) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1,
      infinite: false,
    });

    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    // ✅ 遷移直後はDOM/レイアウト未確定なことがあるので、スマホだけ多段で潰す
    if (isTouchDevice()) {
      scrollToTop(); // 1発目（即時）

      // 2発目（次フレーム）
      requestAnimationFrame(() => {
        scrollToTop();

        // 3発目（さらに次フレーム）
        requestAnimationFrame(() => {
          scrollToTop();
        });
      });

      // 4発目（iOSの慣性/アドレスバー伸縮対策の保険）
      const t = window.setTimeout(() => {
        scrollToTop();
      }, 80);

      return () => window.clearTimeout(t);
    }

    // PCは従来通りでOK
    scrollToTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

useEffect(() => {
  // ✅ 初回ロード時だけ header の slide-in を発火
  if (typeof document !== "undefined") {
    const root = document.documentElement;

    if (!root.classList.contains("has-booted")) {
      // 少し遅らせて付与（初回の描画が先に出ないように）
      const t = window.setTimeout(() => {
        root.classList.add("has-booted");
      }, 60);

      return () => window.clearTimeout(t);
    }
  }
}, []);

  return null;
};
