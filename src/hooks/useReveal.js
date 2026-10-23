import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

// Project visuals wipe in once as they enter. Everything else stays still.
export default function useReveal() {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('[data-clip]').forEach((el) =>
          gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, {
            clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power3.inOut', clearProps: 'clipPath',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          }))
        gsap.utils.toArray('[data-drift]').forEach((el) =>
          gsap.fromTo(el, { yPercent: 6 }, {
            yPercent: -6, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          }))
      })
    }, ref)
    return () => ctx.revert()
  }, [])
  return ref
}
