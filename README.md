# Sai Teja AI — Personal Voice Assistant

An interactive personal portfolio that answers recruiter and interview questions in Sai Teja Atkapuram's voice. It combines a reviewed personal knowledge base, fuzzy intent matching, and browser-native speech APIs in a polished React interface.

This project is intentionally **not presented as a generative LLM**. It is a personalized, knowledge-based assistant: every answer is stored, editable, and grounded in the supplied profile. It uses no paid AI API, backend, database, account, API key, or environment variable.

## Highlights

- Browser speech recognition with explicit start/stop controls and `en-IN` preference
- Browser speech synthesis with natural English voice selection, replay, stop, and speed control
- Typed fallback on every browser
- 130+ recruiter-ready question intents with multiple variations
- Hybrid matching: text normalization, synonym expansion, keyword weighting, and Fuse.js fuzzy search
- Low-confidence fallback instead of confidently answering unrelated questions
- Explicit confirmation-safe answers for unverified personal or behavioral claims
- Conversation history, live transcript, suggestions, project shortcuts, and clear states
- Responsive premium dark interface with reduced-motion support and keyboard accessibility
- Static deployment to Netlify or Vercel with no secrets

## Technology

- React 19 + Vite 7
- JavaScript
- Tailwind CSS 4 (Vite plugin) plus a custom design layer
- Framer Motion, Lucide React, Fuse.js, Web Speech API, and Vitest

## Architecture

```text
src/
├── components/             UI sections and conversation components
├── data/
│   ├── personalData.json   Authoritative public professional profile
│   └── questionBank.json   Editable intents, variations, keywords, and answers
├── hooks/                  Browser recognition and synthesis
├── utils/                  Normalization, matching, response handling, and tests
├── App.jsx
├── index.css
└── main.jsx
```

The matcher normalizes natural speech and technical spellings, expands relevant synonyms, searches questions and variations through Fuse.js, and combines fuzzy relevance with weighted keyword overlap. It returns a reviewed answer only above the confidence threshold; otherwise it uses a neutral fallback.

## Run locally

Requires a current Node.js LTS release.

```bash
npm install
npm run dev
```

Production checks:

```bash
npm test
npm run build
npm run preview
```

The production output is generated in `dist/`.

> On Windows, if PowerShell blocks `npm.ps1`, run `npm.cmd install`, `npm.cmd test`, and `npm.cmd run build`.

## Edit profile and answers

Edit [`src/data/personalData.json`](src/data/personalData.json) to update the public profile, skills, project descriptions, objectives, and career goal. Keep it suitable for a public portfolio.

Edit [`src/data/questionBank.json`](src/data/questionBank.json) to change interview answers or add intents:

```json
{
  "id": "biggest_strength",
  "category": "personality",
  "question": "What is your biggest strength?",
  "variations": ["What are your strengths?"],
  "keywords": ["strength", "good at"],
  "answer": "My biggest strength is structured problem-solving...",
  "requiresConfirmation": false
}
```

For a new intent, use a unique ID, realistic spoken variations, distinctive multi-word keywords, and a grounded first-person answer. Set `requiresConfirmation: true` for any unverified opinion, incident, metric, preference, or personal claim. Add representative cases to `src/utils/questionMatcher.test.js` and run `npm test`.

## Voice behavior and compatibility

Recognition starts only after a visitor clicks a microphone control. Spoken segments are buffered across brief pauses and submitted after approximately three seconds of silence, or immediately with **Finish Question**. Optional continuous conversation mode resumes listening after the spoken answer, while manual microphone mode remains the default. Recognition is always disabled while the assistant speaks, preventing feedback capture. Permission, no-speech, and network errors never disable typed questions.

- Speech synthesis has broad support in current browsers.
- Speech recognition varies and works best in current Chrome/Chromium browsers; some implementations use a browser-vendor speech service.
- Firefox and some Safari versions may not expose compatible recognition.
- Available voices vary by operating system and browser.
- Microphone access requires HTTPS in production or `localhost` during development.
- Text matching and answers are local and require no AI network service.

## Test checklist

The automated suite covers 21 paraphrases, mandatory profile areas, all projects, confirmation-safe topics, and unrelated-question fallback.

```bash
npm test
```

Manual browser checks:

- [ ] Allow microphone access and ask “Tell me about yourself.”
- [ ] Stop listening, restart it, and deny permission once to verify error handling.
- [ ] Ask each mandatory assignment question and each featured project question.
- [ ] Replay a response, adjust speed, and stop speech.
- [ ] Verify recognition cannot start while speech synthesis is active.
- [ ] Ask an unrelated question and verify the neutral fallback.
- [ ] Complete several turns and clear the conversation.
- [ ] Test keyboard-only navigation, visible focus, and reduced motion.
- [ ] Test narrow mobile, tablet, and desktop layouts.
- [ ] Test the deployed HTTPS URL in Chrome/Edge and a browser without recognition.

## Personal Answers Review Checklist

These intents are deliberately marked `requiresConfirmation: true`. Until reviewed, the assistant labels the text as a suggestion or declines to invent a fact.

- [ ] `growth_areas` — confirm the three desired growth areas
- [ ] `biggest_weakness` — confirm or replace the suggested communication weakness
- [ ] `coworker_misconception` — confirm or replace the suggested interpretation
- [ ] `leadership_potential` — add only verified leadership examples
- [ ] `conflict` — add a real conflict or disagreement example
- [ ] `failure_story` — add a real mistake, response, and lesson
- [ ] `achievement` — add a verified accomplishment and evidence
- [ ] `pressure` — confirm the approach or add a real incident
- [ ] `work_environment` — confirm team and culture preferences
- [ ] `project_challenge` — add a specific real technical challenge
- [ ] `favorite_project` — confirm a genuine preference
- [ ] `contact` — add a public professional contact only if desired
- [ ] `availability` — add current availability or notice period
- [ ] `salary` — optionally define a response strategy
- [ ] `relocation` — confirm location, remote-work, and relocation preferences
- [ ] `why_move` — confirm the reason for seeking a new opportunity

Also review any future response involving childhood, family, employers, coworker opinions, production deployment, ownership, leadership, conflict, failure, achievements, financial expectations, or performance metrics.

## Deploy free to Netlify

The included `netlify.toml` uses `npm run build` and publishes `dist`.

### Netlify Drop

1. Run `npm install`.
2. Run `npm run build`.
3. Open <https://app.netlify.com/drop>.
4. Upload the generated `dist` folder.
5. Open the public HTTPS Netlify URL.
6. Test text, microphone permission, recognition, and synthesis on the deployed site.

For Git-based deployment, import the repository in Netlify. The build settings are read from `netlify.toml`. No environment variables are required.

## Deploy free to Vercel

1. Push the project to a Git repository.
2. Import it at <https://vercel.com/new>.
3. Confirm the build command is `npm run build` and output directory is `dist`.
4. Deploy and test voice permissions on the HTTPS URL.

The included `vercel.json` preserves static route behavior.

## Troubleshooting

**Microphone unavailable:** The browser does not expose compatible speech recognition. Use typed questions or current Chrome/Edge.

**Permission denied:** Allow microphone access in site settings, reload, and click the microphone again.

**Recognition network error:** Some implementations depend on a vendor service. Typed matching continues to work locally.

**Wrong answer selected:** Add the real paraphrase to the intended intent, add a distinctive keyword phrase, and add a regression test. Avoid globally weakening the threshold.

**Unexpected voice:** The app prefers `en-IN`, then another installed English voice. The device controls availability.

## Privacy and limitations

Personal answers are public static assets in the built site, so include only portfolio-appropriate information. The assistant cannot answer beyond its reviewed knowledge bank, learn from conversations, or reason like a generative model. That boundary keeps answers editable, predictable, inexpensive, and honest.
