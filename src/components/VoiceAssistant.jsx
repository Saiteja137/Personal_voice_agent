import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, Eraser, Keyboard, Mic, Square, Volume2 } from 'lucide-react'
import VoiceOrb from './VoiceOrb'
import ChatWindow from './ChatWindow'
import QuestionSuggestions from './QuestionSuggestions'
import { createResponse } from '../utils/responseHandler'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'

const now = () => new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date())
let fallbackId = 0
const createMessageId = () => {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  } catch {
    // Older browsers and non-secure contexts may block randomUUID.
  }
  fallbackId += 1
  return `message-${Date.now()}-${fallbackId}`
}

export default function VoiceAssistant() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [lastCategory, setLastCategory] = useState(null)
  const lastCategoryRef = useRef(null)
  const responseTimerRef = useRef(null)
  const speech = useSpeechSynthesis()

  const submitQuestion = useCallback((raw) => {
    const question = String(raw ?? '').trim()
    if (!question) return
    speech.stop()
    setError('')
    setInput('')
    setMessages((current) => [...current, { id: createMessageId(), role: 'user', text: question, time: now() }])
    setProcessing(true)
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current)
    responseTimerRef.current = window.setTimeout(() => {
      try {
        const response = createResponse(question, { lastCategory: lastCategoryRef.current })
        lastCategoryRef.current = response.category
        setLastCategory(response.category)
        setMessages((current) => [...current, { id: createMessageId(), role: 'assistant', text: response.answer, time: now(), intent: response.intent }])
        speech.speak(response.answer)
      } catch (responseError) {
        console.error('Unable to create the assistant response:', responseError)
        setError('I could not process that question in this browser. Please try rephrasing it.')
      } finally {
        setProcessing(false)
        responseTimerRef.current = null
      }
    }, 420)
  }, [speech.speak, speech.stop])

  useEffect(() => () => {
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current)
  }, [])

  const recognition = useSpeechRecognition({
    disabled: speech.isSpeaking,
    onResult: submitQuestion,
    onError: setError
  })

  useEffect(() => {
    const handleAsk = (event) => submitQuestion(event.detail)
    window.addEventListener('ask-sai', handleAsk)
    return () => window.removeEventListener('ask-sai', handleAsk)
  }, [submitQuestion])

  const state = useMemo(() => recognition.isListening ? 'listening' : processing ? 'processing' : speech.isSpeaking ? 'speaking' : 'idle', [processing, recognition.isListening, speech.isSpeaking])
  const toggleMic = () => recognition.isListening ? recognition.stopListening() : recognition.startListening()
  const submit = (event) => { event.preventDefault(); submitQuestion(input) }

  return (
    <section className="assistant-section section" id="assistant">
      <div className="container">
        <div className="section-heading assistant-heading centered">
          <span className="section-number">01 / INTERACTIVE EXPERIENCE</span>
          <span className="assistant-title-label">Your Personal AI Voice Assistant</span>
          <h2>Meet Sai Teja <span className="gradient-text">AI</span></h2>
          <p>Ask about my journey, technical expertise, projects, and ambitions. Click the microphone to speak, or type below to start a conversation.</p>
        </div>
        <div className="assistant-frame">
          <div className="assistant-statusbar"><span><i /> Knowledge base online</span><span>Local matching · No AI API</span></div>
          <div className="assistant-grid">
            <div className="voice-panel">
              <span className="panel-label">VOICE INTERFACE</span>
              <VoiceOrb state={state} onClick={toggleMic} disabled={processing || speech.isSpeaking || !recognition.isSupported} />
              {recognition.interimTranscript && recognition.isListening && <p className="transcript">“{recognition.interimTranscript}”</p>}
              {!recognition.isSupported && <p className="support-note">Voice recognition is unavailable in this browser. The typed assistant is fully supported.</p>}
              <div className="voice-controls">
                {speech.isSpeaking ? <button onClick={speech.stop}><Square size={14} /> Stop voice</button> : <span><Volume2 size={14} /> Male English voice</span>}
                <label>Speed <input type="range" min="0.8" max="1.4" step="0.1" value={speech.rate} onChange={(e) => speech.setRate(Number(e.target.value))} aria-label="Voice speed" /><b>{speech.rate.toFixed(1)}×</b></label>
              </div>
            </div>
            <div className="conversation-panel">
              <div className="conversation-title"><div><Keyboard size={17} /><span>Conversation</span></div>{messages.length > 0 && <button onClick={() => { speech.stop(); setMessages([]); setLastCategory(null); lastCategoryRef.current = null }}><Eraser size={15} /> Clear</button>}</div>
              <ChatWindow messages={messages} onReplay={speech.speak} />
              {processing && <div className="thinking"><i /><i /><i /><span>Matching your question</span></div>}
              {error && <div className="error-banner" role="alert">{error}</div>}
              <form className="chat-form" onSubmit={submit}>
                <button type="button" className="input-mic" onClick={toggleMic} disabled={!recognition.isSupported || speech.isSpeaking} aria-label="Use microphone"><Mic size={18} /></button>
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything about my journey…" aria-label="Type a question" />
                <button className="send-button" disabled={!input.trim() || processing} aria-label="Send question"><ArrowUp size={19} /></button>
              </form>
            </div>
          </div>
        </div>
        <QuestionSuggestions onSelect={submitQuestion} />
        <p className="browser-note"><span>Browser note</span> Voice recognition works best in current Chromium-based browsers over HTTPS. Text chat remains available everywhere.</p>
      </div>
    </section>
  )
}
