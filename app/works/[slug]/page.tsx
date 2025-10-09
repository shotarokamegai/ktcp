import { fetchWorkBySlug, strip } from "@/lib/wp";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  // 動的ビルドのみでOK。大量の場合は省略可
  return [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const work = await fetchWorkBySlug(params.slug);
  const title = work ? strip(work.title.rendered) : "Work";
  return { title, openGraph: { title } };
}

export default async function WorkDetail({ params }: { params: { slug: string } }) {
  const work = await fetchWorkBySlug(params.slug);
  if (!work) return <main className="container">Not Found</main>;
  return (
    <main className="container">
      <h1 dangerouslySetInnerHTML={{ __html: work.title.rendered }} />
      <section dangerouslySetInnerHTML={{ __html: work.content.rendered }} />
    </main>
  );
}
