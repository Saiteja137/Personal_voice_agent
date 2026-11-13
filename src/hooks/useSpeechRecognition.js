import { useCallback, useEffect, useRef, useState } from 'react'
import { cleanTranscript, collectRecognitionText } from '../utils/speechTranscript'

const DEFAULT_SILENCE_MS = 3000
const MAX_RESTARTS = 3

export function useSpeechRecognition({ onResult, onError, disabled = false, silenceTimeout = DEFAULT_SILENCE_MS } = {}) {
  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const restartTimerRef = useRef(null)
  const sessionActiveRef = useRef(false)
  const finishingRef = useRef(false)
  const disabledRef = useRef(disabled)
  const callbacksRef = useRef({ onResult, onError })
  const committedRef = useRef('')
  const displayRef = useRef('')
  const restartAttemptsRef = useRef(0)
  const startEngineRef = useRef(null)

  const [isListening, setIsListening] = useState(false)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [transcript, setTranscript] = useState('')

  const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
  const isSupported = Boolean(SpeechRecognition)
  callbacksRef.current = { onResult, onError }
  disabledRef.current = disabled

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current)
    if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current)
    silenceTimerRef.current = null
    restartTimerRef.current = null
  }, [])

  const resetBuffer = useCallback(() => {
    committedRef.current = ''
    displayRef.current = ''
    setTranscript('')
    setIsWaiting(false)
  }, [])

  const finalizeQuestion = useCallback(() => {
    const completeQuestion = cleanTranscript(displayRef.current)
    if (!completeQuestion) {
      callbacksRef.current.onError?.('I did not hear a question. Please try again or use the text input.')
      return false
    }

    finishingRef.current = true
    sessionActiveRef.current = false
    setIsSessionActive(false)
    setIsListening(false)
    setIsWaiting(false)
    clearTimers()
    try { recognitionRef.current?.stop() } catch { /* The browser may already have stopped. */ }
    recognitionRef.current = null
    resetBuffer()
    callbacksRef.current.onResult?.(completeQuestion)
    return true
  }, [clearTimers, resetBuffer])

  const scheduleSilenceCompletion = useCallback(() => {
    if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current)
    silenceTimerRef.current = window.setTimeout(() => {
      if (sessionActiveRef.current && displayRef.current) finalizeQuestion()
    }, silenceTimeout)
  }, [finalizeQuestion, silenceTimeout])

  const stopListening = useCallback(({ discard = true } = {}) => {
    finishingRef.current = true
    sessionActiveRef.current = false
    setIsSessionActive(false)
    setIsListening(false)
    setIsWaiting(false)
    clearTimers()
    try { recognitionRef.current?.abort() } catch { /* Already stopped. */ }
    recognitionRef.current = null
    if (discard) resetBuffer()
  }, [clearTimers, resetBuffer])

  const failSession = useCallback((message) => {
    stopListening({ discard: false })
    callbacksRef.current.onError?.(message)
  }, [stopListening])

  const startEngine = useCallback(() => {
    if (!SpeechRecognition || disabledRef.current || !sessionActiveRef.current || recognitionRef.current) return false

    let recognition
    try {
      recognition = new SpeechRecognition()
      recognition.lang = 'en-IN'
      recognition.interimResults = true
      recognition.continuous = true
      recognition.maxAlternatives = 1
    } catch {
      failSession('Voice recognition could not start in this browser. Typed questions are still available.')
      return false
    }

    recognition.onstart = () => {
      recognitionRef.current = recognition
      setIsListening(true)
      setIsWaiting(Boolean(displayRef.current))
    }

    recognition.onspeechstart = () => {
      setIsWaiting(false)
      setIsListening(true)
      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current)
    }

    recognition.onresult = (event) => {
      const { complete, interimText } = collectRecognitionText(event.results, committedRef.current)
      if (!complete) return
      displayRef.current = complete
      setTranscript(complete)
      setIsWaiting(!interimText)
      restartAttemptsRef.current = 0
      scheduleSilenceCompletion()
    }

    recognition.onspeechend = () => {
      if (sessionActiveRef.current && displayRef.current) setIsWaiting(true)
    }

    recognition.onerror = (event) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return
      const messages = {
        'not-allowed': 'Microphone access was blocked. Allow it in browser settings or type your question below.',
        'service-not-allowed': 'Voice recognition is disabled by this browser. Typed questions are still available.',
        'audio-capture': 'No working microphone was found. Check your device or use the text input.',
        network: 'Voice recognition lost its connection. You can continue in manual text mode.'
      }
      failSession(messages[event.error] || 'Voice recognition stopped unexpectedly. Please try again.')
    }

    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null
      setIsListening(false)
      if (finishingRef.current || !sessionActiveRef.current || disabledRef.current) return

      committedRef.current = cleanTranscript(displayRef.current)
      setIsWaiting(Boolean(committedRef.current))
      if (restartAttemptsRef.current >= MAX_RESTARTS) {
        failSession('The browser paused microphone recognition. Click the microphone to continue, or use the text input.')
        return
      }

      restartAttemptsRef.current += 1
      restartTimerRef.current = window.setTimeout(() => {
        restartTimerRef.current = null
        if (sessionActiveRef.current && !disabledRef.current) startEngineRef.current?.()
      }, 250)
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      return true
    } catch {
      recognitionRef.current = null
      failSession('The microphone could not restart automatically. Click it once to continue.')
      return false
    }
  }, [SpeechRecognition, failSession, scheduleSilenceCompletion])

  startEngineRef.current = startEngine

  const startListening = useCallback(() => {
    if (!isSupported || disabledRef.current) return false
    clearTimers()
    resetBuffer()
    finishingRef.current = false
    sessionActiveRef.current = true
    restartAttemptsRef.current = 0
    setIsSessionActive(true)
    return startEngineRef.current?.() ?? false
  }, [clearTimers, isSupported, resetBuffer])

  useEffect(() => {
    if (disabled && sessionActiveRef.current) stopListening({ discard: false })
  }, [disabled, stopListening])

  useEffect(() => () => {
    finishingRef.current = true
    sessionActiveRef.current = false
    clearTimers()
    try { recognitionRef.current?.abort() } catch { /* Component is already closing. */ }
  }, [clearTimers])

  return { isSupported, isListening, isSessionActive, isWaiting, transcript, startListening, stopListening, finishQuestion: finalizeQuestion }
}
