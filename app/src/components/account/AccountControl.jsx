import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/authState";
import { useDataSync } from "../../context/dataSyncState";

function AccountControl() {
  const { user, isLoading, requestSignIn, signOut } = useAuth();
  const { status, error } = useDataSync();
  const [isOpen, setIsOpen] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    function closeOutside(event) {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  if (!user) {
    return (
      <button
        className="top-left-action account-launcher"
        type="button"
        disabled={isLoading}
        onClick={() => requestSignIn()}
        aria-haspopup="dialog"
      >
        <i className="far fa-user" aria-hidden="true" />
        <span>{isLoading ? "Checking…" : "Sign in"}</span>
      </button>
    );
  }

  const statusText = status === "syncing" ? "Syncing…" : status === "error" ? "Saved on this device" : "Synced";

  return (
    <div className="account-control" ref={rootRef}>
      <button
        className="top-left-action account-launcher"
        type="button"
        aria-expanded={isOpen}
        aria-controls="account-popover"
        onClick={() => setIsOpen((current) => !current)}
      >
        <i className="far fa-user" aria-hidden="true" />
        <span>Account</span>
      </button>

      {isOpen && (
        <aside className="account-popover" id="account-popover">
          <strong>{user.email || "Signed in"}</strong>
          <p className={`account-sync-status account-sync-${status}`}>
            <i className={status === "syncing" ? "fas fa-circle-notch fa-spin" : status === "error" ? "fas fa-cloud-upload-alt" : "fas fa-check"} aria-hidden="true" />
            {statusText}
          </p>
          {error && <p className="account-popover-error">{error}</p>}
          <button
            type="button"
            onClick={async () => {
              setSignOutError("");
              try {
                await signOut();
                setIsOpen(false);
              } catch (logoutError) {
                setSignOutError(logoutError.message || "Could not sign out.");
              }
            }}
          >
            Sign out
          </button>
          {signOutError && <p className="account-popover-error" role="alert">{signOutError}</p>}
        </aside>
      )}
    </div>
  );
}

export default AccountControl;
