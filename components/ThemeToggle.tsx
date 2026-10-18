"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const current = (): Theme =>
  (document.documentElement.dataset.theme as Theme | undefined) ??
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

/**
 * Sun ⇄ moon toggle. The icon morphs (the moon's bite slides in, the rays
 * fold away), and the new theme spreads across the page as a circle growing
 * from the button, using the View Transitions API where available.
 * The choice is remembered; until then the OS setting decides.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => setTheme(current()), []);

  const apply = (next: Theme) => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
    window.dispatchEvent(new Event("themechange"));
  };

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = current() === "dark" ? "light" : "dark";
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || reduced) return apply(next);

    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    doc.startViewTransition(() => apply(next)).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  };

  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light mode" : "Dark mode"}
      data-dark={dark || undefined}
      className="theme-toggle group relative grid h-9 w-9 place-items-center rounded-full border border-line text-fg transition-colors hover:border-line-strong hover:bg-surface"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="overflow-visible">
        <mask id="theme-moon">
          <rect x="-4" y="-4" width="32" height="32" fill="white" />
          <circle className="theme-bite" cx="25" cy="-1" r="6.5" fill="black" />
        </mask>
        <circle className="theme-core" cx="12" cy="12" r="5" fill="currentColor" mask="url(#theme-moon)" />
        <g className="theme-rays" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${a} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
}
