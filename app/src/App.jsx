import Preloader from "./components/layout/Preloader";
import PomodoroTimer from "./components/timer/PomodoroTimer";
import TodoList from "./components/todo/TodoList";
import MusicPanel from "./components/music/MusicPanel";
import QuoteCard from "./components/quotes/QuoteCard";
import StatsBar from "./components/stats/StatsBar";
import ThemeSwitcher from "./components/theme/ThemeSwitcher";
import FullscreenToggle from "./components/layout/FullscreenToggle";
import FeedbackWidget from "./components/feedback/FeedbackWidget";
import UserSurvey from "./components/feedback/UserSurvey";
import LampIcon from "./components/layout/lamp.svg?react";

function App() {
  return (
    <>
      <Preloader />
      <div className="background-img" />
      <div className="theme-decorations" />
      <div className="theme-clouds" />
      <div className="theme-frame" />
      <ThemeSwitcher />
      <FeedbackWidget />
      <UserSurvey />
      <div className="container">
        <h1>study buddy</h1>

        <div className="home-row">
          <div className="timer-todo-column">
            <PomodoroTimer />
            <TodoList />
          </div>

          <div className="vibes-column">
            <MusicPanel />
            <QuoteCard />
          </div>
        </div>

        <StatsBar />

        <span className="signature">
          <a href="https://www.erikhein.info/">
            <LampIcon className="signature-icon" />
          </a>
        </span>

        <FullscreenToggle />
      </div>
    </>
  );
}

export default App;
