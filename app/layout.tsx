// app/layout.tsx (or RootLayout)
import GAListener from "@/components/GAListener";
import "../styles/globals.css";
import "../styles/tailwind.css";
import type { Metadata } from "next";
import { gtAmerica } from "./fonts";
import MenuToggle from "@/components/MenuToggle";
import SplittingSpan from "@/components/SplittingSpan";
import Image from "next/image";
import FMLink from "@/components/FMLink";
import HeaderNavLink from "@/components/HeaderNavLink";
import Script from "next/script";
import { LenisProvider } from "./../components/LenisProvider";
import Plus from "../components/svg/Plus";
import SlideInOnLoad from "@/components/SlideInOnLoad";

export const metadata: Metadata = {
  title: {
    default: "Ketchup Inc. | Tokyo-based creative company.",
    template: "%s - Ketchup Inc. | Tokyo-based creative company.",
  },
  description:
    "東京発のクリエイティブカンパニー。デザインからWebサイト制作・ブランディングまで、企画・制作・運用を一貫して手がけます。| Add a bit of flavoring to those contents, and deliver them in an even better thing.",

  openGraph: {
    type: "website",
    siteName: "Ketchup Inc. | Tokyo-based creative company.",
    title: "Ketchup Inc. | Tokyo-based creative company.",
    description:
      "東京発のクリエイティブカンパニー。デザインからWebサイト制作・ブランディングまで、企画・制作・運用を一貫して手がけます。| Add a bit of flavoring to those contents, and deliver them in an even better thing.",
    url: "https://ktcp.jp",
    images: [
      {
        url: "https://ktcp.jp/ogp.png",
        width: 1200,
        height: 630,
        alt: "Ketchup Inc.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Ketchup Inc. | Tokyo-based creative company.",
    description:
      "東京発のクリエイティブカンパニー。デザインからWebサイト制作・ブランディングまで、企画・制作・運用を一貫して手がけます。| Add a bit of flavoring to those contents, and deliver them in an even better thing.",
    images: ["https://ktcp.jp/ogp.png"],
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV; // 使うなら
const ENABLE_GA = !!GA_ID; // previewでも計測したいならこれだけでOK
// previewでGAを入れたくないなら：
// const ENABLE_GA = !!GA_ID && VERCEL_ENV === "production";

// ============================
// Tailwind class presets
// ============================
const BODY = "pre:w-full";

const HEADER =
  "pre:fixed pre:top-0 pre:left-0 pre:z-[100] pre:h-[86px] pre:sm:sp-h-[50] header-slide " +
  "pre:w-full pre:bg-white pre:sm:py-0 pre:sm:sp-px-[20] pre:sm:flex pre:sm:items-center pre:sm:justify-between";

const LOGO_LINK =
  "pre:w-[104.4px] pre:h-11 pre:sm:sp-w-[65] pre:sm:h-auto pre:sm:block";

const NAV =
  "js-header-nav pre:absolute pre:top-[26px] pre:right-5 pre:[&_ul]:flex pre:[&_ul]:items-start pre:[&_ul]:justify-end pre:sm:flex " +
  "pre:sm:fixed pre:sm:sp-w-[430] pre:sm:mx-auto pre:sm:bg-white " +
  "pre:sm:opacity-0 pre:sm:invisible pre:sm:h-dvh pre:sm:w-screen pre:sm:top-0 pre:sm:left-0 pre:sm:[&_ul]:flex-col pre:sm:sp-pl-[20] pre:sm:sp-pb-[50]";

const NAV_LINK_BASE =
  "pre:font-gt pre:font-regular pre:text-[12px] " +
  "pre:text-black pre:hover:text-ketchup pre:sm:sp-fs-[30] pre:sm:font-light";

const NAV_LINK_GAP = "pre:mr-[37px] pre:sm:mr-0";

const CAREERS_LINK =
  "pre:inline-flex pre:items-center pre:px-[17px] pre:sm:top-auto " +
  "pre:text-ketchup pre:hover:text-black " +
  "pre:[&_svg]:relative " +
  "pre:hover:[&_svg]:rotate-[45deg] pre:sm:pl-0 pre:sm:sppr-[20]";

const CAREERS_TEXT = "pre:block pre:relative";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={gtAmerica.variable}>
      <head>
        {ENABLE_GA && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { page_path: window.location.pathname });
            `}
          </Script>
        </>
      )}
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
        {ENABLE_GA && <GAListener />}
        <LenisProvider />
        <MenuToggle />

        <header className={HEADER} id="header">
          <h1 className="pre:absolute pre:top-[26px] pre:left-5 pre:z-100 sm:center-y" id="logo">
            <FMLink href="/" className={LOGO_LINK}>
              <Image
                src="/logo.svg"
                alt="Ketchup Logo"
                className=""
                width={104.4}
                height={44}
              />
            </FMLink>
          </h1>

          <nav className={NAV}>
            <ul className="pre:sm:mt-auto">
              <div className="pre:hidden pre:sm:block pre:absolute sm:center-xy pre:sp-w-[375] illust">
                <Image
                  src="/illust/about.png"
                  alt=""
                  width={372}
                  height={279}
                  className="pre:w-full"
                />
              </div>

              <li className="pre:leading-none">
                <HeaderNavLink
                  href="/about"
                  className={`${NAV_LINK_BASE} ${NAV_LINK_GAP} splitting-hover`}
                >
                  <span className="splitting-hover__inner">
                    <SplittingSpan text="ABOUT" aria-hidden="false" />
                    <SplittingSpan text="ABOUT" aria-hidden="true" />
                  </span>
                </HeaderNavLink>
              </li>

              <li className="pre:leading-none">
                <HeaderNavLink
                  href="/contact"
                  className={`${NAV_LINK_BASE} ${NAV_LINK_GAP} splitting-hover`}
                >
                  <span className="splitting-hover__inner">
                    <SplittingSpan text="CONTACT" aria-hidden="false" />
                    <SplittingSpan text="CONTACT" aria-hidden="true" />
                  </span>
                </HeaderNavLink>
              </li>

              <li className="pre:leading-none">
                <HeaderNavLink
                  href="/careers"
                  className={`${NAV_LINK_BASE} ${CAREERS_LINK} splitting-hover pre:sm:overflow-hidden`}
                >
                  <div className="pre:absolute center-y pre:left-0 sm:center-y pre:sm:hidden">
                    <Plus />
                  </div>

                  <span
                    className={`${CAREERS_TEXT} splitting-hover__inner`}
                  >
                    <SplittingSpan text="CAREERS" aria-hidden="false" />
                    <SplittingSpan text="CAREERS" aria-hidden="true" />
                  </span>

                  <div className="pre:absolute center-y pre:right-0 sm:center-y plus">
                    <Plus />
                  </div>
                </HeaderNavLink>
              </li>
            </ul>
          </nav>

          <div className="menu-trigger pre:hidden pre:sm:block pre:sm:absolute pre:sm:sp-h-[14] pre:sm:sp-w-[30] pre:sm:sp-right-[18] sm:center-y">
            <div className="pre:h-full pre:w-full">
            <div className="menu-trigger-content pre:sm:relative pre:h-full pre:w-full pre:[&_div]:absolute pre:[&_div]:h-0.5 pre:[&_div]:bg-ketchup">
              <div className="menu1 pre:w-full pre:left-0"></div>
              <div className="menu2 pre:sp-w-[18]"></div>
              <div className="menu3 pre:w-full pre:left-0"></div>
              <div className="menu4"></div>
              <div className="menu5"></div>
            </div>
            <p className="pre:font-gt pre:font-light pre:sp-fs-[12] pre:text-ketchup pre:absolute sm:center-x pre:bottom-[calc(12/393*-100vw)] splitting-hover pre:w-[104%] pre:invisible pre:in-[.is-open]:visible">
              <span className="splitting-hover__inner">
                <SplittingSpan text="Close" aria-hidden="true" />
                <SplittingSpan text="Close" aria-hidden="true" />
              </span>
            </p>
            </div>
          </div>
        </header>

        {/* ★ 追加：メニューが消えるまで下のページを見せないマスク */}
        <div id="page-mask" aria-hidden="true" />

        <main id="page">
          {children}<SlideInOnLoad />
        </main>
      </body>
    </html>
  );
}
