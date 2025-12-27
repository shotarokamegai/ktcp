// app/contact/page.tsx
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ApplicationForm from "@/components/ApplicationForm";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Application | Ketchup Portfolio",
  description: "応募フォーム",
  openGraph: { title: "Application | Ketchup Portfolio" },
};

export const revalidate = 60;

export default function ContactPage() {
  return (
    <main className="container pre:pt-[263px] slide-out pre:sm:sp-pt-[110]">
    <section
      className="
        pre:w-[693px]
        pre:mb-[180px]
        pre:mx-auto
      "
    >
    {/* sticky は内側に */}
    <div className="pre:sm:relative">
      <Image src="/illust/engineer.png" alt="" width={323} height={177} className="pre:w-[323px] pre:mb-[70px] pre:mx-auto slide-in" />
      <h2 className="pre:text-[24px] pre:font-gt pre:font-light pre:mb-14 slide-in pre:sm:sp-fs-[24] pre:sm:sp-mb-[25] pre:text-center">
        Application Form
      </h2>
      <ApplicationForm />
    </div>
  </section>

  <Footer />
</main>

  );
}
