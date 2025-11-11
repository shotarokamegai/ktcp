import "../styles/globals.css";
import "../styles/tailwind.css";
import Image from "next/image";
import Link from 'next/link'
import FMLink from "@/components/FMLink";
import { LenisProvider } from './../components/LenisProvider'
import Plus from '../components/svg/Plus'
import TransitionCover from "@/components/TransitionCover"; // ← そのまま使う（後述の修正版）

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Ketchup Portfolio</title>
      </head>
      <body>
        <LenisProvider />
        <header className="pre:fixed pre:top-0 pre:left-0 pre:w-full pre:bg-white pre:px-[20px] pre:pt-[26px] pre:flex pre:justify-between pre:z-[100]">
          <FMLink href="/" className="pre:w-[104.4px] pre:h-[44px]">
            <Image src="/logo.svg" alt="Ketchup Logo" width={104.4} height={44} />
          </FMLink>
          <nav className="pre:flex pre:justify-end pre:items-start">
            <Link href="/about" className="pre:text-black pre:text-[12px] pre:mr-[37px]">ABOUT</Link>
            <Link href="/contact" className="pre:text-black pre:text-[12px] pre:mr-[37px]">CONTACT</Link>
            <Link href="/careers" className="pre:text-black pre:text-black pre:text-[12px] pre:inline-flex pre:items-center">
              <Plus />
              <span className="pre:mx-[6px]">
                CAREERS
              </span>
              <Plus />
            </Link>
          </nav>
        </header>

        {/* ★ メイン領域だけ覆うためにラップ */}
        <main id="page">
          {children}
          {/* ★ カバーは main の中に置く（= ヘッダーは覆わない） */}
          <TransitionCover />
        </main>
      </body>
    </html>
  );
}
