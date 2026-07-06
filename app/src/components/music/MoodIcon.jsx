import { MOOD_ICONS } from "./icons";

function MoodIcon({ genre, isSelected, onClick }) {
  const Icon = MOOD_ICONS[genre.icon];

  return (
    <div className="mood-container">
      <div
        className={`icon-box${isSelected ? " mood-selected" : ""}`}
        data-mood={genre.icon}
        title={genre.label}
        onClick={onClick}
      >
        {Icon && <Icon className="mood-icon-svg" />}
        {isSelected && <i className="fas fa-sync mood-selected-badge" />}
      </div>
      <label className="mood-label">{genre.label}</label>
    </div>
  );
}

export default MoodIcon;
