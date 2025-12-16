import "../styles/globals.css";
import { gtAmerica } from "./fonts";
import "../styles/tailwind.css";
import Image from "next/image";
// import Link from 'next/link'
import FMLink from "@/components/FMLink";
import Script from "next/script";
import { LenisProvider } from './../components/LenisProvider'
import Plus from '../components/svg/Plus'
import TransitionCover from "@/components/TransitionCover"; // ← そのまま使う（後述の修正版）
import SlideInOnLoad from "@/components/SlideInOnLoad";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={gtAmerica.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Ketchup Inc. | 株式会社 Ketchup</title>
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
      <body className="pre:w-full pre:overflow-hidden">
        <LenisProvider />
        <header className="pre:fixed pre:top-0 pre:left-0 pre:w-full pre:px-5 pre:pt-[26px] pre:flex pre:justify-between pre:z-[100]">
          <FMLink href="/" className="pre:w-[104.4px] pre:h-11">
            <Image src="/logo.svg" alt="Ketchup Logo" width={104.4} height={44} />
          </FMLink>
          <nav className="pre:flex pre:justify-end pre:items-start pre:[&_a]:font-gt pre:[&_a]:font-regular pre:[&_a]:text-[12px]">
            <FMLink href="/about" className="pre:mr-[37px] pre:text-black pre:hover:text-ketchup">ABOUT</FMLink>
            <FMLink href="/contact" className="pre:mr-[37px] pre:text-black pre:hover:text-ketchup">CONTACT</FMLink>
            <FMLink href="/careers" className="pre:inline-flex pre:text-ketchup pre:items-center pre:hover:text-black pre:[&_svg]:relative pre:hover:[&_div]:rotate-[45deg]">
              <Plus />
              <span className="pre:mx-[6px]">
                CAREERS
              </span>
              <Plus />
            </FMLink>
          </nav>
        </header>

        {/* ★ メイン領域だけ覆うためにラップ */}
        <main id="page">
          {children}
          {/* ★ カバーは main の中に置く（= ヘッダーは覆わない） */}
          <TransitionCover />
          <SlideInOnLoad />  {/* ← これを追加 */}
        </main>
      </body>
    </html>
  );
}
