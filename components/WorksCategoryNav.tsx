"use client";

import type React from "react";
import { forwardRef } from "react";
import SplittingSpan from "@/components/SplittingSpan";
import type { WorkTerm } from "@/lib/wp";

type Props = {
  categories?: WorkTerm[];
  onChange?: (slug: string | null) => void;
  activeSlug: string | null;
  className?: string;
  allLabel?: string;

  stickyAnchorRef?: React.Ref<HTMLDivElement>;
};

const WorksCategoryNav = forwardRef<HTMLElement, Props>(function WorksCategoryNav(
  {
    categories = [],
    activeSlug,
    onChange,
    className = "",
    allLabel = "ALL",
    stickyAnchorRef,
  },
  ref
) {
  const base =
    "pre:font-gt pre:font-light pre:mr-[25px] pre:last:mr-0 pre:transition-colors pre:cursor-pointer pre:inline-block pre:[&_.splitting-hover__inner]:h-[50px] pre:[&_span]:text-[10px] pre:sm:sp-mr-[20] pre:sm:sp-fs-[10] pre:sm:whitespace-nowrap";

  return (
    <>
      <div ref={stickyAnchorRef} aria-hidden className="pre:h-0 pre:w-0" />

      <section
        ref={ref as React.Ref<HTMLElement>}
        className={[
          "pre:flex pre:justify-end pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:pb-[18px] pre:mb-[18px] pre:sm:sp-w-[340] pre:sm:justify-start pre:sm:sp-mb-[30] pre:sm:sp-py-[20] pre:sticky pre:top-[86px] pre:sm:sp-top-[49] pre:bg-white pre:z-10 slide-in slide-out pre:sm:flex-nowrap pre:sm:overflow-scroll",
          className,
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => onChange?.(null)}
          className={[
            base,
            !activeSlug
              ? "splitting-hover stay pre:text-ketchup"
              : "splitting-hover pre:text-gray-400 pre:hover:text-ketchup",
          ].join(" ")}
        >
          <span className="splitting-hover__inner">
            <SplittingSpan text={allLabel} />
            <SplittingSpan text={allLabel} aria-hidden="true" />
          </span>
        </button>

        {categories.map((cat) => {
          const isActive = cat.slug === activeSlug;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange?.(cat.slug)}
              className={[
                base,
                isActive
                  ? "splitting-hover stay pre:text-ketchup"
                  : "splitting-hover pre:text-gray-400 pre:hover:text-ketchup",
              ].join(" ")}
            >
              <span className="splitting-hover__inner">
                <SplittingSpan text={cat.name} />
                <SplittingSpan text={cat.name} aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </section>
    </>
  );
});

export default WorksCategoryNav;
