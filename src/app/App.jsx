import Nav from '../components/layout/Nav'
import Hero from '../features/hero/Hero'
import Projects from '../features/projects/Projects'
import { About, Skills, Journey, Contact, Footer } from '../features/sections/Sections'
import useReveal from '../hooks/useReveal'

export default function App() {
  const ref = useReveal()
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Nav />
      <main id="main" ref={ref}>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Journey />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
