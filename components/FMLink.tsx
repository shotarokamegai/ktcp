"use client";

import Link from "next/link";
import React, { forwardRef, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = React.ComponentProps<typeof Link>;

const OUT_FALLBACK_MS = 650; // ← 消えるアニメが長いならここを伸ばす

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
      onClick?.(e as any);

      pushedRef.current = false;

      const go = () => {
        if (pushedRef.current) return;
        pushedRef.current = true;
        router.push(String(href));
      };

      // “消える開始” を通知（ここで外側がアニメ開始して、終わったら go() を呼ぶ）
      window.dispatchEvent(
        new CustomEvent("fm:start", {
          detail: { href: String(href), go },
        })
      );

      // 保険：もし外側が go を呼ばなくても遷移できるように
      window.setTimeout(go, OUT_FALLBACK_MS);
    };

    return <Link href={href} onClick={handleClick} ref={ref} {...rest} />;
  }
);

FMLink.displayName = "FMLink";
export default FMLink;
