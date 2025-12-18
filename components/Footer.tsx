// components/Footer.tsx
import FMLink from "@/components/FMLink";

export default function Footer() {
  return (
    <footer className="pre:flex pre:items-center pre:justify-between pre:px-5 pre:pb-[33px] pre:leading-[1] slide-in slide-out">
      <a
        href="mailto:info@ktcp.jp"
        className="pre:text-[24px] pre:font-gt pre:font-light pre:hover:text-ketchup"
      >
        info@ktcp.jp
      </a>
      <div className="pre:flex pre:items-baseline">
        <p className="pre:text-[12px] pre:font-gt pre:font-light pre:mr-[180px]">
          ©Ketchup inc. all rights reserved.
        </p>

        <div className="pre:inline-block pre:relative pre:mr-[60px]">
          <FMLink href="/" className="pre:text-[12px] pre:font-gt pre:font-light">
            Privacy policy
          </FMLink>
          <div className="pre:h-px pre:w-full pre:bg-black pre:absolute pre:bottom-0 pre:left-0"></div>
        </div>

        <p className="pre:text-[12px] pre:font-gt pre:font-light">2025</p>
      </div>
    </footer>
  );
}
