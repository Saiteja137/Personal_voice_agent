import { Mic, MicOff, Volume2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function VoiceOrb({ state, onClick, disabled }) {
  const labels = { idle: 'Tap to speak', listening: 'Listening…', processing: 'Finding the best answer…', speaking: 'Speaking…' }
  const Icon = state === 'listening' ? MicOff : state === 'speaking' ? Volume2 : Mic
  return (
    <div className={`orb-stage state-${state}`}>
      <motion.button
        className="voice-orb"
        onClick={onClick}
        disabled={disabled}
        aria-label={state === 'listening' ? 'Stop listening' : 'Start voice question'}
        animate={state === 'listening' ? { scale: [1, 1.06, 1] } : state === 'speaking' ? { scale: [1, 1.035, .99, 1] } : { y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: state === 'idle' ? 3.8 : 1.2, ease: 'easeInOut' }}
      >
        <span className="orb-ring ring-one" /><span className="orb-ring ring-two" />
        <span className="orb-inner"><Icon size={32} strokeWidth={1.7} /></span>
      </motion.button>
      <div className="wave-bars" aria-hidden="true">{[1,2,3,4,5,6,7].map((n) => <i key={n} style={{ '--i': n }} />)}</div>
      <p className="orb-state"><span />{labels[state]}</p>
    </div>
  )
}
