import Navbar from './components/Navbar'
import Hero from './components/Hero'
import VoiceAssistant from './components/VoiceAssistant'
import ProjectShowcase from './components/ProjectShowcase'
import AboutMe from './components/AboutMe'
import ExperienceSection from './components/ExperienceSection'
import SkillsSection from './components/SkillsSection'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'

export default function App() {
  const ask = (question) => {
    window.dispatchEvent(new CustomEvent('ask-sai', { detail: question }))
    document.querySelector('#assistant')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <Navbar />
      <main>
        <Hero onStart={() => document.querySelector('#assistant')?.scrollIntoView({ behavior: 'smooth' })} />
        <VoiceAssistant />
        <ProjectShowcase onAsk={ask} />
        <AboutMe />
        <ExperienceSection />
        <SkillsSection />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
