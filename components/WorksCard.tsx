"use client";

import FMLink from "@/components/FMLink";
import ResponsiveImage from "@/components/ResponsiveImage";
import { pickEyecatchRandom } from "@/lib/wp";

type Props = {
  work: any;
  widthClass: string;
  className?: string;
  /**
   * 2/4幅（= 1列3投稿の「大きい枠」）かどうか。
   * true の場合は縦長になる pattern を避ける。
   */
  isWide?: boolean;
};

type ImageMeta = { url: string; width?: number; height?: number };
type Pattern = 1 | 2 | 3;

function normalizeImage(x: any): ImageMeta | null {
  if (!x) return null;
  if (typeof x === "string") return { url: x };
  if (typeof x === "object") {
    const url = x.url || x.src || x.source_url;
    if (typeof url !== "string" || !url) return null;
    const width = typeof x.width === "number" ? x.width : undefined;
    const height = typeof x.height === "number" ? x.height : undefined;
    return { url, width, height };
  }
  return null;
}

/**
 * いろんなACF構造を吸収して pattern別のpc/spを取りに行く
 */
function getPatternImages(
  work: any,
  pattern: Pattern
): { pc: ImageMeta; sp?: ImageMeta | null } | null {
  const key = `pattern${pattern}`;
  const obj = work?.acf?.[key];
  if (!obj) return null;

  // 1) ACFが { pc:{}, sp:{} } / {pc:'',sp:''} 形式
  const pc = normalizeImage(obj.pc || obj.PC || obj.desktop);
  const sp = normalizeImage(obj.sp || obj.SP || obj.mobile);

  if (pc) return { pc, sp };

  // 2) ACFが単体画像（string / {url,width,height}）形式
  const pc2 = normalizeImage(obj);
  if (pc2) return { pc: pc2, sp: null };

  // 3) それでも取れないなら null
  return null;
}

export default function WorksCard({
  work: w,
  widthClass,
  className = "",
  isWide = false,
}: Props) {
  // ✅ レイアウト（枠）に応じて、使っていい pattern を制限する
  // - isWide=true（= 2/4幅の大きい枠）：縦長になりやすいので 1:1 のみに限定
  // - isWide=false（= 1/4幅の小さい枠=四つ並び枠）：1/1, 3/4, 16/9 を許可
  //
  // ★要件：pattern3 は「四つ並び（= 1/4幅）」の時しか入れない
  const allowed: Pattern[] = isWide ? [1] : [1, 2, 3];

  // ✅ seed は id で固定（SSR/CSR一致）
  const seed = w?.id ?? 0;

  // ✅ allowed の中で deterministic に pattern を選ぶ
  let pattern: Pattern = allowed[seed % allowed.length];

  // ✅ まずは pattern固定で画像を拾う
  let byPattern = getPatternImages(w, pattern);

  // ✅ 取れなかったら allowed 内で順にフォールバック（表示0を防ぐ）
  if (!byPattern) {
    for (const p of allowed) {
      const hit = getPatternImages(w, p);
      if (hit) {
        pattern = p;
        byPattern = hit;
        break;
      }
    }
  }

  // ✅ それでも取れなかったら従来の仕組みにフォールバック
  const fallback = byPattern ? null : pickEyecatchRandom(w, { seed });

  const picked = byPattern ?? fallback;
  if (!picked?.pc?.url) return null;

  // works_cat の表示ラベル：ACFの ryaku を優先し、なければ name
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

        // ✅ ここで常時 slide-in（hover依存をやめる）
        "slide-in",

        "pre:mb-5 pre:px-[calc(7.5/1401*100%)] pre:sm:sp-w-[160] pre:sm:sp-mx-[10] pre:sm:sp-mb-[40] pre:sm:px-0",

        // ✅ hover text（元に戻す）
        "pre:hover:[&_header_h2]:text-ketchup",
        "pre:hover:[&_header_p]:text-ketchup",

        // ✅ image hover（元に戻す）
        "pre:[&_.responsive-image]:[clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)]",
        "pre:hover:[&_.responsive-image]:[clip-path:polygon(calc(100%_*_0.046)_0,calc(100%_*_0.953)_0,calc(100%_*_0.953)_100%,calc(100%_*_0.046)_100%)]",
        "pre:[&_.responsive-image]:transition-all pre:[&_.responsive-image]:duration-500",

        className,
      ].join(" ")}
    >
      <ResponsiveImage
        className="pre:aspect-[1/1] pre:sm:sp-aspect-[1/1]"
        pc={{
          url: picked.pc.url,
          width: picked.pc.width,
          height: picked.pc.height,
        }}
        sp={
          picked.sp?.url
            ? { url: picked.sp.url, width: picked.sp.width, height: picked.sp.height }
            : undefined
        }
        alt={w?.title?.rendered ?? ""}
      />

      <header className="pre:flex pre:mt-2.5 pre:sm:block pre:sm:sp-mt-[8]">
        <h2
          className="pre:text-[15px] pre:font-gt pre:font-light pre:leading-[1.7] pre:w-[calc(100%-105px)] pre:pr-2 pre:sm:w-full transition-text pre:sm:sp-fs-[14] pre:sm:whitespace-normal pre:sm:sp-mb-[5]"
          dangerouslySetInnerHTML={{ __html: w.title?.rendered ?? "" }}
        />
        <p className="pre:text-[10px] pre:w-[105px] pre:text-right pre:font-gt pre:font-light pre:leading-[1.7] pre:sm:w-full pre:sm:text-left transition-text pre:sm:sp-fs-[10]">
          {catLabel}
        </p>
      </header>
    </FMLink>
  );
}
