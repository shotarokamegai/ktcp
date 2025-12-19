"use client";

import { useEffect, useRef } from "react";

export default function SplittingSpan({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!text) return;

    // すでに分割済み & 正常なら何もしない
    if (el.dataset.splittingDone === "true" && el.querySelector(".char")) {
      return;
    }

    let cancelled = false;

    (async () => {
      const { default: Splitting } = await import("splitting");
      if (cancelled) return;

      // 念のため毎回テキストを入れ直す（0 chars防止）
      el.textContent = text;

      Splitting({
        target: el,
        by: "chars",
      });

      el.dataset.splittingDone = "true";
    })();

    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <span
      ref={ref}
      className={`splitting-text ${className}`}
      data-splitting="chars"
      aria-hidden="true"
    >
      {text}
    </span>
  );
}
