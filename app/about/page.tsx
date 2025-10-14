import type { Metadata } from "next";
import { fetchPageBySlug } from "@/lib/wp";
import { strip } from "@/lib/wp";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPageBySlug("about");
  const title = page ? strip(page.title.rendered) : "About";
  return { title, openGraph: { title } };
}

export default async function AboutPage() {
  const page = await fetchPageBySlug("about");
  if (!page) {
    return (
      <main className="container" style={{ maxWidth: 940 }}>
        <h1>About</h1>
        <p>準備中です。</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: 940 }}>
      <h1 dangerouslySetInnerHTML={{ __html: page.title.rendered }} />
      <section
        style={{ marginTop: 16 }}
        dangerouslySetInnerHTML={{ __html: page.content.rendered }}
      />
    </main>
  );
}
