"use client";

import { useEffect } from "react";

export default function MenuToggle() {
  useEffect(() => {
    const trigger = document.querySelector<HTMLElement>(".menu-trigger");
    const nav = document.querySelector<HTMLElement>(".js-header-nav");
    if (!trigger || !nav) return;

    const ACTIVE_CLASS = "is-open"; // trigger / nav 共通
    const CLOSE_DURATION = 200; // ★ navのフェードアウト所要ms（CSSと合わせる）
    const AFTER_CLOSE_DELAY = 10000; // ★ 消えた後の“間”

    const items = Array.from(
      nav.querySelectorAll<HTMLElement>(".splitting-hover")
    );

    // stagger index（1回でOK）
    items.forEach((el, i) => el.style.setProperty("--stagger", String(i)));

    // ★ SP判定：Tailwind sm(640px) と揃える
    const isSP = () => window.matchMedia("(max-width: 639.98px)").matches;

    const open = () => {
      nav.classList.add(ACTIVE_CLASS);
      trigger.classList.add(ACTIVE_CLASS);

      // 入口アニメを毎回リスタート
      items.forEach((el) => el.classList.remove("menu-enter"));

      // reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      nav.offsetHeight;

      items.forEach((el) => el.classList.add("menu-enter"));
    };

    const close = () => {
      nav.classList.remove(ACTIVE_CLASS);
      trigger.classList.remove(ACTIVE_CLASS);

      items.forEach((el) => el.classList.remove("menu-enter"));
    };

    const toggle = () => {
      const opened = nav.classList.contains(ACTIVE_CLASS);
      if (opened) close();
      else open();
    };

    trigger.addEventListener("click", toggle);

    // nav内リンク押下
const onNavClick = (e: Event) => {
  const ev = e as MouseEvent;

  // 修飾クリックは無視（新規タブ等）
  if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;

  const a = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
  if (!a) return;

  if (isSP()) {
    const href = a.getAttribute("href");
    if (!href) return;

    // ★ ここが重要：Next.js Link の onClick より先に止める
    e.preventDefault();
    // @ts-expect-error: stopImmediatePropagation exists on Event in browsers
    e.stopImmediatePropagation?.();
    ev.stopPropagation();

    document.documentElement.classList.add("is-page-masked");
    close();

    const AFTER_CLOSE_DELAY = 500;

    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("fm:start", { detail: { href } }));
    }, CLOSE_DURATION + AFTER_CLOSE_DELAY);

    return;
  }

  close();
};


    // nav.addEventListener("click", onNavClick);
    nav.addEventListener("click", onNavClick, { capture: true });


    return () => {
      trigger.removeEventListener("click", toggle);
      // nav.removeEventListener("click", onNavClick);
      nav.removeEventListener("click", onNavClick, { capture: true } as any);

    };
  }, []);

  return null;
}
