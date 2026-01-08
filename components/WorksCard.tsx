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

// ✅ pattern → 横幅（画像ラッパーの幅）
const PATTERN_WIDTH: Record<Pattern, string> = {
  1: "pre:w-[calc(690/870*100%)]",
  2: "pre:w-[calc(516/870*100%)]",
  3: "pre:w-full",
};

// ✅ 画像の寄せ（必要なら）
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

  return (
    <FMLink
      href={`/works/${w.slug}`}
      className={[
        widthClass,
        "works-card group", // ✅ 追加（hover起点）
        "pre:[&_.responsive-image]:[clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)]",
        "pre:hover:[&_.responsive-image]:[clip-path:polygon(10px_10px,calc(100%-10px)_10px,calc(100%-10px)_calc(100%-10px),10px_calc(100%-10px))]",
        "pre:[&_img]:transform-[scale(1)]",
        "pre:hover:[&_img]:transform-[scale(1.05)]",
        "slide-in",
        "pre:mb-[calc(20/1401*100%)] pre:px-[calc(7.5/1401*100%)] pre:sm:sp-w-[160] pre:sm:sp-mx-[10] pre:sm:sp-mb-[40] pre:sm:px-0",
        className,
      ].join(" ")}
      data-wide={isWide ? "1" : "0"}
      data-ratio={ratioKey}
      data-pattern={String(requiredPattern)}
    >
      {/* ✅ aspect-ratio は一切なし。横幅だけ pattern で制御 */}
      <div className={["pre:flex", PATTERN_ALIGN[requiredPattern]].join(" ")}>
        <ResponsiveImage
          pc={{ url: imgUrl }}
          alt={w?.title?.rendered ?? ""}
          className={PATTERN_WIDTH[requiredPattern]}
          ratioKey={ratioKey}
          fit="cover"
          placeholder_color={w?.acf?.placeholder_color}
        />
      </div>

      <header className="works-card__text pre:flex pre:justify-between pre:mt-2.5 pre:sm:block pre:sm:sp-mt-[8]">
        <h2 className="works-card__title pre:text-[16px] pre:leading-[130%] pre:sm:sp-fs-[14]" dangerouslySetInnerHTML={{ __html: w?.title?.rendered ?? "" }} />
        <p className="works-card__meta pre:text-[10px] pre:w-[105px] pre:text-right pre:font-gt pre:font-light pre:leading-[1.7] pre:sm:w-full pre:sm:text-left transition-text pre:sm:sp-fs-[10]">
          {catLabel}
        </p>
      </header>
    </FMLink>
  );
}
