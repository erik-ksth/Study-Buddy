import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { submitHostedForm } from "./submitHostedForm";

const TALLY_FORM_ID = import.meta.env.VITE_TALLY_FORM_ID?.trim();
const FEEDBACK_FORM_ENDPOINT = import.meta.env.VITE_FEEDBACK_FORM_ENDPOINT?.trim();

function FeedbackForm({ endpoint, theme }) {
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
                source: "study-buddy-feedback",
                theme,
              });
            }
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

function FeedbackWidget() {
  const { theme } = useTheme();
  const dialogRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const usesNativeForm = Boolean(FEEDBACK_FORM_ENDPOINT);
  const usesTallyFallback = Boolean(TALLY_FORM_ID) && !usesNativeForm;
  const isLocalPreview = import.meta.env.DEV && !usesNativeForm && !usesTallyFallback;

  const formUrl = useMemo(() => {
    if (!usesTallyFallback) return "";

    const params = new URLSearchParams({
      alignLeft: "1",
      hideTitle: "1",
      transparentBackground: "1",
      dynamicHeight: "1",
      source: "study-buddy",
      theme,
    });

    return `https://tally.so/embed/${TALLY_FORM_ID}?${params.toString()}`;
  }, [theme, usesTallyFallback]);

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

  if (!usesNativeForm && !usesTallyFallback && !isLocalPreview) return null;

  function closeDialog() {
    setIsOpen(false);
    document.body.classList.remove("feedback-dialog-open");
  }

  return (
    <>
      <button
        className="feedback-launcher"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <i className="far fa-comment-dots" aria-hidden="true" />
        <span>Feedback</span>
      </button>

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
              <span>Feedback &amp; ideas</span>
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
              <h2 id="feedback-title">Help shape Study Buddy</h2>
              <p>
                Found something awkward, have an idea, or want to share what helps you focus?
                Leave a note for the team.
              </p>
            </div>

            <div className="feedback-form-surface">
              {usesTallyFallback ? (
                <iframe
                  className="feedback-tally-frame"
                  src={formUrl}
                  title="Study Buddy feedback form"
                  loading="lazy"
                />
              ) : (
                <FeedbackForm endpoint={FEEDBACK_FORM_ENDPOINT} theme={theme} />
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
