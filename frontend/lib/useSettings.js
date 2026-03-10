import { useState, useEffect } from "react";

export const DEFAULT_SETTINGS = {
  autoSpeak: true,
  voiceSpeed: 0.9,
  voiceGender: "female",
  showTimer: true,
  timerDuration: 120,
  autoNext: false,
  accentColor: "purple",
  fontSize: "medium",
  compactMode: false,
  animations: true,
  emailNotifs: false,
  practiceReminder: true,
  reminderFreq: "daily",
  sessionAlerts: true,
  saveHistory: true,
  analytics: true,
  shareData: false,
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("voiceprep_settings");
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch {}
  }, []);
  return settings;
}