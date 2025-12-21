import FMLink from "@/components/FMLink";
import ResponsiveImage from "@/components/ResponsiveImage";
import { pickEyecatchRandom } from "@/lib/wp";

type Props = {
  work: any;              // まずは any のまま（必要なら後で型作れます）
  widthClass: string;     // "pre:w-[calc(2/4*100%)]" みたいなの
  className?: string;     // 追加したい時用
};

export default function WorksCard({ work: w, widthClass, className = "" }: Props) {
  const picked = pickEyecatchRandom(w, { seed: w.id });
  if (!picked) return null;

  return (
    <FMLink
  href={`/works/${w.slug}`}
  className={[
    widthClass,
    "pre:mb-5 pre:px-[calc(7.5/1401*100%)]",

    // ▼ header 内 h2, p に transition を適用
    "pre:[&_header_h2]:[will-change:transform,opacity]",
    "pre:[&_header_p]:[will-change:transform,opacity]",
    "pre:[&_header_h2]:transition-colors",
    "pre:[&_header_p]:transition-colors",
    "pre:[&_header_h2]:duration-[500ms]",
    "pre:[&_header_p]:duration-[500ms]",
    "pre:[&_header_h2]:ease-[var(--ease-out-quart)]",
    "pre:[&_header_p]:ease-[var(--ease-out-quart)]",

    // ▼ hover 時の色変化
    "pre:hover:[&_header_h2]:text-ketchup",
    "pre:hover:[&_header_p]:text-ketchup",

    // 既存
    "pre:[&_.responsive-image]:[clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)]",
    "pre:hover:[&_.responsive-image]:[clip-path:polygon(10px_10px,calc(100%-10px)_10px,calc(100%-10px)_calc(100%-10px),10px_calc(100%-10px))]",
    "pre:[&_.responsive-image-content]:scale-[1]",
    "pre:hover:[&_.responsive-image-content]:scale-[1.1]",
    "slide-in text-hover",
    className,
  ].join(" ")}
>
      <ResponsiveImage
        pc={picked.pc}
        sp={picked.sp || undefined}
        alt={w.title?.rendered ?? ""}
        placeholder_color={w.acf?.placeholder_color}
        fallbackRatio="4 / 3"
      />

      <header className="pre:flex pre:mt-2.5">
        <p className="pre:text-[15px] pre:font-gt pre:font-light pre:w-[70px]">
          {w.acf?.date}
        </p>

        <h2
          className="pre:text-[15px] pre:font-gt pre:font-light pre:w-[calc(100%-70px-105px)] pre:text-ellipsis pre:overflow-hidden pre:whitespace-nowrap"
          dangerouslySetInnerHTML={{ __html: w.title?.rendered ?? "" }}
        />

        <p className="pre:text-[10px] pre:leading-[130%] pre:font-gt pre:font-light pre:w-[105px] pre:text-right">
          {Array.isArray(w.works_cat) && w.works_cat.length > 0
            ? w.works_cat.map((cat: any) => cat.name).join(" / ")
            : ""}
        </p>
      </header>
    </FMLink>
  );
}
