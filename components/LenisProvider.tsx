'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from '@studio-freight/lenis'

export const LenisProvider = () => {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    // ✅ ブラウザの「勝手に前のスクロール位置へ戻す」を無効化
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // ✅ タッチデバイスでは Lenis 無効（元の仕様）
    const isTouchDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0)

    if (isTouchDevice) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1,
      infinite: false,
    })

    lenisRef.current = lenis

    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, []) // ← ここは初回だけ :contentReference[oaicite:0]{index=0}

  // ✅ 遷移のたびに先頭へ（タイミングずれ対策で2段）
  useEffect(() => {
    const lenis = lenisRef.current

    // Lenisあり（PC）
    if (lenis) {
      lenis.stop()
      lenis.scrollTo(0, { immediate: true })
      window.scrollTo(0, 0) // 念のための保険

      // レイアウト確定後にもう一回潰す（これが効く）
      requestAnimationFrame(() => {
        lenis.scrollTo(0, { immediate: true })
        window.scrollTo(0, 0)
        lenis.start()
      })

      return
    }

    // Lenisなし（スマホ等）
    window.scrollTo(0, 0)
    requestAnimationFrame(() => window.scrollTo(0, 0))
  }, [pathname])

  return null
}
