export const cleanTranscript = (value = '') => String(value).replace(/\s+/g, ' ').trim()

export const joinTranscript = (...parts) => cleanTranscript(parts.filter(Boolean).join(' '))

export function collectRecognitionText(results, committed = '') {
  let finalText = ''
  let interimText = ''

  for (let index = 0; index < results.length; index += 1) {
    const result = results[index]
    const value = result?.[0]?.transcript || ''
    if (result.isFinal) finalText = joinTranscript(finalText, value)
    else interimText = joinTranscript(interimText, value)
  }

  return {
    finalText,
    interimText,
    complete: joinTranscript(committed, finalText, interimText)
  }
}
