import { AudioWaveform, Database, LockKeyhole, SearchCheck } from 'lucide-react'

const steps = [
  { icon: AudioWaveform, title: 'Speak or type', text: 'Your browser converts speech to text, or you can use the keyboard fallback.' },
  { icon: SearchCheck, title: 'Match the intent', text: 'Normalization, synonyms, keyword weighting, and fuzzy search identify the most relevant intent.' },
  { icon: Database, title: 'Use reviewed knowledge', text: 'The answer comes from an editable, first-person knowledge bank grounded in Sai’s supplied profile.' },
  { icon: LockKeyhole, title: 'Respond privately', text: 'The browser speaks the answer. No paid model, database, account, or API key is involved.' }
]

export default function HowItWorks() {
  return (
    <section className="section how-section" id="how-it-works"><div className="container"><div className="section-heading centered"><span className="section-number">05 / UNDER THE HOOD</span><h2>Purposefully intelligent.<br />Honestly explained.</h2><p>This is a personalized knowledge-based assistant—not a generative AI model pretending to know me.</p></div><div className="steps-grid">{steps.map(({ icon: Icon, title, text }, index) => <article key={title}><span className="step-number">0{index + 1}</span><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
  )
}
