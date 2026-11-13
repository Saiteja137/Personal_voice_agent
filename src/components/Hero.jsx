import { ArrowDown, AudioLines, ShieldCheck, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import personalData from '../data/personalData.json'
import questionBank from '../data/questionBank.json'

export default function Hero({ onStart }) {
  return (
    <section className="hero container" id="top">
      <motion.div className="hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
        <div className="eyebrow"><span className="status-dot" /> Sai Teja's interactive AI portfolio</div>
        <h1>Meet Sai Teja <span className="gradient-text">AI</span></h1>
        <p className="hero-kicker">The Voice Behind the Engineer</p>
        <p className="hero-description">{personalData.summary}</p>
        <div className="identity-line"><strong>{personalData.name}</strong><span>AI Engineer · Generative AI · Agentic AI · Enterprise Automation</span></div>
        <div className="hero-actions">
          <button className="primary-button" onClick={onStart}><AudioLines size={19} /> Start a conversation</button>
          <a className="text-link" href="#projects">Explore my work <ArrowDown size={17} /></a>
        </div>
        <div className="trust-row"><span><ShieldCheck size={15} /> No account or API key</span><span><Sparkles size={15} /> {questionBank.length} curated recruiter answers</span></div>
      </motion.div>
      <motion.div className="hero-visual" initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8, delay: .15 }} aria-hidden="true">
        <div className="orbit orbit-a"><span /></div>
        <div className="orbit orbit-b"><span /></div>
        <div className="hero-core"><div className="monogram">ST</div><div className="core-label">Engineer<br />in the loop</div></div>
        <div className="signal-card signal-one"><span>01</span> Reason</div>
        <div className="signal-card signal-two"><span>02</span> Retrieve</div>
        <div className="signal-card signal-three"><span>03</span> Act safely</div>
      </motion.div>
    </section>
  )
}
