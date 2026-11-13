import { describe, expect, it } from 'vitest'
import { collectRecognitionText } from './speechTranscript'

const result = (text, isFinal) => Object.assign([{ transcript: text }], { isFinal })

describe('speech transcript accumulation', () => {
  it('combines final and interim segments in order', () => {
    const value = collectRecognitionText([
      result('Can you explain your', true),
      result('Agentic AI project', false)
    ])
    expect(value.complete).toBe('Can you explain your Agentic AI project')
  })

  it('uses cumulative browser results without duplicating prior final words', () => {
    const first = collectRecognitionText([result('Can you explain your', true)])
    const update = collectRecognitionText([
      result('Can you explain your', true),
      result('request management service', true)
    ])
    expect(first.complete).toBe('Can you explain your')
    expect(update.complete).toBe('Can you explain your request management service')
  })

  it('preserves committed text across a browser recognition restart', () => {
    const restarted = collectRecognitionText(
      [result('request management service project', true)],
      'Can you explain your Agentic AI'
    )
    expect(restarted.complete).toBe('Can you explain your Agentic AI request management service project')
  })
})
