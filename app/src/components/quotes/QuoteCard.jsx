import { useQuotes } from "../../hooks/useQuotes";

function QuoteCard() {
  const { current, refreshQuote } = useQuotes();

  return (
    <figure className="quote-container">
      <button className="redo-btn refresh-quote-btn" onClick={refreshQuote}>
        <i className="fas fa-redo" />
      </button>
      <blockquote className="quoteClass">&quot;{current.quote}&quot;</blockquote>
      <figcaption className="authorClass">-{current.author}-</figcaption>
    </figure>
  );
}

export default QuoteCard;
