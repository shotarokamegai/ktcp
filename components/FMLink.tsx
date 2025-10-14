"use client";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";

export default function FMLink({
  href,
  children,
  className,
  style,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const router = useRouter();

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const evt = new CustomEvent("fm:start", { detail: { href } });
    window.dispatchEvent(evt); // カバーに「開始」を通知
  };

  return (
    <a href={href} onClick={onClick} className={className} style={style}>
      {children}
    </a>
  );
}
