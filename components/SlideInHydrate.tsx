"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function SlideInHydrate({
  selector = ".slide-in",
  className = "is-shown",
  bootScans = 6,
}: {
  selector?: string;
  className?: string;
  bootScans?: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const addOnly = (targets?: HTMLElement[]) => {
      const els =
        targets ?? Array.from(document.querySelectorAll<HTMLElement>(selector));
      if (!els.length) return;

      els.forEach((el) => {
        if (!el.classList.contains(className)) el.classList.add(className);
      });
    };

    let rafId = 0;
    let count = 0;
    const bootLoop = () => {
      addOnly();
      count++;
      if (count < bootScans) rafId = requestAnimationFrame(bootLoop);
    };
    rafId = requestAnimationFrame(bootLoop);

    const mo = new MutationObserver((mutations) => {
      const added: HTMLElement[] = [];
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches?.(selector)) added.push(n);
          n.querySelectorAll?.(selector).forEach((el) =>
            added.push(el as HTMLElement)
          );
        });
      }
      if (added.length) addOnly(added);
    });

    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(rafId);
      mo.disconnect();
    };
  }, [pathname, searchParams?.toString(), selector, className, bootScans]);

  return null;
}
