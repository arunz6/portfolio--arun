import { Component, lazy, Suspense, useCallback, useRef, useState } from 'react'
import { profile } from '../../data/content'

const Hero3D = lazy(() => import('../../components/three/Hero3D'))

class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError?.() }
  render() { return this.state.failed ? null : this.props.children }
}

export default function Hero() {
  const [intro, setIntro] = useState('loading')
  const contentRef = useRef(null)
  const sceneReady = useCallback(() => setIntro((state) => state === 'loading' ? 'forming' : state), [])
  const completeIntro = useCallback(() => setIntro('complete'), [])
  const failIntro = useCallback(() => setIntro('fallback'), [])

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr">Full-stack developer</h1>

      <div className="hero__stage">
        <div className="hero__scene" aria-hidden="true">
          <SceneBoundary onError={failIntro}>
            <Suspense fallback={<div className="hero__fallback-copy"><strong>FULL STACK</strong><span>DEVELOPER</span></div>}>
              <Hero3D onReady={sceneReady} onIntroComplete={completeIntro} onError={failIntro} revealRef={contentRef} />
            </Suspense>
          </SceneBoundary>
        </div>
        <p className={`hero__scroll-cue${intro === 'complete' ? ' is-ready' : ''}`} aria-hidden="true">Scroll to explore <span>↓</span></p>
      </div>

      <div className="hero__chapter hero__chapter--identity">
        <div ref={contentRef} className={`hero__beats${intro === 'fallback' ? ' is-fallback' : ''}`}>
          <div className="hero__beat hero__beat--role" aria-label="Full-stack developer, Agentic AI and Creative frontend">
            <span className="hero__index">01 / WHAT I DO</span>
            <p className="hero__role">Full-stack developer <span aria-hidden="true">/</span><br />Agentic AI <span aria-hidden="true">/</span> Creative frontend</p>
          </div>
          <div className="hero__beat hero__beat--lead">
            <span className="hero__index">02 / APPROACH</span>
            <p className="hero__lead">Building interactive digital experiences, full-stack applications, and AI-powered tools.</p>
          </div>
          <div className="hero__beat hero__beat--profile">
            <span className="hero__index">03 / CURRENTLY</span>
            <p className="hero__lead">Pursuing my MCA at SGSITS Indore<br />Working at Agniro</p>
            <span className="hero__loc">{profile.location}</span>
          </div>
          <div className="hero__beat hero__beat--links">
            <span className="hero__index">04 / EXPLORE</span>
            <div className="hero__actions">
              <a className="btn btn--solid" href="#projects">See projects</a>
              <a className="btn" href="#contact">Contact me</a>
              <a className="link" href={profile.github} target="_blank" rel="noopener noreferrer">GitHub<span className="sr"> (opens in new tab)</span></a>
              <a className="link" href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<span className="sr"> (opens in new tab)</span></a>
            </div>
          </div>
        </div>
      </div>

      {(intro === 'loading' || intro === 'forming') && (
        <div className={`hero__loader${intro === 'forming' ? ' hero__loader--leaving' : ''}`} role="status" aria-live="polite">
          <span className="hero__loader-mark">01</span>
          <span className="hero__loader-copy">{intro === 'loading' ? 'Preparing the scene' : 'Assembling the name'}</span>
          <span className="hero__loader-track"><span /></span>
        </div>
      )}
    </section>
  )
}
