"use client";

import { useEffect, useState } from "react";

/**
 * One phrase at a time, rising into place every few seconds. Every phrase is
 * in the DOM for screen readers; reduced motion keeps the first one still.
 */
export default function RotatingWords({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="rotating relative inline-grid align-bottom">
      <span className="sr-only">{words.join(", ")}</span>
      {words.map((w, n) => (
        <span
          key={w}
          aria-hidden="true"
          data-state={n === i ? "in" : n === (i - 1 + words.length) % words.length ? "out" : "wait"}
          className="rotating-word whitespace-nowrap [grid-area:1/1]"
        >
          {w}
        </span>
      ))}
    </span>
  );
}
