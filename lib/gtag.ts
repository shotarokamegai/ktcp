// lib/gtag.ts
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/** SPA遷移時に page_view を送る */
export const pageview = (url: string) => {
  if (!GA_ID) return;
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("config", GA_ID, {
    page_path: url,
  });
};
