# Study Buddy — app

Vite + React app. See the [repo root README](../README.md) for the project overview and dev setup.

## Feedback form

Study Buddy renders its own theme-matched feedback form and can send submissions
to a hosted form backend such as Formspree. This keeps every control inside the
app's CSS instead of placing a separately styled form in an iframe.

1. Create a hosted form endpoint. With Formspree, create a form and copy its
   `https://formspree.io/f/...` endpoint.
2. Copy `.env.example` to `.env.local` and set `VITE_FEEDBACK_FORM_ENDPOINT`.
3. The native form submits `feedbackType`, `message`, `email`, `source`, and
   `theme` fields.
4. Restart the Vite development server.

The endpoint is public by design and is bundled into the client. When an endpoint
is absent, development shows a local visual preview and production hides the
corresponding form.

## First-visit onboarding survey

The app also shows a short onboarding survey after the loading screen:

1. What brings you to Study Buddy? One choice, required.
   - Studying
   - Working
   - Personal projects
   - Something else
2. How did you first hear about Study Buddy? One choice, required.
3. Which feature would you like to try first? One choice, required.
   - Pomodoro timer
   - To-do list
   - Music and ambient sounds
   - Quotes
   - Themes
   - Daily stats

Set `VITE_SURVEY_FORM_ENDPOINT` to a second hosted form endpoint. The survey sends
`purpose`, `discoverySource`, `featureInterest`, `source`, `flow`, and
`theme` fields. The app saves `studyBuddy:user-survey:v1:completed` in local
storage only after the hosted endpoint accepts the submission. Closing the survey
only hides it for the current page view. It appears again after a refresh until a
submission succeeds.

During development, add `?surveyPreview=1` to the URL to force the local survey
preview open.

## Detailed feedback prompt

The Feedback & Ideas form remains available from the Feedback button at any time.
After two completed Pomodoro focus sessions, the app opens a separate post-session
check-in automatically once. Set `VITE_POST_SESSION_FORM_ENDPOINT` to a third
hosted form endpoint. The check-in asks for `favoriteTheme`, `usageFrequency`,
`favoriteFeature`, `responseType`, `message`, and optional `email`, and also sends
`source`, `theme`, and `completedSessions` metadata.

The prompt uses the persisted `totalPomodoros` count and records
`studyBuddy:post-session-feedback:v1:prompted` in local storage so it does not
interrupt the user again. Post-session submissions use the
`study-buddy-post-session-feedback` source. During development, add
`?feedbackPromptPreview=1` to force the post-session version of the dialog.
