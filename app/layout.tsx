// app/layout.tsx (or RootLayout)
import "../styles/animations.css";
import "../styles/globals.css";
import "../styles/tailwind.css";
import { gtAmerica } from "./fonts";
import SplittingSpan from "@/components/SplittingSpan"
import Image from "next/image";
import FMLink from "@/components/FMLink";
import Script from "next/script";
import { LenisProvider } from "./../components/LenisProvider";
import Plus from "../components/svg/Plus";
import TransitionCover from "@/components/TransitionCover";
import SlideInOnLoad from "@/components/SlideInOnLoad";

// ============================
// Tailwind class presets
// ============================
const BODY = "pre:w-full pre:overflow-hidden";

const HEADER =
  "pre:fixed pre:top-0 pre:left-0 pre:z-[100] " +
  "pre:flex pre:justify-between " +
  "pre:w-full pre:px-5 pre:pt-[26px]";

const LOGO_LINK = "pre:w-[104.4px] pre:h-11";

const NAV = "pre:flex pre:items-start pre:justify-end";

const NAV_LINK_BASE =
  "pre:font-gt pre:font-regular pre:text-[12px] " +
  "pre:text-black pre:hover:text-ketchup";

const NAV_LINK_GAP = "pre:mr-[37px]";

const CAREERS_LINK =
  "pre:inline-flex pre:items-center pre:px-[17px] " +
  "pre:text-ketchup pre:hover:text-black " +
  "pre:[&_svg]:relative " +
  "pre:hover:[&_svg]:rotate-[45deg]";

const CAREERS_TEXT = "pre:block pre:relative";

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
                var config = { kitId: 'amd6ymi', scriptTimeout: 3000, async: true },
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

      <body className={BODY}>
        <LenisProvider />

        <header className={HEADER} id="header">
          <FMLink href="/" className={LOGO_LINK}>
            <Image src="/logo.svg" alt="Ketchup Logo" width={104.4} height={44} />
          </FMLink>

          <nav className={NAV}>
            <FMLink href="/about" className={`${NAV_LINK_BASE} ${NAV_LINK_GAP} splitting-hover`}>
            <span className="splitting-hover__inner">
              <SplittingSpan text="ABOUT" />
              <SplittingSpan text="ABOUT" />
            </span>
            </FMLink>
            <FMLink href="/contact" className={`${NAV_LINK_BASE} ${NAV_LINK_GAP} splitting-hover`}>
            <span className="splitting-hover__inner">
             <SplittingSpan text="CONTACT" />
             <SplittingSpan text="CONTACT" />
            </span>
            </FMLink>

            <FMLink href="/careers" className={`${NAV_LINK_BASE} ${CAREERS_LINK} splitting-hover`}>
              <div className="pre:absolute center-y pre:left-0 sm:center-y">
                <Plus />
              </div>
              <span className="splitting-hover__inner">
                <span className={CAREERS_TEXT}>
                  <SplittingSpan text="CAREERS" />
                  <SplittingSpan text="CAREERS" />
                </span>
              </span>
              <div className="pre:absolute center-y pre:right-0 sm:center-y">
                <Plus />
              </div>
            </FMLink>
          </nav>
        </header>

        <main id="page">
          {children}
          <TransitionCover />
          <SlideInOnLoad />
        </main>
      </body>
    </html>
  );
}
