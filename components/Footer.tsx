// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="pre:flex pre:items-center pre:justify-between pre:px-[20px]">
      <a
        href="mailto:info@ktcp.jp"
        className="pre:text-[24px] pre:font-gt pre:font-light pre:hover:text-ketchup"
      >
        info@ktcp.jp
      </a>

      <p className="pre:text-[12px] pre:font-gt pre:font-light">
        ©Ketchup.inc all rights reserved.
      </p>

      <p className="pre:text-[12px] pre:font-gt pre:font-light">2025</p>
    </footer>
  );
}
