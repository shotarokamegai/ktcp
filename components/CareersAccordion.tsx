import Image from "next/image";
import FMLink from "@/components/FMLink";
import Arrow from "@/components/svg/Arrow";
import SplittingSpan from "@/components/SplittingSpan";

type ListItem = { text: string };

type FlowItem = {
  no: string;
  title: string;
  desc?: string;
};

type Section =
  | {
      kind: "text";
      en: string;
      ja: string;
      text: string;
      textNote?: string;
    }
  | {
      kind: "list";
      en: string;
      ja: string;
      lead?: string;
      items: ListItem[];
    }
  | {
      kind: "flow";
      en: string;
      ja: string;
      items: FlowItem[];
    };

type Props = {
  id: string;
  title: string;
  illustSrc: string;

  // intrinsic（比率・最適化のために保持）
  illustWidth?: number;
  illustHeight?: number;

  // ★追加：表示サイズはclassで制御できるように
  illustClassName?: string;
  illustWrapClassName?: string;

  sections: Section[];

  applyLabel?: string;

  /**
   * Next.js Link(FMLink) は href 必須なので、
   * ここは optional のままでも中で必ずフォールバックを当てる
   */
  applyHref?: string;
  applyOnClick?: () => void;
};

const cx = (...v: Array<string | undefined | false>) => v.filter(Boolean).join(" ");

export default function CareersAccordion({
  id,
  title,
  illustSrc,
  illustWidth = 372,
  illustHeight = 279,

  // デフォルト：親に合わせつつ最大幅だけPC/SPで分ける
  illustClassName = "pre:block pre:w-full pre:h-auto pre:max-w-[372px] pre:sm:max-w-[240px]",
  illustWrapClassName = "",

  sections,
  applyLabel = "APPLY NOW",
  applyHref,
  applyOnClick,
}: Props) {
  // ✅ FMLink（=Next Link）に必ずhrefを渡す（undefinedを混ぜない）
  // ここはプロジェクトの応募ページに合わせて調整してください
  const href = applyHref ?? "/application";

  return (
    <div className="accordion careers-accordion group" id={id}>
      <div
        className="careers-accordion-title accordion-trigger js-pc-accordion pre:hover:text-ketchup splitting-hover pre:sticky! pre:top-[86px] pre:sm:sp-top-[50]"
        data-target={id}
      >
        <h3 className="pre:text-[18px] pr:font-gt pre:font-light">
          <span className="splitting-hover__inner">
            <SplittingSpan text={title} />
            <SplittingSpan text={title} />
          </span>
        </h3>

        <div className="careers-accordion-title-line pre:absolute pre:bottom-0 pre:left-0 pre:h-px pre:w-full pre:overflow-hidden"></div>

        <div className="careers-accordion-icon">
          <div className="pre:absolute pre:bg-black pre:h-0.5 pre:w-full center-xy sm:center-xy"></div>
          <div className="pre:absolute pre:bg-black pre:h-full pre:w-0.5 center-xy sm:center-xy"></div>
        </div>
      </div>

      <div className="accordion__inner careers-accordion__inner pre:grid-cols-[calc(436/1401*100%)_1fr] pre:gap-x-[calc(158/1401*100%)] pre:items-start pre:sm:!block">
        <div className="pre:sticky pre:top-[140px] careers-accordion-illust pre:pl-[calc(114/436*100%)] pre:pt-[70px] pre:sm:relative pre:sm:top-auto pre:sm:pt-0 pre:sm:p-0 pre:sm:sp-mt-[50]">
          <div className={cx("pre:w-full pre:sm:sp-pl-[89] pre:sm:flex pre:sm:justify-center", illustWrapClassName)}>
            <Image src={illustSrc} alt="" width={illustWidth} height={illustHeight} className={illustClassName} />
          </div>
        </div>

        <div className="accordion__inner-content careers-accordion__inner-content">
          {sections.map((sec, idx) => (
            <div className="careers-accordion-box" key={`${sec.en}-${idx}`}>
              <div className="pre:w-[142px] pre:sm:w-full pre:sm:sp-mb-[60]">
                <h4
                  dangerouslySetInnerHTML={{
                    __html: sec.en.replace(/\n/g, "<br/>"),
                  }}
                />
                <h5>{sec.ja}</h5>
              </div>

              <div className="pre:w-[calc(100%-142px-15px)] pre:sm:w-full">
                {sec.kind === "text" && (
                  <>
                    <p className="pre:text-[14px] pre:leading-[180%] pre:sm:sp-fs-[14]">{sec.text}</p>
                    {sec.textNote && <p className="pre:text-[12px] pre:sm:sp-fs-[12]">{sec.textNote}</p>}
                  </>
                )}

                {sec.kind === "list" && (
                  <>
                    {sec.lead && (
                      <p className="pre:text-[14px] pre:leading-[180%] pre:mb-10 pre:sm:sp-fs-[14] pre:sm:sp-mb-[26]">
                        {sec.lead}
                      </p>
                    )}
                    <ul className="pre:[&>li]:text-[12px] pre:[&>li]:pb-3 pre:[&>li]:mb-3 pre:[&>li:last-child]:mb-0 pre:[&>li:last-child]:border-b-0 pre:[&>li]:border-b pre:[&>li]:border-darkGray pre:[&>li]:border-solid pre:[&>li]:sm:sp-fs[12] pre:[&>li]:sm:sp-pb-[6] pre:[&>li]:sm:sp-mb-[6]">
                      {sec.items.map((it, i) => (
                        <li key={i}>{it.text}</li>
                      ))}
                    </ul>
                  </>
                )}

                {sec.kind === "flow" && (
                  <ul className="pre:[&>li]:text-[12px] pre:[&>li]:pb-3 pre:[&>li]:sm:sp-pb-[25] pre:[&>li]:mb-3 pre:[&>li]:sm:sp-mb-[25] pre:[&>li:last-child]:mb-0 pre:[&>li:last-child]:border-b-0 pre:[&>li]:border-b pre:[&>li]:border-darkGray pre:[&>li]:border-solid pre:[&>li]:flex pre:[&>li]:items-center pre:[&>li]:sm:flex-wrap pre:[&>li]:sm:justify-between">
                    {sec.items.map((it, i) => (
                      <li key={i} className="pre:sm:sp-pl-[72] pre:sm:relative">
                        <div className="pre:w-[calc(71/496*100%)] pre:sm:absolute pre:sm:top-0 pre:sm:left-0 pre:sm:sp-w-[72]">
                          <p className="pre:text-[20px] pre:font-gt pre:font-light pre:sm:sp-fs-[20] pre:leading-none">{it.no}</p>
                        </div>
                        <div className="pre:w-[calc(106/496*100%)] pre:sm:sp-w-[177] pre:sm:sp-mb-[20]">
                          <p className="pre:text-[14px] pre:font-dnp pre:font-light pre:sm:sp-fs-[14] pre:leading-none">{it.title}</p>
                        </div>
                        <div className="pre:w-[calc(319/496*100%)] pre:sm:sp-w-[177]">
                          <p className="pre:text-[12px] pre:leading-[180%] pre:font-dnp pre:font-light pre:sm:sp-fs-[12]">
                            {it.desc ?? ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}

          <FMLink
            href={href}              // ✅ 必須
            onClick={applyOnClick}   // ✅ optional
            className="btn-submit pre:mt-[30px] pre:mx-auto splitting-hover icon-hover pre:hover:[&_.char]:text-black pre:hover:[&_path]:stroke-black pre:hover:[&_line]:stroke-black pre:hover:bg-white pre:sm:sp-mt-[12] pre:sm:sp-w-[320]"
          >
            <span className="splitting-hover__inner">
              <SplittingSpan text={applyLabel} />
              <SplittingSpan text={applyLabel} />
            </span>

            <div className="icon-content pre:absolute center-y sm:center-y pre:right-[25px] pre:flex pre:items-center pre:sm:sp-right-[30]">
              <span className="icon-content__inner">
                <div className="pre:p-[5px] icon pre:sm:p-0">
                  <Arrow />
                </div>
                <div className="pre:p-[5px] icon pre:sm:p-0">
                  <Arrow />
                </div>
              </span>
            </div>
          </FMLink>
        </div>
      </div>
    </div>
  );
}
