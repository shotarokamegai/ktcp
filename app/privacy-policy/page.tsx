import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { fetchPageBySlug, strip } from "@/lib/wp";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPageBySlug("privacy-policy");
  const title = page ? strip(page.title?.rendered ?? "") : "Privacy Policy";

  return {
    title: `${title} | Ketchup Inc. | 株式会社 Ketchup`,
    description: "プライバシーポリシーページ",
    openGraph: { title: `${title} | Ketchup Inc. | 株式会社 Ketchup` },
  };
}

export default async function PrivacyPolicyPage() {
  const page = await fetchPageBySlug("privacy-policy");

  // WP側に無い時でも落ちないように最低限のフォールバック
  const html =
    page?.content?.rendered ??
    "<p>プライバシーポリシーの内容がまだ用意されていません。</p>";

  return (
    <main className="container pre:pt-[307px] slide-out pre:sm:sp-pt-[110]">
      <section className="pre:w-[calc(100%-40px)] pre:text-center pre:pb-[185px] pre:sm:sp-w-[339] pre:sm:sp-mb-[100]">
        <h1 className="pre:text-[24px] pre:font-gt pre:font-light slide-in pre:mb-[60px] pre:sm:sp-fs-[24] pre:sm:sp-mb-[90]">
          Privacy Policy
        </h1>

        <div
          className="pre:w-[530px] pre:mx-auto pre:font-normal slide-in pre:[&_p]:pre:leading-[180%] pre:[&_a]:pre:underline pre:sm:w-full"
          dangerouslySetInnerHTML={{ __html: html }}
          
        />
      </section>
      <Footer />
    </main>
  );
}
