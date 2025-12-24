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

    const setOverflowHidden = (inner: HTMLElement) => {
      inner.style.overflow = "hidden";
    };

    // ✅ 「開き終わり（height transitionend）」で overflow visible + illust top 付与（PCのみ）
    const setOverflowVisibleAfterTransition = (
      inner: HTMLElement,
      wrapper: HTMLElement
    ) => {
      // 多重発火防止（毎回 1回だけ）
      const onEnd = (ev: TransitionEvent) => {
        if (ev.target !== inner) return;
        if (ev.propertyName !== "height") return;

        inner.style.overflow = "visible";

        inner.removeEventListener("transitionend", onEnd);
      };
      inner.addEventListener("transitionend", onEnd);
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
        inner.style.transitionDuration = "500ms";
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

        // すでに open 状態のものは visible & top 調整（PCのみ）
        inner.style.overflow = "visible";
      });

      // 閉じてるやつは top 戻しておく（PCのみ）
      const closed = Array.from(
        root.querySelectorAll<HTMLElement>(".accordion:not(.active):not(.open)")
      );
    };

    const onClick = (e: Event) => {
      const elm = e.currentTarget as HTMLElement | null;
      if (!elm) return;

      const id = elm.dataset.target;
      if (!id) return;

      const wrapper = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      if (!wrapper) return;

      const inner = wrapper.querySelector<HTMLElement>(".accordion__inner");
      const content = wrapper.querySelector<HTMLElement>(
        ".accordion__inner-content"
      );
      if (!inner || !content) return;

      const { all: triggers } = getTriggersById(id);
      const isOpen = wrapper.classList.contains("active");

      const currentH = inner.getBoundingClientRect().height;
      const targetH = isOpen ? 0 : content.scrollHeight;
      const distance = Math.abs(targetH - currentH);

      setHeightTransition(inner, calcDurationMs(distance));

      if (isOpen) {
        wrapper.classList.remove("active");

        // ✅ 閉じる時：まず hidden / top を戻す（PCのみ）
        setOverflowHidden(inner);

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

        // ✅ 開く時：hidden のままアニメ → 終了後 visible + top付与（PCのみ）
        setOverflowHidden(inner);
        setOverflowVisibleAfterTransition(inner, wrapper);

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

    const applyMode = (mode: Mode) => {
      const spTriggers = Array.from(
        root.querySelectorAll<HTMLElement>(".js-sp-accordion")
      );
      const pcTriggers = Array.from(
        root.querySelectorAll<HTMLElement>(".js-pc-accordion")
      );

      [...spTriggers, ...pcTriggers].forEach((el) =>
        el.removeEventListener("click", onClick)
      );

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
          inner.style.overflow = "visible";

          triggers.forEach((t) => {
            t.classList.add("active");
            toggleStayIfSplittingHover(t, true);
          });
        } else {
          wrapper.classList.remove("active");
          inner.style.height = "0px";
          inner.style.overflow = "hidden";

          triggers.forEach((t) => {
            t.classList.remove("active");
            toggleStayIfSplittingHover(t, false);
          });
        }
      });

      if (mode === "sp") spTriggers.forEach((el) => el.addEventListener("click", onClick));
      else pcTriggers.forEach((el) => el.addEventListener("click", onClick));

      requestAnimationFrame(refreshOpenHeights);
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
            inner.style.overflow = "visible";
          }
        });

        ro.observe(content);
        ros.push(ro);
      });
    };

    // resize は rAF でまとめる
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

    if (document.fonts?.ready) document.fonts.ready.then(refreshOpenHeights);
    window.addEventListener("load", refreshOpenHeights);

    setupResizeObservers();
    requestAnimationFrame(refreshOpenHeights);

    // cleanup
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
