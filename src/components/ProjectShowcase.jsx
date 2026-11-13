import { ArrowUpRight, FileSearch, GitBranch, Landmark, Network, Scale } from 'lucide-react'
import { motion } from 'framer-motion'
import personalData from '../data/personalData.json'

const projectConfig = {
  'request-management': { icon: Network, question: 'Tell me about your Agentic AI Request Management Service' },
  'cicd-analysis': { icon: GitBranch, question: 'Explain your AI-Powered CI/CD Root Cause Analysis project' },
  'finance-planner': { icon: Landmark, question: 'Explain your AI Personal Finance Planner' },
  'sla-credit-recovery': { icon: Scale, question: 'Tell me about your SLA breach and credit recovery project' },
  smartpdf: { icon: FileSearch, question: 'What is your SmartPDF QA Bot?' }
}

export default function ProjectShowcase({ onAsk }) {
  return (
    <section className="section projects-section" id="projects">
      <div className="container">
        <div className="section-heading split"><div><span className="section-number">02 / SELECTED WORK</span><h2>AI systems with a reason to exist.</h2></div><p>Five projects across enterprise automation, developer experience, document intelligence, and personal decision support.</p></div>
        <div className="project-grid">
          {personalData.projects.map((project, index) => {
            const config = projectConfig[project.id] || { icon: Network, question: `Tell me about your ${project.title} project` }
            const Icon = config.icon
            return <motion.article className={`project-card ${index === 0 ? 'featured' : ''}`} key={project.id} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 240, damping: 20 }}>
              <div className="project-top"><div className="project-icon"><Icon size={23} /></div><span>0{index + 1}</span></div>
              <p className="project-kicker">{project.shortTitle}</p><h3>{project.title}</h3><p className="project-description">{project.description}</p>
              <div className="objective"><span>ENGINEERING OBJECTIVE</span><p>{project.objective}</p></div>
              {project.highlights?.length > 0 && <ul className="project-highlights">{project.highlights.slice(0, 3).map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>}
              {project.resumeReportedMetrics?.length > 0 && <div className="project-metrics"><span>RESUME-DOCUMENTED SCOPE</span><div>{project.resumeReportedMetrics.map((metric) => <b key={metric}>{metric}</b>)}</div></div>}
              <div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <button className="project-action" onClick={() => onAsk(config.question)}>Ask about this project <ArrowUpRight size={17} /></button>
            </motion.article>
          })}
        </div>
      </div>
    </section>
  )
}
