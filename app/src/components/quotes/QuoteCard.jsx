import { useQuotes } from "../../hooks/useQuotes";

function QuoteCard() {
  const { current, refreshQuote, retryQuotes, status } = useQuotes();
  const isLoading = status === "loading";
  const hasError = status === "error";

  return (
    <figure className="quote-container">
      <button
        type="button"
        className="redo-btn refresh-quote-btn"
        aria-label={hasError ? "Retry quotes" : "Refresh quote"}
        title={hasError ? "Retry quotes" : "Refresh quote"}
        disabled={isLoading}
        onClick={hasError ? retryQuotes : refreshQuote}
      >
        <i className="fas fa-redo" />
      </button>
      {current ? (
        <>
          <blockquote className="quoteClass">&quot;{current.quote}&quot;</blockquote>
          <figcaption className="authorClass">-{current.author}-</figcaption>
        </>
      ) : (
        <>
          <blockquote className="quoteClass quote-status" aria-live="polite">
            {isLoading ? "Finding a quote…" : "Quotes are taking a break."}
          </blockquote>
          <figcaption className="authorClass">
            {hasError ? "Use refresh to try again" : "One moment"}
          </figcaption>
        </>
      )}
    </figure>
  );
}

export default QuoteCard;
