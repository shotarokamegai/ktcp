// app/works/page.tsx
// app/works/layout.tsx
import { Suspense } from "react";
import WorksCategoryNavShell from "@/components/WorksCategoryNavShell";
import Footer from "@/components/Footer";
import WorksBrowserClient from "@/components/WorksBrowserClient";
import { fetchWorks, fetchWorkCategories } from "@/lib/wp";

export const revalidate = 60;

export default async function WorksPage() {
  const [works, categories] = await Promise.all([fetchWorks(), fetchWorkCategories()]);

  return (
    <main className="container pre:pt-[307px] slide-out">
      <Suspense fallback={null}>
        <WorksCategoryNavShell categories={categories} />
      </Suspense>
      <WorksBrowserClient
        initialWorks={works}
        categories={categories}
        initialActiveSlug={null}
      />
      <Footer />
    </main>
  );
}
