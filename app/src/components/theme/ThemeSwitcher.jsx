import { THEMES } from "../../data/themes";
import { useTheme } from "../../context/ThemeContext";

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`theme-swatch${theme === t.id ? " theme-swatch-active" : ""}`}
          title={t.label}
          onClick={() => setTheme(t.id)}
          style={{
            background: `linear-gradient(135deg, ${t.swatch.bg} 50%, ${t.swatch.accent} 50%)`,
            borderColor: t.swatch.ink,
          }}
        >
          {theme === t.id && <i className="fas fa-check" style={{ color: t.swatch.ink }} />}
        </button>
      ))}
    </div>
  );
}

export default ThemeSwitcher;
