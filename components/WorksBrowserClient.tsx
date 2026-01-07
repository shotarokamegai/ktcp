"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Work, WorkTerm } from "@/lib/wp";
import WorksCard from "@/components/WorksCard";
import WorksCategoryNav from "@/components/WorksCategoryNav";

const SWAP_OUT_MS = 350;
const APPLY_SHOWN_AFTER_MS = 1;

// ------------------------------
// ratio ↔ pattern
// ------------------------------
export type RatioKey = "1/1" | "3/4" | "4/3";
export type Pattern = 1 | 2 | 3;

const RATIO_TO_PATTERN: Record<RatioKey, Pattern> = {
  "1/1": 1,
  "3/4": 2,
  "4/3": 3,
};

const RATIOS: readonly RatioKey[] = ["1/1", "3/4", "4/3"] as const;

// ------------------------------
// illust assets（7種）
// ------------------------------
const ILLUST_IMAGES = [
  "/illust/about.png",
  "/illust/careers.png",
  "/illust/complete.png",
  "/illust/contact.png",
  "/illust/engineer.png",
  "/illust/form.png",
  "/illust/web-director.png",
] as const;

// ------------------------------
// utils
// ------------------------------
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRatioKey(layoutSeed: number, workId: number, isWide: boolean): RatioKey {
  const s =
    (layoutSeed ^ Math.imul((workId >>> 0) + (isWide ? 101 : 0), 2654435761)) >>> 0;
  const r = mulberry32(s)();
  return RATIOS[Math.floor(r * RATIOS.length)];
}

function pickIllustSrc(layoutSeed: number, rowIndex: number) {
  const r = mulberry32((layoutSeed + rowIndex * 997) >>> 0)();
  return ILLUST_IMAGES[Math.floor(r * ILLUST_IMAGES.length)];
}

// ------------------------------
// Props
// ------------------------------
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

  // layoutSeed（1ロード中は固定）
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
  const swapIdRef = useRef(0);
  const swapTimerRef = useRef<number | null>(null);
  const pendingWorksRef = useRef<Work[] | null>(null);

  const applyShown = () => {
    window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>(".works-list .slide-in")
        .forEach((el) => el.classList.add("is-shown"));
    }, APPLY_SHOWN_AFTER_MS);
  };

  useEffect(() => {
    return () => {
      if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const setUrlOnly = (slug: string | null) => {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("category", slug);
    else url.searchParams.delete("category");
    window.history.replaceState({}, "", url.toString());
  };

  const onChangeCategory = async (slug: string | null) => {
    if (slug === activeSlug) return;

    if (swapTimerRef.current) {
      window.clearTimeout(swapTimerRef.current);
      swapTimerRef.current = null;
    }

    const swapId = ++swapIdRef.current;

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

      pendingWorksRef.current = Array.isArray(json.works) ? json.works : [];

      swapTimerRef.current = window.setTimeout(() => {
        if (swapId !== swapIdRef.current) return;

        setWorks(pendingWorksRef.current ?? []);
        pendingWorksRef.current = null;

        setIsAnimating(false);
        applyShown();
        swapTimerRef.current = null;
      }, SWAP_OUT_MS);
    } catch (e: any) {
      if (e?.name !== "AbortError") console.error(e);
      setIsAnimating(false);
    }
  };

  const rendered = useMemo(() => {
    const latest = works.slice(0, 12);
    const out: JSX.Element[] = [];

    const IllustCell = (key: string, src: string) => (
      <div
        key={key}
        className={[
          "pre:w-1/4 slide-in",
          "pre:mb-5 pre:px-[calc(7.5/1401*100%)] pre:sm:sp-w-[160] pre:sm:sp-mx-[10] pre:sm:sp-mb-[40] pre:sm:px-0",
          "pre:flex pre:items-start pre:justify-center",
        ].join(" ")}
      >
        <div
          className="pre:w-full pre:flex pre:items-center pre:justify-center"
          style={{ aspectRatio: "4 / 3" }} // ※ illust はあなたの以前の要件どおり 4/3 のまま
        >
          <img
            src={src}
            alt=""
            className="pre:w-full pre:h-full pre:object-contain"
            loading="lazy"
          />
        </div>
      </div>
    );

    const EmptyCell = (key: string) => (
      <div key={key} className="pre:w-[calc(1/4*100%)] pre:mb-5" aria-hidden />
    );

    const ILLUST_EVERY_SLOTS = 8;
    const ILLUST_COL_IN_ROW4 = 1; // row4 の 2番目（中央寄り）

    let cursor = 0;
    let rowIndex = 0;
    let wideToggle = (layoutSeed & 1) === 0 ? 0 : 1;

    let slotCount = 0;
    let needIllust = false;

    while (cursor < latest.length) {
      const remaining = latest.length - cursor;
      const isRow3 = rowIndex % 2 === 0;

      // ---------------- row3 ----------------
      if (isRow3) {
        const take = Math.min(3, remaining);
        const wideIndex = wideToggle === 0 ? 0 : 1;

        for (let i = 0; i < take; i++) {
          const w = latest[cursor++];
          const isWide = take === 3 && i === wideIndex;

          const ratioKey = pickRatioKey(layoutSeed, Number(w.id), isWide);

          out.push(
            <WorksCard
              key={`work-${w.id}`}
              work={w}
              isWide={isWide}
              widthClass={isWide ? "pre:w-[calc(2/4*100%)]" : "pre:w-[calc(1/4*100%)]"}
              className="pre:mb-5"
              ratioKey={ratioKey}
              requiredPattern={RATIO_TO_PATTERN[ratioKey]}
            />
          );
        }

        if (take === 3) {
          wideToggle = 1 - wideToggle;
          slotCount += 4;
          if (slotCount >= ILLUST_EVERY_SLOTS) needIllust = true;
        }

        rowIndex++;
        continue;
      }

      // ---------------- row4 ----------------
      const insertIllust = needIllust || slotCount + 4 >= ILLUST_EVERY_SLOTS;
      const illustSrc = pickIllustSrc(layoutSeed, rowIndex);

      const worksToTake = Math.min(insertIllust ? 3 : 4, remaining);
      let taken = 0;

      for (let i = 0; i < 4; i++) {
        if (insertIllust && i === ILLUST_COL_IN_ROW4) {
          out.push(IllustCell(`illust-${rowIndex}-${i}`, illustSrc));
          continue;
        }

        if (taken < worksToTake) {
          const w = latest[cursor++];
          taken++;

          const ratioKey = pickRatioKey(layoutSeed, Number(w.id), false);

          out.push(
            <WorksCard
              key={`work-${w.id}`}
              work={w}
              isWide={false}
              widthClass="pre:w-[calc(1/4*100%)]"
              className="pre:mb-5"
              ratioKey={ratioKey}
              requiredPattern={RATIO_TO_PATTERN[ratioKey]}
            />
          );
        } else {
          out.push(EmptyCell(`empty-${rowIndex}-${i}`));
        }
      }

      slotCount += 4;
      if (insertIllust) {
        needIllust = false;
        slotCount = 0;
      }

      rowIndex++;
    }

    return out;
  }, [works, layoutSeed]);

  return (
    <>
      <WorksCategoryNav categories={categories} activeSlug={activeSlug} onChange={onChangeCategory} />

      <section
        className={[
          "pre:flex pre:flex-wrap pre:items-start pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px]",
          "pre:sm:sp-w-[360] pre:sm:sp-mb-[110]",
          isAnimating ? "works-list is-changing" : "works-list",
        ].join(" ")}
      >
        {rendered}
      </section>
    </>
  );
}
