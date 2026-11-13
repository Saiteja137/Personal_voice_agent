import Fuse from 'fuse.js'
import questionBank from '../data/questionBank.json'
import { expandWithSynonyms, normalizeText, tokenize } from './textNormalizer'

const records = questionBank.flatMap((item) => [item.question, ...item.variations].map((phrase) => ({
  id: item.id,
  phrase,
  normalized: expandWithSynonyms(phrase)
})))

const fuse = new Fuse(records, {
  keys: ['normalized'],
  includeScore: true,
  threshold: 0.58,
  ignoreLocation: true,
  minMatchCharLength: 2
})

const byId = new Map(questionBank.map((item) => [item.id, item]))

function keywordScore(query, item) {
  const normalized = normalizeText(query)
  const queryTokens = tokenize(query)
  const terms = [...item.keywords, item.question, ...item.variations].map(normalizeText)
  let score = 0
  terms.forEach((term, index) => {
    if (!term) return
    if (normalized === term) score += index === 0 ? 1.1 : 0.9
    else if (normalized.includes(term) || term.includes(normalized)) score += index === 0 ? 0.62 : 0.42
    const termTokens = tokenize(term)
    const overlap = [...queryTokens].filter((token) => termTokens.has(token)).length
    score += (overlap / Math.max(queryTokens.size, termTokens.size, 1)) * (index < item.keywords.length ? 0.48 : 0.25)
  })
  return Math.min(score, 1.4)
}

export function matchQuestion(query, context = {}) {
  const normalized = normalizeText(query)
  if (!normalized || normalized.length < 2) return { match: null, confidence: 0, reason: 'empty' }

  const fuzzyById = new Map()
  fuse.search(expandWithSynonyms(query), { limit: 18 }).forEach((result) => {
    const score = 1 - (result.score ?? 1)
    fuzzyById.set(result.item.id, Math.max(score, fuzzyById.get(result.item.id) ?? 0))
  })

  const ranked = questionBank.map((item) => {
    const fuzzy = fuzzyById.get(item.id) ?? 0
    const keywords = keywordScore(query, item)
    const contextBoost = context.lastCategory === item.category && /\b(it|that|this|more|project)\b/.test(normalized) ? 0.08 : 0
    return { item, score: (fuzzy * 0.52) + (keywords * 0.48) + contextBoost, fuzzy, keywords }
  }).sort((a, b) => b.score - a.score)

  const best = ranked[0]
  const runnerUp = ranked[1]
  const margin = best.score - runnerUp.score
  const confidence = Math.max(0, Math.min(1, best.score * 0.88 + Math.max(0, margin) * 0.2))
  const accepted = best.score >= 0.39 && (confidence >= 0.36 || best.keywords >= 0.45)

  return {
    match: accepted ? byId.get(best.item.id) : null,
    confidence,
    candidates: ranked.slice(0, 3).map(({ item, score }) => ({ id: item.id, question: item.question, score })),
    reason: accepted ? 'matched' : 'low-confidence'
  }
}

export const fallbackResponse = "I don't have a reliable answer for that in my reviewed profile yet. Try asking about my AI projects, technical skills, strengths, career goals, or how I approach engineering problems."

export function getQuestionById(id) {
  return byId.get(id)
}
