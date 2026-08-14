import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useStudyStats } from "../../context/StudyStatsContext";
import { THEMES } from "../../data/themes";
import { submitHostedForm } from "./submitHostedForm";

const FEEDBACK_FORM_ENDPOINT = import.meta.env.VITE_FEEDBACK_FORM_ENDPOINT?.trim();
const POST_SESSION_FORM_ENDPOINT = import.meta.env.VITE_POST_SESSION_FORM_ENDPOINT?.trim();
const POST_SESSION_PROMPTED_KEY = "studyBuddy:post-session-feedback:v1:prompted";
const FEEDBACK_PROMPT_SESSION_COUNT = 2;

function FeedbackForm({ completedSessions, endpoint, onSubmitted, source, theme }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isLocalPreview = !endpoint;

  if (submitted) {
    return (
      <div className="feedback-preview-success" role="status">
        <span className="feedback-success-icon" aria-hidden="true">
          <i className="fas fa-check" />
        </span>
        <div>
          <strong>{isLocalPreview ? "That’s the whole flow." : "Thanks for the note."}</strong>
          <p>
            {isLocalPreview
              ? "Add a hosted form endpoint to receive real submissions."
              : "Your feedback has been sent and will help shape Study Buddy."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLocalPreview && (
        <div className="feedback-preview-label">
          <span aria-hidden="true" />
          Local preview
        </div>
      )}

      <form
        className="feedback-preview-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setIsSubmitting(true);

          try {
            if (endpoint) {
              await submitHostedForm(endpoint, event.currentTarget, {
                completedSessions,
                source,
                theme,
              });
            }
            onSubmitted?.();
            setSubmitted(true);
          } catch (submissionError) {
            setError(submissionError.message);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <fieldset disabled={isSubmitting}>
          <legend>What would you like to share?</legend>
          <div className="feedback-type-options">
            <label>
              <input type="radio" name="feedbackType" value="An idea" defaultChecked />
              <span>
                <i className="far fa-lightbulb" aria-hidden="true" />
                An idea
              </span>
            </label>
            <label>
              <input type="radio" name="feedbackType" value="A problem" />
              <span>
                <i className="fas fa-wrench" aria-hidden="true" />
                A problem
              </span>
            </label>
            <label>
              <input type="radio" name="feedbackType" value="My experience" />
              <span>
                <i className="far fa-heart" aria-hidden="true" />
                My experience
              </span>
            </label>
          </div>
        </fieldset>

        <label className="feedback-field">
          <span>Your note</span>
          <textarea
            name="message"
            rows="4"
            placeholder="What could make your study sessions feel better?"
            required
            disabled={isSubmitting}
          />
        </label>

        <label className="feedback-field">
          <span>
            Email <small>optional, only if you want a reply</small>
          </span>
          <input name="email" type="email" placeholder="you@example.com" disabled={isSubmitting} />
        </label>

        {error && (
          <p className="feedback-form-error" role="alert">
            <i className="fas fa-exclamation-circle" aria-hidden="true" />
            {error}
          </p>
        )}

        <button className="feedback-submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              Sending
              <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />
            </>
          ) : (
            <>
              Send note
              <i className="far fa-paper-plane" aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </>
  );
}

function PostSessionFeedbackForm({ completedSessions, endpoint, onSubmitted, theme }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isLocalPreview = !endpoint;

  if (submitted) {
    return (
      <div className="feedback-preview-success" role="status">
        <span className="feedback-success-icon" aria-hidden="true">
          <i className="fas fa-check" />
        </span>
        <div>
          <strong>{isLocalPreview ? "That’s the whole flow." : "Thanks for checking in."}</strong>
          <p>
            {isLocalPreview
              ? "Add the post-session form endpoint to receive real submissions."
              : "Your answers will help the team make future focus sessions better."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLocalPreview && (
        <div className="feedback-preview-label">
          <span aria-hidden="true" />
          Local preview
        </div>
      )}

      <form
        className="feedback-preview-form post-session-feedback-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setIsSubmitting(true);

          try {
            if (endpoint) {
              await submitHostedForm(endpoint, event.currentTarget, {
                completedSessions,
                source: "study-buddy-post-session-feedback",
                theme,
              });
            }
            onSubmitted?.();
            setSubmitted(true);
          } catch (submissionError) {
            setError(submissionError.message);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <fieldset disabled={isSubmitting}>
          <legend>Which theme is your favorite so far?</legend>
          <div className="survey-choice-grid post-session-theme-grid">
            {THEMES.map((themeOption) => (
              <label className="post-session-theme-option" key={themeOption.id}>
                <input type="radio" name="favoriteTheme" value={themeOption.label} required />
                <span>
                  <i
                    className="post-session-theme-swatch"
                    style={{
                      "--theme-preview-bg": themeOption.swatch.bg,
                      "--theme-preview-accent": themeOption.swatch.accent,
                      "--theme-preview-ink": themeOption.swatch.ink,
                    }}
                    aria-hidden="true"
                  />
                  {themeOption.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset disabled={isSubmitting}>
          <legend>How often do you use Study Buddy?</legend>
          <div className="survey-choice-grid post-session-frequency-grid">
            {["This was my first session", "A few times a month", "A few times a week", "Most days"].map(
              (frequency) => (
                <label key={frequency}>
                  <input type="radio" name="usageFrequency" value={frequency} required />
                  <span>{frequency}</span>
                </label>
              ),
            )}
          </div>
        </fieldset>

        <fieldset disabled={isSubmitting}>
          <legend>Which feature has helped you most so far?</legend>
          <div className="survey-choice-grid post-session-feature-grid">
            {["Pomodoro timer", "To-do list", "Music & sounds", "Quotes", "Themes", "Stats"].map(
              (feature) => (
                <label key={feature}>
                  <input type="radio" name="favoriteFeature" value={feature} required />
                  <span>{feature}</span>
                </label>
              ),
            )}
          </div>
        </fieldset>

        <fieldset disabled={isSubmitting}>
          <legend>What would you like to share?</legend>
          <div className="feedback-type-options">
            <label>
              <input type="radio" name="responseType" value="A request" defaultChecked />
              <span>
                <i className="far fa-lightbulb" aria-hidden="true" />
                A request
              </span>
            </label>
            <label>
              <input type="radio" name="responseType" value="Feedback" />
              <span>
                <i className="far fa-comment-dots" aria-hidden="true" />
                Feedback
              </span>
            </label>
            <label>
              <input type="radio" name="responseType" value="Something else" />
              <span>
                <i className="fas fa-ellipsis-h" aria-hidden="true" />
                Something else
              </span>
            </label>
          </div>
        </fieldset>

        <label className="feedback-field">
          <span>Tell us more</span>
          <textarea
            name="message"
            rows="4"
            placeholder="What should the team improve, add, or keep doing?"
            required
            disabled={isSubmitting}
          />
        </label>

        <label className="feedback-field">
          <span>
            Email <small>optional, only if you want a reply</small>
          </span>
          <input name="email" type="email" placeholder="you@example.com" disabled={isSubmitting} />
        </label>

        {error && (
          <p className="feedback-form-error" role="alert">
            <i className="fas fa-exclamation-circle" aria-hidden="true" />
            {error}
          </p>
        )}

        <button className="feedback-submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              Sending
              <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />
            </>
          ) : (
            <>
              Send check-in
              <i className="far fa-paper-plane" aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </>
  );
}

function FeedbackWidget() {
  const { theme } = useTheme();
  const { stats } = useStudyStats();
  const dialogRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openedAfterSessions, setOpenedAfterSessions] = useState(false);
  const regularFormAvailable = Boolean(FEEDBACK_FORM_ENDPOINT) || import.meta.env.DEV;
  const postSessionFormAvailable = Boolean(POST_SESSION_FORM_ENDPOINT) || import.meta.env.DEV;
  const isAvailable = regularFormAvailable || postSessionFormAvailable;
  const isForcedPromptPreview =
    import.meta.env.DEV && new URLSearchParams(window.location.search).has("feedbackPromptPreview");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      document.body.classList.add("feedback-dialog-open");
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }

    return () => document.body.classList.remove("feedback-dialog-open");
  }, [isOpen]);

  useEffect(() => {
    if (!postSessionFormAvailable) return undefined;

    const completedSessions = Number(stats.totalPomodoros) || 0;
    let promptState = {};

    try {
      promptState = JSON.parse(localStorage.getItem(POST_SESSION_PROMPTED_KEY) || "null") || {};
    } catch {
      // Treat malformed storage as an unseen prompt.
    }

    const lastPromptedSession = Number(promptState.completedSessions) || 0;
    if (
      !isForcedPromptPreview &&
      (completedSessions < FEEDBACK_PROMPT_SESSION_COUNT ||
        promptState.respondedAt ||
        completedSessions <= lastPromptedSession)
    ) {
      return undefined;
    }

    let openTimer;

    function openWhenReady() {
      if (document.visibilityState !== "visible" || document.querySelector("dialog[open]")) {
        openTimer = window.setTimeout(openWhenReady, 1200);
        return;
      }

      if (!isForcedPromptPreview) {
        localStorage.setItem(
          POST_SESSION_PROMPTED_KEY,
          JSON.stringify({ promptedAt: new Date().toISOString(), completedSessions }),
        );
      }
      setOpenedAfterSessions(true);
      setIsOpen(true);
    }

    openTimer = window.setTimeout(openWhenReady, isForcedPromptPreview ? 250 : 1800);
    return () => window.clearTimeout(openTimer);
  }, [isForcedPromptPreview, postSessionFormAvailable, stats.totalPomodoros]);

  if (!isAvailable) return null;

  function markPostSessionHandled() {
    localStorage.setItem(
      POST_SESSION_PROMPTED_KEY,
      JSON.stringify({
        respondedAt: new Date().toISOString(),
        completedSessions: Number(stats.totalPomodoros) || 0,
      }),
    );
  }

  function closeDialog() {
    setIsOpen(false);
    document.body.classList.remove("feedback-dialog-open");
  }

  return (
    <>
      {regularFormAvailable && (
        <button
          className="top-left-action feedback-launcher"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen && !openedAfterSessions}
          onClick={() => {
            setOpenedAfterSessions(false);
            setIsOpen(true);
          }}
        >
          <i className="far fa-comment-dots" aria-hidden="true" />
          <span>Feedback</span>
        </button>
      )}

      <dialog
        ref={dialogRef}
        className="feedback-dialog"
        aria-labelledby="feedback-title"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onClose={closeDialog}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDialog();
        }}
      >
        <section className="feedback-window">
          <header className="feedback-window-banner">
            <div className="feedback-window-title">
              <i className="far fa-envelope-open" aria-hidden="true" />
              <span>{openedAfterSessions ? "Session check-in" : "Feedback & ideas"}</span>
            </div>
            <button
              className="feedback-close-button"
              type="button"
              aria-label="Close feedback"
              onClick={closeDialog}
            >
              <i className="fas fa-times" aria-hidden="true" />
            </button>
          </header>

          <div className="feedback-window-body">
            <div className="feedback-intro">
              <h2 id="feedback-title">
                {openedAfterSessions
                  ? "How was your focus session?"
                  : "Help shape Study Buddy"}
              </h2>
              {openedAfterSessions ? (
                <p>
                  Now that you’ve tried a focus session, a few quick answers will help the team
                  understand what’s useful and what to improve next.
                </p>
              ) : (
                <p>
                  Found something awkward, have an idea, or want to share what helps you focus?
                  Leave a note for the team.
                </p>
              )}
            </div>

            <div className="feedback-form-surface">
              {openedAfterSessions ? (
                <PostSessionFeedbackForm
                  completedSessions={Number(stats.totalPomodoros) || 0}
                  endpoint={POST_SESSION_FORM_ENDPOINT}
                  onSubmitted={markPostSessionHandled}
                  theme={theme}
                />
              ) : (
                <FeedbackForm
                  completedSessions={Number(stats.totalPomodoros) || 0}
                  endpoint={FEEDBACK_FORM_ENDPOINT}
                  source="study-buddy-feedback"
                  theme={theme}
                />
              )}
            </div>

            <p className="feedback-privacy-note">
              <i className="fas fa-lock" aria-hidden="true" />
              Please don’t include passwords or sensitive information.
            </p>
          </div>
        </section>
      </dialog>
    </>
  );
}

export default FeedbackWidget;
