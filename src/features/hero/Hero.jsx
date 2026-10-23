import { Component, lazy, Suspense, useCallback, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { profile } from '../../data/content'

const Hero3D = lazy(() => import('../../components/three/Hero3D'))

class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError?.() }
  render() { return this.state.failed ? <div className="hero__fallback" aria-hidden="true" /> : this.props.children }
}

export default function Hero() {
  const root = useRef(null)
  const [intro, setIntro] = useState('loading')
  const completeIntro = useCallback(() => setIntro('complete'), [])
  const sceneReady = useCallback(() => setIntro((state) => state === 'loading' ? 'forming' : state), [])

  useLayoutEffect(() => {
    if (intro !== 'complete') return undefined
    const ctx = gsap.context(() => {
      const motion = gsap.matchMedia()
      motion.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from('.hero__letter', { yPercent: 115, opacity: 0, duration: 0.8, stagger: 0.035 })
          .from('.hero__in', { opacity: 0, y: 14, duration: 0.7, stagger: 0.08 }, '-=0.4')
      })
    }, root)
    return () => ctx.revert()
  }, [intro])

  return (
    <section id="top" className="hero" ref={root} aria-labelledby="hero-title">
      <div className="hero__stage" aria-hidden="true">
        <div className="hero__scene">
          <SceneBoundary onError={completeIntro}>
            <Suspense fallback={<div className="hero__fallback" aria-hidden="true" />}>
              <Hero3D onReady={sceneReady} onIntroComplete={completeIntro} onError={completeIntro} />
            </Suspense>
          </SceneBoundary>
        </div>
        <span className="hero__waterline" />
      </div>

      {intro !== 'complete' && (
        <div className={`hero__loader${intro === 'forming' ? ' hero__loader--leaving' : ''}`} role="status" aria-live="polite">
          <span className="hero__loader-mark">AR</span>
          <span className="hero__loader-copy">{intro === 'loading' ? 'Preparing the scene' : 'Forming the mark'}</span>
          <span className="hero__loader-track"><span /></span>
        </div>
      )}

      <div className="hero__chapter hero__chapter--identity">
        <div className={`hero__content${intro === 'complete' ? ' is-ready' : ' is-waiting'}`}>
          <p className="hero__in hero__loc">{profile.location}</p>
          <h1 id="hero-title" className="hero__name" aria-label="Arun Rajput">
            {['ARUN', 'RAJPUT'].map((word) => <span className="hero__word" key={word} aria-hidden="true">{Array.from(word, (char, index) => <span className="hero__letter" key={`${word}-${index}`}>{char}</span>)}</span>)}
          </h1>
          <p className="hero__in hero__role">Full-stack developer <span aria-hidden="true">/</span> Agentic AI <span aria-hidden="true">/</span> Creative frontend</p>
          <div className="hero__row">
            <p className="hero__in hero__lead">Building interactive digital experiences, full-stack applications, and AI-powered tools. Currently pursuing my MCA at SGSITS Indore and working at Agniro.</p>
            <div className="hero__in hero__actions">
              <a className="btn btn--solid" href="#projects">See projects</a>
              <a className="btn" href="#contact">Contact me</a>
              <a className="link" href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a>
              <a className="link" href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
          <p className="hero__scroll-cue" aria-hidden="true">Scroll to explore <span>↓</span></p>
        </div>
      </div>
    </section>
  )
}
