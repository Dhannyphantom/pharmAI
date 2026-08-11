"use client";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function ConfettiBurst({ trigger }) {
  useEffect(() => {
    if (!trigger) return;
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#22D3EE", "#7C5CFF", "#2F6FED", "#34D399"],
    });
  }, [trigger]);
  return null;
}
