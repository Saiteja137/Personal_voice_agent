# Meet Sai Teja AI

Sai Teja's personal AI voice assistant is an interactive portfolio designed for recruiters and hiring teams. Visitors can ask questions by voice or text and receive clear, pre-reviewed answers about Sai Teja Atkapuram's experience, skills, projects, achievements, and career goals.

## What the assistant offers

- 160 curated recruiter and interview question intents
- Voice and text-based questions
- Male English voice preference with adjustable speaking speed
- Answers grounded in Sai Teja's professional profile and resume
- Project, technical, behavioral, and HR interview coverage
- Safe fallback for unsupported or unrelated questions
- Responsive interface for desktop and mobile devices
- No account, API key, paid AI service, backend, or database required

## How it works

The assistant uses a reviewed knowledge bank rather than generating unverified answers. A visitor's question is normalized and compared with stored questions, common variations, and weighted keywords. Fuzzy matching helps recognize natural phrasing and speech-to-text differences.

When the match is sufficiently confident, the assistant returns the corresponding reviewed answer. If the question is outside the portfolio's scope or the confidence is too low, it provides a clear fallback instead of inventing information.

Voice input and output use the browser's Web Speech APIs. Questions can also be typed, so the portfolio remains usable when speech recognition is unavailable.

## Technology

- React 19 and Vite 7
- JavaScript
- Tailwind CSS 4
- Framer Motion
- Fuse.js
- Web Speech API
- Vitest

## Run locally

Use a current Node.js LTS release.

```bash
npm install
npm run dev
```

Open the local address displayed by Vite.

To verify a production build:

```bash
npm test
npm run build
npm run preview
```

The production files are generated in `dist/`.

> On Windows, if PowerShell blocks `npm.ps1`, use `npm.cmd install`, `npm.cmd test`, and `npm.cmd run build`.

## Configuration

### Professional profile

Update `src/data/personalData.json` to maintain the public profile, experience, skills, projects, achievements, and career information shown throughout the portfolio.

### Questions and answers

Update `src/data/questionBank.json` to edit an answer or add a new recruiter question. Each intent contains:

- A unique `id`
- A category and primary question
- Natural question variations
- Distinctive matching keywords
- A reviewed first-person answer
- An optional `requiresConfirmation` safety flag

After changing the knowledge bank, run `npm test` to check matching behavior.

### Voice settings

Voice behavior is configured in:

- `src/hooks/useSpeechRecognition.js` for language and silence detection
- `src/hooks/useSpeechSynthesis.js` for voice preference and default speed
- `src/components/VoiceAssistant.jsx` for conversation controls and speed range

The current defaults are:

- Recognition language: `en-IN`
- Silence before submitting a question: 3 seconds
- Preferred output: an installed male English voice
- Speaking speed: `1.1x`, adjustable from `0.8x` to `1.4x`

Available voices depend on the visitor's browser and operating system.

## Browser support

Typed questions work across modern browsers. Voice recognition works best in current Chrome and Edge versions. Microphone access requires `localhost` during development or HTTPS after deployment. If voice recognition is unavailable or permission is denied, the text input remains fully functional.

## Deploy to Netlify

The included `netlify.toml` runs the production build and publishes `dist/`.

For Git-based deployment:

1. Push the repository to GitHub or another supported Git provider.
2. Import the repository into Netlify.
3. Confirm the build command is `npm run build`.
4. Confirm the publish directory is `dist`.
5. Deploy and test microphone permission on the HTTPS site.

No environment variables are required.

## Privacy

All portfolio data and answers are included in the public static build. Only professional information suitable for public viewing should be added to the profile or question bank. The assistant does not store conversations or require visitor accounts.
