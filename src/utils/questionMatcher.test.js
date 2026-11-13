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

  it('redirects unrelated questions', () => {
    expect(matchQuestion('What is the weather in Tokyo tomorrow?').match?.id).toBe('out_of_scope')
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

  const hrCases = [
    ['Why are you changing jobs?', 'why_move'],
    ['Why are you interested in this position?', 'why_position'],
    ['What do you know about our company?', 'company_knowledge'],
    ['Why do you want to work for our company?', 'why_company'],
    ['What are your expectations from your manager?', 'manager_expectations'],
    ['How do you handle difficult teammates?', 'difficult_teammates'],
    ['Are you comfortable working independently?', 'independent_work'],
    ['How do you manage work-life balance?', 'work_life_balance'],
    ['What would your manager say about you?', 'manager_description'],
    ['What is your greatest professional learning?', 'professional_learning'],
    ['What professional decision are you proud of?', 'proud_decision'],
    ['How do you stay motivated during repetitive work?', 'repetitive_work'],
    ['Why are you a good cultural fit?', 'cultural_fit'],
    ['What kind of projects excite you?', 'exciting_projects'],
    ['What would make you stay with a company long-term?', 'long_term_company'],
    ['What does professionalism mean to you?', 'professionalism'],
    ['What would you do if you disagreed with your manager?', 'disagree_manager'],
    ['How would you explain AI to a nontechnical person?', 'explain_ai_simple'],
    ['Why should we trust you with important responsibilities?', 'trust_responsibility'],
    ['Why did you choose Computer Science?', 'why_computer_science'],
    ['How do you handle failure?', 'handle_failure'],
    ['What is your notice period?', 'notice_period']
  ]

  it.each(hrCases)('matches HR question %s', (question, expected) => {
    expect(matchQuestion(question).match?.id).toBe(expected)
  })

  it.each([
    ['Do you know Apache Kafka?', 'Apache Kafka'],
    ['Have you worked with Snowflake?', 'Snowflake'],
    ['Do you have experience with AWS Bedrock?', 'AWS Bedrock'],
    ['Have you used Databricks?', 'Databricks'],
    ['Are you familiar with Go?', 'Go']
  ])('handles unknown skill %s', (question, technology) => {
    const result = matchQuestion(question)
    expect(result.match?.id).toBe('unknown_skill')
    expect(result.match?.answer).toContain(technology)
  })

  it.each(['Do you know Python?', 'Have you worked with FastAPI?', 'Are you familiar with LangGraph?'])('does not reject verified skill %s', (question) => {
    expect(matchQuestion(question).match?.id).not.toBe('unknown_skill')
    expect(matchQuestion(question).match).not.toBeNull()
  })

  it.each([
    "What's today's weather?",
    "Who won yesterday's cricket match?",
    'Tell me a joke',
    'What is the latest stock market price?'
  ])('redirects out-of-scope question %s', (question) => {
    expect(matchQuestion(question).match?.id).toBe('out_of_scope')
  })

  it.each([
    ['How did you build this AI assistant?', 'how_assistant_built'],
    ['What technologies did you use for this website?', 'how_assistant_built'],
    ['Is this powered by ChatGPT?', 'portfolio_assistant'],
    ['Is this a real generative AI chatbot?', 'portfolio_assistant']
  ])('explains assistant architecture for %s', (question, expected) => {
    expect(matchQuestion(question).match?.id).toBe(expected)
  })

  it('keeps intent ids unique and entries complete', () => {
    const ids = questionBank.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(questionBank.every((item) => item.question && item.answer && item.variations.length && item.keywords.length)).toBe(true)
  })
})
