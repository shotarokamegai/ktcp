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
    <main className="container pre:pt-[307px] slide-out">
  <section
    className="
      pre:w-[calc(100%-40px)]
      pre:mx-auto
      pre:mb-[180px]
      pre:grid
      pre:items-start
      pre:grid-cols-[calc(339/1401*100%)_1fr]
      pre:gap-x-[calc(192/1401*100%)]
    "
  >
    {/* sticky は内側に */}
    <div className="pre:sticky pre:top-24">
      <h2 className="pre:text-[24px] pre:font-gt pre:font-light pre:mb-[106px] slide-in">
        Contact
      </h2>

      <div>
        <Image
          src="/illust/contact.png"
          alt=""
          width={220}
          height={220}
          className="pre:w-[220px] slide-in"
        />
      </div>

      <p className="pre:text-[24px] pre:font-gt pre:font-light pre:leading-[130%] slide-in pre:[overflow-wrap:anywhere]">
        Transforming Your Content Like Ketchup
        <br />
        Transforms a Meal, The Perfect Condiment
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
