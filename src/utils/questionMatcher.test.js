import { describe, expect, it } from 'vitest'
import questionBank from '../data/questionBank.json'
import { matchQuestion } from './questionMatcher'

describe('question matcher', () => {
  it('contains at least 70 reviewed intents', () => expect(questionBank.length).toBeGreaterThanOrEqual(70))

  const careerCases = [
    ["I have a question. I want to know about Sai Teja's career.", 'career_background'],
    ["Tell me about Sai Teja's career.", 'career_background'],
    ["Can you explain his professional journey?", 'career_background'],
    ["What is Sai Teja's professional background?", 'career_background'],
    ['Tell me about your career.', 'career_background'],
    ['What is your career journey?', 'career_background'],
    ['What does Sai Teja do professionally?', 'career_background'],
    ['What kind of work has Sai Teja done?', 'career_background'],
    ['What is his work experience?', 'professional_experience'],
    ['What is your professional experience?', 'professional_experience'],
    ['What are your career goals?', 'career_goals'],
    ['Why did you choose an AI career?', 'why_ai_career']
  ]

  it.each(careerCases)('routes career question %s', (question, expected) => {
    const result = matchQuestion(question)
    expect(result.match?.id).toBe(expected)
    expect(result.match?.id).not.toBe('langchain')
  })

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

  it('keeps a specific LangChain question technical', () => {
    expect(matchQuestion('How have you used LangChain?').match?.id).toBe('langchain')
  })

  it.each([
    ['What should we know about your life story?', 'life_story'],
    ['What is your number one superpower?', 'superpower'],
    ['What are the top three areas you want to grow in?', 'growth_areas'],
    ['What misconception do coworkers have about you?', 'coworker_misconception'],
    ['How do you push your boundaries and limits?', 'push_boundaries'],
    ['What is your biggest weakness?', 'biggest_weakness'],
    ['Tell me about your AI projects', 'all_projects'],
    ['What motivates you professionally?', 'motivation'],
    ['uh uh please tell tell me about your request management project', 'request_project']
  ])('preserves intent boundaries for %s', (question, expected) => {
    expect(matchQuestion(question).match?.id).toBe(expected)
  })

  it.each([
    ['How have you deployed AI systems to production?', 'deployment_experience'],
    ['Tell me about your AI deployment experience', 'deployment_experience'],
    ['What is the Agent Skills Framework and Sandbox?', 'skills_framework'],
    ['How did you generate executable agent skills?', 'skills_framework'],
    ['What measurable impact have you delivered?', 'impact_metrics'],
    ['Which certifications do you have?', 'certifications'],
    ['How have you used DeepEval?', 'evaluation_tools'],
    ['How did you monitor your AI agents?', 'monitoring_tools']
  ])('matches resume-supported recruiter question %s', (question, expected) => {
    expect(matchQuestion(question).match?.id).toBe(expected)
  })

  it.each([
    'Can you tell me more?',
    'I have a question about something',
    'What is the best option?'
  ])('rejects ambiguous question %s', (question) => {
    expect(matchQuestion(question).match).toBeNull()
  })
})
