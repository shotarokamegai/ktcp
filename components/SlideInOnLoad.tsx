"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/* ===== 調整用 ===== */
const IN_BASE_DELAY = 0;
const IN_MIN_DELAY = 0;
const IN_MAX_DELAY = 1000;

const OUT_MIN_DELAY = 0;
const OUT_MAX_DELAY = 200;
const TRANSITION_DURATION = 200;

const IN_MODE: "random" | "sequence" = "sequence";
const OUT_MODE: "random" | "sequence" = "sequence";

const REFRESH_EVENT = "slidein:refresh";
/* ================= */

export default function SlideInOnLoad() {
  const pathname = usePathname();
  const router = useRouter();

  const getDelay = (
    index: number,
    count: number,
    min: number,
    max: number,
    mode: "random" | "sequence"
  ) => {
    if (mode === "sequence") {
      if (count <= 1) return min;
      const t = index / (count - 1);
      return Math.round(min + (max - min) * t);
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const scrollToTop = () => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" as ScrollBehavior,
    });
  };

  /* ===== IN ===== */
  const runIn = () => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".slide-in")
    );

    els.forEach((el) => {
      el.classList.remove("is-shown", "is-hidden");
      el.style.transitionDelay = "0ms";
    });

    const count = els.length;

    setTimeout(() => {
      els.forEach((el, i) => {
        const delay = getDelay(i, count, IN_MIN_DELAY, IN_MAX_DELAY, IN_MODE);
        el.style.transitionDelay = `${delay}ms`;
        requestAnimationFrame(() => el.classList.add("is-shown"));
      });
    }, IN_BASE_DELAY);
  };

  /* ===== OUT ===== */
  const runOutAndPush = (href: string) => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".slide-out")
    );

    if (els.length === 0) {
      router.push(href, { scroll: true });
      return;
    }

    let maxDelay = 0;
    const count = els.length;

    els.forEach((el, i) => {
      const delay = getDelay(i, count, OUT_MIN_DELAY, OUT_MAX_DELAY, OUT_MODE);
      maxDelay = Math.max(maxDelay, delay);

      el.style.transitionDelay = `${delay}ms`;
      el.classList.remove("is-shown");
      el.classList.add("is-hidden");
    });

    setTimeout(() => {
      router.push(href, { scroll: true });
    }, maxDelay + TRANSITION_DURATION + 50);
  };

  /* ===== pathname change ===== */
  useEffect(() => {
    // SPでメニュー遷移時に被せたマスクの後始末（もし使ってる場合）
    document.documentElement.classList.remove("is-page-masked");

    // 常に先頭
    scrollToTop();
    requestAnimationFrame(() => scrollToTop());

    runIn();
  }, [pathname]);

  /* ===== 同一ページ差し替え ===== */
  useEffect(() => {
    const handler = () => runIn();
    window.addEventListener(REFRESH_EVENT, handler);
    return () => window.removeEventListener(REFRESH_EVENT, handler);
  }, []);

  /* ===== ページ遷移 OUT ===== */
  useEffect(() => {
    const handler = (e: Event) => {
      const href = (e as CustomEvent).detail?.href;
      if (!href) return;

      // ★ 追加：同一ページ遷移（Nextがpushを無視）なら OUT しない
      const next = new URL(href, window.location.href);
      const curr = new URL(window.location.href);

      const sameRoute =
        next.pathname === curr.pathname && next.search === curr.search;

      if (sameRoute) {
        // hashだけ違うならスクロールだけ反映（必要なら）
        if (next.hash && next.hash !== curr.hash) {
          window.history.pushState({}, "", next.hash);
          const el = document.querySelector(next.hash);
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        // もし何かで見え方が崩れてても IN をやり直す
        window.dispatchEvent(new Event(REFRESH_EVENT));
        return;
      }

      runOutAndPush(href);
    };

    window.addEventListener("fm:start", handler);
    return () => window.removeEventListener("fm:start", handler);
  }, [router]);

  return null;
}
