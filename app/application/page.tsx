// app/contact/page.tsx
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ApplicationForm from "@/components/ApplicationForm";

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
        pre:sm:sp-w-[339]
        pre:sm:sp-mb-[100]
      "
    >
    {/* sticky は内側に */}
    <div className="pre:sm:relative">
      <ApplicationForm />
    </div>
  </section>

  <Footer />
</main>

  );
}
