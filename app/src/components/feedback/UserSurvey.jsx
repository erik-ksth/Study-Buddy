import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { submitHostedForm } from "./submitHostedForm";

const TALLY_SURVEY_FORM_ID = import.meta.env.VITE_TALLY_SURVEY_FORM_ID?.trim();
const SURVEY_FORM_ENDPOINT = import.meta.env.VITE_SURVEY_FORM_ENDPOINT?.trim();
const SURVEY_COMPLETED_KEY = "studyBuddy:user-survey:v1:completed";

function SurveyCompleteState() {
  return (
    <div className="survey-complete-state" role="status">
      <span className="feedback-success-icon" aria-hidden="true">
        <i className="fas fa-check" />
      </span>
      <div>
        <strong>Thank you for helping.</strong>
        <p>Your answers will guide what Study Buddy improves next.</p>
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
                source: "study-buddy-auto-survey",
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
          <legend>How often do you use the app?</legend>
          <div className="survey-choice-grid">
            {["First time", "A few times a month", "A few times a week", "Every day"].map(
              (choice) => (
                <label key={choice}>
                  <input
                    type="radio"
                    name="frequency"
                    value={choice}
                    required
                  />
                  <span>{choice}</span>
                </label>
              ),
            )}
          </div>
        </fieldset>

        <fieldset disabled={isSubmitting}>
          <legend>
            Which features are your favorites? <small>Choose any</small>
          </legend>
          <div className="survey-choice-grid survey-feature-grid">
            {["Pomodoro timer", "To-do list", "Music & sounds", "Quotes", "Themes", "Stats"].map(
              (feature) => (
                <label key={feature}>
                  <input
                    type="checkbox"
                    name="favoriteFeatures"
                    value={feature}
                  />
                  <span>{feature}</span>
                </label>
              ),
            )}
          </div>
        </fieldset>

        <label className="feedback-field">
          <span>
            What should we improve or add next? <small>optional</small>
          </span>
          <textarea
            name="request"
            rows="3"
            placeholder="A feature, music style, workflow, or anything else…"
            disabled={isSubmitting}
          />
        </label>

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
              Send my answers
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
  const iframeRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const usesNativeForm = Boolean(SURVEY_FORM_ENDPOINT);
  const usesTallyFallback = Boolean(TALLY_SURVEY_FORM_ID) && !usesNativeForm;
  const isLocalPreview = import.meta.env.DEV && !usesNativeForm && !usesTallyFallback;
  const isForcedPreview =
    import.meta.env.DEV && new URLSearchParams(window.location.search).has("surveyPreview");
  const isAvailable = usesNativeForm || usesTallyFallback || isLocalPreview;

  const formUrl = useMemo(() => {
    if (!usesTallyFallback) return "";

    const params = new URLSearchParams({
      alignLeft: "1",
      hideTitle: "1",
      transparentBackground: "1",
      dynamicHeight: "1",
      source: "study-buddy-auto-survey",
      theme,
    });

    return `https://tally.so/embed/${TALLY_SURVEY_FORM_ID}?${params.toString()}`;
  }, [theme, usesTallyFallback]);

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

  useEffect(() => {
    if (!usesTallyFallback) return undefined;

    function handleTallyMessage(event) {
      if (
        event.origin !== "https://tally.so" ||
        event.source !== iframeRef.current?.contentWindow ||
        typeof event.data !== "string" ||
        !event.data.includes("Tally.FormSubmitted")
      ) {
        return;
      }

      try {
        const message = JSON.parse(event.data);
        if (message?.payload?.formId === TALLY_SURVEY_FORM_ID) markComplete();
      } catch {
        // Ignore unrelated or malformed postMessage traffic.
      }
    }

    window.addEventListener("message", handleTallyMessage);
    return () => window.removeEventListener("message", handleTallyMessage);
  }, [usesTallyFallback]);

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
            <span>One-minute survey</span>
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
              <h2 id="survey-title">How do you use Study Buddy?</h2>
              <p>
                A few quick answers will help us understand who the app serves and what to
                improve next.
              </p>
            </div>
            <span className="survey-time-note">
              <i className="far fa-clock" aria-hidden="true" />
              About 1 minute
            </span>
          </div>

          <div className="feedback-form-surface survey-form-surface">
            {isComplete ? (
              <SurveyCompleteState />
            ) : usesTallyFallback ? (
              <iframe
                ref={iframeRef}
                className="feedback-tally-frame survey-tally-frame"
                src={formUrl}
                title="Study Buddy user survey"
              />
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
