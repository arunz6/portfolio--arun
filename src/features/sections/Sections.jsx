import { profile, skills, experience, education, achievement } from '../../data/content'

const Ext = ({ href, children, className = 'link' }) => (
  <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>
)

export const About = () => (
  <section id="about" className="section section--light about" aria-labelledby="about-title">
    <h2 id="about-title" className="h2">About</h2>
    <div className="about__body">
      <p className="about__big">I build practical full-stack products, and I like giving them an interface that feels considered.</p>
      <p>My base is the MERN stack. Lately I have been working with AI agents and tool-based workflows: LangGraph, multi-model pipelines, agents that call a search tool and reason over the result.</p>
      <p>I also enjoy creative frontend work, from GSAP motion to Three.js scenes, when it helps people understand or remember something. I am doing my MCA at SGSITS Indore.</p>
    </div>
  </section>
)

export const Skills = () => (
  <section id="skills" className="section section--dark" aria-labelledby="skills-title">
    <h2 id="skills-title" className="h2">Skills</h2>
    <dl className="skills">
      {skills.map(([group, items]) => (
        <div key={group} className="skills__row">
          <dt>{group}</dt>
          <dd>{items.join(', ')}</dd>
        </div>
      ))}
    </dl>
  </section>
)

export const Journey = () => (
  <section id="journey" className="section section--dark journey" aria-labelledby="journey-title">
    <h2 id="journey-title" className="h2">Journey</h2>
    <div className="row">
      <p className="meta">{experience.period}</p>
      <div>
        <h3 className="h3">Experience · {experience.role}, {experience.company}</h3>
        <ul className="plain">{experience.points.map((p) => <li key={p}>{p}</li>)}</ul>
        <p><Ext href={experience.site}>Agniro website<span className="sr"> (opens in new tab)</span></Ext></p>
      </div>
    </div>
    {education.map((e) => (
      <div className="row" key={e.degree}>
        <p className="meta">{e.period}</p>
        <div>
          <h3 className="h3">Education · {e.school}</h3>
          <p>{e.degree}</p>
          <p className="meta">{e.note}</p>
        </div>
      </div>
    ))}
    <div className="row">
      <p className="meta">2026</p>
      <div>
        <h3 className="h3">Recognition · {achievement.title}</h3>
        <p>{achievement.text}</p>
      </div>
    </div>
  </section>
)

export const Contact = () => (
  <section id="contact" className="section section--light contact" aria-labelledby="contact-title">
    <h2 id="contact-title" className="h2">Let's build something meaningful.</h2>
    <a className="contact__mail" href={`mailto:${profile.email}`}>{profile.email}</a>
    <p className="contact__links">
      <Ext href={profile.linkedin}>LinkedIn<span className="sr"> (opens in new tab)</span></Ext>
      <Ext href={profile.github}>GitHub<span className="sr"> (opens in new tab)</span></Ext>
    </p>
  </section>
)

export const Footer = () => (
  <footer className="footer">
    <p>&copy; {new Date().getFullYear()} {profile.name}</p>
    <nav aria-label="Footer"><a href="#top">Back to top</a></nav>
  </footer>
)
