import { useEffect, useRef, useState } from "react";

export function useSurveyStepper(totalSteps) {
  const formRef = useRef(null);
  const hasNavigatedRef = useRef(false);
  const transitionTimerRef = useRef(null);
  const transitionLockedRef = useRef(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(
    () => () => {
      window.clearTimeout(transitionTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!hasNavigatedRef.current) return undefined;

    const focusFrame = window.requestAnimationFrame(() => {
      formRef.current
        ?.querySelector(`[data-survey-step="${currentStep}"]`)
        ?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [currentStep]);

  function lockTransition() {
    transitionLockedRef.current = true;
    setIsTransitioning(true);
    window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = window.setTimeout(() => {
      transitionLockedRef.current = false;
      setIsTransitioning(false);
    }, 260);
  }

  function goNext() {
    if (transitionLockedRef.current) return;

    const activeStep = formRef.current?.querySelector(
      `[data-survey-step="${currentStep}"]`,
    );
    const invalidControl = Array.from(activeStep?.elements || []).find(
      (control) => !control.checkValidity(),
    );

    if (invalidControl) {
      invalidControl.reportValidity();
      return;
    }

    hasNavigatedRef.current = true;
    lockTransition();
    setDirection("forward");
    setCurrentStep((step) => Math.min(step + 1, totalSteps - 1));
  }

  function goBack() {
    if (transitionLockedRef.current) return;

    hasNavigatedRef.current = true;
    lockTransition();
    setDirection("backward");
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  return { currentStep, direction, formRef, goBack, goNext, isTransitioning };
}
