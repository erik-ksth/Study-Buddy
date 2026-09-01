export function SurveyProgress({ currentStep, label, totalSteps }) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="survey-progress">
      <div className="survey-progress-copy">
        <span>{label}</span>
        <strong>
          Step {currentStep + 1} of {totalSteps}
        </strong>
      </div>
      <div
        className="survey-progress-track"
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin="1"
        aria-valuemax={totalSteps}
        aria-valuenow={currentStep + 1}
      >
        <span
          className="survey-progress-fill"
          style={{ "--survey-progress": `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function SurveyStep({ active, children, className = "", direction, index, ...props }) {
  const classes = [
    "survey-step",
    active && "survey-step-active",
    active && `survey-step-${direction}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <fieldset
      {...props}
      className={classes}
      data-survey-step={index}
      hidden={!active}
      tabIndex="-1"
    >
      {children}
    </fieldset>
  );
}

export function SurveyActions({
  currentStep,
  isSubmitting,
  isTransitioning,
  onBack,
  onNext,
  submitLabel,
  submittingLabel = "Sending",
  totalSteps,
}) {
  const isLastStep = currentStep === totalSteps - 1;
  const isBusy = isSubmitting || isTransitioning;

  return (
    <div className="survey-step-actions">
      {currentStep > 0 && (
        <button
          className="survey-step-back"
          type="button"
          onClick={onBack}
          disabled={isBusy}
        >
          <i className="fas fa-arrow-left" aria-hidden="true" />
          Back
        </button>
      )}

      <button
        className="feedback-submit-button survey-step-primary"
        type={isLastStep ? "submit" : "button"}
        onClick={isLastStep ? undefined : onNext}
        disabled={isBusy}
      >
        {isSubmitting ? (
          <>
            {submittingLabel}
            <i className="fas fa-circle-notch fa-spin" aria-hidden="true" />
          </>
        ) : isLastStep ? (
          <>
            {submitLabel}
            <i className="far fa-paper-plane" aria-hidden="true" />
          </>
        ) : (
          <>
            Continue
            <i className="fas fa-arrow-right" aria-hidden="true" />
          </>
        )}
      </button>
    </div>
  );
}
