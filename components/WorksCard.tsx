"use client";

import FMLink from "@/components/FMLink";
import ResponsiveImage from "@/components/ResponsiveImage";

type RatioKey = "1/1" | "3/4" | "4/3";
type Pattern = 1 | 2 | 3;

type Props = {
  work: any;
  widthClass: string;
  className?: string;
  isWide?: boolean;

  ratioKey: RatioKey;
  requiredPattern: Pattern;
};

const PATTERN_WIDTH: Record<Pattern, string> = {
  1: "pre:w-[calc(690/870*100%)]",
  2: "pre:w-[calc(516/870*100%)]",
  3: "pre:w-full",
};

const PATTERN_ALIGN: Record<Pattern, string> = {
  1: "pre:justify-center",
  2: "pre:justify-end",
  3: "pre:justify-start",
};

function getEyecatchUrlByPattern(work: any, p: Pattern): string | null {
  const url = work?.acf?.eyecatch?.[`pattern${p}`];
  return typeof url === "string" && url.trim() ? url.trim() : null;
}

export default function WorksCard({
  work: w,
  widthClass,
  className = "",
  isWide = false,
  ratioKey,
  requiredPattern,
}: Props) {
  const url = getEyecatchUrlByPattern(w, requiredPattern);
  const imgUrl = url || "";

  const catLabel = Array.isArray(w?.works_cat)
    ? w.works_cat
        .map((c: any) => c?.acf?.ryaku || c?.ryaku || c?.name)
        .filter(Boolean)
        .join(" / ")
    : "";

  // ✅ ratioKeyごとの「表示枠」の上書き（確実に効くやつ）
  const aspectRatioOverride =
    ratioKey === "4/3"
      ? ("12 / 6.74" as const)
      : ratioKey === "3/4"
      ? ("12 / 15" as const)
      : undefined;

  return (
    <FMLink
      href={`/works/${w.slug}`}
      className={[
        widthClass,
        "works-card group",
        // zoom
        "pre:[&_img]:transform-[scale(1)]",
        "pre:hover:[&_img]:transform-[scale(1.05)]",
        "pre:[&_img]:transition-transform pre:[&_img]:duration-700 pre:[&_img]:ease-out",
        "slide-in",
        "pre:mb-[calc(150/1401*100%)] pre:sm:sp-mb-[0] pre:sm:px-0",
        className,
      ].join(" ")}
      data-wide={isWide ? "1" : "0"}
      data-ratio={ratioKey}
      data-pattern={String(requiredPattern)}
    >
      <div className={["pre:flex", PATTERN_ALIGN[requiredPattern]].join(" ")}>
        <ResponsiveImage
          pc={{ url: imgUrl }}
          alt={w?.title?.rendered ?? ""}
          className={PATTERN_WIDTH[requiredPattern]}
          ratioKey={ratioKey}
          fit="cover"
          placeholder_color={w?.acf?.placeholder_color}
          // ✅ ここで確実に上書き（ResponsiveImageの実装差異があっても効く）
          style={aspectRatioOverride ? { aspectRatio: aspectRatioOverride } : undefined}
        />
      </div>

      <header className="works-card__text pre:flex pre:justify-between pre:mt-2.5 pre:sm:block pre:sm:sp-mt-[8]">
        <h2
          className="works-card__title pre:text-[16px] pre:leading-[130%] pre:sm:sp-fs-[14] pre:font-gt pre:font-light"
          dangerouslySetInnerHTML={{ __html: w?.title?.rendered ?? "" }}
        />
        <p className="works-card__meta pre:text-[10px] pre:w-[105px] pre:text-right pre:font-gt pre:font-light pre:leading-[1.7] pre:sm:w-full pre:sm:text-left transition-text pre:sm:sp-fs-[10] pre:sm:mt-[.3vw]">
          {catLabel}
        </p>
      </header>
    </FMLink>
  );
}
