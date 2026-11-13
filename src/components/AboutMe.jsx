import { Braces, BrainCircuit, Compass, MoveUpRight } from 'lucide-react'
import personalData from '../data/personalData.json'

export default function AboutMe() {
  return (
    <section className="section about-section" id="about">
      <div className="container about-grid">
        <div className="about-portrait" aria-hidden="true"><div className="portrait-frame"><span className="portrait-initials">ST</span><div className="portrait-orbit" /><div className="portrait-code"><Braces size={18} /> build / learn / improve</div></div><div className="portrait-caption"><span>Based in India</span><span>Building for meaningful impact <MoveUpRight size={14} /></span></div></div>
        <div className="about-copy"><span className="section-number">03 / ABOUT ME</span><h2>Curious by nature.<br /><span>Structured by practice.</span></h2><p className="about-lead">{personalData.summary}</p><p>{personalData.background}</p>
          <div className="value-list"><div><BrainCircuit /><span><b>Think in systems</b><small>I break complex work into clear components and dependencies.</small></span></div><div><Compass /><span><b>Learn by building</b><small>I turn new concepts into practical experiments and working applications.</small></span></div></div>
        </div>
      </div>
    </section>
  )
}
