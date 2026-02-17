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

  // ✅ sticky nav ref（top値取得用）
  const stickyNavRef = useRef<HTMLElement | null>(null);
  // ✅ sticky開始地点アンカー（ここに戻す）
  const stickyAnchorRef = useRef<HTMLDivElement | null>(null);

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
  // ✅ scroll to "sticky attach point" (Lenis preferred)
  //    - 基準は anchor（stickyの直前）
  //    - 現在スクロール値は lenis.scroll を優先
  // ------------------------------
  const scrollToStickyTopReliable = useCallback((smooth = true) => {
    const anchor = stickyAnchorRef.current;
    const nav = stickyNavRef.current;
    if (!anchor || !nav) return;

    const lenis = (window as any).lenis as
      | undefined
      | { scrollTo: (to: number, opts?: any) => void; scroll?: number };

    const currentScroll =
      typeof lenis?.scroll === "number" ? lenis.scroll : window.scrollY;

    const topStr = getComputedStyle(nav).top; // "86px" / "49px"
    const parsed = Number.parseFloat(topStr || "");
    const topOffset = Number.isFinite(parsed) ? parsed : 0;

    // ✅ anchor の位置（viewport基準）→ 現在スクロール値に足して document座標へ
    const y = Math.max(0, currentScroll + anchor.getBoundingClientRect().top - topOffset);

    // 即時でまず合わせる（安定化）
    if (lenis?.scrollTo) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);

    if (smooth) {
      requestAnimationFrame(() => {
        const lenis2 = (window as any).lenis as typeof lenis | undefined;
        if (lenis2?.scrollTo) lenis2.scrollTo(y, { duration: 0.6, force: true });
        else window.scrollTo({ top: y, behavior: "smooth" });
      });
    }
  }, []);

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

    // ✅ カテゴリ切替時：stickyが吸着する地点へ戻す（下にいても必ず戻る）
    scrollToStickyTopReliable(true);

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

        // ✅ DOM差し替え後の保険
        scrollToStickyTopReliable(false);

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
  // rendered (PC + SP separate)
  // ------------------------------
  const { renderedPC, renderedSP } = useMemo(() => {
    // （ここから下はあなたの既存のレンダリングロジックそのまま）
    const outPC: JSX.Element[] = [];
    let cursor = 0;
    let rowIndex = 0;
    let wideToggle = (layoutSeed & 1) === 0 ? 0 : 1;

    const ILLUST_EVERY_SLOTS = 16;
    const ILLUST_COL_IN_ROW4 = 1;

    let slotCount = 0;
    let needIllust = false;

    let row4Count = 0;
    let prevRow4HadIllust = false;

    const IllustCellPC = (key: string, src: string) => (
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

          outPC.push(
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

      row4Count++;

      const insertIllust = needIllust || slotCount + 4 >= ILLUST_EVERY_SLOTS;
      const illustSrc = pickIllustSrc(layoutSeed, rowIndex);

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

        outPC.push(
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

      const remainingAfter = works.length - cursor;
      const worksToTake = Math.min(insertIllust ? 3 : 4, remainingAfter);
      let taken = 0;

      for (let i = 0; i < 4; i++) {
        if (insertIllust && i === ILLUST_COL_IN_ROW4) {
          outPC.push(IllustCellPC(`illust-${rowIndex}-${i}`, illustSrc));
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

          outPC.push(
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

      slotCount += 4;
      if (insertIllust) {
        needIllust = false;
        slotCount = 0;
      }
      prevRow4HadIllust = insertIllust;
      rowIndex++;
    }

    const outSP: JSX.Element[] = [];
    let idx = 0;

    let col = 0;
    let workCount = 0;
    let illustIndex = 0;

    const ILLUST_EVERY_WORKS = 9;
    const FULL_WORK_EVERY_WORKS = 7;

    let nextIllustAt = ILLUST_EVERY_WORKS;
    let nextFullAt = FULL_WORK_EVERY_WORKS;

    const IllustCellSP = (key: string, src: string) => (
      <div
        key={key}
        className="pre:col-span-2 slide-in pre:sm:mt-[calc(40/375*-100vw)]"
        style={{ aspectRatio: "4 / 3" }}
      >
        <img src={src} className="pre:w-full pre:h-full pre:object-cover" />
      </div>
    );

    const pushWorkSP = (w: Work, span2: boolean) => {
      const ratioKey = pickRatioKeyFrom(
        RATIOS_ROW4,
        layoutSeed,
        Number(w.id),
        false
      );

      outSP.push(
        <WorksCard
          key={`sp-${span2 ? "full" : "half"}-${w.id}`}
          work={w}
          isWide={false}
          widthClass={[
            "pre:w-full",
            span2 ? "pre:col-span-2" : "pre:col-span-1",
          ].join(" ")}
          ratioKey={ratioKey}
          requiredPattern={RATIO_TO_PATTERN[ratioKey]}
        />
      );

      if (span2) col = 0;
      else col = col === 0 ? 1 : 0;

      workCount++;
    };

    while (idx < works.length) {
      const atRowHead = col === 0;

      if (atRowHead && workCount >= nextIllustAt) {
        const src = pickIllustSrc(layoutSeed, illustIndex);
        outSP.push(IllustCellSP(`sp-illust-${illustIndex}`, src));
        illustIndex++;
        nextIllustAt += ILLUST_EVERY_WORKS;
        col = 0;
        continue;
      }

      if (atRowHead && workCount >= nextFullAt) {
        const w = works[idx++];
        pushWorkSP(w, true);
        nextFullAt += FULL_WORK_EVERY_WORKS;
        continue;
      }

      const remaining = works.length - idx;
      if (remaining === 1) {
        const w = works[idx++];
        pushWorkSP(w, true);
        break;
      }

      const w = works[idx++];
      pushWorkSP(w, false);
    }

    return { renderedPC: outPC, renderedSP: outSP };
  }, [works, layoutSeed]);

  return (
    <>
      <WorksCategoryNav
        ref={stickyNavRef}
        stickyAnchorRef={stickyAnchorRef}
        categories={categories}
        activeSlug={activeSlug}
        onChange={onChangeCategory}
      />

      {/* PC */}
      <section
        data-variant="pc"
        className={[
          "works-list slide-out",
          "pre:grid pre:grid-cols-4 pre:items-start",
          "pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px]",
          "pre:gap-x-[calc(15/1401*100%)] pre:gap-y-[70px]",
          "pre:sm:hidden",
          isAnimating ? "is-changing is-hidden" : "",
        ].join(" ")}
      >
        {renderedPC}
        <div ref={sentinelRef} className="pre:col-span-4 pre:h-px" aria-hidden />
      </section>

      {/* SP */}
      <section
        data-variant="sp"
        className={[
          "works-list slide-out pre:mx-auto",
          "pre:hidden pre:sm:grid pre:sm:grid-cols-2 pre:sm:items-start",
          "pre:sm:sp-w-[340] pre:sm:sp-mx-auto pre:sm:sp-mb-[110]",
          "pre:sm:sp-gap-x-[20] pre:sm:sp-gap-y-[80]",
          isAnimating ? "is-changing is-hidden" : "",
        ].join(" ")}
      >
        {renderedSP}
        <div ref={sentinelRef} className="pre:col-span-2 pre:h-px" aria-hidden />
      </section>
    </>
  );
}
