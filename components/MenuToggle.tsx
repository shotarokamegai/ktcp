"use client";

import { useEffect } from "react";

export default function MenuToggle() {
  useEffect(() => {
    const trigger = document.querySelector<HTMLElement>(".menu-trigger");
    const nav = document.querySelector<HTMLElement>(".js-header-nav");
    if (!trigger || !nav) return;

    const ACTIVE_CLASS = "is-open";
    const CLOSE_DURATION = 200;

    const items = Array.from(nav.querySelectorAll<HTMLElement>(".splitting-hover"));
    items.forEach((el, i) => el.style.setProperty("--stagger", String(i)));

    const isSP = () => window.matchMedia("(max-width: 639.98px)").matches;

    const open = () => {
      nav.classList.add(ACTIVE_CLASS);
      trigger.classList.add(ACTIVE_CLASS);

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
      nav.classList.contains(ACTIVE_CLASS) ? close() : open();
    };

    trigger.addEventListener("click", toggle);

    // ✅ 追加：FMLink/遷移開始を検知したら必ず閉じる（ロゴ含む全リンク）
    const onFmStart = () => close();
    window.addEventListener("fm:start", onFmStart as EventListener);

    // nav内リンク押下（既存ロジック）
    const onNavClick = (e: Event) => {
      const ev = e as MouseEvent;

      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;

      const a = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
      if (!a) return;

      if (isSP()) {
        const href = a.getAttribute("href");
        if (!href) return;

        e.preventDefault();
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

    nav.addEventListener("click", onNavClick, { capture: true });

    return () => {
      trigger.removeEventListener("click", toggle);
      nav.removeEventListener("click", onNavClick, { capture: true } as any);
      window.removeEventListener("fm:start", onFmStart as EventListener);
    };
  }, []);

  return null;
}
