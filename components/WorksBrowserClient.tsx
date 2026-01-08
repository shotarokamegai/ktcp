"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { Work, WorkTerm } from "@/lib/wp";
import WorksCard from "@/components/WorksCard";
import WorksCategoryNav from "@/components/WorksCategoryNav";

const SWAP_OUT_MS = 350;
const APPLY_SHOWN_AFTER_MS = 1;

const PER_PAGE = 12; // ★ 12件ずつ

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

// ★ row3(=一列3個) は縦長NG → 3/4 を除外
const RATIOS_ROW3: readonly RatioKey[] = ["1/1", "4/3"] as const;
// ★ row4(=一列4個) は従来通り
const RATIOS_ROW4: readonly RatioKey[] = ["1/1", "3/4", "4/3"] as const;

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

// ★ 候補配列を受け取って ratioKey を決める（row3 / row4 の制御に使う）
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
  const [works, setWorks] = useState<Work[]>(Array.isArray(initialWorks) ? initialWorks : []);
  const [activeSlug, setActiveSlug] = useState<string | null>(initialActiveSlug);

  const [isAnimating, setIsAnimating] = useState(false);

  // ★ infinite scroll states
  const [page, setPage] = useState(1); // initialWorks が 1ページ目相当
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  // ★ API fetch helper（page 指定で取る）
  const fetchPage = useCallback(
    async (slug: string | null, nextPage: number, signal: AbortSignal) => {
      const params = new URLSearchParams();
      if (slug) params.set("category", slug);
      params.set("page", String(nextPage));
      params.set("perPage", String(PER_PAGE));

      const res = await fetch(`/api/works?${params.toString()}`, { signal });
      if (!res.ok) throw new Error("fetch failed");
      const json = (await res.json()) as { works?: Work[] };

      const list = Array.isArray(json.works) ? json.works : [];
      return list;
    },
    []
  );

  // ★ カテゴリ変更：1ページ目を読み直し & 状態リセット
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

    // reset infinite states
    setPage(1);
    setHasMore(true);

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      // まず 1ページ目を取得
      const first = await fetchPage(slug, 1, ac.signal);

      // 12件未満なら次がない扱い
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

  const inFlightRef = useRef(false);
  const idsRef = useRef<Set<string>>(new Set());

  // works が更新されたら idsRef も同期（初期Works用）
  useEffect(() => {
    idsRef.current = new Set(works.map((w) => String(w.id)));
  }, [works]);

  const loadMore = useCallback(async () => {
    if (isAnimating) return;
    if (!hasMore) return;
    if (inFlightRef.current) return; // ★ 即時ロック（stateより強い）

    inFlightRef.current = true;
    setIsLoadingMore(true);

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const nextPage = page + 1;

    try {
      const more = await fetchPage(activeSlug, nextPage, ac.signal);

      // ★ 0件 → 終端
      if (!more || more.length === 0) {
        setHasMore(false);
        return;
      }

      // ★ “追加が1件も増えない” → APIが同じ12件返してる等。ここで終端にする
      const newOnes = more.filter((w) => !idsRef.current.has(String(w.id)));
      if (newOnes.length === 0) {
        setHasMore(false);
        return;
      }

      // ★ 追加分だけ append
      setWorks((prev) => [...prev, ...newOnes]);

      // idsRef 更新
      newOnes.forEach((w) => idsRef.current.add(String(w.id)));

      setPage(nextPage);

      // “ページが満杯じゃない”なら次は無い
      setHasMore(more.length >= PER_PAGE);

      applyShown();
    } catch (e: any) {
      if (e?.name !== "AbortError") console.error(e);
    } finally {
      setIsLoadingMore(false);
      inFlightRef.current = false; // ★ ロック解除
    }
  }, [activeSlug, fetchPage, hasMore, isAnimating, page]);

  // ★ sentinel が見えたら追加ロード
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        loadMore();
      },
      {
        root: null,
        rootMargin: "600px 0px", // ちょい手前で先読み
        threshold: 0,
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  const rendered = useMemo(() => {
    // ★ state の works 全部を描画
    const latest = works;
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
          style={{ aspectRatio: "4 / 3" }}
        >
          <img
            src={src}
            alt=""
            className="pre:w-[90%] pre:h-full pre:object-contain"
            loading="lazy"
          />
        </div>
      </div>
    );

    const EmptyCell = (key: string) => (
      <div key={key} className="pre:w-[calc(1/4*100%)] pre:mb-5" aria-hidden />
    );

    const ILLUST_EVERY_SLOTS = 8;
    const ILLUST_COL_IN_ROW4 = 1;

    let cursor = 0;
    let rowIndex = 0;
    let wideToggle = (layoutSeed & 1) === 0 ? 0 : 1;

    let slotCount = 0;
    let needIllust = false;

    while (cursor < latest.length) {
      const remaining = latest.length - cursor;
      const isRow3 = rowIndex % 2 === 0;

      // -----------------------
      // Row3: 3 items
      // -----------------------
      if (isRow3) {
        const take = Math.min(3, remaining);
        const wideIndex = wideToggle === 0 ? 0 : 1;

        for (let i = 0; i < take; i++) {
          const w = latest[cursor++];
          const isWide = take === 3 && i === wideIndex;

          // ★ row3 は 1/1 or 4/3 のみ（3/4 を排除）
          const ratioKey = pickRatioKeyFrom(
            RATIOS_ROW3,
            layoutSeed,
            Number(w.id),
            isWide
          );

          out.push(
            <WorksCard
              key={`work-${w.id}`}
              work={w}
              isWide={isWide}
              widthClass={
                isWide ? "pre:w-[calc(2/4*100%)]" : "pre:w-[calc(1/4*100%)]"
              }
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

      // -----------------------
      // Row4: 4 items (+ optional illust)
      // -----------------------
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

          // ★ row4 は従来通り全部OK
          const ratioKey = pickRatioKeyFrom(
            RATIOS_ROW4,
            layoutSeed,
            Number(w.id),
            false
          );

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
      <WorksCategoryNav
        categories={categories}
        activeSlug={activeSlug}
        onChange={onChangeCategory}
      />

      <section
        className={[
          "pre:flex pre:flex-wrap pre:items-start pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px]",
          "pre:sm:sp-w-[360] pre:sm:sp-mb-[110]",
          isAnimating ? "works-list is-changing" : "works-list",
        ].join(" ")}
      >
        {rendered}

        {/* ★ infinite scroll sentinel */}
        <div ref={sentinelRef} className="pre:w-full pre:h-[1px]" aria-hidden />
      </section>
    </>
  );
}
