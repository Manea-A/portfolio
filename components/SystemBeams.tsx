"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Signature background: system beams.
 * Curved data pipelines sweep across a blueprint grid; light pulses
 * travel along them like requests moving through the system. Each
 * pulse refracts the full prism IN SPECTRAL ORDER along its length,
 * kept at light-trail opacity (L3) so it never competes with the
 * name or the ring.
 *
 * Pure SVG + animated gradients (the technique behind the popular
 * "background beams" prebuilts) — no WebGL, ~zero bundle cost.
 * Static faint lines under prefers-reduced-motion.
 */

const W = 1440;
const H = 900;

/* layered ribbons flowing left → right through the hero's lower half */
const BEAMS = Array.from({ length: 9 }, (_, i) => {
  const y = 330 + i * 54;
  const c1y = y - 150 - i * 8;
  const c2y = y + 130 - i * 5;
  const ey = y - 70 + i * 12;
  return `M -80 ${y} C 430 ${c1y}, 990 ${c2y}, 1540 ${ey}`;
});

export default function SystemBeams({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden="true" className={`pointer-events-none ${className}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        fill="none"
      >
        <defs>
          {BEAMS.map((_, i) =>
            reduced ? null : (
              <motion.linearGradient
                key={`pulse-grad-${i}`}
                id={`pulse-${i}`}
                initial={{ x1: "-40%", x2: "-15%", y1: "0%", y2: "0%" }}
                animate={{ x1: "110%", x2: "135%" }}
                transition={{
                  duration: 4.5 + (i % 4) * 1.4,
                  delay: i * 0.9,
                  repeat: Infinity,
                  repeatDelay: 1.2 + (i % 3) * 1.1,
                  ease: "linear",
                }}
              >
                <stop stopColor="var(--spec-1)" stopOpacity="0" />
                <stop offset="0.14" stopColor="var(--spec-1)" />
                <stop offset="0.29" stopColor="var(--spec-2)" />
                <stop offset="0.43" stopColor="var(--spec-3)" />
                <stop offset="0.57" stopColor="var(--spec-4)" />
                <stop offset="0.71" stopColor="var(--spec-5)" />
                <stop offset="0.86" stopColor="var(--spec-6)" />
                <stop offset="1" stopColor="var(--spec-6)" stopOpacity="0" />
              </motion.linearGradient>
            )
          )}
        </defs>

        {/* faint pipeline traces */}
        {BEAMS.map((d, i) => (
          <path
            key={`base-${i}`}
            d={d}
            stroke="var(--fg)"
            strokeOpacity={0.07}
            strokeWidth="1"
          />
        ))}

        {/* travelling light pulses — light-trail opacity (L3) with a
            soft neutral bloom so the color reads as light, not paint */}
        {!reduced && (
          <g
            opacity={0.55}
            style={{ filter: "drop-shadow(0 0 7px rgba(255,255,255,0.12))" }}
          >
            {BEAMS.map((d, i) => (
              <path
                key={`pulse-${i}`}
                d={d}
                stroke={`url(#pulse-${i})`}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
