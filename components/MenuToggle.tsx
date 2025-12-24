"use client";

import { useEffect } from "react";

export default function MenuToggle() {
  useEffect(() => {
    const trigger = document.querySelector(".menu-trigger");
    const nav = document.querySelector<HTMLElement>(".js-header-nav");
    if (!trigger || !nav) return;

    const items = Array.from(nav.querySelectorAll<HTMLElement>(".splitting-hover"));

    // stagger index をセット（1回でOK）
    items.forEach((el, i) => el.style.setProperty("--stagger", String(i)));

    const open = () => {
      nav.classList.add("is-open");

      // 入口アニメを毎回リスタートしたいので一旦外す
      items.forEach((el) => el.classList.remove("menu-enter"));

      // reflow で transition を確実に発火
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      nav.offsetHeight;

      items.forEach((el) => el.classList.add("menu-enter"));
    };

    const close = () => {
      nav.classList.remove("is-open");
      items.forEach((el) => el.classList.remove("menu-enter"));
    };

    const toggle = () => {
      const isOpen = nav.classList.contains("is-open");
      if (isOpen) close();
      else open();
    };

    trigger.addEventListener("click", toggle);

    // nav内リンクを押したら閉じる（任意）
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
