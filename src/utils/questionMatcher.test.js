import { describe, expect, it } from 'vitest'
import questionBank from '../data/questionBank.json'
import { matchQuestion } from './questionMatcher'

describe('question matcher', () => {
  it('contains at least 70 reviewed intents', () => expect(questionBank.length).toBeGreaterThanOrEqual(70))

  const cases = [
    ['Could you introduce yourself?', 'about_yourself'],
    ['what is your greatest strength', 'biggest_strength'],
    ['where do you want to improve', 'growth_areas'],
    ['why are you a good fit for this role', 'why_hire'],
    ['describe the ServiceNow request intelligence solution', 'request_project'],
    ['how does the GitLab pipeline investigator work', 'cicd_project'],
    ['tell me about your budgeting app', 'finance_project'],
    ['what drives you', 'motivation'],
    ['where will you be in five years', 'five_years'],
    ['how do you pick up unfamiliar tools', 'learn_technology'],
    ['how do you stay calm when stuck', 'handle_challenges'],
    ['explain retrieval augmented generation', 'rag'],
    ['how should an agent call external functions', 'tool_calling'],
    ['why keep a human in control', 'human_in_loop'],
    ['how do you prevent made up answers', 'hallucinations'],
    ['describe your troubleshooting process', 'debugging'],
    ['how do you decide what task comes first', 'prioritization'],
    ['can you explain complex ideas to business users', 'communication'],
    ['how do you secure an llm app', 'security'],
    ['is this website powered by a generative model', 'portfolio_assistant'],
    ['what compensation package do you expect', 'salary']
  ]

  it.each(cases)('matches %s', (question, expected) => {
    expect(matchQuestion(question).match?.id).toBe(expected)
  })

  it('rejects unrelated questions', () => {
    expect(matchQuestion('What is the weather in Tokyo tomorrow?').match).toBeNull()
  })
})
