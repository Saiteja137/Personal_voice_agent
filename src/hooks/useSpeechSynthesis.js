import { useCallback, useEffect, useState } from 'react'

export function useSpeechSynthesis() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [rate, setRate] = useState(1.1)
  const [voices, setVoices] = useState([])

  useEffect(() => {
    if (!supported) return undefined
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      window.speechSynthesis.cancel()
    }
  }, [supported])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [supported])

  const speak = useCallback((text) => {
    if (!supported || !text) return
    try {
      window.speechSynthesis.cancel()
      const Utterance = window.SpeechSynthesisUtterance
      if (!Utterance) return
      const utterance = new Utterance(text)
      const maleVoicePattern = /\b(male|ravi|hemant|david|mark|guy|ryan|daniel|george|james|aaron|alex|fred|ralph|thomas|arthur|oliver)\b/i
      const englishVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith('en'))
      const preferred = englishVoices.find((voice) => voice.lang.toLowerCase() === 'en-in' && maleVoicePattern.test(voice.name))
        || englishVoices.find((voice) => maleVoicePattern.test(voice.name))
        || englishVoices.find((voice) => voice.lang.toLowerCase() === 'en-in')
        || englishVoices[0]
      if (preferred) utterance.voice = preferred
      utterance.lang = preferred?.lang || 'en-IN'
      utterance.rate = rate
      utterance.pitch = 1
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    } catch (speechError) {
      console.warn('Speech synthesis is unavailable:', speechError)
      setIsSpeaking(false)
    }
  }, [rate, supported, voices])

  return { isSupported: supported, isSpeaking, rate, setRate, speak, stop }
}
