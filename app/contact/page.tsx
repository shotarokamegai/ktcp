// app/contact/page.tsx
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "株式会社Ketchupへのお問い合わせはこちら。Web制作・ブランディング・デザインなどお気軽にご相談ください。| Feel free to reach out — we'd love to hear about your project.",
  openGraph: { title: "Contact | Ketchup Inc." },
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
