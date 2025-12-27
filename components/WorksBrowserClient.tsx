"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Work, WorkTerm } from "@/lib/wp";
import WorksCard from "@/components/WorksCard";
import WorksCategoryNav from "@/components/WorksCategoryNav";

const SWAP_OUT_MS = 350; // slide-out の duration に合わせる

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

  // ランダム要素を「アクセスごとに変える」ためのseed（SSR/Hydration一致のため mount後に確定）
  const [layoutSeed, setLayoutSeed] = useState<number | null>(null);
  useEffect(() => {
    try {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      setLayoutSeed(buf[0]);
    } catch {
      setLayoutSeed(Math.floor(Math.random() * 2 ** 32));
    }
  }, []);

  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLElement | null>(null);

  const setUrlOnly = (slug: string | null) => {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("category", slug);
    else url.searchParams.delete("category");
    window.history.replaceState({}, "", url.toString());
  };

  const onChangeCategory = async (slug: string | null) => {
    if (slug === activeSlug) return;

    setIsAnimating(true);
    setActiveSlug(slug);
    setUrlOnly(slug);

    // abort previous fetch
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const params = new URLSearchParams();
      if (slug) params.set("category", slug);

      const res = await fetch(`/api/works?${params.toString()}`, {
        signal: ac.signal,
      });
      if (!res.ok) throw new Error("fetch failed");
      const json = (await res.json()) as { works: Work[] };

      setWorks(json.works || []);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    } finally {
      setTimeout(() => setIsAnimating(false), SWAP_OUT_MS);
    }
  };

  // ▼ ここで「work + illust差し込み」を作る（元の仕様に戻す）
  const renderedItems = useMemo(() => {
    // まずは先頭9件に限定（元の挙動）
    const latest = works.slice(0, 9);

    // 3件ごとに illust を差し込む
    const items: { type: "work" | "illust"; work?: Work; key: string }[] = [];
    latest.forEach((w, i) => {
      items.push({ type: "work", work: w, key: `work-${w.id}` });
      if ((i + 1) % 3 === 0) items.push({ type: "illust", key: `illust-${i}` });
    });

    // ★ Math.random() を使うと hydration でズレるので seed から決める
    const firstRowBigIndex = ((layoutSeed ?? 0) & 1) === 0 ? 0 : 1;
    let workIndex = 0;

    return items.map((item) => {
      if (item.type === "illust") {
        return (
          <div
            key={item.key}
            className="pre:w-1/4 pre:mb-5 pre:px-[calc(7.5/1401*100%)] pre:sm:sp-w-[160] pre:sm:sp-mx-[10] pre:sm:sp-mb-[40] pre:sm:px-0 pre:flex pre:items-center pre:justify-center slide-in"
          >
            <img
              src="/illust/about.png"
              alt=""
              className="pre:w-[calc(304/375*100%)]"
              loading="lazy"
            />
          </div>
        );
      }

      const w = item.work!;
      // 3投稿レイアウト：3件単位で big の左右を入れ替える（0/1）
      const row = Math.floor(workIndex / 3);
      const bigIndexForRow = row === 0 ? firstRowBigIndex : (row + firstRowBigIndex) % 2;

      // ここでは「workが並ぶ想定 index」は 0,1,2 を繰り返す扱いにする
      const indexInTri = workIndex % 3;

      // big は 0 or 1 に出したい（=2/4幅）。残りは 1/4。
      const isWide = indexInTri === bigIndexForRow;

      const widthClass = isWide ? "pre:w-[calc(2/4*100%)]" : "pre:w-[calc(1/4*100%)]";

      workIndex++;

      return (
        <WorksCard
          key={item.key}
          work={w}
          widthClass={widthClass}
          isWide={isWide} // ★pattern制御に使う
          className="pre:mb-5"
        />
      );
    });
  }, [works, layoutSeed]);

  useEffect(() => {
  // works が差し替わった “後” に付与
  const raf = requestAnimationFrame(() => {
    const root = listRef.current ?? document;
    root.querySelectorAll<HTMLElement>(".slide-in").forEach((el) => {
      el.classList.add("is-shown");
    });
  });
  return () => cancelAnimationFrame(raf);
}, [works]);

  return (
    <>
      <WorksCategoryNav categories={categories} activeSlug={activeSlug} onChange={onChangeCategory} />

      <section
        ref={(el) => {
          listRef.current = el;
        }}
        className={[
          "pre:flex pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px] pre:sm:sp-w-[360] pre:sm:sp-mb-[110]",
          isAnimating ? "works-list is-changing" : "works-list",
        ].join(" ")}
      >
        {renderedItems}
      </section>
    </>
  );
}
