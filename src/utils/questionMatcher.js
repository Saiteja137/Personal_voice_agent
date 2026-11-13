import Fuse from 'fuse.js'
import questionBank from '../data/questionBank.json'
import personalData from '../data/personalData.json'
import { meaningfulTokens, normalizeText, semanticTokens } from './textNormalizer'

const byId = new Map(questionBank.map((item) => [item.id, item]))
const records = questionBank.flatMap((item) => [item.question, ...item.variations].map((phrase) => ({
  id: item.id,
  normalized: normalizeText(phrase)
})))

const fuse = new Fuse(records, {
  keys: ['normalized'],
  includeScore: true,
  threshold: 0.46,
  ignoreLocation: true,
  minMatchCharLength: 3
})

const knownSkillEntries = Object.values(personalData.skills).flat().map((skill) => ({
  name: skill,
  normalized: normalizeText(skill)
})).sort((a, b) => b.normalized.length - a.normalized.length)

const knownSkillAliases = [
  ['k8s', 'Kubernetes'], ['aks', 'Azure Kubernetes Service'], ['genai', 'Generative AI'],
  ['llm', 'Large Language Models'], ['rest api', 'REST APIs'], ['gitlab api', 'GitLab REST API'],
  ['postgres', 'PostgreSQL'], ['hugging face', 'Hugging Face'], ['open telemetry', 'OpenTelemetry']
]

const priorityIntents = [
  { id: 'why_move', patterns: [/\b(?:job change|change (?:my |your )?job|another opportunity|leave (?:my |your )?(?:current )?company|reason for changing|career move)\b/] },
  { id: 'notice_period', patterns: [/\bnotice period\b/, /\bhow soon .* join\b/, /\bjoining (?:date|availability)\b/] },
  { id: 'how_assistant_built', patterns: [/\b(?:build|built|develop).*(?:assistant|website|voice bot)\b/, /\btechnology stack.*(?:assistant|website|project)\b/, /\barchitecture.*(?:assistant|voice)\b/] },
  { id: 'portfolio_assistant', patterns: [/\b(?:real )?generative ai (?:chatbot|assistant)\b/, /\bpowered by (?:chatgpt|openai|gemini|an? llm)\b/, /\b(?:does|is).*(?:assistant|chatbot).*(?:use|using).*(?:llm|chatgpt)\b/] },
  { id: 'human_in_loop', patterns: [/\bhuman (?:in the loop|control|approval|oversight)\b/, /\bkeep (?:a )?human in control\b/, /\bpeople in control\b/] },
  { id: 'career_goals', patterns: [/\bcareer goals?\b/, /\bprofessional goals?\b/, /\bcareer ambitions?\b/] },
  { id: 'five_years', patterns: [/\bfive year/, /\blong term vision\b/] },
  { id: 'why_ai_career', patterns: [/\bwhy (?:did|do|choose|pursue).*(?:ai|artificial intelligence).*(?:career|engineering)\b/, /\bwhy (?:ai|artificial intelligence) career\b/] },
  { id: 'professional_experience', patterns: [/\bprofessional experience\b/, /\bwork experience\b/, /\bjob experience\b/, /\bwhere .* worked\b/, /\bemployment history\b/] },
  { id: 'career_background', patterns: [/\bcareer\b/, /\bprofessional journey\b/, /\bprofessional background\b/, /\bcareer journey\b/, /\bwork history\b/, /\bdo professionally\b/, /\bkind of work\b/] }
]

const outOfScopePatterns = [
  /\b(?:weather|temperature|forecast)\b/, /\b(?:cricket|football|match score|who won)\b/,
  /\b(?:tell|make) (?:me )?a joke\b/, /\b(?:president|prime minister) of\b/,
  /\b(?:stock|share|crypto) (?:market )?(?:price|quote)\b/, /\b(?:homework|math problem|solve this equation)\b/,
  /\b(?:today's|todays|latest|yesterday's|yesterdays) (?:news|score|price|result)\b/
]

const skillQuestionPatterns = [
  /\bdo you know\s+(.+)/,
  /\bhave you (?:worked with|used|worked on)\s+(.+)/,
  /\bdo you have (?:any )?experience with\s+(.+)/,
  /\bare you familiar with\s+(.+)/,
  /\bcan you work with\s+(.+)/
]

function dynamicIntent(id, answer) {
  const base = byId.get(id)
  return base ? { ...base, answer } : null
}

function detectSkillQuestion(normalized) {
  const match = skillQuestionPatterns.map((pattern) => normalized.match(pattern)).find(Boolean)
  if (!match) return null
  const requested = match[1].replace(/\b(?:extensively|professionally|before|yet)\b/g, ' ').replace(/\s+/g, ' ').trim()
  const containsPhrase = (value, phrase) => new RegExp(`(?:^|\\s)${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|\\s)`).test(value)
  const alias = knownSkillAliases.find(([term]) => containsPhrase(requested, normalizeText(term)))
  const direct = knownSkillEntries.find((skill) => containsPhrase(requested, skill.normalized) || (requested.length > 3 && containsPhrase(skill.normalized, requested)))
  return { requested, knownName: alias?.[1] || direct?.name || null }
}

const categoryPatterns = [
  ['growth', /\b(weakness|grow|growth area|improve|improvement|developing)\b/],
  ['personality', /\b(strength|superpower|personality|good at|work ethic)\b/],
  ['projects', /\b(project|portfolio|built|smartpdf|pipeline investigator|request management|finance planner|budgeting|sla)\b/],
  ['career', /\b(career|professional|professionally|work experience|job experience|employer|worked|role|internship)\b/],
  ['values', /\b(values|principles|success mean|innovation mean)\b/],
  ['responsible-ai', /\b(responsible ai|ethics|privacy|hallucination|trustworthy|human in the loop|human control|human approval)\b/],
  ['technical', /\b(langchain|langgraph|fastapi|python|azure|rag|retrieval|vector|docker|kubernetes|api|tool calling|agentic ai|generative ai|database|react|typescript)\b/]
]

function detectPriorityIntent(normalized) {
  for (const rule of priorityIntents) {
    if (rule.patterns.some((pattern) => pattern.test(normalized)) && byId.has(rule.id)) return rule.id
  }
  return null
}

function detectCategory(normalized) {
  const technologyMatch = categoryPatterns.at(-1)[1].test(normalized)
  if (technologyMatch) return 'technical'
  return categoryPatterns.find(([, pattern]) => pattern.test(normalized))?.[0] ?? null
}

function phraseEvidence(query, phrase) {
  const normalizedPhrase = normalizeText(phrase)
  if (!normalizedPhrase) return { exact: 0, containment: 0, overlap: 0 }
  if (query === normalizedPhrase) return { exact: 1, containment: 1, overlap: 1 }

  const queryTokens = new Set(semanticTokens(query))
  const phraseTokens = new Set(semanticTokens(normalizedPhrase))
  const shared = [...queryTokens].filter((token) => phraseTokens.has(token)).length
  const precision = shared / Math.max(queryTokens.size, 1)
  const recall = shared / Math.max(phraseTokens.size, 1)
  const overlap = shared ? (2 * precision * recall) / Math.max(precision + recall, Number.EPSILON) : 0
  const containment = normalizedPhrase.length >= 4 && (query.includes(normalizedPhrase) || normalizedPhrase.includes(query)) ? 1 : 0
  return { exact: 0, containment, overlap }
}

function scoreItem(query, item, fuzzy, detectedCategory) {
  const phraseScores = [item.question, ...item.variations].map((phrase) => phraseEvidence(query, phrase))
  const keywordScores = item.keywords.map((keyword) => phraseEvidence(query, keyword))
  const exact = Math.max(...phraseScores.map((score) => score.exact), 0)
  const containment = Math.max(...phraseScores.map((score) => score.containment), 0)
  const phraseOverlap = Math.max(...phraseScores.map((score) => score.overlap), 0)
  const keywordContainment = Math.max(...keywordScores.map((score) => score.containment), 0)
  const keywordOverlap = Math.max(...keywordScores.map((score) => score.overlap), 0)
  const lexicalEvidence = Math.max(exact, containment * 0.9, phraseOverlap, keywordContainment, keywordOverlap)
  const categoryAdjustment = !detectedCategory ? 0 : item.category === detectedCategory ? 0.12 : -0.1
  const score = (exact * 0.32) + (containment * 0.18) + (phraseOverlap * 0.2) +
    (keywordContainment * 0.16) + (keywordOverlap * 0.08) + (fuzzy * 0.06) + categoryAdjustment
  return { score: Math.max(0, score), lexicalEvidence, exact, keywordContainment, phraseOverlap }
}

export function matchQuestion(query, context = {}) {
  const normalized = normalizeText(query)
  const queryTokens = meaningfulTokens(normalized)
  if (!normalized || !queryTokens.length) return { match: null, confidence: 0, reason: 'empty' }

  if (outOfScopePatterns.some((pattern) => pattern.test(normalized))) {
    const match = byId.get('out_of_scope')
    return { match, confidence: 0.99, candidates: [{ id: match.id, question: match.question, score: 0.99 }], reason: 'out-of-scope' }
  }

  const skillQuestion = detectSkillQuestion(normalized)
  if (skillQuestion && !skillQuestion.knownName) {
    const generic = /\b(?:technology|tool|skill|stack)\b/.test(skillQuestion.requested)
    const label = generic ? 'that technology' : skillQuestion.requested.replace(/\b\w/g, (letter) => letter.toUpperCase())
    const answer = `I haven't worked extensively with ${label} yet, so I would not want to overstate my experience. I am comfortable learning new tools by understanding the fundamentals, exploring practical examples, and applying them through hands-on implementation. I would be happy to develop that skill if the role requires it.`
    const match = dynamicIntent('unknown_skill', answer)
    return { match, confidence: 0.98, candidates: [{ id: match.id, question: match.question, score: 0.98 }], reason: 'unknown-skill' }
  }

  const priorityId = detectPriorityIntent(normalized)
  if (priorityId) {
    const match = byId.get(priorityId)
    return {
      match,
      confidence: 0.97,
      candidates: [{ id: match.id, question: match.question, score: 0.97 }],
      reason: 'strong-intent'
    }
  }

  const fuzzyById = new Map()
  fuse.search(normalized, { limit: 20 }).forEach((result) => {
    const score = 1 - (result.score ?? 1)
    fuzzyById.set(result.item.id, Math.max(score, fuzzyById.get(result.item.id) ?? 0))
  })

  const detectedCategory = detectCategory(normalized)
  const ranked = questionBank.map((item) => {
    const evidence = scoreItem(normalized, item, fuzzyById.get(item.id) ?? 0, detectedCategory)
    const contextBoost = context.lastCategory === item.category && /\b(more|project|that|this)\b/.test(normalized) ? 0.05 : 0
    return { item, ...evidence, score: evidence.score + contextBoost }
  }).sort((a, b) => b.score - a.score)

  const best = ranked[0]
  const runnerUp = ranked[1]
  const margin = best.score - runnerUp.score
  const confidence = Math.max(0, Math.min(1, best.score + Math.max(0, margin) * 0.15))
  const hasStrongEvidence = best.exact === 1 || best.keywordContainment === 1 || best.phraseOverlap >= 0.5 || best.lexicalEvidence >= 0.62
  const accepted = best.score >= 0.22 && confidence >= 0.24 && hasStrongEvidence && margin >= 0.015

  const knownSkillFallback = !accepted && skillQuestion?.knownName
    ? dynamicIntent('known_skill', `${skillQuestion.knownName} is part of my verified skill set. My depth varies by tool and project, so I would describe the specific context honestly rather than imply equal expertise across every technology I have used.`)
    : null

  return {
    match: accepted ? best.item : knownSkillFallback,
    confidence,
    candidates: ranked.slice(0, 3).map(({ item, score }) => ({ id: item.id, question: item.question, score })),
    reason: accepted ? 'matched' : knownSkillFallback ? 'known-skill' : 'low-confidence'
  }
}

export const fallbackResponse = "I'd be happy to share more. Could you clarify whether you're asking about my career journey, technical skills, projects, or professional experience?"

export function getQuestionById(id) {
  return byId.get(id)
}
