const contractions = {
  "what's": 'what is', "who's": 'who is', "how's": 'how is', "you're": 'you are',
  "you've": 'you have', "i'm": 'i am', "can't": 'cannot', "don't": 'do not'
}

export const synonymGroups = [
  ['job', 'role', 'position', 'opportunity'],
  ['project', 'application', 'solution', 'system'],
  ['skill', 'ability', 'strength', 'expertise'],
  ['learn', 'study', 'upskill', 'understand'],
  ['challenge', 'problem', 'obstacle', 'difficulty'],
  ['coworker', 'colleague', 'teammate'],
  ['artificial intelligence', 'ai'],
  ['generative ai', 'genai'],
  ['retrieval augmented generation', 'rag'],
  ['continuous integration continuous deployment', 'cicd'],
  ['five year', 'long term', 'future']
]

export function normalizeText(input = '') {
  let text = input.toLowerCase().trim()
  Object.entries(contractions).forEach(([from, to]) => { text = text.replaceAll(from, to) })
  return text
    .replace(/ci\s*[/&-]?\s*cd/g, 'cicd')
    .replace(/service\s+now/g, 'servicenow')
    .replace(/lang\s+graph/g, 'langgraph')
    .replace(/lang\s+chain/g, 'langchain')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\b(please|could you|would you|can you|i want to know|tell me|about|kindly)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function expandWithSynonyms(input = '') {
  const normalized = normalizeText(input)
  const additions = []
  synonymGroups.forEach((group) => {
    if (group.some((term) => normalized.includes(term))) additions.push(...group)
  })
  return `${normalized} ${additions.join(' ')}`.trim()
}

export function tokenize(input = '') {
  return new Set(expandWithSynonyms(input).split(' ').filter((word) => word.length > 2))
}
