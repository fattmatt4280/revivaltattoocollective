"use client";
import { useEffect, useRef } from "react";

export function CursorSpotlight() {
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = spotRef.current;
    if (!el) return;

    let raf: number;
    let cx = -600, cy = -600;
    let tx = -600, ty = -600;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const tick = () => {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      el.style.background = `radial-gradient(700px circle at ${cx}px ${cy}px, oklch(0.42 0.18 25 / 0.08), transparent 70%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={spotRef}
      className="pointer-events-none fixed inset-0 z-[5] hidden md:block"
      aria-hidden
    />
  );
}
