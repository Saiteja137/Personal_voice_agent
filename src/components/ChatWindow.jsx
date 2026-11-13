import { useEffect, useRef } from 'react'
import { MessageCircle } from 'lucide-react'
import ChatMessage from './ChatMessage'

export default function ChatWindow({ messages, onReplay }) {
  const endRef = useRef(null)
  useEffect(() => {
    const end = endRef.current
    if (typeof end?.scrollIntoView !== 'function') return
    try {
      end.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } catch {
      end.scrollIntoView()
    }
  }, [messages])
  if (!messages.length) return <div className="empty-chat"><MessageCircle size={25} /><strong>Your conversation starts here</strong><p>Ask about my journey, engineering approach, or any featured project.</p></div>
  return <div className="chat-scroll" aria-live="polite">{messages.map((message) => <ChatMessage key={message.id} message={message} onReplay={onReplay} />)}<div ref={endRef} /></div>
}
