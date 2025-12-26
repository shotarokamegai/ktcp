"use client";

import { useEffect, RefObject } from "react";

type Options = {
  smWidth?: number;
  speedPxPerSec?: number;
  minDurationMs?: number;
  maxDurationMs?: number;

  illustSelector?: string;
  illustInClass?: string;
  illustOutClass?: string;
  illustFadeMs?: number;

  forceCloseOnInit?: boolean;
};

export function useAccordionController(
  rootRef: RefObject<HTMLElement>,
  options: Options = {}
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    /* =========================
       基本設定
    ========================= */

    const SPEEDUP = 2;

    const smWidth = options.smWidth ?? 750;
    const isSP = () => window.innerWidth < smWidth;

    const SP_SLOW_MULT = 2;

    const speed = options.speedPxPerSec ?? 800;
    const minMs = options.minDurationMs ?? 180;
    const maxMs = options.maxDurationMs ?? 900;

    const FORCE_CLOSE_ON_INIT = options.forceCloseOnInit ?? true;

    const ILLUST_SELECTOR =
      options.illustSelector ?? ".careers-accordion-illust";
    const ILLUST_IN_CLASS = options.illustInClass ?? "is-illust-in";
    const ILLUST_OUT_CLASS = options.illustOutClass ?? "is-illust-out";

    const ILLUST_FADE_MS = Math.max(
      1,
      Math.round((options.illustFadeMs ?? 300) / SPEEDUP)
    );

    /* =========================
       Utility
    ========================= */

    const calcDurationMs = (px: number) => {
      const ms = (px / speed) * 1000;
      const clamped = Math.max(minMs, Math.min(maxMs, ms));
      const base = Math.max(1, Math.round(clamped / SPEEDUP));
      return isSP() ? base * SP_SLOW_MULT : base;
    };

    const setHeightTransition = (inner: HTMLElement, ms: number) => {
      inner.style.transitionProperty = "height";
      inner.style.transitionTimingFunction = "cubic-bezier(0.4, 0, 0.2, 1)";
      inner.style.transitionDuration = `${ms}ms`;
    };

    const getIllusts = (wrapper: HTMLElement) =>
      Array.from(wrapper.querySelectorAll<HTMLElement>(ILLUST_SELECTOR));

    const illustShow = (wrapper: HTMLElement) => {
      getIllusts(wrapper).forEach((el) => {
        el.classList.remove(ILLUST_OUT_CLASS);
        el.classList.add(ILLUST_IN_CLASS);
      });
    };

    const illustHide = (wrapper: HTMLElement) => {
      getIllusts(wrapper).forEach((el) => {
        el.classList.remove(ILLUST_IN_CLASS);
        el.classList.add(ILLUST_OUT_CLASS);
      });
    };

    const resetIllustInline = (wrapper: HTMLElement) => {
      getIllusts(wrapper).forEach((el) => {
        el.style.transition = "";
        el.style.opacity = "";
        el.style.transform = "";
      });
    };

    const setTitleActive = (wrapper: HTMLElement, on: boolean) => {
      const title = wrapper.querySelector<HTMLElement>(
        ".careers-accordion-title"
      );
      if (!title) return;
      title.classList.toggle("active", on);
    };

    const getCssFadeMs = (el: HTMLElement | null) => {
      if (!el) return ILLUST_FADE_MS;

      const st = getComputedStyle(el);
      const toMs = (s: string) =>
        s.trim().endsWith("ms")
          ? parseFloat(s)
          : s.trim().endsWith("s")
          ? parseFloat(s) * 1000
          : parseFloat(s) || 0;

      const durs = st.transitionDuration.split(",").map(toMs);
      const delays = st.transitionDelay.split(",").map(toMs);

      let max = 0;
      const len = Math.max(durs.length, delays.length);
      for (let i = 0; i < len; i++) {
        max = Math.max(
          max,
          (durs[i] ?? durs[durs.length - 1] ?? 0) +
            (delays[i] ?? delays[delays.length - 1] ?? 0)
        );
      }
      return Math.max(max, ILLUST_FADE_MS);
    };

    /* =========================
       Timer 管理
    ========================= */

    const timers = new WeakMap<HTMLElement, number[]>();

    const clearTimers = (w: HTMLElement) => {
      timers.get(w)?.forEach(clearTimeout);
      timers.set(w, []);
    };

    const pushTimer = (w: HTMLElement, id: number) => {
      timers.set(w, [...(timers.get(w) ?? []), id]);
    };

    /* =========================
       OPEN
    ========================= */

    const openAccordion = (wrapper: HTMLElement, inner: HTMLElement) => {
      clearTimers(wrapper);

      resetIllustInline(wrapper);
      illustHide(wrapper);

      const targetH = inner.scrollHeight;
      const currentH = inner.getBoundingClientRect().height;

      const duration = calcDurationMs(Math.abs(targetH - currentH));
      setHeightTransition(inner, duration);

      wrapper.classList.add("active");
      setTitleActive(wrapper, true);

      inner.style.overflow = "hidden";
      inner.style.height = `${currentH}px`;

      requestAnimationFrame(() => {
        inner.style.height = `${targetH}px`;
      });

      const t = window.setTimeout(() => {
        inner.style.overflow = "visible";
        illustShow(wrapper);
      }, Math.round(duration * 0.5));

      pushTimer(wrapper, t);
    };

    /* =========================
       CLOSE
    ========================= */

    const closeAccordion = (wrapper: HTMLElement, inner: HTMLElement) => {
      clearTimers(wrapper);

      // title は即OFF
      setTitleActive(wrapper, false);

      const currentH = inner.getBoundingClientRect().height;

      /* ---- SP ---- */
      if (isSP()) {
        wrapper.classList.remove("active");

        const duration = calcDurationMs(currentH);
        setHeightTransition(inner, duration);

        inner.style.overflow = "hidden";
        inner.style.height = `${currentH}px`;

        requestAnimationFrame(() => {
          inner.style.height = "0px";
        });

        const t = window.setTimeout(() => {
          getIllusts(wrapper).forEach((el) => {
            el.style.transition = "none";
            el.style.opacity = "0";
            el.style.transform = "scale(0)";
            el.classList.remove(ILLUST_IN_CLASS, ILLUST_OUT_CLASS);
          });
        }, duration + 30);

        pushTimer(wrapper, t);
        return;
      }

      /* ---- PC ---- */
      illustHide(wrapper);

      const fadeMs = getCssFadeMs(getIllusts(wrapper)[0]);

      const t = window.setTimeout(() => {
        wrapper.classList.remove("active");

        const duration = calcDurationMs(currentH);
        setHeightTransition(inner, duration);

        inner.style.overflow = "hidden";
        inner.style.height = `${currentH}px`;

        requestAnimationFrame(() => {
          inner.style.height = "0px";
        });
      }, fadeMs);

      pushTimer(wrapper, t);
    };

    /* =========================
       CLICK
    ========================= */

    const onClick = (e: Event) => {
      const trigger = e.currentTarget as HTMLElement;
      const id = trigger.dataset.target;
      if (!id) return;

      const wrapper = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      if (!wrapper) return;

      const inner = wrapper.querySelector<HTMLElement>(".accordion__inner");
      if (!inner) return;

      const isOpen = wrapper.classList.contains("active");
      isOpen ? closeAccordion(wrapper, inner) : openAccordion(wrapper, inner);
    };

    /* =========================
       INIT
    ========================= */

    const forceCloseAllInstant = () => {
      root.querySelectorAll<HTMLElement>(".accordion").forEach((wrapper) => {
        clearTimers(wrapper);

        wrapper.classList.remove("active", "open");
        setTitleActive(wrapper, false);
        illustHide(wrapper);

        const inner = wrapper.querySelector<HTMLElement>(".accordion__inner");
        if (!inner) return;

        inner.style.transition = "none";
        inner.style.overflow = "hidden";
        inner.style.height = "0px";
        inner.getBoundingClientRect();
        inner.style.transition = "";
      });
    };

    const init = () => {
      root.querySelectorAll<HTMLElement>(".accordion__inner").forEach((el) => {
        el.style.overflow = "hidden";
        el.style.willChange = "height";
      });

      if (FORCE_CLOSE_ON_INIT) forceCloseAllInstant();

      root
        .querySelectorAll<HTMLElement>(".js-sp-accordion, .js-pc-accordion")
        .forEach((el) => el.addEventListener("click", onClick));
    };

    init();

    return () => {
      root
        .querySelectorAll<HTMLElement>(".js-sp-accordion, .js-pc-accordion")
        .forEach((el) => el.removeEventListener("click", onClick));
    };
  }, [
    rootRef,
    options.smWidth,
    options.speedPxPerSec,
    options.minDurationMs,
    options.maxDurationMs,
    options.illustSelector,
    options.illustInClass,
    options.illustOutClass,
    options.illustFadeMs,
    options.forceCloseOnInit,
  ]);
}
