import { ArrowUp, AudioLines } from 'lucide-react'

export default function Footer() {
  return <footer><div className="container footer-top"><div><span className="footer-logo"><AudioLines /> Sai Teja AI</span><h2>Let’s build something<br /><span>meaningful.</span></h2></div><a href="#top" aria-label="Back to top">Back to top <ArrowUp /></a></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Sai Teja Atkapuram</span><span>Designed & engineered as a privacy-first personal portfolio</span><span>React · Browser Voice APIs · Offline Matching</span></div></footer>
}
