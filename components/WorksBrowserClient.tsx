"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Work, WorkTerm } from "@/lib/wp";
import WorksCard from "@/components/WorksCard";
import WorksCategoryNav from "@/components/WorksCategoryNav";

const SWAP_OUT_MS = 350;

// ------------------------------
// ratio ↔ pattern (absolute rule)
// ------------------------------
export type RatioKey = "1/1" | "3/4" | "4/3";
export type Pattern = 1 | 2 | 3;

const RATIO_TO_PATTERN: Record<RatioKey, Pattern> = {
  "1/1": 1,
  "3/4": 2,
  "4/3": 3,
};

const RATIOS: readonly RatioKey[] = ["1/1", "3/4", "4/3"] as const;

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// workId と layoutSeed から ratio を安定決定（同一アクセス中は固定）
function pickRatioKey(layoutSeed: number, workId: number, isWide: boolean): RatioKey {
  // ※isWide でも ratio を固定にしない（要件）
  const s = (layoutSeed ^ Math.imul((workId >>> 0) + (isWide ? 101 : 0), 2654435761)) >>> 0;
  const r = mulberry32(s)();
  return RATIOS[Math.floor(r * RATIOS.length)];
}

// illust用（既存のまま）
type IllustPattern = 1 | 2 | 3;
const ILLUST_RATIO_MAP: Record<IllustPattern, string> = {
  1: "1 / 1",
  2: "3 / 4",
  3: "4 / 3",
};

type Props = {
  initialWorks?: Work[];
  categories: WorkTerm[];
  initialActiveSlug?: string | null;
};

export default function WorksBrowserClient({
  initialWorks = [],
  categories,
  initialActiveSlug = null,
}: Props) {
  const [works, setWorks] = useState<Work[]>(Array.isArray(initialWorks) ? initialWorks : []);
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
    const latest = safeWorks.slice(0, 12);

    const out: JSX.Element[] = [];

    const pushIllust = (rowIndex: number) => {
      const r = mulberry32((layoutSeed + rowIndex * 997) >>> 0)();
      const pattern = (Math.floor(r * 3) + 1) as IllustPattern;

      out.push(
        <div
          key={`illust-row-${rowIndex}-${out.length}`}
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

    let slotCount = 0;
    const ILLUST_EVERY_SLOTS = 8;

    let cursor = 0;
    let rowIndex = 0;

    let wideToggle = (layoutSeed & 1) === 0 ? 0 : 1;

    while (cursor < latest.length) {
      const remaining = latest.length - cursor;
      const rowKind = rowIndex % 2 === 0 ? "row3" : "row4";
      const need = rowKind === "row3" ? 3 : 4;

      if (remaining < need) {
        for (let i = 0; i < remaining; i++) {
          const w = latest[cursor++];
          const isWide = false;
          const idNum = Number(w?.id ?? cursor);
          const ratioKey = pickRatioKey(layoutSeed, idNum, isWide);
          const requiredPattern = RATIO_TO_PATTERN[ratioKey];

          out.push(
            <WorksCard
              key={`work-${w.id}`}
              work={w}
              isWide={isWide}
              widthClass="pre:w-[calc(1/4*100%)]"
              className="pre:mb-5"
              ratioKey={ratioKey}
              requiredPattern={requiredPattern}
            />
          );
        }

        slotCount += remaining;
        if (slotCount >= ILLUST_EVERY_SLOTS) {
          pushIllust(rowIndex);
          slotCount = 0;
        }
        break;
      }

      if (rowKind === "row3") {
        const wideIndex = wideToggle === 0 ? 0 : 1;

        for (let i = 0; i < 3; i++) {
          const w = latest[cursor++];
          const isWide = i === wideIndex;

          const idNum = Number(w?.id ?? cursor);
          const ratioKey = pickRatioKey(layoutSeed, idNum, isWide);
          const requiredPattern = RATIO_TO_PATTERN[ratioKey];

          out.push(
            <WorksCard
              key={`work-${w.id}`}
              work={w}
              isWide={isWide}
              widthClass={isWide ? "pre:w-[calc(2/4*100%)]" : "pre:w-[calc(1/4*100%)]"}
              className="pre:mb-5"
              ratioKey={ratioKey}
              requiredPattern={requiredPattern}
            />
          );
        }

        wideToggle = 1 - wideToggle;
        slotCount += 4;
      } else {
        for (let i = 0; i < 4; i++) {
          const w = latest[cursor++];

          const isWide = false;
          const idNum = Number(w?.id ?? cursor);
          const ratioKey = pickRatioKey(layoutSeed, idNum, isWide);
          const requiredPattern = RATIO_TO_PATTERN[ratioKey];

          out.push(
            <WorksCard
              key={`work-${w.id}`}
              work={w}
              isWide={isWide}
              widthClass="pre:w-[calc(1/4*100%)]"
              className="pre:mb-5"
              ratioKey={ratioKey}
              requiredPattern={requiredPattern}
            />
          );
        }

        slotCount += 4;
      }

      if (slotCount >= ILLUST_EVERY_SLOTS) {
        pushIllust(rowIndex);
        slotCount = 0;
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
