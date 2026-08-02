import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { submitHostedForm } from "./submitHostedForm";

const SURVEY_FORM_ENDPOINT = import.meta.env.VITE_SURVEY_FORM_ENDPOINT?.trim();
const SURVEY_COMPLETED_KEY = "studyBuddy:user-survey:v1:completed";

function SurveyCompleteState() {
  return (
    <div className="survey-complete-state" role="status">
      <span className="feedback-success-icon" aria-hidden="true">
        <i className="fas fa-check" />
      </span>
      <div>
        <strong>You’re all set.</strong>
        <p>Thanks for introducing yourself. Enjoy exploring Study Buddy.</p>
      </div>
    </div>
  );
}

function SurveyForm({ endpoint, onComplete, theme }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isLocalPreview = !endpoint;

  return (
    <>
      {isLocalPreview && (
        <div className="feedback-preview-label">
          <span aria-hidden="true" />
          Local preview
        </div>
      )}

      <form
        className="survey-preview-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setIsSubmitting(true);

          try {
            if (endpoint) {
              await submitHostedForm(endpoint, event.currentTarget, {
                source: "study-buddy-onboarding-survey",
                flow: "onboarding",
                theme,
              });
            }
            onComplete();
          } catch (submissionError) {
            setError(submissionError.message);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <fieldset disabled={isSubmitting}>
          <legend>What brings you to Study Buddy?</legend>
          <div className="survey-choice-grid survey-choice-grid-four">
            {["Studying", "Working", "Personal projects", "Something else"].map((choice) => (
              <label key={choice}>
                <input
                  type="radio"
                  name="purpose"
                  value={choice}
                  required
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset disabled={isSubmitting}>
          <legend>How did you first hear about Study Buddy?</legend>
          <div className="survey-choice-grid survey-discovery-grid">
            {[
              "Search engine",
              "Social media",
              "Someone I know",
              "School or work",
              "Online community",
              "Something else",
            ].map((source) => (
              <label key={source}>
                <input
                  type="radio"
                  name="discoverySource"
                  value={source}
                  required
                />
                <span>{source}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset disabled={isSubmitting}>
          <legend>Which feature would you like to try first?</legend>
          <div className="survey-choice-grid survey-feature-grid">
            {["Pomodoro timer", "To-do list", "Music & sounds", "Quotes", "Themes", "Stats"].map(
              (feature) => (
                <label key={feature}>
                  <input
                    type="radio"
                    name="featureInterest"
                    value={feature}
                    required
                  />
                  <span>{feature}</span>
                </label>
              ),
            )}
          </div>
        </fieldset>

        {error && (
          <p className="feedback-form-error" role="alert">
            <i className="fas fa-exclamation-circle" aria-hidden="true" />
            {error}
          </p>
        )}

        <button
          className="feedback-submit-button survey-submit-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              Sending
              <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />
            </>
          ) : (
            <>
              Send and start exploring
              <i className="far fa-paper-plane" aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </>
  );
}

function UserSurvey() {
  const { theme } = useTheme();
  const dialogRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const usesNativeForm = Boolean(SURVEY_FORM_ENDPOINT);
  const isLocalPreview = import.meta.env.DEV && !usesNativeForm;
  const isForcedPreview =
    import.meta.env.DEV && new URLSearchParams(window.location.search).has("surveyPreview");
  const isAvailable = usesNativeForm || isLocalPreview;

  useEffect(() => {
    if (!isAvailable) return undefined;

    const hasCompleted = localStorage.getItem(SURVEY_COMPLETED_KEY);
    if (!isForcedPreview && hasCompleted) return undefined;

    let openTimer;

    function openWhenReady() {
      if (document.visibilityState !== "visible" || document.querySelector("dialog[open]")) {
        openTimer = window.setTimeout(openWhenReady, 1200);
        return;
      }

      setIsOpen(true);
    }

    openTimer = window.setTimeout(openWhenReady, isForcedPreview ? 250 : 1450);
    return () => window.clearTimeout(openTimer);
  }, [isAvailable, isForcedPreview]);

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

  useEffect(
    () => () => {
      window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  if (!isAvailable) return null;

  function markComplete() {
    localStorage.setItem(
      SURVEY_COMPLETED_KEY,
      JSON.stringify({ version: 1, completedAt: new Date().toISOString() }),
    );
    setIsComplete(true);
    closeTimerRef.current = window.setTimeout(() => setIsOpen(false), 2400);
  }

  function dismissSurvey() {
    setIsOpen(false);
  }

  return (
    <dialog
      ref={dialogRef}
      className="feedback-dialog survey-dialog"
      aria-labelledby="survey-title"
      onCancel={(event) => {
        event.preventDefault();
        dismissSurvey();
      }}
      onClose={() => {
        setIsOpen(false);
        document.body.classList.remove("feedback-dialog-open");
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) dismissSurvey();
      }}
    >
      <section className="feedback-window survey-window">
        <header className="feedback-window-banner">
          <div className="feedback-window-title">
            <i className="far fa-clipboard" aria-hidden="true" />
            <span>Quick welcome</span>
          </div>
          <button
            className="feedback-close-button"
            type="button"
            aria-label="Answer survey later"
            onClick={dismissSurvey}
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </header>

        <div className="feedback-window-body survey-window-body">
          <div className="feedback-intro survey-intro">
            <div>
              <h2 id="survey-title">Tell us what brought you here</h2>
              <p>
                Three quick answers help us understand who finds Study Buddy and what they
                want to explore first.
              </p>
            </div>
            <span className="survey-time-note">
              <i className="far fa-clock" aria-hidden="true" />
              Under 1 minute
            </span>
          </div>

          <div className="feedback-form-surface survey-form-surface">
            {isComplete ? (
              <SurveyCompleteState />
            ) : (
              <SurveyForm endpoint={SURVEY_FORM_ENDPOINT} onComplete={markComplete} theme={theme} />
            )}
          </div>

          {!isComplete && (
            <div className="survey-footer">
              <button className="survey-later-button" type="button" onClick={dismissSurvey}>
                Maybe later
              </button>
              <p className="feedback-privacy-note">
                <i className="fas fa-lock" aria-hidden="true" />
                Anonymous unless you choose to identify yourself.
              </p>
            </div>
          )}
        </div>
      </section>
    </dialog>
  );
}

export default UserSurvey;
