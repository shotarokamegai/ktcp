import Image from "next/image";
import Arrow from "@/components/svg/Arrow";
import SplittingSpan from "@/components/SplittingSpan";

type ListItem = { text: string };

type FlowItem = {
  no: string;          // "01"
  title: string;       // "書類選考"
  desc?: string;       // 説明文
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
      lead?: string; // "必須要件" など
      items: ListItem[];
    }
  | {
      kind: "flow";
      en: string;
      ja: string;
      items: FlowItem[];
    };

type Props = {
  id: string;               // accordion の id & data-target に使う
  title: string;            // "Front End Engineer"
  illustSrc: string;        // "/illust/engineer.png"
  illustWidth?: number;     // default: 372
  illustHeight?: number;    // default: 279

  sections: Section[];

  applyLabel?: string;      // default: "APPLY NOW"
  applyHref?: string;       // aタグのリンク先（無ければ href無し）
  applyOnClick?: () => void;
};

export default function CareersAccordion({
  id,
  title,
  illustSrc,
  illustWidth = 372,
  illustHeight = 279,
  sections,
  applyLabel = "APPLY NOW",
  applyHref,
  applyOnClick,
}: Props) {
  const applyProps = {
    ...(applyHref ? { href: applyHref } : {}),
    ...(applyOnClick ? { onClick: applyOnClick } : {}),
  };

  return (
    <div className="accordion careers-accordion group" id={id}>
      <div
        className="careers-accordion-title accordion-trigger js-pc-accordion pre:hover:text-ketchup splitting-hover pre:sticky! pre:top-24"
        data-target={id}
      >
        <h3 className="pre:text-[18px] pr:font-gt pre:font-light pre:sm:sp-fs-[18] pre:sm:leading-[1]">
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

      <div className="accordion__inner careers-accordion__inner pre:grid-cols-[calc(436/1401*100%)_1fr] pre:gap-x-[calc(158/1401*100%)] pre:items-start pre:sm:!block pre:sm:w-full">
        <div className="pre:sticky pre:top-[140px] careers-accordion-illust pre:pl-[calc(114/436*100%)] pre:pt-[70px] pre:sm:relative pre:sm:top-auto pre:sm:pt-0 pre:sm:pl-0">
          <Image
            src={illustSrc}
            alt=""
            width={illustWidth}
            height={illustHeight}
            className=""
          />
        </div>

        <div className="accordion__inner-content careers-accordion__inner-content">
          {sections.map((sec, idx) => (
            <div className="careers-accordion-box" key={`${sec.en}-${idx}`}>
              <div className="pre:w-[142px]">
                <h4
                  dangerouslySetInnerHTML={{
                    __html: sec.en.replace(/\n/g, "<br/>"),
                  }}
                />
                <h5>{sec.ja}</h5>
              </div>

              <div className="pre:w-[calc(100%-142px-15px)]">
                {sec.kind === "text" && (
                  <>
                    <p className="pre:text-[14px] pre:leading-[180%]">
                      {sec.text}
                    </p>
                    {sec.textNote && (
                      <p className="pre:text-[12px]">{sec.textNote}</p>
                    )}
                  </>
                )}

                {sec.kind === "list" && (
                  <>
                    {sec.lead && (
                      <p className="pre:text-[14px] pre:leading-[180%] pre:mb-10">
                        {sec.lead}
                      </p>
                    )}
                    <ul className="pre:[&>li]:text-[12px] pre:[&>li]:pb-3 pre:[&>li]:mb-3 pre:[&>li:last-child]:mb-0 pre:[&>li:last-child]:border-b-0 pre:[&>li]:border-b pre:[&>li]:border-lightGray pre:[&>li]:border-solid">
                      {sec.items.map((it, i) => (
                        <li key={i}>{it.text}</li>
                      ))}
                    </ul>
                  </>
                )}

                {sec.kind === "flow" && (
                  <ul className="pre:[&>li]:text-[12px] pre:[&>li]:pb-3 pre:[&>li]:mb-3 pre:[&>li:last-child]:mb-0 pre:[&>li:last-child]:border-b-0 pre:[&>li]:border-b pre:[&>li]:border-lightGray pre:[&>li]:border-solid pre:[&>li]:flex pre:[&>li]:items-center">
                    {sec.items.map((it, i) => (
                      <li key={i}>
                        <div className="pre:w-[calc(71/496*100%)]">
                          <p className="pre:text-[20px] pre:font-gt pre:font-light">
                            {it.no}
                          </p>
                        </div>
                        <div className="pre:w-[calc(106/496*100%)]">
                          <p className="pre:text-[14px] pre:font-dnp pre:font-light">
                            {it.title}
                          </p>
                        </div>
                        <div className="pre:w-[calc(319/496*100%)]">
                          <p className="pre:text-[12px] pre:leading-[180%] pre:font-dnp pre:font-light">
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

          <a
            className="btn-submit pre:mt-[30px] pre:mx-auto splitting-hover icon-hover pre:hover:[&_.char]:text-black pre:hover:[&_path]:stroke-black pre:hover:[&_line]:stroke-black pre:hover:bg-white"
            {...applyProps}
          >
            <span className="splitting-hover__inner">
              <SplittingSpan text={applyLabel} />
              <SplittingSpan text={applyLabel} />
            </span>

            <div className="icon-content pre:absolute center-y pre:right-[25px] pre:flex pre:items-center">
              <span className="icon-content__inner">
                <div className="pre:p-[5px] icon">
                  <Arrow />
                </div>
                <div className="pre:p-[5px] icon">
                  <Arrow />
                </div>
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
