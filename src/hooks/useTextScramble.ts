import { useState, useEffect, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#!@$%&";

export function useTextScramble(text: string, trigger: boolean, speed = 28) {
  const [display, setDisplay] = useState(text);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!trigger) return;

    let progress = 0;

    timerRef.current = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, idx) => {
            if (char === " ") return " ";
            if (idx < Math.floor(progress)) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );
      progress += 0.4;
      if (progress >= text.length + 1) {
        setDisplay(text);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, trigger, speed]);

  return display;
}
