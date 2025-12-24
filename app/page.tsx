// app/works/page.tsx
import Footer from "@/components/Footer";
import WorksBrowserClient from "@/components/WorksBrowserClient";
import { fetchWorks, fetchWorkCategories } from "@/lib/wp";

export const revalidate = 60;

export default async function WorksPage() {
  const [works, categories] = await Promise.all([fetchWorks(), fetchWorkCategories()]);

  return (
    <main className="container pre:pt-[307px] pre:sm:sp-pt-[130] slide-out">
      <WorksBrowserClient
        initialWorks={works}
        categories={categories}
        initialActiveSlug={null}
      />
      <Footer />
    </main>
  );
}
