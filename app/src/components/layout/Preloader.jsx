import { useEffect, useState } from "react";
import LampIcon from "./lamp.svg?react";

// Replaces the original $(window).on("load", () => $("#preloader").fadeOut(1000)).
function Preloader() {
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let hideTimer;

    function startFade() {
      setFading(true);
      hideTimer = setTimeout(() => setHidden(true), 1000);
    }

    if (document.readyState === "complete") {
      startFade();
    } else {
      window.addEventListener("load", startFade);
    }

    return () => {
      window.removeEventListener("load", startFade);
      clearTimeout(hideTimer);
    };
  }, []);

  if (hidden) return null;

  return (
    <div id="preloader" className={fading ? "fade-out" : ""}>
      <div className="logo">
        <LampIcon className="preloader-logo-icon" />
        <h1>Study Buddy</h1>
      </div>
      <div id="gif">&nbsp;</div>
    </div>
  );
}

export default Preloader;
