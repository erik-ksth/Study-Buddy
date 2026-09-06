import { useEffect, useState } from "react";
import { HYDRATE_DATA_EVENT, signalLocalChange } from "../../lib/localData";

const STORAGE_KEY = "studyBuddyFlashcards";

function loadCards() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved)
      ? saved
          .filter((card) => card?.front && card?.back)
          .map((card) => {
            const createdAt = card.createdAt || new Date().toISOString();
            return {
              ...card,
              id: card.id || crypto.randomUUID(),
              createdAt,
              updatedAt: card.updatedAt || createdAt,
              deletedAt: card.deletedAt || null,
            };
          })
      : [];
  } catch {
    return [];
  }
}

function shuffleDeck(deck) {
  const shuffled = [...deck];

  for (let currentIndex = shuffled.length - 1; currentIndex > 0; currentIndex -= 1) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
    [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
  }

  const orderStayedTheSame = shuffled.every((card, cardIndex) => card.id === deck[cardIndex].id);
  if (shuffled.length > 1 && orderStayedTheSame) shuffled.push(shuffled.shift());

  return shuffled;
}

function FlashcardsApp() {
  const [storedCards, setStoredCards] = useState(loadCards);
  const cards = storedCards.filter((card) => !card.deletedAt);
  const [mode, setMode] = useState("review");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [instantFlip, setInstantFlip] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedCards));
    signalLocalChange("flashcards");
  }, [storedCards]);

  useEffect(() => {
    function handleHydration(event) {
      if (event.detail?.namespace !== "flashcards") return;
      setStoredCards(event.detail.value || []);
      setIndex(0);
      setFlipped(false);
    }
    window.addEventListener(HYDRATE_DATA_EVENT, handleHydration);
    return () => window.removeEventListener(HYDRATE_DATA_EVENT, handleHydration);
  }, []);

  function addCard(event) {
    event.preventDefault();
    if (!front.trim() || !back.trim()) return;
    const createdAt = new Date().toISOString();
    const card = { id: crypto.randomUUID(), front: front.trim(), back: back.trim(), createdAt, updatedAt: createdAt, deletedAt: null };
    setStoredCards((current) => [...current, card]);
    setIndex(cards.length);
    setFront("");
    setBack("");
    setFlipped(false);
    setMode("review");
  }

  function showCard(nextIndex) {
    setIndex((nextIndex + cards.length) % cards.length);
    setFlipped(false);
    setInstantFlip(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setInstantFlip(false)));
  }

  function toggleFlip(fromKeyboard = false) {
    setInstantFlip(fromKeyboard);
    setFlipped((current) => !current);
    if (fromKeyboard) requestAnimationFrame(() => setInstantFlip(false));
  }

  function removeCurrent() {
    const cardToRemove = cards[index];
    const nextCards = cards.filter((card) => card.id !== cardToRemove.id);
    const updatedAt = new Date().toISOString();
    setStoredCards((current) => current.map((card) => card.id === cardToRemove.id ? { ...card, deletedAt: updatedAt, updatedAt } : card));
    setFlipped(false);
    if (!nextCards.length) {
      setIndex(0);
      setMode("create");
    } else {
      setIndex(Math.min(index, nextCards.length - 1));
    }
  }

  function shuffleCards() {
    if (cards.length < 2) return;
    const shuffled = shuffleDeck(cards);
    const visibleOrder = new Map(shuffled.map((card, cardIndex) => [card.id, cardIndex]));
    setStoredCards((current) => [...current].sort((a, b) => {
      if (a.deletedAt || b.deletedAt) return 0;
      return visibleOrder.get(a.id) - visibleOrder.get(b.id);
    }));
    setIndex(0);
    setFlipped(false);
    setInstantFlip(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setInstantFlip(false)));
  }

  function handleCardKeyDown(event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showCard(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      showCard(index - 1);
    }
  }

  const currentCard = cards[index];

  return (
    <div className="flashcards-app">
      {cards.length > 0 && (
        <div className="flashcards-toolbar">
          <div className="flashcards-tabs" role="tablist" aria-label="Flashcard views">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "review"}
              onClick={() => setMode("review")}
            >
              Review
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "create"}
              onClick={() => setMode("create")}
            >
              <i className="fa-solid fa-plus" aria-hidden="true" /> Add card
            </button>
          </div>
        </div>
      )}

      {mode === "review" && currentCard ? (
        <section className="flashcard-review" role="tabpanel">
          <div className="flashcard-position">{index + 1} / {cards.length}</div>

          <button
            className={`study-card${flipped ? " study-card-flipped" : ""}${instantFlip ? " study-card-instant" : ""}`}
            type="button"
            onClick={(event) => toggleFlip(event.detail === 0)}
            onKeyDown={handleCardKeyDown}
            aria-label={`${flipped ? "Answer" : "Question"}: ${flipped ? currentCard.back : currentCard.front}. Press Space to flip.`}
            autoFocus
          >
            <span className="study-card-inner">
              <span className="study-card-face study-card-front">
                <strong>{currentCard.front}</strong>
              </span>
              <span className="study-card-face study-card-back">
                <strong>{currentCard.back}</strong>
              </span>
            </span>
          </button>

          <div className="flashcard-actions">
            <div className="flashcard-action-tools">
              <button className="flashcard-remove" type="button" onClick={removeCurrent} aria-label="Remove current card">
                <i className="fa-solid fa-trash" aria-hidden="true" />
              </button>
              <button className="flashcard-shuffle" type="button" onClick={shuffleCards} disabled={cards.length < 2} title="Shuffle deck">
                <i className="fa-solid fa-shuffle" aria-hidden="true" />
                <span>Shuffle</span>
              </button>
            </div>
            <div className="flashcard-navigation">
              <button type="button" onClick={() => showCard(index - 1)} disabled={cards.length < 2} aria-label="Previous card">
                <i className="fa-solid fa-arrow-left" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => showCard(index + 1)} disabled={cards.length < 2} aria-label="Next card">
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="flashcard-create" role="tabpanel">
          <form
            className="flashcard-form"
            onSubmit={addCard}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) addCard(event);
            }}
          >
            <label>
              Question or term
              <textarea
                value={front}
                onChange={(event) => setFront(event.target.value)}
                aria-label="Flashcard question or term"
                autoFocus
              />
            </label>
            <label>
              Answer
              <textarea
                value={back}
                onChange={(event) => setBack(event.target.value)}
                aria-label="Flashcard answer"
              />
            </label>
            <div className="flashcard-form-footer">
              <button type="submit" disabled={!front.trim() || !back.trim()}>
                <i className="fa-solid fa-plus" aria-hidden="true" /> Add card
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

export default FlashcardsApp;
