"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Work, WorkTerm } from "@/lib/wp";
import WorksCard from "@/components/WorksCard";

const SWAP_OUT_MS = 350;

type Props = {
  initialWorks?: Work[];
  categories: WorkTerm[]; // （layout側で使う想定。ここでは未使用でもOK）
  initialActiveSlug?: string | null;
};

type RatioKey = "1/1" | "3/4" | "4/3";
type Pattern = 1 | 2 | 3;

const RATIO_VALUE: Record<RatioKey, string> = {
  "1/1": "1 / 1",
  "3/4": "3 / 4",
  "4/3": "4 / 3",
};

const RATIO_TO_PATTERN: Record<RatioKey, Pattern> = {
  "1/1": 1,
  "3/4": 2,
  "4/3": 3,
};

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 安定seed（0→初回再描画を避ける）
function hashU32(input: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
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

  // OUT演出用（CSSで .works-list.is-changing を使う想定）
  const [isAnimating, setIsAnimating] = useState(false);

  // ★ 引き継ぎworks（同一id）があっても「チラ見え」させないためのキー
  //   スワップの瞬間に container を remount してDOM再利用を完全に断つ
  const [listKey, setListKey] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  // URLクエリの書き換え（SPA運用の場合だけ使う。link運用なら呼ばなくてOK）
  const setUrlOnly = (slug: string | null) => {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("category", slug);
    else url.searchParams.delete("category");
    window.history.replaceState({}, "", url.toString());
  };

  // ✅ クリック直後に次の一覧がチラッと見える問題を構造で潰す
  // - 先にOUTを始める（isAnimating=true）
  // - fetchは走らせる
  // - SWAP_OUT_MS 待ってから setWorks（この瞬間に container を remount）
  const onChangeCategory = async (slug: string | null) => {
    if (slug === activeSlug) return;

    setIsAnimating(true);
    setActiveSlug(slug);
    setUrlOnly(slug);

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const fetchPromise = (async () => {
      const params = new URLSearchParams();
      if (slug) params.set("category", slug);

      const res = await fetch(`/api/works?${params.toString()}`, { signal: ac.signal });
      if (!res.ok) throw new Error("fetch failed");
      const json = (await res.json()) as { works?: Work[] };
      return Array.isArray(json.works) ? json.works : [];
    })();

    try {
      // OUTが見える最低時間を保証
      await new Promise((r) => setTimeout(r, SWAP_OUT_MS));

      const nextWorks = await fetchPromise;

      // ★ ここで remount（同一work idがいてもDOMを引き継がない）
      setListKey((k) => k + 1);
      setWorks(nextWorks);

      // INは SlideInHydrate / SlideInOnLoad が拾う想定
      window.dispatchEvent(new Event("slidein:refresh"));
    } catch (e: any) {
      if (e?.name !== "AbortError") console.error(e);
    } finally {
      // OUTクラス解除は次フレームでOK（スパッと切れにくい）
      requestAnimationFrame(() => setIsAnimating(false));
    }
  };

  // このコンポーネント内で nav を出す場合だけ使う（layout常駐navなら不要）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _navForSpaOnly = { categories, activeSlug, onChangeCategory };

  // レイアウトseed（worksの並びが変わる時だけ変わる）
  const layoutSeed = useMemo(() => {
    const ids = (Array.isArray(works) ? works : []).slice(0, 12).map((w) => String((w as any)?.id ?? "")).join(",");
    return hashU32(`${activeSlug ?? "ALL"}|${ids}`);
  }, [works, activeSlug]);

  const rendered = useMemo(() => {
    const safeWorks = Array.isArray(works) ? works : [];

    // ✅ 12件まで（イラストが入りやすい）
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

    // ---- 2行に1回（= 8枠ごと） ----
    let slotCount = 0;
    const ILLUST_EVERY_SLOTS = 8;

    let cursor = 0;
    let rowIndex = 0;

    // row3 wide位置を左右交互
    let wideToggle = (layoutSeed & 1) === 0 ? 0 : 1;

    const pickRatioKey = (w: any, rowIdx: number, posInRow: number) => {
      // ✅ isWideに依存しない（絶対ルール：ratioが決まったらpattern固定）
      const seed = hashU32(`${layoutSeed}|${w?.id ?? 0}|${rowIdx}|${posInRow}`);
      const r = mulberry32(seed)();
      return (["1/1", "3/4", "4/3"] as const)[Math.floor(r * 3)] as RatioKey;
    };

    while (cursor < latest.length) {
      const remaining = latest.length - cursor;

      const rowKind = rowIndex % 2 === 0 ? "row3" : "row4";
      const need = rowKind === "row3" ? 3 : 4;

      if (remaining < need) {
        for (let i = 0; i < remaining; i++) {
          const w = latest[cursor++];
          const ratioKey = pickRatioKey(w, rowIndex, i);
          const requiredPattern = RATIO_TO_PATTERN[ratioKey];

          out.push(
            <WorksCard
              key={`work-${(w as any).id}`}
              work={w}
              isWide={false}
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

          const ratioKey = pickRatioKey(w, rowIndex, i);
          const requiredPattern = RATIO_TO_PATTERN[ratioKey];

          out.push(
            <WorksCard
              key={`work-${(w as any).id}`}
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
          const ratioKey = pickRatioKey(w, rowIndex, i);
          const requiredPattern = RATIO_TO_PATTERN[ratioKey];

          out.push(
            <WorksCard
              key={`work-${(w as any).id}`}
              work={w}
              isWide={false}
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
    <section
      key={listKey}
      className={[
        "pre:flex pre:flex-wrap pre:w-[calc(100%-40px)] pre:mx-auto pre:mb-[180px] pre:sm:sp-w-[360] pre:sm:sp-mb-[110]",
        "works-list",
        isAnimating ? "is-changing" : "",
      ].filter(Boolean).join(" ")}
      // ✅ OUT対象から除外したいなら、親にこれを付ける（SlideInOnLoad側で filter する）
      data-no-out
    >
      {rendered}
    </section>
  );
}
