import "../styles/globals.css";
import { gtAmerica } from "./fonts";
import "../styles/tailwind.css";
import Image from "next/image";
import Link from 'next/link'
import Script from "next/script";
import { LenisProvider } from './../components/LenisProvider'
import Plus from '../components/svg/Plus'
import TransitionCover from "@/components/TransitionCover"; // ← そのまま使う（後述の修正版）

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={gtAmerica.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Ketchup Portfolio</title>
        <Script
          id="adobe-fonts"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(d) {
                var config = {
                  kitId: 'amd6ymi',
                  scriptTimeout: 3000,
                  async: true
                },
                h=d.documentElement,
                t=setTimeout(function(){
                  h.className=h.className.replace(/\\bwf-loading\\b/g,"")+" wf-inactive";
                },config.scriptTimeout),
                tk=d.createElement("script"),
                f=false,
                s=d.getElementsByTagName("script")[0],a;
                h.className+=" wf-loading";
                tk.src='https://use.typekit.net/'+config.kitId+'.js';
                tk.async=true;
                tk.onload=tk.onreadystatechange=function(){
                  a=this.readyState;
                  if(f||a&&a!="complete"&&a!="loaded")return;
                  f=true;
                  clearTimeout(t);
                  try{Typekit.load(config)}catch(e){}
                };
                s.parentNode.insertBefore(tk,s)
              })(document);
            `,
          }}
        />
      </head>
      <body>
        <LenisProvider />
        <header className="pre:fixed pre:top-0 pre:left-0 pre:w-full pre:px-[20px] pre:pt-[26px] pre:flex pre:justify-between pre:z-[100]">
          <Link href="/" className="pre:w-[104.4px] pre:h-[44px]">
            <Image src="/logo.svg" alt="Ketchup Logo" width={104.4} height={44} />
          </Link>
          <nav className="pre:flex pre:justify-end pre:items-start pre:[&_a]:font-gt pre:[&_a]:font-regular pre:[&_a]:text-black pre:[&_a]:hover:text-ketchup pre:[&_a]:text-[12px]">
            <Link href="/about" className="pre:mr-[37px]">ABOUT</Link>
            <Link href="/contact" className="pre:mr-[37px]">CONTACT</Link>
            <Link href="/careers" className="pre:inline-flex pre:items-center">
              <Plus />
              <span className="pre:mx-[6px] pre:text-ketchup">
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
