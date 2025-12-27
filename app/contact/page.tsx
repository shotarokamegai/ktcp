// app/contact/page.tsx
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Ketchup Portfolio",
  description: "お問い合わせフォーム",
  openGraph: { title: "Contact | Ketchup Portfolio" },
};

export const revalidate = 60;

export default function ContactPage() {
  return (
    <main className="container pre:pt-[307px] slide-out pre:sm:sp-pt-[110]">
      <ContactForm />
      <Footer />
    </main>

  );
}
