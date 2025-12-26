"use client";

import SplittingSpan from "@/components/SplittingSpan";
import type { WorkTerm } from "@/lib/wp";

export default function WorksCategoryNav({
  categories = [],
  activeSlug,
  onChange,
  className = "",
  allLabel = "ALL",
}: {
  categories?: WorkTerm[];
  onChange?: (slug: string | null) => void;
  activeSlug: string | null;
  className?: string;
  allLabel?: string;
}) {
  const base =
    "pre:font-gt pre:font-light pre:mr-[25px] pre:last:mr-0 pre:transition-colors pre:cursor-pointer pre:inline-block pre:[&_.splitting-hover__inner]:h-[50px] pre:[&_span]:text-[10px]";

  return (
    <section
      className={[
        "pre:flex pre:justify-end pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:pb-[18px] pre:mb-[18px] slide-in pre:sm:sp-w-[340] pre:sm:justify-start pre:sm:sp-mb-[30] pre:sm:pb-0",
        className,
      ].join(" ")}
    >
      {/* ALL */}
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
          <SplittingSpan text={allLabel} />
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
              <SplittingSpan text={cat.name} />
            </span>
          </button>
        );
      })}
    </section>
  );
}
