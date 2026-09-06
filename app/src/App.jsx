import Preloader from "./components/layout/Preloader";
import PomodoroTimer from "./components/timer/PomodoroTimer";
import TodoList from "./components/todo/TodoList";
import MusicPanel from "./components/music/MusicPanel";
import AppsSection from "./components/apps/AppsSection";
import StatsBar from "./components/stats/StatsBar";
import ThemeSwitcher from "./components/theme/ThemeSwitcher";
import FullscreenToggle from "./components/layout/FullscreenToggle";
import CommunityLink from "./components/layout/CommunityLink";
import FeedbackWidget from "./components/feedback/FeedbackWidget";
import UserSurvey from "./components/feedback/UserSurvey";
import LampIcon from "./components/layout/lamp.svg?react";
import NotificationCenter from "./components/notifications/NotificationCenter";
import AccountControl from "./components/account/AccountControl";
import AuthDialog from "./components/account/AuthDialog";
import GreetingTitle from "./components/layout/GreetingTitle";
import { useAuth } from "./context/authState";

function App() {
  const { user } = useAuth();

  return (
    <>
      <Preloader />
      <div className="background-img" />
      <div className="theme-decorations" />
      <div className="theme-clouds" />
      <div className="theme-frame" />
      <ThemeSwitcher />
      <div className="top-left-actions">
        <AccountControl />
        <NotificationCenter />
        <FeedbackWidget />
        <CommunityLink />
      </div>
      <UserSurvey />
      <AuthDialog />
      <div className="container">
        {user ? <GreetingTitle key={user.id} user={user} /> : <h1>study buddy</h1>}

        <div className="home-row">
          <div className="timer-todo-column">
            <PomodoroTimer />
            <TodoList />
          </div>

          <div className="vibes-column">
            <MusicPanel />
            <AppsSection />
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
