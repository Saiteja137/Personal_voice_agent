const contractions = {
  "what's": 'what is', "who's": 'who is', "how's": 'how is', "you're": 'you are',
  "you've": 'you have', "i'm": 'i am', "can't": 'cannot', "don't": 'do not',
  "i'd": 'i would', "he's": 'he is', "she's": 'she is'
}

const fillerPhrases = [
  'i have a question', 'i have one question', 'i want to know', 'i would like to know',
  'could you please', 'would you please', 'can you please', 'could you', 'would you',
  'can you', 'please', 'kindly'
]

const ignoredTokens = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did',
  'have', 'has', 'had', 'i', 'me', 'my', 'you', 'your', 'yours', 'he', 'him', 'his', 'she',
  'her', 'hers', 'they', 'them', 'their', 'we', 'our', 'it', 'its', 'this', 'that', 'to', 'of',
  'for', 'on', 'in', 'at', 'and', 'or', 'with', 'about', 'question', 'know', 'tell', 'explain'
])

const synonymAliases = [
  ['career', ['professional journey', 'career journey', 'career background', 'professional background', 'work history', 'employment history']],
  ['experience', ['professional experience', 'work experience', 'job experience']],
  ['role', ['job', 'position', 'opportunity']],
  ['project', ['projects', 'application', 'solution']],
  ['skill', ['skills', 'ability', 'expertise']],
  ['learn', ['learning', 'study', 'upskill']],
  ['challenge', ['problem', 'obstacle', 'difficulty']],
  ['coworker', ['colleague', 'teammate']],
  ['ai', ['artificial intelligence']],
  ['genai', ['generative ai']],
  ['rag', ['retrieval augmented generation']],
  ['cicd', ['continuous integration continuous deployment']]
]

const intentAliases = [
  ['finance', ['budget', 'budgeting', 'financial planning', 'finance planner']],
  ['oversight', ['human control', 'human approval', 'human oversight', 'human in the loop', 'humans approve', 'people in control']],
  ['debug', ['debugging', 'troubleshoot', 'troubleshooting', 'root cause']],
  ['priority', ['prioritize', 'prioritization', 'task comes first', 'what to do first', 'what first']],
  ['communication', ['communicate', 'explain complex', 'technical ideas', 'non technical', 'business users']],
  ['assistant', ['voice assistant', 'this website', 'website powered', 'this assistant', 'this bot', 'using an llm', 'generative model']],
  ['growth', ['grow', 'growth areas', 'improve', 'improvement', 'developing']]
]

export function normalizeText(input = '') {
  let text = String(input).toLowerCase().trim()
  Object.entries(contractions).forEach(([from, to]) => { text = text.replaceAll(from, to) })
  text = text
    .replace(/ci\s*[/&-]?\s*cd/g, 'cicd')
    .replace(/service\s+now/g, 'servicenow')
    .replace(/lang\s+graph/g, 'langgraph')
    .replace(/lang\s+chain/g, 'langchain')
    .replace(/sai\s+teja(?:\s+atkapuram)?(?:'s|s)?/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/-/g, ' ')

  fillerPhrases.forEach((phrase) => { text = text.replaceAll(phrase, ' ') })

  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  return words.filter((word, index) => index === 0 || word !== words[index - 1]).join(' ')
}

export function meaningfulTokens(input = '') {
  const normalized = normalizeText(input)
  return normalized.split(' ').filter((word) => word.length > 1 && !ignoredTokens.has(word))
}

export function semanticTokens(input = '') {
  const normalized = normalizeText(input)
  const tokens = new Set(meaningfulTokens(normalized))
  ;[...synonymAliases, ...intentAliases].forEach(([canonical, aliases]) => {
    if (tokens.has(canonical) || aliases.some((alias) => normalized.includes(alias))) tokens.add(canonical)
  })
  return [...tokens]
}

export function expandWithSynonyms(input = '') {
  const normalized = normalizeText(input)
  const additions = []
  synonymAliases.forEach(([canonical, aliases]) => {
    if (normalized.includes(canonical) || aliases.some((alias) => normalized.includes(alias))) additions.push(canonical)
  })
  return [...new Set([normalized, ...additions])].join(' ').trim()
}

export function tokenize(input = '') {
  return new Set(meaningfulTokens(expandWithSynonyms(input)))
}
