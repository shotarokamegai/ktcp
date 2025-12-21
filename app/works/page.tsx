import Footer from "@/components/Footer";
import WorksCard from "@/components/WorksCard";

import { fetchWorks } from "@/lib/wp";

export const revalidate = 60;

export default async function WorksPage() {
  const works = await fetchWorks();

  return (
    <main className="container" style={{ padding: "80px 24px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Works</h1>

      <section className="pre:flex pre:justify-between pre:flex-wrap">
        {works.map((w) => (
          <WorksCard
            key={w.id}
            work={w}
            widthClass="pre:w-[calc(339/1401*100%)]"
          />
        ))}
      </section>

      <Footer />
    </main>
  );
}
