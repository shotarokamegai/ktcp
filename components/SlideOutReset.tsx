"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SlideOutReset() {
  const pathname = usePathname();

  useEffect(() => {
    // 戻る/キャッシュ復帰でタイミングズレることがあるので2フレーム待つ
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        document.querySelectorAll<HTMLElement>(".slide-out.is-hidden").forEach((el) => {
          el.classList.remove("is-hidden");
          el.style.transitionDelay = "0ms"; // inline delay 残留対策
        });
      });
      return () => cancelAnimationFrame(raf2);
    });

    return () => cancelAnimationFrame(raf1);
  }, [pathname]);

  return null;
}
