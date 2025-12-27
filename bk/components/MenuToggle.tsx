"use client";

import { useEffect } from "react";

export default function MenuToggle() {
  useEffect(() => {
    const trigger = document.querySelector<HTMLElement>(".menu-trigger");
    const nav = document.querySelector<HTMLElement>(".js-header-nav");
    if (!trigger || !nav) return;

    const ACTIVE_CLASS = "is-open"; // trigger / nav 共通
    const CLOSE_DURATION = 200; // ★ navのフェードアウト所要ms（CSSと合わせる）

    // nav 内の splitting-hover（メニュー項目）
    const items = Array.from(
      nav.querySelectorAll<HTMLElement>(".splitting-hover")
    );

    // ★追加：ヘッダー内 Close（menu-trigger 内の splitting-hover）
    // これが今まで制御されていなかったので、OPEN時に表示されなくなっていた
    const closeLabels = Array.from(
      trigger.querySelectorAll<HTMLElement>(".splitting-hover")
    );

    // stagger index（1回でOK）
    items.forEach((el, i) => el.style.setProperty("--stagger", String(i)));

    // ★ SP判定：Tailwind sm(640px) と揃える
    const isSP = () => window.matchMedia("(max-width: 639.98px)").matches;

    const open = () => {
      nav.classList.add(ACTIVE_CLASS);
      trigger.classList.add(ACTIVE_CLASS);

      // ★追加：Close を強制表示（hover不要に）
      closeLabels.forEach((el) => el.classList.add("stay"));

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

      // ★追加：Close を初期状態に戻す
      closeLabels.forEach((el) => el.classList.remove("stay"));

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
      const a = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
      if (!a) return;

      // ★ SPだけ：ページを隠してから close → close完了後に fm:start で遷移
      if (isSP()) {
        const href = a.getAttribute("href");
        if (!href) return;

        e.preventDefault();

        // 下の #page を見せない（メニューの下に敷く前提）
        document.documentElement.classList.add("is-page-masked");

        // メニューを閉じる（フェードアウト開始）
        close();

        // フェードアウト完了後に遷移開始
        window.setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("fm:start", { detail: { href } })
          );
        }, CLOSE_DURATION);

        return;
      }

      // ★ PCは今まで通り：メニューだけ閉じて、遷移は通常に任せる
      close();
    };

    nav.addEventListener("click", onNavClick);

    return () => {
      trigger.removeEventListener("click", toggle);
      nav.removeEventListener("click", onNavClick);
    };
  }, []);

  return null;
}
