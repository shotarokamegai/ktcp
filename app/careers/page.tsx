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
    <main className="container pre:pt-[307px] slide-out">
      <section className="pre:relative pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[230px]">
        <div className="pre:flex pre:justify-between pre:items-center pre:mb-[30px]">
          <div className="pre:w-[calc(339/1401*100%)] pre:min-w-[339px]">
            <h2 className="pre:text-[24px] pre:font-gt pre:font-light pre:mb-[30px] slide-in">Careers</h2>
            <p className="pre:text-[18px] pre:font-dnp pre:font-light pre:leading-[180%] slide-in">弊社では、新しいメンバーを募集中です。<br/>
            1つ1つの案件に真剣に向き合い、<br/>
            こだわりたいと考えている仲間を探しています。</p>
          </div>
          <div className="">
            <Image src="/illust/careers.png" alt="" width={220} height={220} className="pre:w-[220px] slide-in" />
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
