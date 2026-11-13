import { useCallback, useEffect, useRef, useState } from 'react'

export function useSpeechRecognition({ onResult, onError, disabled = false } = {}) {
  const recognitionRef = useRef(null)
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
  const isSupported = Boolean(SpeechRecognition)

  useEffect(() => () => recognitionRef.current?.abort(), [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const startListening = useCallback(() => {
    if (!SpeechRecognition || disabled || isListening) return
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => { setIsListening(true); setInterimTranscript('') }
    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const value = event.results[i][0].transcript
        if (event.results[i].isFinal) final += value
        else interim += value
      }
      setInterimTranscript(interim || final)
      if (final.trim()) onResult?.(final.trim())
    }
    recognition.onerror = (event) => {
      setIsListening(false)
      const messages = {
        'not-allowed': 'Microphone access was blocked. Allow it in your browser settings or type your question below.',
        'no-speech': 'I did not hear a question. Try again or use the text input.',
        network: 'Voice recognition could not connect. Typed questions still work offline.'
      }
      onError?.(messages[event.error] || 'Voice recognition stopped unexpectedly. You can still type your question.')
    }
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    try { recognition.start() } catch { onError?.('The microphone is already active. Please try again.') }
  }, [SpeechRecognition, disabled, isListening, onError, onResult])

  return { isSupported, isListening, interimTranscript, startListening, stopListening }
}
