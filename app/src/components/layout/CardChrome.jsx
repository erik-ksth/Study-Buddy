// The mini/maximize buttons are decorative in the original design — they never had
// click handlers. The close button is only ever functional when a card actually
// passes onClose (e.g. the timer settings popover) — everywhere else it's just as
// decorative as mini/max, so it only gets the "clickable" styling when it's
// actually wired to something.
function CardChrome({ onClose, showMinMax = true }) {
  return (
    <div className="windows-btn-container">
      {showMinMax && (
        <>
          <div className="windows-btn windows-btn-mini">
            <div className="mini-btn" />
          </div>
          <div className="windows-btn windows-btn-max">
            <div className="max-btn" />
          </div>
        </>
      )}
      <div
        className={`windows-btn windows-btn-close${onClose ? " windows-btn-close-wired" : ""}`}
        onClick={onClose}
      >
        <i className="fas fa-times close-btn" />
      </div>
    </div>
  );
}

export default CardChrome;
