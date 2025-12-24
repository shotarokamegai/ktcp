"use client";

import { useRef } from "react";
import { useAccordionController } from "@/components/useAccordionController"; // あなたのパスに合わせて

type Props = {
  children: React.ReactNode;
  smWidth?: number;
};

export default function CareersAccordionClient({ children, smWidth = 750 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  // この配下にある .accordion / .js-*-accordion をまとめて有効化
  // useAccordionController(rootRef, { smWidth });
  useAccordionController(rootRef, {
  illustFadeMs: 500,
  illustShowDelayMs: 0, // “開き切った瞬間に表示開始”なら0。0.5秒待ってからなら500
});

  return <div ref={rootRef} className="slide-in slide-out">{children}</div>;
}
