import { useEffect, useState } from 'react'
import { Menu, Sparkles, X } from 'lucide-react'

const links = [['Assistant', '#assistant'], ['Projects', '#projects'], ['About', '#about'], ['Experience', '#experience'], ['How it works', '#how-it-works']]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  return (
    <header className="nav-wrap">
      <nav className="nav container" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Sai Teja AI home"><span className="brand-mark"><Sparkles size={16} /></span><span>Sai Teja <b>AI</b></span></a>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
        <div id="mobile-menu" className={`nav-links ${open ? 'open' : ''}`}>
          {links.map(([label, href]) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}</a>)}
          <a className="nav-cta" href="#assistant" onClick={() => setOpen(false)}>Start conversation</a>
        </div>
      </nav>
    </header>
  )
}
