// WorksBrowserClient.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import type { Work, WorkTerm } from "@/lib/wp";
import WorksCard from "@/components/WorksCard";
import WorksCategoryNav from "@/components/WorksCategoryNav";

const SWAP_OUT_MS = 350; // slide-out の duration に合わせる
const REFRESH_EVENT = "slidein:refresh";

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

  // ★ アクセス（ページロード）ごとに1回だけ生成される seed
  //   ※同一アクセス中は固定されるので、チラつき防止にもなる
  const [visitSeed] = useState(() => {
    try {
      // randomUUID があれば最優先
      if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
      }
    } catch (_) {}
    // フォールバック
    return `${Date.now()}-${Math.random()}`;
  });
  console.log("visitSeed:", visitSeed);

  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLElement | null>(null);

  const setUrlOnly = (slug: string | null) => {
    const next = slug ? `/works?category=${encodeURIComponent(slug)}` : `/works`;
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

    if (!res.ok) {
      throw new Error(
        `API error: ${res.status} ${res.statusText}\n` +
          `URL: /api/works${qs}\n` +
          `Body(head): ${text.slice(0, 200)}`
      );
    }
    if (!contentType.includes("application/json")) {
      throw new Error(
        `Expected JSON but got "${contentType}"\n` +
          `URL: /api/works${qs}\n` +
          `Body(head): ${text.slice(0, 200)}`
      );
    }

    const json = JSON.parse(text);
    if (!json.ok) throw new Error(json.message || "fetch failed");
    return json.works as Work[];
  };

  // ▼ 現在表示中を OUT（is-shown を外す）
  const playSwapOut = () => {
    const root = listRef.current ?? document;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".slide-in"));
    els.forEach((el) => {
      el.classList.remove("is-shown");
      el.classList.add("is-hidden"); // is-hidden のCSSが無いならこの行は消してOK
      el.style.transitionDelay = "0ms";
    });
  };

  const onChangeCategory = async (slug: string | null) => {
    if (slug === activeSlug) return;

    setIsAnimating(true);

    // ① いま表示中をOUT
    playSwapOut();

    try {
      // ② 次を取得
      const nextWorks = await fetchWorksOnly(slug);

      // ③ OUT 完了を待ってから差し替え
      setTimeout(() => {
        setActiveSlug(slug);
        setUrlOnly(slug);
        setWorks(nextWorks);

        // ④ DOM反映後に slide-in 再実行
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event(REFRESH_EVENT));
          setIsAnimating(false);
        });
      }, SWAP_OUT_MS);
    } catch (e) {
      // 失敗したら見た目だけ戻す
      requestAnimationFrame(() => {
        const root = listRef.current ?? document;
        const els = Array.from(root.querySelectorAll<HTMLElement>(".slide-in"));
        els.forEach((el) => {
          el.classList.remove("is-hidden");
          el.classList.add("is-shown");
          el.style.transitionDelay = "0ms";
        });
        setIsAnimating(false);
      });
      throw e;
    }
  };

  // ▼ ここで「work + illust差し込み」を復活させる
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
            className="pre:w-1/4 pre:mb-5 pre:px-[calc(7.5/1401*100%)] pre:sm:w-full slide-in slide-out pre:flex pre:items-center pre:justify-center"
          >
            <img
              src="/illust/about.png"
              alt=""
              className="pre:w-[calc(304/375*100%)]"
            />
          </div>
        );
      }

      const w = item.work!;
      const row = Math.floor(workIndex / 3);
      const indexInRow = workIndex % 3;

      const bigIndexForRow =
        row % 2 === 0 ? firstRowBigIndex : 1 - firstRowBigIndex;
      const isWide = indexInRow === bigIndexForRow;

      workIndex++;

      const widthClass = isWide
        ? "pre:w-[calc(2/4*100%)]"
        : "pre:w-[calc(1/4*100%)]";

      return (
        <WorksCard
          key={item.key}
          work={w}
          widthClass={widthClass}
          className="pre:mb-5"
          // ★ アクセスごとに変わる seed を混ぜる（同一アクセス中は固定）
          seed={`${visitSeed}-${w.id}`}
        />
      );
    });
  }, [works, visitSeed]);

  return (
    <>
      <WorksCategoryNav
        categories={categories}
        activeSlug={activeSlug}
        onChange={onChangeCategory}
      />

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
