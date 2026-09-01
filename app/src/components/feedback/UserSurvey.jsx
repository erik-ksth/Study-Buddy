import { useEffect, useRef, useState } from "react";
import { trackEvent } from "../../analytics";
import { useTheme } from "../../context/ThemeContext";
import { submitHostedForm } from "./submitHostedForm";
import {
  SurveyActions,
  SurveyProgress,
  SurveyStep,
} from "./SurveyStepper";
import { useSurveyStepper } from "./useSurveyStepper";

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
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const hasTrackedStartRef = useRef(false);
  const isLocalPreview = !endpoint;
  const { currentStep, direction, formRef, goBack, goNext, isTransitioning } =
    useSurveyStepper(totalSteps);

  function trackStart() {
    if (hasTrackedStartRef.current) return;
    hasTrackedStartRef.current = true;
    trackEvent("sb_form_start", { form_name: "onboarding_survey", theme });
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
        ref={formRef}
        className="survey-preview-form"
        onChange={trackStart}
        onSubmit={async (event) => {
          event.preventDefault();

          if (isTransitioning || currentStep !== totalSteps - 1) {
            if (!isTransitioning) goNext();
            return;
          }

          setError("");
          setIsSubmitting(true);
          trackEvent("sb_form_submit_attempt", { form_name: "onboarding_survey", theme });

          try {
            if (endpoint) {
              await submitHostedForm(endpoint, event.currentTarget, {
                source: "study-buddy-onboarding-survey",
                flow: "onboarding",
                theme,
              });
            }
            trackEvent("sb_form_submit", { form_name: "onboarding_survey", theme });
            onComplete();
          } catch (submissionError) {
            trackEvent("sb_form_error", {
              error_type: "submission_failed",
              form_name: "onboarding_survey",
              theme,
            });
            setError(submissionError.message);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <SurveyProgress
          currentStep={currentStep}
          label="Getting to know you"
          totalSteps={totalSteps}
        />

        <div className="survey-step-viewport">
          <SurveyStep
            active={currentStep === 0}
            direction={direction}
            disabled={isSubmitting}
            index={0}
          >
            <legend>What brings you to Study Buddy?</legend>
            <div className="survey-choice-grid survey-choice-grid-four">
              {["Studying", "Working", "Personal projects", "Something else"].map((choice) => (
                <label key={choice}>
                  <input type="radio" name="purpose" value={choice} required />
                  <span>{choice}</span>
                </label>
              ))}
            </div>
          </SurveyStep>

          <SurveyStep
            active={currentStep === 1}
            direction={direction}
            disabled={isSubmitting}
            index={1}
          >
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
                  <input type="radio" name="discoverySource" value={source} required />
                  <span>{source}</span>
                </label>
              ))}
            </div>
          </SurveyStep>

          <SurveyStep
            active={currentStep === 2}
            direction={direction}
            disabled={isSubmitting}
            index={2}
          >
            <legend>Which feature would you like to try first?</legend>
            <div className="survey-choice-grid survey-feature-grid">
              {["Pomodoro timer", "To-do list", "Music & sounds", "Quotes", "Themes", "Stats"].map(
                (feature) => (
                  <label key={feature}>
                    <input type="radio" name="featureInterest" value={feature} required />
                    <span>{feature}</span>
                  </label>
                ),
              )}
            </div>
          </SurveyStep>
        </div>

        {error && (
          <p className="feedback-form-error" role="alert">
            <i className="fas fa-exclamation-circle" aria-hidden="true" />
            {error}
          </p>
        )}

        <SurveyActions
          currentStep={currentStep}
          isSubmitting={isSubmitting}
          isTransitioning={isTransitioning}
          onBack={goBack}
          onNext={goNext}
          submitLabel="Send and start exploring"
          totalSteps={totalSteps}
        />
      </form>
    </>
  );
}

function UserSurvey() {
  const { theme } = useTheme();
  const dialogRef = useRef(null);
  const closeTimerRef = useRef(null);
  const themeRef = useRef(theme);
  const [isOpen, setIsOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const usesNativeForm = Boolean(SURVEY_FORM_ENDPOINT);
  const isLocalPreview = import.meta.env.DEV && !usesNativeForm;
  const isForcedPreview =
    import.meta.env.DEV && new URLSearchParams(window.location.search).has("surveyPreview");
  const isAvailable = usesNativeForm || isLocalPreview;
  themeRef.current = theme;

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

      trackEvent("sb_form_view", {
        form_name: "onboarding_survey",
        theme: themeRef.current,
        trigger: "automatic",
      });
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

  return (
    <dialog
      ref={dialogRef}
      className="feedback-dialog survey-dialog"
      aria-labelledby="survey-title"
      onCancel={(event) => {
        event.preventDefault();
      }}
      onClose={() => {
        setIsOpen(false);
        document.body.classList.remove("feedback-dialog-open");
      }}
    >
      <section className="feedback-window survey-window">
        <header className="feedback-window-banner">
          <div className="feedback-window-title">
            <i className="far fa-clipboard" aria-hidden="true" />
            <span>Quick welcome</span>
          </div>
        </header>

        <div className="feedback-window-body survey-window-body">
          <div className="feedback-intro survey-intro">
            <div>
              <h2 id="survey-title">Tell us what brought you here</h2>
              <p>
                Three quick steps help us understand who finds Study Buddy and what they want
                to explore first.
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
        </div>
      </section>
    </dialog>
  );
}

export default UserSurvey;
