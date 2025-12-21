"use client";

import { useEffect, RefObject } from "react";

type Mode = "sp" | "pc";

type Options = {
  smWidth?: number;
  speedPxPerSec?: number; // 例: 800
  minDurationMs?: number; // 例: 180
  maxDurationMs?: number; // 例: 900
};

export function useAccordionController(
  rootRef: RefObject<HTMLElement>,
  options: Options = {}
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const smWidth = options.smWidth ?? 750;
    const speed = options.speedPxPerSec ?? 800;
    const minMs = options.minDurationMs ?? 180;
    const maxMs = options.maxDurationMs ?? 900;

    const calcDurationMs = (px: number) => {
      const ms = (px / speed) * 1000;
      return Math.max(minMs, Math.min(maxMs, ms));
    };

    const setHeightTransition = (inner: HTMLElement, durationMs: number) => {
      inner.style.transitionProperty = "height";
      inner.style.transitionTimingFunction = "cubic-bezier(0.4, 0, 0.2, 1)";
      inner.style.transitionDuration = `${durationMs}ms`;
    };

    const getMode = (): Mode => (window.innerWidth <= smWidth ? "sp" : "pc");

    const getTriggersById = (id: string) => {
      const sp = Array.from(
        root.querySelectorAll<HTMLElement>(
          `.js-sp-accordion[data-target="${id}"]`
        )
      );
      const pc = Array.from(
        root.querySelectorAll<HTMLElement>(
          `.js-pc-accordion[data-target="${id}"]`
        )
      );
      return { sp, pc, all: [...sp, ...pc] };
    };

    // ✅ splitting-hover を持つ trigger だけ、open 状態のとき stay を付与
    const toggleStayIfSplittingHover = (
      trigger: HTMLElement,
      isOpen: boolean
    ) => {
      if (!trigger.classList.contains("splitting-hover")) return;
    
      if (isOpen) {
        trigger.classList.add("stay", "pre:text-ketchup");
      } else {
        trigger.classList.remove("stay", "pre:text-ketchup");
      }
    };


    const initInnerStyles = () => {
      const allInner = Array.from(
        root.querySelectorAll<HTMLElement>(".accordion__inner")
      );
      allInner.forEach((inner) => {
        inner.style.overflow = "hidden";
        inner.style.willChange = "height";
        inner.style.transitionProperty = "height";
        inner.style.transitionTimingFunction = "cubic-bezier(0.4, 0, 0.2, 1)";
        inner.style.transitionDuration = "500ms"; // 初期値（任意）
      });
    };

    const refreshOpenHeights = () => {
      const wrappers = Array.from(
        root.querySelectorAll<HTMLElement>(".accordion.active, .accordion.open")
      );
      wrappers.forEach((wrapper) => {
        const inner = wrapper.querySelector<HTMLElement>(".accordion__inner");
        const content = wrapper.querySelector<HTMLElement>(
          ".accordion__inner-content"
        );
        if (!inner || !content) return;
        const h = content.scrollHeight;
        if (h > 0) inner.style.height = `${h}px`;
      });
    };

    const applyMode = (mode: Mode) => {
      const spTriggers = Array.from(
        root.querySelectorAll<HTMLElement>(".js-sp-accordion")
      );
      const pcTriggers = Array.from(
        root.querySelectorAll<HTMLElement>(".js-pc-accordion")
      );

      // いったん全部外す
      [...spTriggers, ...pcTriggers].forEach((el) =>
        el.removeEventListener("click", onClick)
      );

      // 状態同期（開いてるやつは scrollHeight で高さを作る）
      const wrappers = Array.from(root.querySelectorAll<HTMLElement>(".accordion"));
      wrappers.forEach((wrapper) => {
        const id = wrapper.id;
        if (!id) return;

        const inner = wrapper.querySelector<HTMLElement>(".accordion__inner");
        const content = wrapper.querySelector<HTMLElement>(
          ".accordion__inner-content"
        );
        if (!inner || !content) return;

        const { all: triggers } = getTriggersById(id);

        const isOpenState =
          wrapper.classList.contains("active") || wrapper.classList.contains("open");

        if (isOpenState) {
          wrapper.classList.add("active");
          inner.style.height = `${content.scrollHeight}px`;
          triggers.forEach((t) => {
            t.classList.add("active");
            toggleStayIfSplittingHover(t, true);
          });
        } else {
          wrapper.classList.remove("active");
          inner.style.height = "0px";
          triggers.forEach((t) => {
            t.classList.remove("active");
            toggleStayIfSplittingHover(t, false);
          });
        }
      });

      // モードごとに有効なトリガーだけON
      if (mode === "sp") spTriggers.forEach((el) => el.addEventListener("click", onClick));
      else pcTriggers.forEach((el) => el.addEventListener("click", onClick));

      requestAnimationFrame(refreshOpenHeights);
    };

    const onClick = (e: Event) => {
      const elm = e.currentTarget as HTMLElement | null;
      if (!elm) return;

      const id = elm.dataset.target;
      if (!id) return;

      const wrapper = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      if (!wrapper) return;

      const inner = wrapper.querySelector<HTMLElement>(".accordion__inner");
      const content = wrapper.querySelector<HTMLElement>(".accordion__inner-content");
      if (!inner || !content) return;

      const { all: triggers } = getTriggersById(id);

      const isOpen = wrapper.classList.contains("active");

      // 現在高さ（アニメ距離算出用）
      const currentH = inner.getBoundingClientRect().height;
      const targetH = isOpen ? 0 : content.scrollHeight;
      const distance = Math.abs(targetH - currentH);

      setHeightTransition(inner, calcDurationMs(distance));

      if (isOpen) {
        wrapper.classList.remove("active");

        // いきなり 0 にすると距離算出が崩れる環境があるので「今の高さ→0」を保証
        inner.style.height = `${currentH}px`;
        requestAnimationFrame(() => {
          inner.style.height = "0px";
        });

        triggers.forEach((t) => {
          t.classList.remove("active");
          toggleStayIfSplittingHover(t, false);
        });
      } else {
        wrapper.classList.add("active");

        // 0 → targetH
        inner.style.height = `${currentH}px`;
        requestAnimationFrame(() => {
          inner.style.height = `${targetH}px`;
        });

        triggers.forEach((t) => {
          t.classList.add("active");
          toggleStayIfSplittingHover(t, true);
        });
      }
    };

    // ResizeObserver（中身の高さ変化追従）
    const ros: ResizeObserver[] = [];
    const setupResizeObservers = () => {
      ros.forEach((ro) => ro.disconnect());
      ros.length = 0;
      if (!("ResizeObserver" in window)) return;

      const wrappers = Array.from(root.querySelectorAll<HTMLElement>(".accordion"));
      wrappers.forEach((wrapper) => {
        const content = wrapper.querySelector<HTMLElement>(".accordion__inner-content");
        if (!content) return;

        const ro = new ResizeObserver(() => {
          if (wrapper.classList.contains("active") || wrapper.classList.contains("open")) {
            const inner = wrapper.querySelector<HTMLElement>(".accordion__inner");
            if (!inner) return;
            const h = content.scrollHeight;
            if (h > 0) inner.style.height = `${h}px`;
          }
        });

        ro.observe(content);
        ros.push(ro);
      });
    };

    // resize は rAF でまとめる（元実装踏襲）
    let currentMode: Mode = getMode();
    let raf: number | null = null;
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const newMode = getMode();
        if (newMode !== currentMode) {
          currentMode = newMode;
          applyMode(newMode);
        } else {
          refreshOpenHeights();
        }
      });
    };

    // init
    initInnerStyles();
    applyMode(currentMode);
    window.addEventListener("resize", onResize);

    // フォント/画像ロードで高さが変わる保険（元実装踏襲）
    if (document.fonts?.ready) document.fonts.ready.then(refreshOpenHeights);
    window.addEventListener("load", refreshOpenHeights);

    setupResizeObservers();
    requestAnimationFrame(refreshOpenHeights);

    // cleanup（Next.js で重要）
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", refreshOpenHeights);

      const spTriggers = Array.from(
        root.querySelectorAll<HTMLElement>(".js-sp-accordion")
      );
      const pcTriggers = Array.from(
        root.querySelectorAll<HTMLElement>(".js-pc-accordion")
      );
      [...spTriggers, ...pcTriggers].forEach((el) =>
        el.removeEventListener("click", onClick)
      );

      ros.forEach((ro) => ro.disconnect());
      if (raf) cancelAnimationFrame(raf);
    };
  }, [
    rootRef,
    options.smWidth,
    options.speedPxPerSec,
    options.minDurationMs,
    options.maxDurationMs,
  ]);
}
