import personalData from '../data/personalData.json'

export default function SkillsSection() {
  return (
    <section className="skills-section section">
      <div className="container">
        <div className="skills-header"><span>TECHNICAL FIELD NOTES</span><p>A toolkit shaped around the complete AI application workflow—not isolated technologies.</p></div>
        <div className="skills-grid">{Object.entries(personalData.skills).map(([category, skills], index) => <div className="skill-group" key={category}><span className="skill-index">0{index + 1}</span><h3>{category}</h3><div>{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div>)}</div>
      </div>
    </section>
  )
}
