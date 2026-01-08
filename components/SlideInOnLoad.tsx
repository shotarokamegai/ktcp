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

const STAGGER_INTERVAL = 50; // ★ 0.2s 固定

const IN_MODE: "random" | "sequence" = "sequence";
const OUT_MODE: "random" | "sequence" = "sequence";

const REFRESH_EVENT = "slidein:refresh";
/* ================= */

function shouldSkipByBreakpoint(el: HTMLElement) {
  // Tailwind sm=640px を基準に「SP」を判定（sm未満）
  const isSP = window.matchMedia("(max-width: 639.98px)").matches;

  // SPのとき：PC用として隠される要素（sm以上でhidden）をスキップ
  if (isSP) return el.classList.contains("pre:sm:hidden");

  // PCのとき：常時hidden（SP用）をスキップ
  return el.classList.contains("pre:hidden");
}

export default function SlideInOnLoad() {
  const pathname = usePathname();
  const router = useRouter();

  const getDelay = (
    index: number,
    _count: number,
    _min: number,
    _max: number,
    mode: "random" | "sequence"
  ) => {
    if (mode === "sequence") {
      return index * STAGGER_INTERVAL;
    }
    // random を残すなら（不要なら消してOK）
    return Math.floor(Math.random() * STAGGER_INTERVAL);
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
  // ★ 残留しがちなコンテナを先に復帰（works-list等）
  const roots = Array.from(
    document.querySelectorAll<HTMLElement>(".works-list.slide-in")
  ).filter((el) => !shouldSkipByBreakpoint(el));

  roots.forEach((el) => {
    el.classList.remove("is-hidden");
    el.classList.add("is-shown");
    el.style.transitionDelay = "0ms";
  });

  const els = Array.from(
    document.querySelectorAll<HTMLElement>(".slide-in")
  ).filter((el) => !shouldSkipByBreakpoint(el));

  if (els.length === 0) return;

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
    ).filter((el) => !shouldSkipByBreakpoint(el))
    // .filter((el) => !el.classList.contains("works-list")); // ★追加


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
