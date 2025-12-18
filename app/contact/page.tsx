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
    <main className="container pre:pt-[307px]">
      <section className=" pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px] pre:flex pre:justify-between">
        <div className="pre:w-[calc(339/1401*100%)]">
          <h2 className="pre:text-[24px] pre:font-gt pre:font-light pre:mb-[106px] slide-in slide-out">Contact</h2>
          <div>
            <Image src="/illust_2.png" alt="" width={220} height={220} className="pre:w-[220px] slide-in slide-out" />
          </div>
          <p className="pre:text-[24px] pre:font-gt pre:font-light pre:leading-[130%] slide-in slide-out">Transforming Your Content Like Ketchup<br/>
          Transforms a Meal, The Perfect Condiment<br/>
          for Your Business</p>
          </div>
        <div className="pre:w-[calc(870/1401*100%)] slide-in slide-out">
          <ContactForm />
        </div>
      </section>
      <Footer/>
    </main>
  );
}
