import { Bot, RotateCcw, UserRound } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ChatMessage({ message, onReplay }) {
  const assistant = message.role === 'assistant'
  return (
    <motion.article className={`message ${message.role}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="message-avatar">{assistant ? <Bot size={16} /> : <UserRound size={16} />}</div>
      <div className="message-content">
        <div className="message-meta"><strong>{assistant ? 'Sai Teja AI' : 'You'}</strong><time>{message.time}</time></div>
        <p>{message.text}</p>
        {assistant && onReplay && <button className="replay-button" onClick={() => onReplay(message.text)}><RotateCcw size={13} /> Replay</button>}
      </div>
    </motion.article>
  )
}
