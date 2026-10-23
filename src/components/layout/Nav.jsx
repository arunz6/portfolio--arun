import { useEffect, useState } from 'react'

const links = [['about', 'About'], ['skills', 'Skills'], ['projects', 'Projects'], ['journey', 'Journey'], ['contact', 'Contact']]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const lightSection = ['about', 'projects', 'contact'].includes(active)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    links.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className={`nav${lightSection ? ' nav--light' : ''}`}>
      <a className="nav__logo" href="#top" aria-label="Arun Rajput, back to top">Arun Rajput</a>
      <button className="nav__toggle" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>
        {open ? 'Close' : 'Menu'}
      </button>
      <nav id="menu" className={`nav__menu${open ? ' is-open' : ''}`} aria-label="Primary">
        {links.map(([id, label]) => (
          <a key={id} href={`#${id}`} aria-current={active === id ? 'true' : undefined} onClick={() => setOpen(false)}>{label}</a>
        ))}
        <a className="nav__cta" href="#contact" onClick={() => setOpen(false)}>Get in touch</a>
      </nav>
    </header>
  )
}
