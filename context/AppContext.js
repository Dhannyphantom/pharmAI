"use client";
import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveMode, setLiveModeState] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("pharmai-live-mode") === "true";
  });

  const setLiveMode = useCallback((value) => {
    setLiveModeState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pharmai-live-mode", value ? "true" : "false");
    }
  }, []);

  const addScore = useCallback((correct) => {
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  }, []);

  const resetScore = useCallback(() => setScore({ correct: 0, total: 0 }), []);

  const toggleFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleFullscreen]);

  return (
    <AppCtx.Provider
      value={{
        score, addScore, resetScore,
        isFullscreen, toggleFullscreen,
        liveMode, setLiveMode,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
