"use client";

import FMLink from "@/components/FMLink";
import ResponsiveImage from "@/components/ResponsiveImage";
import type { ImageMeta } from "@/components/ResponsiveImage";

type RatioKey = "1/1" | "3/4" | "4/3";
type Pattern = 1 | 2 | 3;

type Props = {
  work: any;
  widthClass: string;
  className?: string;
  isWide?: boolean;

  // ✅ レイアウト側で確定した真実
  ratioKey: RatioKey;
  requiredPattern: Pattern;
};

const RATIO_VALUE: Record<RatioKey, string> = {
  "1/1": "1 / 1",
  "3/4": "3 / 4",
  "4/3": "4 / 3",
};

// ✅ 整合性を壊さないプレースホルダ
function solidPlaceholderDataUrl(fill: string) {
  const safe = fill || "rgb(217, 217, 217)";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="${safe}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getEyecatchUrlByRequiredPattern(work: any, p: Pattern): string | null {
  // ✅ ACF構造：acf.eyecatch.pattern1/2/3 が "url文字列"
  const url = work?.acf?.eyecatch?.[`pattern${p}`];
  return typeof url === "string" && url.length > 0 ? url : null;
}

export default function WorksCard({
  work: w,
  widthClass,
  className = "",
  isWide = false,
  ratioKey,
  requiredPattern,
}: Props) {
  const url = getEyecatchUrlByRequiredPattern(w, requiredPattern);

  let img: ImageMeta;
  if (url) {
    img = { url };
  } else {
    // ✅ patternを変えて救済しない（整合性維持）
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[WorksCard] eyecatch url not found", {
        workId: w?.id,
        slug: w?.slug,
        ratioKey,
        requiredPattern,
        hasEyecatch: Boolean(w?.acf?.eyecatch),
        eyecatchKeys: w?.acf?.eyecatch ? Object.keys(w.acf.eyecatch) : null,
      });
    }
    const ph = String(w?.acf?.placeholder_color || "rgb(217, 217, 217)");
    img = { url: solidPlaceholderDataUrl(ph) };
  }

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
        "slide-in",
        "pre:mb-5 pre:px-[calc(7.5/1401*100%)] pre:sm:sp-w-[160] pre:sm:sp-mx-[10] pre:sm:sp-mb-[40] pre:sm:px-0",
        // hover（維持）
        "pre:hover:[&_header_h2]:text-ketchup",
        "pre:hover:[&_header_p]:text-ketchup",
        "pre:[&_.responsive-image]:[clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)]",
        "pre:hover:[&_.responsive-image]:[clip-path:polygon(calc(100%_*_0.046)_0,calc(100%_*_0.953)_0,calc(100%_*_0.953)_100%,calc(100%_*_0.046)_100%)] pre:hover:[&_img]:transform-[scale(1.05)]",
        "pre:[&_.responsive-image]:transition-all pre:[&_.responsive-image]:duration-500",
        className,
      ].join(" ")}
      data-wide={isWide ? "1" : "0"}
      data-ratio={ratioKey}
      data-pattern={String(requiredPattern)}
    >
      <ResponsiveImage
        pc={img}
        alt={w?.title?.rendered ?? ""}
        placeholder_color={w?.acf?.placeholder_color}
        aspectRatio={RATIO_VALUE[ratioKey]} // ✅ 枠のratioはレイアウトの真実のみ
        fit="cover"
      />

      <header className="pre:flex pre:mt-2.5 pre:sm:block pre:sm:sp-mt-[8]">
        <h2
          className="pre:text-[15px] pre:font-gt pre:font-light pre:leading-[1.7] pre:w-[calc(100%-105px)] pre:pr-2 pre:sm:w-full transition-text pre:sm:sp-fs-[14] pre:sm:whitespace-normal pre:sm:sp-mb-[5] pre:sm:pr-0"
          dangerouslySetInnerHTML={{ __html: w?.title?.rendered ?? "" }}
        />
        <p className="pre:text-[10px] pre:w-[105px] pre:text-right pre:font-gt pre:font-light pre:leading-[1.7] pre:sm:w-full pre:sm:text-left transition-text pre:sm:sp-fs-[10]">
          {catLabel}
        </p>
      </header>
    </FMLink>
  );
}
