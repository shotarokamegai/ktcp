// components/WorksCategoryNavLink.tsx (Server Component)
import SplittingSpan from "@/components/SplittingSpan";
import FMLink from "@/components/FMLink";
import type { WorkTerm } from "@/lib/wp";

export default function WorksCategoryNavLink({
  categories = [],
  activeSlug = null,
  allHref = "/works",
}: {
  categories: WorkTerm[];
  activeSlug?: string | null;
  allHref?: string;
}) {
  const base =
    "pre:font-gt pre:font-light pre:text-[10px] pre:mr-[25px] pre:last:mr-0 pre:hover:text-black pre:transition-colors pre:cursor-pointer";

  return (
    <section className="pre:flex pre:justify-end pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:pb-[18px] pre:mb-[18px]">
      <FMLink
        href={allHref}
        className={[base, !activeSlug ? "pre:text-black" : "pre:text-gray-400 splitting-hover pre:hover:text-ketchup"].join(" ")}
      >
        <span className="splitting-hover__inner">
          <SplittingSpan text="ALL" />
          <SplittingSpan text="ALL" />
        </span>
      </FMLink>

      {categories.map((cat) => {
        const isActive = cat.slug === activeSlug;
        return (
          <FMLink
            key={cat.id}
            href={`/works/category/${cat.slug}`}
            className={[
              base,
              isActive ? "pre:text-black" : "pre:text-gray-400 splitting-hover pre:hover:text-ketchup",
            ].join(" ")}
          >
            <span className="splitting-hover__inner">
              <SplittingSpan text={cat.name} />
              <SplittingSpan text={cat.name} />
            </span>
          </FMLink>
        );
      })}
    </section>
  );
}
