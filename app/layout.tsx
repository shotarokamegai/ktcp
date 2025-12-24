// app/layout.tsx (or RootLayout)
import "../styles/animations.css";
import "../styles/globals.css";
import "../styles/tailwind.css";
import { gtAmerica } from "./fonts";
import MenuToggle from "@/components/MenuToggle";
import SplittingSpan from "@/components/SplittingSpan"
import Image from "next/image";
import FMLink from "@/components/FMLink";
import HeaderNavLink from "@/components/HeaderNavLink";
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
  "pre:fixed pre:top-0 pre:left-0 pre:z-[100] pre:sm:sp-h-[50] " +
  "pre:flex pre:justify-between " +
  "pre:w-full pre:px-5 pre:py-[26px] pre:bg-white pre:sm:py-0 pre:sm:sp-px-[20] pre:sm:flex pre:sm:items-center pre:sm:justify-between";

const LOGO_LINK = "pre:w-[104.4px] pre:h-11 pre:sm:sp-w-[65] pre:sm:h-auto pre:sm:block";

const NAV =
  "js-header-nav pre:[&_ul]:flex pre:[&_ul]:items-start pre:[&_ul]:justify-end " +
  "pre:sm:fixed pre:sm:sp-w-[430] pre:sm:mx-auto pre:sm:bg-white " +
  "pre:sm:opacity-0 pre:sm:invisible pre:sm:h-screen pre:sm:w-screen pre:sm:top-0 pre:sm:left-0 pre:sm:[&_ul]:flex-col pre:sm:sp-pl-[20] pre:sm:sp-pb-[50]";

const NAV_LINK_BASE =
  "pre:font-gt pre:font-regular pre:text-[12px] " +
  "pre:text-black pre:hover:text-ketchup pre:sm:sp-fs-[30] pre:sm:font-light";

const NAV_LINK_GAP = "pre:mr-[37px] pre:sm:mr-0";

const CAREERS_LINK =
  "pre:inline-flex pre:items-center pre:px-[17px] " +
  "pre:text-ketchup pre:hover:text-black " +
  "pre:[&_svg]:relative " +
  "pre:hover:[&_svg]:rotate-[45deg] pre:sm:pl-0 pre:sm:sppr-[20]";

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
        <MenuToggle />

        <header className={HEADER} id="header">
          <h1 className="pre:relative pre:z-100">
            <FMLink href="/" className={LOGO_LINK}>
              <Image src="/logo.svg" alt="Ketchup Logo" width={104.4} height={44}/>
            </FMLink>
          </h1>

          <nav className={NAV}>
            <ul className="pre:sm:mt-auto">
              <div className="pre:hidden pre:sm:block pre:absolute sm:center-xy pre:sp-w-[340]">
                <Image src="/illust/about.png" alt="" width={372} height={279} className="pre:w-full" />
              </div>
              <li>
                <HeaderNavLink
                  href="/about"
                  className={`${NAV_LINK_BASE} ${NAV_LINK_GAP} splitting-hover`}
                >
                  <span className="splitting-hover__inner">
                    <SplittingSpan text="ABOUT" />
                    <SplittingSpan text="ABOUT" />
                  </span>
                </HeaderNavLink>
              </li>
              <li>
                <HeaderNavLink
                  href="/contact"
                  className={`${NAV_LINK_BASE} ${NAV_LINK_GAP} splitting-hover`}
                >
                  <span className="splitting-hover__inner">
                    <SplittingSpan text="CONTACT" />
                    <SplittingSpan text="CONTACT" />
                  </span>
                </HeaderNavLink>
              </li>
              <li>
                <HeaderNavLink
                    href="/careers"
                    className={`${NAV_LINK_BASE} ${CAREERS_LINK} splitting-hover`}
                  >
                  <div className="pre:absolute center-y pre:left-0 sm:center-y pre:sm:hidden">
                    <Plus />
                  </div>
                  <span className="splitting-hover__inner pre:mt-[2%]">
                    <span className={CAREERS_TEXT}>
                      <SplittingSpan text="CAREERS" />
                      <SplittingSpan text="CAREERS" />
                    </span>
                  </span>
                  <div className="pre:absolute center-y pre:right-0 sm:center-y">
                    <Plus />
                  </div>
                </HeaderNavLink>
              </li>
            </ul>
          </nav>

          <div className="menu-trigger pre:sm:sp-h-[14] pre:sm:sp-w-[30] pre:hidden pre:sm:block pre:sm:relative">
            <div className="pre:absolute pre:right-0 pre:h-0.5 pre:w-full pre:bg-ketchup"></div>
            <div className="pre:absolute pre:right-0 pre:h-0.5 pre:sp-w-[18] pre:bg-ketchup"></div>
            <div className="pre:absolute pre:right-0 pre:h-0.5 pre:w-full pre:bg-ketchup"></div>
          </div>
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
