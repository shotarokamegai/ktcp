"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { Work, WorkTerm } from "@/lib/wp";
import WorksCard from "@/components/WorksCard";
import WorksCategoryNav from "@/components/WorksCategoryNav";

const SWAP_OUT_MS = 350;
const APPLY_SHOWN_AFTER_MS = 1;
const PER_PAGE = 12;

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

const RATIOS_ROW3: readonly RatioKey[] = ["1/1", "4/3"] as const;
const RATIOS_ROW4: readonly RatioKey[] = ["1/1", "3/4", "4/3"] as const;

// ------------------------------
// illust assets
// ------------------------------
const ILLUST_IMAGES = [
  "/top/about.png",
  "/top/careers.png",
  "/top/complete.png",
  "/top/contact.png",
  "/top/engineer.png",
  "/top/form.png",
  "/top/web-director.png",
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

function pickRatioKeyFrom(
  ratios: readonly RatioKey[],
  layoutSeed: number,
  workId: number,
  isWide: boolean
): RatioKey {
  const s =
    (layoutSeed ^ Math.imul((workId >>> 0) + (isWide ? 101 : 0), 2654435761)) >>> 0;
  const r = mulberry32(s)();
  return ratios[Math.floor(r * ratios.length)];
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
  const [works, setWorks] = useState<Work[]>(
    Array.isArray(initialWorks) ? initialWorks : []
  );
  const [activeSlug, setActiveSlug] = useState<string | null>(initialActiveSlug);
  const [isAnimating, setIsAnimating] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // layoutSeed
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
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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

  // ------------------------------
  // API fetch
  // ------------------------------
  const fetchPage = useCallback(
    async (slug: string | null, nextPage: number, signal: AbortSignal) => {
      const params = new URLSearchParams();
      if (slug) params.set("category", slug);
      params.set("page", String(nextPage));
      params.set("perPage", String(PER_PAGE));

      const res = await fetch(`/api/works?${params.toString()}`, { signal });
      if (!res.ok) throw new Error("fetch failed");
      const json = (await res.json()) as { works?: Work[] };
      return Array.isArray(json.works) ? json.works : [];
    },
    []
  );

  // ------------------------------
  // category change
  // ------------------------------
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

    setPage(1);
    setHasMore(true);

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const first = await fetchPage(slug, 1, ac.signal);
      const nextHasMore = first.length >= PER_PAGE;

      swapTimerRef.current = window.setTimeout(() => {
        if (swapId !== swapIdRef.current) return;

        setWorks(first);
        setHasMore(nextHasMore);
        setIsAnimating(false);
        applyShown();
        swapTimerRef.current = null;
      }, SWAP_OUT_MS);
    } catch (e: any) {
      if (e?.name !== "AbortError") console.error(e);
      setIsAnimating(false);
    }
  };

  // ------------------------------
  // infinite load
  // ------------------------------
  const inFlightRef = useRef(false);
  const idsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    idsRef.current = new Set(works.map((w) => String(w.id)));
  }, [works]);

  const loadMore = useCallback(async () => {
    if (isAnimating || !hasMore || inFlightRef.current) return;

    inFlightRef.current = true;
    setIsLoadingMore(true);

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const nextPage = page + 1;

    try {
      const more = await fetchPage(activeSlug, nextPage, ac.signal);
      if (!more || more.length === 0) {
        setHasMore(false);
        return;
      }

      const newOnes = more.filter((w) => !idsRef.current.has(String(w.id)));
      if (newOnes.length === 0) {
        setHasMore(false);
        return;
      }

      setWorks((prev) => [...prev, ...newOnes]);
      newOnes.forEach((w) => idsRef.current.add(String(w.id)));
      setPage(nextPage);
      setHasMore(more.length >= PER_PAGE);
      applyShown();
    } catch (e: any) {
      if (e?.name !== "AbortError") console.error(e);
    } finally {
      setIsLoadingMore(false);
      inFlightRef.current = false;
    }
  }, [activeSlug, fetchPage, hasMore, isAnimating, page]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "600px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  // ------------------------------
  // rendered (GRID)
  // ------------------------------
  const rendered = useMemo(() => {
    const out: JSX.Element[] = [];
    let cursor = 0;
    let rowIndex = 0;
    let wideToggle = (layoutSeed & 1) === 0 ? 0 : 1;

    const ILLUST_EVERY_SLOTS = 16;
    const ILLUST_COL_IN_ROW4 = 1;

    let slotCount = 0;
    let needIllust = false;

    // ★ row4カウント（4列ブロック何回目か）
    let row4Count = 0;

    // ★ 直前のrow4がillust行だったか
    let prevRow4HadIllust = false;

    const IllustCell = (key: string, src: string) => (
      <div
        key={key}
        className="pre:col-span-1 pre:sm:col-span-2 slide-in pre:sm:mt-[calc(40/375*-100vw)]"
        style={{ aspectRatio: "4 / 3" }}
      >
        <img src={src} className="pre:w-full pre:h-full pre:object-cover" />
      </div>
    );

    while (cursor < works.length) {
      const remaining = works.length - cursor;
      const isRow3 = rowIndex % 2 === 0;

      // -------- Row3 (3 works)
      if (isRow3) {
        const take = Math.min(3, remaining);
        const wideIndex = wideToggle === 0 ? 0 : 1;

        for (let i = 0; i < take; i++) {
          const w = works[cursor++];
          const isWide = take === 3 && i === wideIndex;

          const ratioKey = pickRatioKeyFrom(
            RATIOS_ROW3,
            layoutSeed,
            Number(w.id),
            isWide
          );

          out.push(
            <WorksCard
              key={w.id}
              work={w}
              isWide={isWide}
              widthClass={[
                "pre:w-full",
                isWide ? "pre:col-span-2" : "pre:col-span-1",
                "pre:sm:col-span-1",
              ].join(" ")}
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

      // -------- Row4 (4 works + illust)
      row4Count++;

      const insertIllust = needIllust || slotCount + 4 >= ILLUST_EVERY_SLOTS;
      const illustSrc = pickIllustSrc(layoutSeed, rowIndex);

      // ★ 「作品full(100%)」をたまに差し込む条件
      // - row4が4回に1回くらい
      // - illust行ではない
      // - illust直後ではない
      // - illustが近そうなタイミング（slotCount溜まり気味）は避ける（保守的）
      
      const wantFullWork =
        row4Count % 4 === 0 &&
        !insertIllust &&
        !prevRow4HadIllust &&
        slotCount <= 12 &&
        cursor < works.length;
          
      if (wantFullWork) {
        const w = works[cursor++];
      
        const ratioKey = pickRatioKeyFrom(
          RATIOS_ROW4,
          layoutSeed,
          Number(w.id),
          false
        );
      
        out.push(
          <WorksCard
            key={`work-full-${w.id}`}
            work={w}
            isWide={false}
            widthClass="pre:col-span-1 pre:sm:col-span-2 pre:sm:!w-full pre:sm:!sp-w-[340] pre:sm:!sp-mx-0"
            ratioKey={ratioKey}
            requiredPattern={RATIO_TO_PATTERN[ratioKey]}
          />
        );
      }

      // 残りを通常row4として描画
      const remainingAfter = works.length - cursor;
      const worksToTake = Math.min(insertIllust ? 3 : 4, remainingAfter);
      let taken = 0;

      for (let i = 0; i < 4; i++) {
        if (insertIllust && i === ILLUST_COL_IN_ROW4) {
          out.push(IllustCell(`illust-${rowIndex}-${i}`, illustSrc));
          continue;
        }

        if (taken < worksToTake && cursor < works.length) {
          const w = works[cursor++];
          taken++;

          const ratioKey = pickRatioKeyFrom(
            RATIOS_ROW4,
            layoutSeed,
            Number(w.id),
            false
          );

          out.push(
            <WorksCard
              key={w.id}
              work={w}
              isWide={false}
              widthClass="pre:w-full pre:col-span-1 pre:sm:col-span-1"
              ratioKey={ratioKey}
              requiredPattern={RATIO_TO_PATTERN[ratioKey]}
            />
          );
        }
      }

      // ★ slotCount / illustフラグ更新（row4は+4扱いを維持）
      slotCount += 4;
      if (insertIllust) {
        needIllust = false;
        slotCount = 0;
      }

      // ★ 次のrow4用に状態保持
      prevRow4HadIllust = insertIllust;

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
          "works-list slide-out",
          "pre:grid pre:grid-cols-4 pre:items-start",
          "pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px]",
          "pre:gap-x-[calc(15/1401*100%)] pre:gap-y-[70px]",
          "pre:sm:grid-cols-2 pre:sm:sp-gap-x-[20] pre:sm:sp-gap-y-[80]",
          "pre:sm:sp-w-[340] pre:sm:sp-mb-[110]",
          isAnimating ? "is-changing is-hidden" : "",
        ].join(" ")}
      >
        {rendered}

        <div
          ref={sentinelRef}
          className="pre:col-span-4 pre:sm:col-span-2 pre:h-px"
          aria-hidden
        />
      </section>
    </>
  );
}
