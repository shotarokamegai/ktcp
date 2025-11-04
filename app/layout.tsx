import "../styles/globals.css";
import Image from "next/image";
import Link from 'next/link'
import FMLink from "@/components/FMLink";
import { LenisProvider } from './../components/LenisProvider'
import TransitionCover from "@/components/TransitionCover"; // ← そのまま使う（後述の修正版）

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Ketchup Portfolio</title>
      </head>
      <body style={{ background: "var(--bg, #0b0b0b)" }}>
        <LenisProvider />
        <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",borderBottom:"1px solid #222"}}>
          <FMLink href="/" style={{ display: "inline-flex", alignItems: "center" }}>
            <Image src="/logo.svg" alt="Ketchup Logo" width={120} height={32} priority />
          </FMLink>
          <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
            <Link href="/">Home</Link>
            <Link href="/works">Works</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </header>

        {/* ★ メイン領域だけ覆うためにラップ */}
        <main id="page" style={{ position: "relative", minHeight: "100dvh" }}>
          {children}
          {/* ★ カバーは main の中に置く（= ヘッダーは覆わない） */}
          <TransitionCover />
        </main>

        <footer style={{textAlign:"center",padding:"40px 0 20px",fontSize:12,opacity:.6}}>
          © Ketchup Inc.
        </footer>
      </body>
    </html>
  );
}
