"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __KTCP_NAV_CLICK_TS__?: number; // 最後に「遷移するリンク」をクリックした時刻
  }
}

const LEAVE_WINDOW_MS = 650; // ★ slide-out の duration に合わせて調整（0.5sなら 600〜750）
const CLEANUP_RETRY = [0, 60, 160, 360, 800]; // ★ 到着後の掃除リトライ

function now() {
  return Date.now();
}

function recentLeaveWindow() {
  const ts = window.__KTCP_NAV_CLICK_TS__ ?? 0;
  return ts > 0 && now() - ts < LEAVE_WINDOW_MS;
}

function unhideAll(force = false) {
  // ★ “遷移クリック直後”だけは消さない（slide-out を生かす）
  if (!force && recentLeaveWindow()) return;

  document.querySelectorAll<HTMLElement>(".slide-out.is-hidden").forEach((el) => {
    el.classList.remove("is-hidden");
    // inline delay 残留で固まる対策
    el.style.transitionDelay = "0ms";
  });
}

function isInternalNavigatingAnchor(a: HTMLAnchorElement, e: MouseEvent) {
  const href = a.getAttribute("href") || "";
  if (!href) return false;
  if (href.startsWith("#")) return false; // hashだけは遷移扱いしない
  if (a.target === "_blank") return false;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;

  // 外部は除外
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
  } catch {
    // 相対パスならOK
  }
  return true;
}

export default function SlideOutGuard() {
  const pathname = usePathname();

  // ① 遷移クリック時刻を記録（captureで先に取る）
  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!a) return;

      if (!isInternalNavigatingAnchor(a, e)) return;

      // ★ ここで “遷移クリック” とみなす
      window.__KTCP_NAV_CLICK_TS__ = now();
    };

    window.addEventListener("click", onClickCapture, true);
    return () => window.removeEventListener("click", onClickCapture, true);
  }, []);

  // ② “到着したら” 必ず掃除（pathname変化＝新ページに来た合図）
  useEffect(() => {
    // 到着直後は強制掃除してOK（新ページは hidden のまま困るだけ）
    CLEANUP_RETRY.forEach((ms) => {
      window.setTimeout(() => unhideAll(true), ms);
    });

    // bfcache（戻る）対策：pageshowでも強制掃除
    const onPageShow = () => unhideAll(true);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [pathname]);

  // ③ is-hidden が付与されたら監視して、遷移クリック直後以外は即剥がす
  useEffect(() => {
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== "attributes") continue;
        const el = m.target as HTMLElement;
        if (!el?.classList) continue;

        if (el.classList.contains("slide-out") && el.classList.contains("is-hidden")) {
          // ★ クリック直後（slide-out中）だけは残す
          if (recentLeaveWindow()) continue;

          el.classList.remove("is-hidden");
          el.style.transitionDelay = "0ms";
        }
      }
    });

    mo.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => mo.disconnect();
  }, []);

  return null;
}
