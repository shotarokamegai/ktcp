"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import SplittingSpan from "@/components/SplittingSpan";
import FMLink from "@/components/FMLink";
import type { WorkTerm } from "@/lib/wp";

function getActiveSlug(pathname: string): string | null {
  const m = pathname.match(/^\/works\/category\/([^\/?#]+)/);
  if (m?.[1]) return decodeURIComponent(m[1]);
  if (pathname === "/works") return null;
  return null;
}

export default function WorksCategoryNavShell({
  categories = [],
  allLabel = "ALL",
  allHref = "/works",
  categoryBaseHref = "/works/category",
}: {
  categories?: WorkTerm[];
  allLabel?: string;
  allHref?: string;
  categoryBaseHref?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const activeSlug = getActiveSlug(pathname);

  const lockRef = useRef(false);

  const base =
    "pre:font-gt pre:font-light pre:mr-[25px] pre:last:mr-0 pre:transition-colors pre:cursor-pointer pre:inline-block pre:[&_.splitting-hover__inner]:h-[50px] pre:[&_span]:text-[10px] pre:sm:sp-mr-[20] pre:sm:sp-fs-[10]";

  // ✅ navは常駐表示（slide-inにしない）
  const wrap =
    "pre:flex pre:justify-end pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:pb-[18px] pre:mb-[18px] pre:sm:sp-w-[340] pre:sm:justify-start pre:sm:sp-mb-[30] pre:sm:pb-0";

  const cls = (isActive: boolean) =>
    [
      base,
      isActive
        ? "splitting-hover stay pre:text-ketchup"
        : "splitting-hover pre:text-gray-400 pre:hover:text-ketchup",
    ].join(" ");

  const Label = ({ text }: { text: string }) => (
    <span className="splitting-hover__inner">
      <SplittingSpan text={text} />
      <SplittingSpan text={text} />
    </span>
  );

  const animateThenNavigate = (href: string) => (e: any) => {
    if (href === pathname) return;
    e.preventDefault();
    if (lockRef.current) return;
    lockRef.current = true;

    const el = e.currentTarget as HTMLElement | null;
    const ANIM_MS = 520;

    el?.classList.add("is-tap-anim");

    window.setTimeout(() => {
      el?.classList.remove("is-tap-anim");
      router.push(href);
      window.setTimeout(() => (lockRef.current = false), 200);
    }, ANIM_MS);
  };

  return (
    <section className={wrap}>
      <FMLink
        href={allHref}
        className={cls(activeSlug === null)}
        onClick={animateThenNavigate(allHref)}
      >
        <Label text={allLabel} />
      </FMLink>

      {categories.map((cat) => {
        const href = `${categoryBaseHref}/${cat.slug}`;
        return (
          <FMLink
            key={cat.id}
            href={href}
            className={cls(activeSlug === cat.slug)}
            onClick={animateThenNavigate(href)}
          >
            <Label text={cat.name} />
          </FMLink>
        );
      })}
    </section>
  );
}
