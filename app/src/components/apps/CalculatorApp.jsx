import { useEffect, useRef, useState } from "react";
import { evaluateExpression, formatCalculatorResult } from "./calculatorMath";

const KEYS = [
  { label: "DEG", action: "angle", kind: "mode" },
  { label: "(", token: "(" },
  { label: ")", token: ")" },
  { label: "AC", action: "clear", kind: "utility" },
  { label: "⌫", action: "backspace", kind: "utility", ariaLabel: "Backspace" },
  { label: "sin", token: "sin()", cursorOffset: -1, kind: "function" },
  { label: "cos", token: "cos()", cursorOffset: -1, kind: "function" },
  { label: "tan", token: "tan()", cursorOffset: -1, kind: "function" },
  { label: "ln", token: "ln()", cursorOffset: -1, kind: "function" },
  { label: "log", token: "log()", cursorOffset: -1, kind: "function" },
  { label: "√", token: "sqrt()", cursorOffset: -1, kind: "function" },
  { label: "x²", token: "^2", kind: "function" },
  { label: "xʸ", token: "^", kind: "function" },
  { label: "π", token: "π", kind: "function" },
  { label: "e", token: "e", kind: "function" },
  { label: "7", token: "7" },
  { label: "8", token: "8" },
  { label: "9", token: "9" },
  { label: "÷", token: "÷", kind: "operator" },
  { label: "%", token: "%", kind: "operator" },
  { label: "4", token: "4" },
  { label: "5", token: "5" },
  { label: "6", token: "6" },
  { label: "×", token: "×", kind: "operator" },
  { label: "Ans", token: "Ans", kind: "function" },
  { label: "1", token: "1" },
  { label: "2", token: "2" },
  { label: "3", token: "3" },
  { label: "−", token: "−", kind: "operator" },
  { label: "=", action: "equals", kind: "equals" },
  { label: "0", token: "0", kind: "zero" },
  { label: ".", token: "." },
  { label: "+", token: "+", kind: "operator" },
];

const RESULT_CONTINUATION_TOKENS = new Set(["+", "−", "×", "÷", "%", "^", "^2"]);
const KEYBOARD_TOKEN_ALIASES = { "*": "×", "/": "÷", "-": "−" };

function CalculatorApp() {
  const inputRef = useRef(null);
  const [expression, setExpression] = useState("0");
  const [result, setResult] = useState("0");
  const [answer, setAnswer] = useState(0);
  const [angleMode, setAngleMode] = useState("DEG");
  const [hasError, setHasError] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function focusAt(position, endPosition = position) {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(position, endPosition);
    });
  }

  function insertToken(token, cursorOffset = 0) {
    if (hasResult) {
      let nextExpression = token;
      let nextCursorOffset = cursorOffset;

      if (!hasError && RESULT_CONTINUATION_TOKENS.has(token)) {
        nextExpression = `${result}${token}`;
        nextCursorOffset = 0;
      } else if (!hasError && token.endsWith("()")) {
        nextExpression = `${token.slice(0, -1)}${result})`;
        nextCursorOffset = 0;
      }

      setExpression(nextExpression);
      setHasError(false);
      setHasResult(false);
      focusAt(nextExpression.length + nextCursorOffset);
      return;
    }

    const input = inputRef.current;
    const start = input?.selectionStart ?? expression.length;
    const end = input?.selectionEnd ?? start;
    const nextExpression = `${expression.slice(0, start)}${token}${expression.slice(end)}`;
    setExpression(nextExpression);
    setHasError(false);
    setHasResult(false);
    focusAt(start + token.length + cursorOffset);
  }

  function backspace() {
    const input = inputRef.current;
    const start = input?.selectionStart ?? expression.length;
    const end = input?.selectionEnd ?? start;
    if (start === 0 && end === 0) return;
    const deleteFrom = start === end ? start - 1 : start;
    setExpression(`${expression.slice(0, deleteFrom)}${expression.slice(end)}`);
    setHasError(false);
    setHasResult(false);
    focusAt(deleteFrom);
  }

  function clear() {
    setExpression("0");
    setResult("0");
    setHasError(false);
    setHasResult(false);
    focusAt(0, 1);
  }

  function calculate() {
    if (!expression.trim()) return;
    try {
      const value = evaluateExpression(expression, { angleMode, answer });
      setAnswer(value);
      setResult(formatCalculatorResult(value));
      setHasError(false);
      setHasResult(true);
    } catch {
      setResult("Check expression");
      setHasError(true);
      setHasResult(true);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === "=") {
      event.preventDefault();
      calculate();
    } else if (
      hasResult
      && !event.metaKey
      && !event.ctrlKey
      && !event.altKey
      && /^[0-9.+\-*/%^()a-z]$/i.test(event.key)
    ) {
      event.preventDefault();
      insertToken(KEYBOARD_TOKEN_ALIASES[event.key] || event.key);
    }
  }

  function runKey(key) {
    if (key.action === "clear") clear();
    else if (key.action === "backspace") backspace();
    else if (key.action === "equals") calculate();
    else if (key.action === "angle") setAngleMode((mode) => (mode === "DEG" ? "RAD" : "DEG"));
    else insertToken(key.token, key.cursorOffset);
  }

  return (
    <div className="calculator-app">
      <div
        className={`calculator-screen${hasResult ? " calculator-screen-solved" : ""}${hasError ? " calculator-screen-error" : ""}`}
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          className="calculator-expression"
          value={expression}
          onChange={(event) => {
            setExpression(event.target.value);
            setHasError(false);
            setHasResult(false);
          }}
          onKeyDown={handleKeyDown}
          aria-label="Calculator expression"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          autoFocus
        />
        <output className="calculator-result" aria-live="polite" aria-hidden={!hasResult}>
          {result}
        </output>
      </div>

      <div className="calculator-keys">
        {KEYS.map((key) => {
          const label = key.action === "angle" ? angleMode : key.label;
          return (
            <button
              key={key.label}
              className={`calculator-key${key.kind ? ` calculator-key-${key.kind}` : ""}`}
              type="button"
              aria-label={key.ariaLabel || label}
              aria-pressed={key.action === "angle" ? angleMode === "RAD" : undefined}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => runKey(key)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CalculatorApp;
