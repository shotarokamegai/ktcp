// app/contact/page.tsx
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Image from "next/image";

import FrontEndEngineer from "@/components/careers/FrontEndEngineer";
import WebDirector from "@/components/careers/WebDirector";

import AccordionClient from "@/components/AccordionClient";

export const metadata: Metadata = {
  title: "Careers | Ketchup Portfolio",
  description: "採用ページ",
  openGraph: { title: "Careers | Ketchup Portfolio" },
};

export const revalidate = 60;

export default function CareersPage() {
  return (
    <main className="container pre:pt-[307px] slide-out pre:sm:sp-pt-[110] slide-out">
      <section className="pre:relative pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[230px] pre:sm:sp-w-[339]">
        <div className="pre:flex pre:justify-between pre:items-center pre:pb-[30px] pre:sm:sp-pb-[70]">
          <div className="pre:w-[calc(375/1401*100%)] pre:min-w-[375px]">
            <h2 className="pre:text-[24px] pre:font-gt pre:font-light pre:mb-[30px] slide-in pre:sm:sp-fs-[24] pre:sm:sp-mb-[240]">Careers</h2>
            <p className="pre:text-[18px] pre:font-dnp pre:font-light pre:leading-[180%] slide-in pre:sm:sp-fs-[18]">弊社では、新しいメンバーを<br className="pre:hidden pre:sm:block"/>募集中です。<br className="pre:sm:hidden"/>
            1つ1つの案件に真剣に<br className="pre:hidden pre:sm:block"/>向き合い、<br className="pre:sm:hidden"/>
            こだわりたいと考えている<br className="pre:hidden pre:sm:block"/>仲間を探しています。</p>
          </div>
          <div className="pre:absolute pre:sm:sp-top-[25] pre:right-0">
            <Image src="/illust/careers.png" alt="" width={175} height={210} className="pre:w-[175px] slide-in pre:sm:sp-w-[153]" />
          </div>
        </div>
        <div>
          <AccordionClient smWidth={750}>
            <FrontEndEngineer />
            <WebDirector />
          </AccordionClient>
        </div>
      </section>
      <Footer/>
    </main>
  );
}
