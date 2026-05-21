import { MetadataRoute } from "next";
import { fetchWorks, fetchWorkCategories } from "@/lib/wp";
import type { Work, WorkTerm } from "@/lib/wp";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [works, categories] = await Promise.all([
    fetchWorks(),
    fetchWorkCategories(),
  ]);

  const workUrls = works.map((w: Work) => ({
    url: `https://ktcp.jp/works/${w.slug}`,
    lastModified: w.date ? new Date(w.date) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const categoryUrls = categories.map((c: WorkTerm) => ({
    url: `https://ktcp.jp/works/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: "https://ktcp.jp",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: "https://ktcp.jp/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://ktcp.jp/works",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...categoryUrls,
    ...workUrls,
    {
      url: "https://ktcp.jp/careers",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://ktcp.jp/contact",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
