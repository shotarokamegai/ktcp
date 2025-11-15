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
    <main className="container" style={{ maxWidth: 820 }}>
      <h1>Contact</h1>
      <p style={{ opacity: 0.85, marginBottom: 20 }}>
        お仕事のご相談・ご依頼はこちらからお願いします。
      </p>
      <ContactForm />
      <Footer/>
    </main>
  );
}
