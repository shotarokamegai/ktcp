// components/Footer.tsx
import FMLink from "@/components/FMLink";
import SplittingSpan from "@/components/SplittingSpan"

export default function Footer() {
  return (
    <footer className="pre:flex pre:items-center pre:justify-between pre:px-5 pre:pb-[33px] pre:leading-none slide-in slide-out pre:sm:block pre:sm:sp-pb-[40]">
      <a
        href="mailto:info@ktcp.jp"
        className="pre:text-[24px] pre:font-gt pre:font-light pre:hover:text-ketchup splitting-hover pre:sm:sp-fs-[14] pre:sm:sp-mb-[10]"
      >
        <span className="splitting-hover__inner">
          <SplittingSpan text="info@ktcp.jp" />
          <SplittingSpan text="info@ktcp.jp" />
        </span>
      </a>
      <div className="pre:flex pre:items-baseline">
        <p className="pre:text-[12px] pre:font-gt pre:font-light pre:mr-[180px] pre:sm:sp-fs-[10] pre:sm:sp-mr-[32]">
          ©Ketchup inc. all rights reserved.
        </p>

        <div className="pre:inline-block pre:relative pre:mr-[60px]">
          <FMLink href="/privacy-policy" className="pre:text-[12px] pre:font-gt pre:font-light splitting-hover pre:hover:text-ketchup pre:sm:sp-fs-[10]">
            <span className="splitting-hover__inner">
              <SplittingSpan text="Privacy policy" />
              <SplittingSpan text="Privacy policy" />
            </span>
          </FMLink>
          <div className="pre:h-px pre:w-full pre:bg-black pre:absolute pre:bottom-0 pre:left-0"></div>
        </div>

        <p className="pre:text-[12px] pre:font-gt pre:font-light pre:sm:ml-auto pre:sm:sp-fs-[10]">2025</p>
      </div>
    </footer>
  );
}
