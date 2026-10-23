import { featured, more } from '../../data/content'
import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Sketch of how each project works, drawn from its real architecture.
// Swap in a real screenshot by adding an `image` field and rendering it here.
function Flow({ project }) {
  return (
    <div className={`flow flow--${project.id}`} role="img" aria-label={`How ${project.title} works: ${project.flow.map((s) => s.join(' and ')).join(', then ')}`} data-clip>
      <ol className="flow__steps" aria-hidden="true">
        {project.flow.map((group, i) => (
          <li key={i} className="flow__step">{group.map((n) => <span key={n} className="flow__node">{n}</span>)}</li>
        ))}
      </ol>
    </div>
  )
}

function Links({ p }) {
  return (
    <p className="project__links">
      {p.live && <a className="btn btn--solid" href={p.live} target="_blank" rel="noopener noreferrer">Live demo<span className="sr"> of {p.title} (opens in new tab)</span></a>}
      <a className="btn" href={p.repo} target="_blank" rel="noopener noreferrer">GitHub<span className="sr"> repository for {p.title} (opens in new tab)</span></a>
    </p>
  )
}

export default function Projects() {
  const root = useRef(null)
  const [active, setActive] = useState(featured[0].id)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const motion = gsap.matchMedia()
      motion.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('.project').forEach((article) => {
          gsap.fromTo(article, { y: 24 }, {
            y: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: article, start: 'top 82%', once: true },
          })
        })
      })
      featured.forEach((project) => {
        const article = document.getElementById(project.id)
        if (!article) return
        ScrollTrigger.create({
          trigger: article, start: 'top center', end: 'bottom center',
          onToggle: ({ isActive }) => { if (isActive) setActive(project.id) },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="projects" className="section section--light projects" aria-labelledby="projects-title" ref={root}>
      <p className="projects__eyebrow">A selection of work · 2026</p>
      <h2 id="projects-title" className="h2">Selected projects</h2>
      <nav className="project-index" aria-label="Choose a project">
        {featured.map((p, i) => (
          <a key={p.id} href={`#${p.id}`} aria-current={active === p.id ? 'true' : undefined}>
            <span className="project-index__number">0{i + 1}</span><span>{p.title}</span>
          </a>
        ))}
      </nav>
      {featured.map((p, i) => (
        <article key={p.id} id={p.id} className={`project project--${p.layout}`}>
          <div className="project__visual" data-drift><Flow project={p} /></div>
          <div className="project__info">
            <p className="meta"><span className="project__number">0{i + 1}</span> {p.category}, {p.year}</p>
            <h3 className="project__title">{p.title}</h3>
            <p className="project__desc">{p.description}</p>
            <ul className="project__features">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
            <ul className="tags" aria-label="Technologies">{p.tech.map((t) => <li key={t}>{t}</li>)}</ul>
            <p className="meta">Contribution: {p.contribution}</p>
            <Links p={p} />
          </div>
        </article>
      ))}
      <h3 className="h3">Also built</h3>
      <ul className="more">
        {more.map((m) => (
          <li key={m.title}>
            <h4>{m.title}</h4>
            <p>{m.note}</p>
            <p>
              {m.live && <a className="link" href={m.live} target="_blank" rel="noopener noreferrer">Live<span className="sr"> {m.title}</span></a>}
              <a className="link" href={m.repo} target="_blank" rel="noopener noreferrer">GitHub<span className="sr"> {m.title}</span></a>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
