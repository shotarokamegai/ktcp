"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useRef } from "react";
import FMLink from "@/components/FMLink";

type Props = {
  href: string;
  className?: string;
  exact?: boolean;
  children: React.ReactNode;
};

export default function HeaderNavLink({
  href,
  className = "",
  exact = false,
  children,
}: Props) {
  const pathname = usePathname();
  const ref = useRef<HTMLAnchorElement | null>(null);

  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  const handleClick = () => {
    // ヘッダー内の他リンクの遷移状態を外す
    document
      .querySelectorAll("header nav a.is-transitioning")
      .forEach((el) => el.classList.remove("is-transitioning"));

    ref.current?.classList.add("is-transitioning");
  };

  return (
    <FMLink
      href={href}
      className={clsx(className, {
        active: isActive,
      })}
      onClick={handleClick}
      ref={ref as any}
    >
      {children}
    </FMLink>
  );
}
