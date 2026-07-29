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

The endpoint is public by design and is bundled into the client. When neither an
endpoint nor a legacy Tally ID is present, development shows a local visual
preview and production hides the feedback control.

Existing Tally forms remain supported as a fallback through
`VITE_TALLY_FORM_ID`, but an embedded Tally iframe cannot inherit Study Buddy's
CSS. Tally's own theme editor or Tally Pro custom CSS must be used to style that
fallback.

## First-visit user survey

The app also shows a native one-minute survey after the loading screen:

1. What brings you to Study Buddy?
   - Studying
   - Working
   - Personal projects
   - Something else
2. How often do you use the app?
   - First time
   - A few times a month
   - A few times a week
   - Every day
3. Which features are your favorites? Allow multiple selections:
   - Pomodoro timer
   - To-do list
   - Music and ambient sounds
   - Quotes
   - Themes
   - Daily stats
4. What should we improve or add next? Long text, optional.

Set `VITE_SURVEY_FORM_ENDPOINT` to a second hosted form endpoint. The survey sends
`purpose`, `frequency`, repeated `favoriteFeatures`, `request`, `source`, and
`theme` fields. The app saves `studyBuddy:user-survey:v1:completed` in local
storage only after the hosted endpoint accepts the submission. Closing the survey
only hides it for the current page view. It appears again after a refresh until a
submission succeeds.

`VITE_TALLY_SURVEY_FORM_ID` remains available as an iframe fallback. During
development, add `?surveyPreview=1` to the URL to force the local survey preview
open.
