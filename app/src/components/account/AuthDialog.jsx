import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/authState";
import LampIcon from "../layout/lamp.svg?react";

function AuthDialog() {
  const {
    authDialog,
    closeAuthDialog,
    isConfigured,
    signInWithGoogle,
    user,
  } = useAuth();
  const dialogRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (authDialog.isOpen && !dialog.open) dialog.showModal();
    if (!authDialog.isOpen && dialog.open) dialog.close();
  }, [authDialog.isOpen]);

  useEffect(() => {
    if (user && authDialog.isOpen) closeAuthDialog();
  }, [authDialog.isOpen, closeAuthDialog, user]);

  function close() {
    setError("");
    closeAuthDialog();
  }

  return (
    <dialog
      ref={dialogRef}
      className="account-dialog"
      aria-labelledby="account-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClose={closeAuthDialog}
    >
      <section className="account-window">
        <button className="account-close-button" type="button" onClick={close} aria-label="Close sign in">
          <i className="fas fa-times" aria-hidden="true" />
        </button>

        <div className="account-window-body">
          <LampIcon className="account-signin-logo" aria-hidden="true" />
          <h2 className="account-signin-title" id="account-dialog-title">Sign in</h2>
          {!isConfigured ? (
            <div className="account-setup-note" role="status">
              <i className="fas fa-wrench" aria-hidden="true" />
              <div>
                <strong>Account connection is ready for setup.</strong>
                <p>Add the Supabase project URL and publishable key to enable sign-in.</p>
              </div>
            </div>
          ) : (
            <>
              <button
                className="account-google-button"
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  setError("");
                  setIsSubmitting(true);
                  try {
                    await signInWithGoogle();
                  } catch (signInError) {
                    setError(signInError.message || "Google sign-in could not start.");
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? (
                  <i className="fas fa-circle-notch fa-spin" aria-label="Opening Google sign in" />
                ) : (
                  <i className="fab fa-google" aria-hidden="true" />
                )}
                {isSubmitting ? "Opening Google…" : "Continue with Google"}
              </button>
              {error && <p className="account-error" role="alert">{error}</p>}
            </>
          )}
        </div>
      </section>
    </dialog>
  );
}

export default AuthDialog;
