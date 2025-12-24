"use client";

import { useEffect } from "react";

export default function MenuToggle() {
  useEffect(() => {
    const trigger = document.querySelector<HTMLElement>(".menu-trigger");
    const nav = document.querySelector<HTMLElement>(".js-header-nav");
    if (!trigger || !nav) return;

    const ACTIVE_CLASS = "is-open"; // ← trigger / nav 共通で使う

    const items = Array.from(
      nav.querySelectorAll<HTMLElement>(".splitting-hover")
    );

    // stagger index（1回でOK）
    items.forEach((el, i) =>
      el.style.setProperty("--stagger", String(i))
    );

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
      const isOpen = nav.classList.contains(ACTIVE_CLASS);
      if (isOpen) close();
      else open();
    };

    trigger.addEventListener("click", toggle);

    // nav内リンク押下で閉じる
    const onNavClick = (e: Event) => {
      const a = (e.target as HTMLElement).closest("a");
      if (a) close();
    };
    nav.addEventListener("click", onNavClick);

    return () => {
      trigger.removeEventListener("click", toggle);
      nav.removeEventListener("click", onNavClick);
    };
  }, []);

  return null;
}
