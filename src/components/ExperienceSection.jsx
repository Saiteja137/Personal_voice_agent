import { BadgeCheck, BriefcaseBusiness, GraduationCap } from 'lucide-react'
import personalData from '../data/personalData.json'

export default function ExperienceSection() {
  const certifications = personalData.certifications?.filter((item) => !/verify/i.test(item)).slice(0, 3) ?? []

  return (
    <section className="section experience-section" id="experience">
      <div className="container">
        <div className="section-heading split">
          <div><span className="section-number">04 / EXPERIENCE</span><h2>From data foundations to enterprise AI.</h2></div>
          <p>A practical progression through analytics, data science, and production-minded AI engineering.</p>
        </div>
        <div className="experience-layout">
          <div className="timeline">
            {personalData.experience.map((item, index) => (
              <article className="timeline-item" key={`${item.organization}-${item.role}`}>
                <span className="timeline-marker">0{index + 1}</span>
                <div>
                  <span className="timeline-period">{item.period}</span>
                  <h3>{item.role}</h3>
                  <p className="timeline-org">{item.organization}{item.location ? ` · ${item.location}` : ''}</p>
                  <ul>{item.highlights.slice(0, 2).map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
          <aside className="credential-panel">
            <div className="credential-icon"><GraduationCap /></div>
            <span className="credential-label">EDUCATION</span>
            <h3>{personalData.education.degree}</h3>
            <p>{personalData.education.institution}</p>
            <div className="education-meta"><span>{personalData.education.period}</span><strong>CGPA {personalData.education.cgpa}</strong></div>
            <div className="credential-divider" />
            <div className="credential-title"><BadgeCheck size={17} /><span>Selected credentials</span></div>
            <ul className="cert-list">{certifications.map((certification) => <li key={certification}>{certification}</li>)}</ul>
            <div className="experience-focus"><BriefcaseBusiness size={16} /><span>Targeting AI Engineer, Generative AI Engineer, and Agentic AI Engineer roles.</span></div>
          </aside>
        </div>
      </div>
    </section>
  )
}
