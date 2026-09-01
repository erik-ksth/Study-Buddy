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
storage only after the hosted endpoint accepts the submission. The survey is
mandatory and cannot be dismissed before a successful submission.

During development, add `?surveyPreview=1` to the URL to force the local survey
preview open.

## Detailed feedback prompt

The Feedback & Ideas form remains available from the Feedback button at any time.
After one completed Pomodoro focus session, the app opens a separate post-session
check-in. Set `VITE_POST_SESSION_FORM_ENDPOINT` to a third hosted form endpoint.
The check-in asks for `sessionExperience`, `usefulness`, `favoriteFeature`,
`favoriteTheme`, optional `message`, and optional `email`. It also
sends `source`, `theme`, and `completedSessions` metadata, then offers a Discord
invitation after a successful submission.

The prompt uses the persisted `totalPomodoros` count and records
`studyBuddy:post-session-feedback:v1:prompted` in local storage. The check-in is
mandatory and cannot be dismissed before submission. After submission, the
Discord invitation replaces the form and a **Maybe later** action closes the
dialog. The prompt does not open automatically again. Post-session submissions
use the `study-buddy-post-session-feedback` source. During development, add
`?feedbackPromptPreview=1` to force the post-session version of the dialog.

## Feedback funnel analytics

The existing Google Analytics tag records anonymous custom events for the
onboarding survey, the manual feedback form, and the post-session check-in:

- `sb_form_eligible`: the post-session check-in reached its session threshold.
- `sb_form_view`: a form was actually shown.
- `sb_form_start`: the user changed their first answer.
- `sb_form_submit_attempt`: the user tried to submit.
- `sb_form_submit`: the hosted form accepted the submission.
- `sb_form_error`: submission failed.
- `sb_form_dismiss`: the user closed the manual feedback form before submitting.
- `sb_discord_invite_click`: the user clicked the post-session Discord invitation.
- `sb_focus_session_complete`: a Pomodoro focus session was completed.

Form events include `form_name`, `theme`, `trigger`, and, when available,
`completed_sessions` and a low-cardinality `session_bucket`. Dismissal events
also include `dismiss_method`. No form answers, messages, or email addresses are
sent to analytics. Custom events are disabled during local development so
preview sessions do not pollute production data.

In Google Analytics, create event-scoped custom dimensions for `form_name`,
`trigger`, `dismiss_method`, `theme`, `error_type`, and `session_bucket` under
**Admin > Data display > Custom definitions**. Event names can be checked first
in the Realtime report. Use an Exploration funnel ordered by `sb_form_view`,
`sb_form_start`, `sb_form_submit_attempt`, and `sb_form_submit`.
