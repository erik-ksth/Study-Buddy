import { useState } from "react";

const GREETINGS_BY_TIME = {
  morning: ["Good morning", "Morning", "Rise and shine", "A fresh start"],
  afternoon: ["Good afternoon", "Welcome back", "Hello", "Ready to focus"],
  evening: ["Good evening", "Welcome back", "Evening", "Ready to settle in"],
  lateNight: ["Good evening", "Welcome back", "Working late", "Still going strong"],
};

function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "lateNight";
}

function chooseGreeting() {
  const options = GREETINGS_BY_TIME[getTimeOfDay(new Date().getHours())];
  return options[Math.floor(Math.random() * options.length)];
}

function getFirstName(user) {
  const metadata = user?.user_metadata || {};
  const profileName = metadata.given_name || metadata.first_name || metadata.full_name || metadata.name;

  if (typeof profileName === "string" && profileName.trim()) {
    return profileName.trim().split(/\s+/)[0];
  }

  const emailName = user?.email?.split("@")[0]?.split(/[._-]/)[0];
  if (!emailName) return "there";

  return emailName.charAt(0).toLocaleUpperCase() + emailName.slice(1);
}

function GreetingTitle({ user }) {
  const [greeting] = useState(chooseGreeting);

  return (
    <h1 className="personal-greeting">
      {greeting}, {getFirstName(user)}!
    </h1>
  );
}

export default GreetingTitle;
