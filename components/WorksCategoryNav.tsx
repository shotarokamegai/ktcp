// components/WorksCategoryNav.tsx
import FMLink from "@/components/FMLink";
import { fetchWorkCategories, type WorkTerm } from "@/lib/wp";

export default async function WorksCategoryNav({
  activeSlug,
  allHref = "/works",
  className = "",
}: {
  /** 今アクティブなカテゴリslug（ALL の時は undefined / null でOK） */
  activeSlug?: string | null;
  /** 「ALL」リンクの飛び先（ページによって変えたい時用） */
  allHref?: string;
  /** section に追加したいクラス */
  className?: string;
}) {
  const categories: WorkTerm[] = await fetchWorkCategories();

  return (
    <section
      className={[
        "pre:flex pre:justify-end pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:pb-[18px] pre:mb-[18px] slide-in slide-out",
        className,
      ].join(" ")}
    >
      <FMLink
        key="all"
        href={allHref}
        className={[
          "pre:font-gt pre:font-light pre:text-[10px] pre:mr-[25px] pre:last:mr-0 pre:hover:text-black pre:transition-colors",
          !activeSlug ? "pre:text-black" : "pre:text-gray-400",
        ].join(" ")}
      >
        ALL
      </FMLink>

      {categories.map((cat) => {
        const isActive = cat.slug === activeSlug;
        return (
          <FMLink
            key={cat.id}
            href={`/works/category/${cat.slug}`}
            className={[
              "pre:font-gt pre:font-light pre:text-[10px] pre:mr-[25px] pre:last:mr-0 pre:hover:text-black pre:transition-colors",
              isActive ? "pre:text-black" : "pre:text-gray-400",
            ].join(" ")}
          >
            {cat.name}
          </FMLink>
        );
      })}
    </section>
  );
}
