import { THEMES } from "../../data/themes";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/authState";

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { user, requestSignIn } = useAuth();

  return (
    <div className="theme-switcher" role="group" aria-label="Choose a color theme">
      {THEMES.map((t) => {
        const isLocked = t.id === "sakura" && !user;
        return <button
          key={t.id}
          type="button"
          className={`theme-swatch${theme === t.id ? " theme-swatch-active" : ""}${isLocked ? " theme-swatch-locked" : ""}`}
          aria-label={isLocked ? `Sign in to use ${t.label} theme` : `Use ${t.label} theme`}
          aria-pressed={theme === t.id}
          title={isLocked ? `${t.label} — sign in to unlock` : t.label}
          onClick={() => isLocked ? requestSignIn("Sakura theme") : setTheme(t.id)}
          style={{
            background: `linear-gradient(135deg, ${t.swatch.bg} 50%, ${t.swatch.accent} 50%)`,
            borderColor: t.swatch.ink,
          }}
        >
          {isLocked ? (
            <i className="fas fa-lock" style={{ color: t.swatch.ink }} aria-hidden="true" />
          ) : theme === t.id ? (
            <i className="fas fa-check" style={{ color: t.swatch.ink }} aria-hidden="true" />
          ) : null}
        </button>
      })}
    </div>
  );
}

export default ThemeSwitcher;
