const suggestions = [
  'Tell me about yourself',
  "What's your biggest superpower?",
  'What are your top three growth areas?',
  'Tell me about your AI projects',
  'Why should we hire you?',
  'How do you push your limits?'
]

export default function QuestionSuggestions({ onSelect }) {
  return <div className="suggestions"><span>Try asking</span><div>{suggestions.map((question) => <button key={question} onClick={() => onSelect(question)}>{question}</button>)}</div></div>
}
