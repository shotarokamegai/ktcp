"use client";

import Link from "next/link";
import ResponsiveImage from "@/components/ResponsiveImage";
import type { ImageMeta } from "@/components/ResponsiveImage";
import { pickEyecatchRandom } from "@/lib/wp";

type Props = {
  work: any;
  widthClass: string;
  className?: string;
  isWide?: boolean; // row3の1つだけ true（2マス）
};

type RatioKey = "1/1" | "3/4" | "4/3";
type Pattern = 1 | 2 | 3;

const RATIO_TO_PATTERN: Record<RatioKey, Pattern> = {
  "1/1": 1,
  "3/4": 2,
  "4/3": 3,
};

const RATIO_VALUE: Record<RatioKey, string> = {
  "1/1": "1 / 1",
  "3/4": "3 / 4",
  "4/3": "4 / 3",
};

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizeImage(x: any): ImageMeta | null {
  if (!x) return null;
  if (typeof x === "string") return { url: x };
  if (typeof x === "object") {
    const url = x.url || x.src || x.source_url;
    if (typeof url !== "string" || !url) return null;
    const width = typeof x.width === "number" ? x.width : undefined;
    const height = typeof x.height === "number" ? x.height : undefined;
    const placeholder_color =
      typeof x.placeholder_color === "string" ? x.placeholder_color : null;
    return { url, width, height, placeholder_color };
  }
  return null;
}

/** pattern1/2/3 を単一画像として取得（acf揺れ吸収） */
function getPatternImage(w: any, p: Pattern): ImageMeta | null {
  const acf = w?.acf;
  if (!acf) return null;

  const raw =
    acf[`pattern${p}`] ??
    acf[`pattern_${p}`] ??
    acf[`pattern${p}_pc`] ??
    acf[`pattern_${p}_pc`];

  if (!raw) return null;

  const direct = normalizeImage(raw);
  if (direct) return direct;

  // { pc: {...} } 等
  if (typeof raw === "object") {
    const pc = normalizeImage(raw.pc || raw.PC || raw.desktop);
    if (pc) return pc;
  }

  return null;
}

export default function WorksCard({
  work: w,
  widthClass,
  className = "",
  isWide = false,
}: Props) {
  const seed = (w?.id ?? 0) >>> 0;
  const rand = mulberry32(seed);

  // ✅ レイアウトルール：
  // - wide(2マス) は縦長回避で「3/4のみ」固定（= pattern2）
  // - それ以外は 1/1・3/4・4/3 をランダム
  // - pattern3(4/3) は 1マスのみ（wideでは選ばれない）
  let ratioKey: RatioKey = isWide
    ? "3/4"
    : (["1/1", "3/4", "4/3"] as const)[Math.floor(rand() * 3)];

  let pattern: Pattern = RATIO_TO_PATTERN[ratioKey];

  // 選んだpatternでまず取る
  let img = getPatternImage(w, pattern);

  // 無い場合：許容される候補から「画像があるもの」へフォールバック
  const fallbackOrder: RatioKey[] = isWide
    ? ["3/4", "1/1"] // wideは縦長回避、最悪1/1へ
    : ["1/1", "3/4", "4/3"];

  if (!img) {
    for (const rk of fallbackOrder) {
      const p = RATIO_TO_PATTERN[rk];
      const hit = getPatternImage(w, p);
      if (hit) {
        ratioKey = rk;
        pattern = p;
        img = hit;
        break;
      }
    }
  }

  // それでも無い場合：何かしら出す
  if (!img) {
    const fb = pickEyecatchRandom(w, { seed })?.pc;
    if (fb?.url) img = { url: fb.url, width: fb.width, height: fb.height };
  }

  if (!img?.url) return null;

  const catLabel = Array.isArray(w?.works_cat)
    ? w.works_cat
        .map((c: any) => c?.acf?.ryaku || c?.ryaku || c?.name)
        .filter(Boolean)
        .join(" / ")
    : "";

  return (
    <Link
      href={`/works/${w.slug}`}
      className={[
        widthClass,
        "slide-in",
        "pre:mb-5 pre:px-[calc(7.5/1401*100%)] pre:sm:sp-w-[160] pre:sm:sp-mx-[10] pre:sm:sp-mb-[40] pre:sm:px-0",
        // ---- hover復活 ----
        "pre:hover:[&_header_h2]:text-ketchup",
        "pre:hover:[&_header_p]:text-ketchup",
        "pre:[&_.responsive-image]:[clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)]",
        "pre:hover:[&_.responsive-image]:[clip-path:polygon(calc(100%_*_0.046)_0,calc(100%_*_0.953)_0,calc(100%_*_0.953)_100%,calc(100%_*_0.046)_100%)] pre:hover:[&_.responsive-image>img]:[transform:scale(1.05)]",
        "pre:[&_.responsive-image]:transition-all pre:[&_.responsive-image]:duration-500",
        className,
      ].join(" ")}
    >
      <ResponsiveImage
        pc={img}
        alt={w?.title?.rendered ?? ""}
        placeholder_color={w?.acf?.placeholder_color}
        aspectRatio={RATIO_VALUE[ratioKey]}
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
    </Link>
  );
}
