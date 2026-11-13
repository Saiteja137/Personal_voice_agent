import { fallbackResponse, matchQuestion } from './questionMatcher'

export function createResponse(question, context = {}) {
  const result = matchQuestion(question, context)
  if (!result.match) return { answer: fallbackResponse, intent: null, category: null, confidence: result.confidence }
  return {
    answer: result.match.answer,
    intent: result.match.id,
    category: result.match.category,
    requiresConfirmation: result.match.requiresConfirmation,
    confidence: result.confidence
  }
}
