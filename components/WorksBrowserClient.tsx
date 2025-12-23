"use client";

import { useMemo, useRef, useState } from "react";
import type { Work, WorkTerm } from "@/lib/wp";
import WorksCard from "@/components/WorksCard";
import WorksCategoryNav from "@/components/WorksCategoryNav";

type Props = {
  initialWorks: Work[];
  categories: WorkTerm[];
  initialActiveSlug?: string | null; // null = ALL
};

export default function WorksBrowserClient({
  initialWorks,
  categories,
  initialActiveSlug = null,
}: Props) {
  const [works, setWorks] = useState<Work[]>(initialWorks);
  const [activeSlug, setActiveSlug] = useState<string | null>(initialActiveSlug);
  const [isAnimating, setIsAnimating] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

const setUrlOnly = (slug: string | null) => {
  const next = slug ? `/works?category=${slug}` : `/works`;
  window.history.pushState({}, "", next);
};

const fetchWorksOnly = async (slug: string | null) => {
  abortRef.current?.abort();
  const ac = new AbortController();
  abortRef.current = ac;

  const qs = slug ? `?category=${encodeURIComponent(slug)}` : "";
  const res = await fetch(`/api/works${qs}`, {
    signal: ac.signal,
    headers: { Accept: "application/json" },
  });

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  // ✅ まずHTTPステータス確認
  if (!res.ok) {
    throw new Error(
      `API error: ${res.status} ${res.statusText}\n` +
        `URL: /api/works${qs}\n` +
        `Body(head): ${text.slice(0, 200)}`
    );
  }

  // ✅ JSON以外が返ったらここで止める（今のエラーを握りつぶさない）
  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON but got "${contentType}"\n` +
        `URL: /api/works${qs}\n` +
        `Body(head): ${text.slice(0, 200)}`
    );
  }

  const json = JSON.parse(text);
  if (!json.ok) throw new Error(json.message || "fetch failed");
  return json.works;
};


  const onChangeCategory = async (slug: string | null) => {
    // 同じなら何もしない
    if (slug === activeSlug) return;

    setIsAnimating(true);
    try {
      const nextWorks = await fetchWorksOnly(slug);
      setActiveSlug(slug);
      setUrlOnly(slug);
      setWorks(nextWorks);
    } finally {
      // フェード用：少しだけ待って戻す（好みで調整）
      requestAnimationFrame(() => setIsAnimating(false));
    }
  };

  // ▼ ここは元の category/[slug] の「横長＋イラスト差し込み」を流用
  const renderedItems = useMemo(() => {
    const latest = works.slice(0, 9);

    const items: { type: "work" | "illust"; work?: Work; key: string }[] = [];
    latest.forEach((w, i) => {
      items.push({ type: "work", work: w, key: `work-${w.id}` });
      if ((i + 1) % 3 === 0) items.push({ type: "illust", key: `illust-${i}` });
    });

    const firstRowBigIndex = Math.random() > 0.5 ? 0 : 1;
    let workIndex = 0;

    return items.map((item) => {
      if (item.type === "illust") {
        return (
          <div
            key={item.key}
            className="pre:w-1/4 pre:mb-5 pre:px-[calc(7.5/1401*100%)] slide-out"
          >
            {/* illustは既存のままでOK（あなたのResponsiveImageを使うなら差し替えて） */}
            <img src="/illust/about.png" alt="" />
          </div>
        );
      }

      const w = item.work!;
      const row = Math.floor(workIndex / 3);
      const indexInRow = workIndex % 3;

      const bigIndexForRow = row % 2 === 0 ? firstRowBigIndex : 1 - firstRowBigIndex;
      const isWide = indexInRow === bigIndexForRow;

      workIndex++;

      const widthClass = isWide ? "pre:w-[calc(2/4*100%)]" : "pre:w-[calc(1/4*100%)]";

      return (
        <WorksCard
          key={item.key}
          work={w}
          widthClass={widthClass}
          className="pre:mb-[20px] slide-out"
        />
      );
    });
  }, [works]);

  return (
    <>
      <WorksCategoryNav
        categories={categories}
        activeSlug={activeSlug}
        onChange={onChangeCategory}
        className=""
      />

      <section
        className={[
          "pre:flex pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px]",
          isAnimating ? "works-list is-changing" : "works-list",
        ].join(" ")}
      >
        {renderedItems}
      </section>
    </>
  );
}
