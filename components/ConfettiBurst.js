"use client";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function ConfettiBurst({ trigger }) {
  useEffect(() => {
    if (!trigger) return;
    confetti({
      particleCount: 80,
      spread: 65,
      origin: { y: 0.6 },
      colors: ["#3b6fe0", "#4f9d74", "#9aa1ac"],
    });
  }, [trigger]);
  return null;
}
