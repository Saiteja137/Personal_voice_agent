import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, Check, Eraser, Keyboard, Mic, Radio, Square, Volume2 } from 'lucide-react'
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
  const [continuousMode, setContinuousMode] = useState(false)
  const [conversationActive, setConversationActive] = useState(false)
  const lastCategoryRef = useRef(null)
  const responseTimerRef = useRef(null)
  const conversationActiveRef = useRef(false)
  const previousSpeakingRef = useRef(false)
  const resumeTimerRef = useRef(null)
  const stopRecognitionRef = useRef(null)
  const speech = useSpeechSynthesis()

  const updateConversationActive = useCallback((value) => {
    conversationActiveRef.current = value
    setConversationActive(value)
  }, [])

  const submitQuestion = useCallback((raw) => {
    const question = String(raw ?? '').trim()
    if (!question) return
    stopRecognitionRef.current?.({ discard: true })
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
    silenceTimeout: 3000,
    onResult: submitQuestion,
    onError: (message) => {
      setError(message)
      updateConversationActive(false)
    }
  })

  stopRecognitionRef.current = recognition.stopListening

  useEffect(() => {
    const wasSpeaking = previousSpeakingRef.current
    previousSpeakingRef.current = speech.isSpeaking
    if (!wasSpeaking || speech.isSpeaking || processing || !continuousMode || !conversationActiveRef.current) return undefined

    resumeTimerRef.current = window.setTimeout(() => {
      resumeTimerRef.current = null
      if (conversationActiveRef.current && !speech.isSpeaking) {
        setError('')
        recognition.startListening()
      }
    }, 450)
    return () => {
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current)
    }
  }, [continuousMode, processing, recognition.startListening, speech.isSpeaking])

  useEffect(() => {
    const handleAsk = (event) => submitQuestion(event.detail)
    window.addEventListener('ask-sai', handleAsk)
    return () => window.removeEventListener('ask-sai', handleAsk)
  }, [submitQuestion])

  const state = useMemo(() => {
    if (processing) return 'processing'
    if (speech.isSpeaking) return 'speaking'
    if (recognition.isWaiting) return 'waiting'
    if (recognition.isListening) return 'listening'
    if (error) return 'error'
    return 'idle'
  }, [error, processing, recognition.isListening, recognition.isWaiting, speech.isSpeaking])

  const startVoiceSession = () => {
    setError('')
    if (continuousMode) updateConversationActive(true)
    recognition.startListening()
  }

  const stopConversation = () => {
    updateConversationActive(false)
    recognition.stopListening({ discard: true })
    speech.stop()
  }

  const toggleMic = () => {
    if (!recognition.isSessionActive) {
      startVoiceSession()
      return
    }
    if (recognition.transcript) recognition.finishQuestion()
    else stopConversation()
  }

  const toggleContinuousMode = () => {
    const nextValue = !continuousMode
    setContinuousMode(nextValue)
    if (!nextValue) {
      updateConversationActive(false)
      recognition.stopListening({ discard: true })
    }
  }

  const replayResponse = (text) => {
    recognition.stopListening({ discard: true })
    speech.speak(text)
  }

  const clearConversation = () => {
    stopConversation()
    setMessages([])
    setLastCategory(null)
    lastCategoryRef.current = null
    setError('')
  }
  const submit = (event) => { event.preventDefault(); submitQuestion(input) }

  return (
    <section className="assistant-section section" id="assistant">
      <div className="container">
        <div className="section-heading assistant-heading centered">
          <span className="section-number">01 / INTERACTIVE EXPERIENCE</span>
          <span className="assistant-title-label">Sai Teja's AI Portfolio Assistant</span>
          <h2>Meet Sai Teja <span className="gradient-text">AI</span></h2>
          <p>An interactive showcase of Sai Teja's experience, engineering work, and ambitions. Ask a question by voice or text to explore the person behind the portfolio.</p>
        </div>
        <div className="assistant-frame">
          <div className="assistant-statusbar"><span><i /> Knowledge base online</span><span>Local matching · No AI API</span></div>
          <div className="assistant-grid">
            <div className="voice-panel">
              <span className="panel-label">VOICE INTERFACE</span>
              <VoiceOrb state={state} onClick={toggleMic} disabled={processing || speech.isSpeaking || !recognition.isSupported} />
              {recognition.transcript && recognition.isSessionActive && <p className="transcript">“{recognition.transcript}”</p>}
              {recognition.isSessionActive && <div className="listening-actions">
                <button className="finish-question" onClick={recognition.finishQuestion} disabled={!recognition.transcript}><Check size={14} /> Finish Question</button>
                {continuousMode && <button className="stop-conversation" onClick={stopConversation}><Square size={13} /> Stop Conversation</button>}
              </div>}
              {!recognition.isSupported && <p className="support-note">Voice recognition is unavailable in this browser. The typed assistant is fully supported.</p>}
              <div className="continuous-control">
                <div><Radio size={15} /><span><b>Continuous conversation</b><small>Automatically listen again after each answer</small></span></div>
                <button className={`mode-switch ${continuousMode ? 'enabled' : ''}`} onClick={toggleContinuousMode} role="switch" aria-checked={continuousMode} aria-label="Toggle continuous conversation"><i /></button>
              </div>
              {continuousMode && conversationActive && !recognition.isSessionActive && <button className="stop-conversation standalone" onClick={stopConversation}><Square size={13} /> Stop Conversation</button>}
              <div className="voice-controls">
                {speech.isSpeaking ? <button onClick={speech.stop}><Square size={14} /> Stop voice</button> : <span><Volume2 size={14} /> Male English voice</span>}
                <label>Speed <input type="range" min="0.8" max="1.4" step="0.1" value={speech.rate} onChange={(e) => speech.setRate(Number(e.target.value))} aria-label="Voice speed" /><b>{speech.rate.toFixed(1)}×</b></label>
              </div>
            </div>
            <div className="conversation-panel">
              <div className="conversation-title"><div><Keyboard size={17} /><span>Conversation</span></div>{messages.length > 0 && <button onClick={clearConversation}><Eraser size={15} /> Clear</button>}</div>
              <ChatWindow messages={messages} onReplay={replayResponse} />
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
