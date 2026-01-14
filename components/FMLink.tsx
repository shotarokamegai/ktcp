"use client";

import Link from "next/link";
import React, { forwardRef, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = React.ComponentProps<typeof Link>;

const OUT_FALLBACK_MS = 650;

const FMLink = forwardRef<HTMLAnchorElement, Props>(
  ({ href, onClick, ...rest }, ref) => {
    const router = useRouter();
    const pushedRef = useRef(false);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // 新規タブ/別操作は素通し
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.button !== 0
      ) {
        onClick?.(e as any);
        return;
      }

      e.preventDefault();

      const targetHref = String(href);
      const currentPath = window.location.pathname;

      // ============================
      // ✅ 同じページの場合：scrollTop に変更
      // ============================
      if (targetHref === currentPath) {
        // works 用のリセットなどはそのまま生かせる
        if (targetHref === "/") {
          window.dispatchEvent(new Event("works:reset"));
        }

        // Lenis があれば使う
        const lenis = (window as any).__lenis;
        if (lenis) {
          lenis.scrollTo(0, {
            duration: 0.8,
            easing: (t: number) => t,
          });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }

        onClick?.(e as any);
        return;
      }

      // ============================
      // ⬇️ 別ページ：今まで通り
      // ============================
      if (targetHref === "/") {
        window.dispatchEvent(new Event("works:reset"));
      }

      onClick?.(e as any);
      pushedRef.current = false;

      const go = () => {
        if (pushedRef.current) return;
        pushedRef.current = true;
        router.push(targetHref);
      };

      window.dispatchEvent(
        new CustomEvent("fm:start", {
          detail: { href: targetHref, go },
        })
      );

      window.setTimeout(go, OUT_FALLBACK_MS);
    };

    return <Link href={href} onClick={handleClick} ref={ref} {...rest} />;
  }
);

FMLink.displayName = "FMLink";
export default FMLink;
