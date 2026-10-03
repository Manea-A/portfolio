"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

/** Shared scroll-reveal + stagger primitives. One easing, one language. */

const EASE = [0.22, 1, 0.36, 1] as const;

export function FadeIn({
  children,
  className = "",
  delay = 0,
  y = 28,
  immediate = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** play on mount (hero content already in view) instead of on scroll */
  immediate?: boolean;
}) {
  const reduced = useReducedMotion();
  const visible = { opacity: 1, y: 0, filter: "blur(0px)" };
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y, filter: "blur(6px)" }}
      {...(immediate
        ? { animate: visible }
        : { whileInView: visible, viewport: { once: true, margin: "-80px" } })}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: EASE },
  },
};

export function Stagger({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial={reduced ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

/** Hero headline: each word rises out of an overflow clip, staggered. */
export function SplitWords({
  text,
  className = "",
  gradientWords = [],
  baseDelay = 0,
}: {
  text: string;
  className?: string;
  /** word indexes to paint with gradient ink (serializable for RSC) */
  gradientWords?: number[];
  baseDelay?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} aria-hidden="true">
          <span className="inline-block overflow-hidden pb-[0.08em] align-baseline">
            <motion.span
              className={`inline-block ${gradientWords.includes(i) ? "text-gradient" : ""}`}
              initial={reduced ? false : { y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: baseDelay + i * 0.08, ease: EASE }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
