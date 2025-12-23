"use client";

import SplittingSpan from "@/components/SplittingSpan";
import type { WorkTerm } from "@/lib/wp";

export default function WorksCategoryNav({
  categories = [],   // ← ここ！
  activeSlug,
  onChange,
  className = "",
  allLabel = "ALL",
}: {
  categories?: WorkTerm[]; // optional に
  activeSlug: string | null;
  onChange: (slug: string | null) => void;
  className?: string;
  allLabel?: string;
}) {

  const base =
    "pre:font-gt pre:font-light pre:text-[10px] pre:mr-[25px] pre:last:mr-0 pre:hover:text-black pre:transition-colors pre:cursor-pointer";

  return (
    <section
      className={[
        "pre:flex pre:justify-end pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:pb-[18px] pre:mb-[18px] slide-in",
        className,
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        className={[
          base,
          !activeSlug ? "pre:text-black" : "pre:text-gray-400 splitting-hover pre:hover:text-ketchup",
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
            onClick={() => onChange(cat.slug)}
            className={[
              base,
              isActive ? "pre:text-black" : "pre:text-gray-400 splitting-hover pre:hover:text-ketchup",
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
