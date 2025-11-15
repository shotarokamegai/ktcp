// app/fonts.ts
import localFont from "next/font/local";

export const gtAmerica = localFont({
  src: [
    {
      path: "./../public/fonts/GT-America/GT-America-Standard-Light.woff2",
      weight: "300",          // ← Light
      style: "normal",
    },
    {
      path: "./../public/fonts/GT-America/GT-America-Standard-Regular.woff2",
      weight: "400",          // ← Regular
      style: "normal",
    },
    {
      path: "./../public/fonts/GT-America/GT-America-Standard-Bold.woff2",
      weight: "700",          // ← Bold
      style: "normal",
    },
  ],
  variable: "--font-gt-america", // Tailwindで使う用
  display: "swap",             // FOUT対策
});