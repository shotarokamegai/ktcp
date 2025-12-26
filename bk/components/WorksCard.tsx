import FMLink from "@/components/FMLink";
import ResponsiveImage from "@/components/ResponsiveImage";
import { pickEyecatchRandom } from "@/lib/wp";

type Props = {
  work: any;
  widthClass: string;
  className?: string;
};

export default function WorksCard({
  work: w,
  widthClass,
  className = "",
}: Props) {
  const picked = pickEyecatchRandom(w, { seed: w.id });
  if (!picked) return null;

  return (
    <FMLink
      href={`/works/${w.slug}`}
      className={[
        widthClass,
        "pre:mb-5 pre:px-[calc(7.5/1401*100%)] pre:sm:sp-w-[160] pre:sm:sp-mx-[10] pre:sm:sp-mb-[40] pre:sm:px-0",

        // hover text
        "pre:hover:[&_header_h2]:text-ketchup",
        "pre:hover:[&_header_p]:text-ketchup",

        // image hover
        "pre:[&_.responsive-image]:[clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)]",
        "pre:hover:[&_.responsive-image]:[clip-path:polygon(10px_10px,calc(100%-10px)_10px,calc(100%-10px)_calc(100%-10px),10px_calc(100%-10px))]",
        "pre:[&_.responsive-image-content]:scale-[1]",
        "pre:hover:[&_.responsive-image-content]:scale-[1.1]",

        // ★ slide-in 対象
        "slide-in slide-out",
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

      <header className="pre:flex pre:mt-2.5 pre:sm:sp-mt-[10] pre:sm:block">
        {/* <p className="pre:text-[15px] pre:font-gt pre:w-[70px]">
          {w.acf?.date}
        </p> */}

        <h2
          className="pre:text-[15px] pre:font-gt pre:font-light pre:w-[calc(100%-105px)] pre:truncate pre:sm:sp-fs-[14] pre:truncate pre:sm:leading-[130%]"
          dangerouslySetInnerHTML={{ __html: w.title?.rendered ?? "" }}
        />

        <p className="pre:text-[10px] pre:w-[105px] pre:text-right pre:sm:w-full pre:sm:text-left pre:sm:sp-fs-[10] pre:sm:sp-mt-[5]">
          {Array.isArray(w.works_cat)
            ? w.works_cat.map((c: any) => c.name).join(" / ")
            : ""}
        </p>
      </header>
    </FMLink>
  );
}
