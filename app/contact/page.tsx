// app/contact/page.tsx
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Contact | Ketchup Portfolio",
  description: "お問い合わせフォーム",
  openGraph: { title: "Contact | Ketchup Portfolio" },
};

export const revalidate = 60;

export default function ContactPage() {
  return (
    <main className="container pre:pt-[307px] slide-out pre:sm:sp-pt-[110]">
  <section
    className="
      pre:w-[calc(100%-40px)]
      pre:mx-auto
      pre:mb-[180px]
      pre:grid
      pre:items-start
      pre:grid-cols-[calc(375/1401*100%)_1fr]
      pre:gap-x-[calc(192/1401*100%)]
      pre:sm:sp-w-[339]
      pre:sm:block
       pre:sm:sp-mb-[110]
    "
  >
    {/* sticky は内側に */}
    <div className="pre:sticky pre:top-24 pre:sm:relative pre:sm:top-auto pre:sm:sp-mb-[40]">
      <h2 className="pre:text-[24px] pre:font-gt pre:font-light pre:mb-[106px] slide-in pre:sm:sp-fs-[24] pre:sm:sp-mb-[25]">
        Contact
      </h2>

      <div className="pre:w-[256px] pre:mb-2.5 pre:sm:sp-w-[212] pre:sm:sp-mb-[35] pre:sm:mr-0 pre:sm:ml-auto">
        <Image
          src="/illust/contact.png"
          alt=""
          width={256}
          height={222}
          className="pre:w-[220px] slide-in pre:sm:sp-w-[212]"
        />
      </div>

      <p className="pre:text-[24px] pre:font-gt pre:font-light pre:leading-[130%] slide-in pre:wrap-anywhere pre:sm:sp-fs-[24]">
        Transforming Your Content Like <br className="pre:hidden pre:sm:block" />Ketchup
        <br className="pre:sm:hidden" />
        Transforms a Meal, <br className="pre:hidden pre:sm:block" />The Perfect Condiment
        <br />
        for Your Business
      </p>
    </div>

    {/* 右列：ここも w は付けない（1frに任せる） */}
    <div className="slide-in">
      <ContactForm />
    </div>
  </section>

  <Footer />
</main>

  );
}
