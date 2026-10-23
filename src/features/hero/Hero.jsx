import { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { featured, profile, skills } from '../../data/content'

gsap.registerPlugin(ScrollTrigger)
const Hero3D = lazy(() => import('../../components/three/Hero3D'))

export default function Hero() {
  const root = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const motion = gsap.matchMedia()
      motion.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from('.hero__letter', { yPercent: 115, opacity: 0, duration: 0.8, stagger: 0.035 })
          .from('.hero__in', { opacity: 0, y: 14, duration: 0.7, stagger: 0.08 }, '-=0.4')

        gsap.utils.toArray('.hero__panel--scroll').forEach((panel) => {
          gsap.fromTo(panel, { opacity: 0, y: 26 }, {
            opacity: 1, y: 0, duration: 0.85, ease: 'power2.out',
            scrollTrigger: { trigger: panel, start: 'top 78%', toggleActions: 'play none none reverse' },
          })
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const letter = (word) => (
    <span className="mask" key={word} aria-hidden="true">
      <span className="hero__word">{Array.from(word, (char, index) => <span className="hero__letter" key={`${word}-${index}`}>{char}</span>)}</span>
    </span>
  )

  return (
    <section id="top" className="hero" ref={root} aria-labelledby="hero-title">
      <div className="hero__stage" aria-hidden="true">
        <div className="hero__scene">
          <Suspense fallback={<div className="hero__fallback" />}><Hero3D /></Suspense>
        </div>
        <span className="hero__waterline" />
      </div>

      <div className="hero__chapter hero__chapter--identity">
        <div className="hero__content">
          <p className="hero__in hero__loc">{profile.location}</p>
          <h1 id="hero-title" className="hero__name" aria-label="Arun Rajput">
            {letter('ARUN')}{letter('RAJPUT')}
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

      <div className="hero__chapter hero__chapter--intro">
        <div className="hero__panel hero__panel--scroll hero__panel--left">
          <p className="hero__chapter-label">01 / Introduction</p>
          <h2>Digital products, from first idea to the final detail.</h2>
          <p>I bring full-stack engineering, AI workflows, and creative frontend work together to make useful products feel clear and memorable.</p>
          <a className="link" href="#about">More about me <span aria-hidden="true">↗</span></a>
        </div>
        <div className="hero__side-note" aria-hidden="true">A considered point of view<br />on code and interaction.</div>
      </div>

      <div className="hero__chapter hero__chapter--skills">
        <div className="hero__side-note hero__side-note--left" aria-hidden="true">One connected<br />digital practice.</div>
        <div className="hero__panel hero__panel--scroll hero__panel--right">
          <p className="hero__chapter-label">02 / Technical identity</p>
          <h2>One toolkit. Several ways to build.</h2>
          <dl className="hero__stack">
            {skills.slice(0, 3).map(([category, items]) => (
              <div key={category}><dt>{category === 'AI and GenAI' ? 'AI engineering' : category}</dt><dd>{items.slice(0, 5).join(' · ')}</dd></div>
            ))}
          </dl>
          <a className="link" href="#skills">View all skills <span aria-hidden="true">↗</span></a>
        </div>
      </div>

      <div className="hero__chapter hero__chapter--work">
        <div className="hero__panel hero__panel--scroll hero__panel--left hero__work-panel">
          <p className="hero__chapter-label">03 / Selected work</p>
          <h2>Built to solve real problems.</h2>
          <ol className="hero__work-list">
            {featured.map((project, index) => (
              <li key={project.id}><a href={`#${project.id}`}><span>0{index + 1}</span>{project.title}<span aria-hidden="true">↗</span></a></li>
            ))}
          </ol>
          <a className="btn btn--solid" href="#projects">Explore all projects</a>
        </div>
        <p className="hero__side-note" aria-hidden="true">Selected experiments<br />in product and code.</p>
      </div>
    </section>
  )
}
