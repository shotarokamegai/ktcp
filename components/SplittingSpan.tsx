"use client";
import { useEffect, useRef } from "react";

export default function SplittingSpan({
  text,
  className = "",
  "aria-hidden": ariaHidden,
}: {
  text: string;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!text) return;
    if (el.dataset.splittingDone === "true" && el.querySelector(".char")) {
      return;
    }
    let cancelled = false;
    (async () => {
      const { default: Splitting } = await import("splitting");
      if (cancelled) return;
      el.textContent = text;
      Splitting({ target: el, by: "chars" });
      el.dataset.splittingDone = "true";
    })();
    return () => { cancelled = true; };
  }, [text]);

  return (
    <span
      ref={ref}
      className={`splitting-text ${className}`}
      data-splitting="chars"
      aria-hidden={ariaHidden}
    >
      {text}
    </span>
  );
}
