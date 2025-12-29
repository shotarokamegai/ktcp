"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Work, WorkTerm } from "@/lib/wp";
import WorksCard from "@/components/WorksCard";
import WorksCategoryNav from "@/components/WorksCategoryNav";

const SWAP_OUT_MS = 350;

type Props = {
  initialWorks?: Work[];
  categories: WorkTerm[];
  initialActiveSlug?: string | null;
};

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type IllustPattern = 1 | 2 | 3;
const ILLUST_RATIO_MAP: Record<IllustPattern, string> = {
  1: "1 / 1",
  2: "3 / 4",
  3: "4 / 3",
};

export default function WorksBrowserClient({
  initialWorks = [],
  categories,
  initialActiveSlug = null,
}: Props) {
  const [works, setWorks] = useState<Work[]>(
    Array.isArray(initialWorks) ? initialWorks : []
  );
  const [activeSlug, setActiveSlug] = useState<string | null>(initialActiveSlug);
  const [isAnimating, setIsAnimating] = useState(false);

  const [layoutSeed, setLayoutSeed] = useState<number>(0);
  useEffect(() => {
    try {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      setLayoutSeed(buf[0] >>> 0);
    } catch {
      setLayoutSeed((Math.random() * 2 ** 32) >>> 0);
    }
  }, []);

  const abortRef = useRef<AbortController | null>(null);

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

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const params = new URLSearchParams();
      if (slug) params.set("category", slug);

      const res = await fetch(`/api/works?${params.toString()}`, { signal: ac.signal });
      if (!res.ok) throw new Error("fetch failed");
      const json = (await res.json()) as { works?: Work[] };
      setWorks(Array.isArray(json.works) ? json.works : []);
    } catch (e: any) {
      if (e?.name !== "AbortError") console.error(e);
    } finally {
      setTimeout(() => setIsAnimating(false), SWAP_OUT_MS);
    }
  };

  const rendered = useMemo(() => {
    const safeWorks = Array.isArray(works) ? works : [];

    // ✅ illustが入りやすいように 12件まで
    const latest = safeWorks.slice(0, 12);

    const out: JSX.Element[] = [];

    const pushIllust = (rowIndex: number) => {
      const r = mulberry32((layoutSeed + rowIndex * 997) >>> 0)();
      const pattern = (Math.floor(r * 3) + 1) as IllustPattern;

      out.push(
        <div
          key={`illust-row-${rowIndex}`}
          className={[
            "pre:w-[calc(1/4*100%)]",
            "pre:mb-5 pre:px-[calc(7.5/1401*100%)] pre:sm:sp-w-[160] pre:sm:sp-mx-[10] pre:sm:sp-mb-[40] pre:sm:px-0",
            "pre:flex pre:items-center pre:justify-center",
          ].join(" ")}
        >
          <div className="pre:w-full" style={{ aspectRatio: ILLUST_RATIO_MAP[pattern] }}>
            <img
              src="/illust/about.png"
              alt=""
              className="pre:w-full pre:h-full pre:object-contain"
              loading="lazy"
            />
          </div>
        </div>
      );
    };

    let cursor = 0;
    let rowIndex = 0;

    // row3のwide位置を左右交互に
    let wideToggle = (layoutSeed & 1) === 0 ? 0 : 1;

    // ✅ 「2行でも1回出す」ためのフラグ
    let hasInsertedEarlyIllust = false;

    while (cursor < latest.length) {
      const remaining = latest.length - cursor;

      // ✅ 行は必ず 3 → 4 → 3 → 4…
      const rowKind = rowIndex % 2 === 0 ? "row3" : "row4";
      const need = rowKind === "row3" ? 3 : 4;

      // 残りが足りない場合：残り全部を1/4で出して終了
      if (remaining < need) {
        for (let i = 0; i < remaining; i++) {
          const w = latest[cursor++];
          out.push(
            <WorksCard
              key={`work-${w.id}`}
              work={w}
              isWide={false}
              widthClass="pre:w-[calc(1/4*100%)]"
              className="pre:mb-5"
            />
          );
        }

        // ✅ 余り行も「1行」扱い（illust挿入判定に必要）
        const afterRowIndex = rowIndex;

        // ✅ 3行に1回 or 2行しか作れない場合の救済で1回
        const shouldInsertIllust =
          ((afterRowIndex + 1) % 3 === 0) ||
          (!hasInsertedEarlyIllust && latest.length >= 5 && afterRowIndex === 1);

        if (shouldInsertIllust) {
          pushIllust(afterRowIndex);
          if (afterRowIndex === 1) hasInsertedEarlyIllust = true;
        }

        break;
      }

      if (rowKind === "row3") {
        const wideIndex = wideToggle === 0 ? 0 : 1;

        for (let i = 0; i < 3; i++) {
          const w = latest[cursor++];
          const isWide = i === wideIndex;

          out.push(
            <WorksCard
              key={`work-${w.id}`}
              work={w}
              isWide={isWide}
              widthClass={isWide ? "pre:w-[calc(2/4*100%)]" : "pre:w-[calc(1/4*100%)]"}
              className="pre:mb-5"
            />
          );
        }

        wideToggle = 1 - wideToggle;
      } else {
        for (let i = 0; i < 4; i++) {
          const w = latest[cursor++];
          out.push(
            <WorksCard
              key={`work-${w.id}`}
              work={w}
              isWide={false}
              widthClass="pre:w-[calc(1/4*100%)]"
              className="pre:mb-5"
            />
          );
        }
      }

      // ✅ 3行に1回
      const shouldInsertNormal = (rowIndex + 1) % 3 === 0;

      // ✅ 作品が少なくて2行しか作れないカテゴリでも、2行目の後に1回だけ救済
      const shouldInsertEarly =
        !hasInsertedEarlyIllust && latest.length >= 5 && rowIndex === 1;

      if (shouldInsertNormal || shouldInsertEarly) {
        pushIllust(rowIndex);
        if (shouldInsertEarly) hasInsertedEarlyIllust = true;
      }

      rowIndex++;
    }

    return out;
  }, [works, layoutSeed]);

  return (
    <>
      <WorksCategoryNav
        categories={categories}
        activeSlug={activeSlug}
        onChange={onChangeCategory}
      />

      <section
        className={[
          "pre:flex pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px] pre:sm:sp-w-[360] pre:sm:sp-mb-[110]",
          isAnimating ? "works-list is-changing" : "works-list",
        ].join(" ")}
      >
        {rendered}
      </section>
    </>
  );
}
