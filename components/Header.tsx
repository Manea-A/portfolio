"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import IridescentButton from "@/components/ui/IridescentButton";

const nav = [
  { href: "/#about", label: "About", always: false },
  { href: "/#work", label: "Work", always: true },
  { href: "/#experience", label: "Experience", always: false },
  { href: "/#writing", label: "Writing", always: false },
  { href: "/#contact", label: "Contact", always: true },
];

/** Floating glass pill nav — condenses once the page starts scrolling. */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={reduced ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="fixed inset-x-0 top-3 z-40 px-3 md:top-5"
    >
      <div
        className={`mx-auto flex max-w-4xl items-center justify-between rounded-full border px-3 py-2 transition-all duration-500 md:px-3.5 ${
          scrolled
            ? "border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--bg)_78%,transparent)] shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            : "border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_45%,transparent)] backdrop-blur-md"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* the reference use case: circular iridescent home button */}
          <IridescentButton href="/" size="icon" aria-label="Home">
            {/* quiet white core — the prism ring around it is the color */}
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full bg-white/80"
            />
          </IridescentButton>
          <Link
            href="/"
            className="voice-display whitespace-nowrap text-[0.95rem] tracking-tight text-fg transition-colors hover:text-white"
          >
            Manea<span className="hidden sm:inline">&nbsp;Abdullah</span>
          </Link>
        </div>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-1 md:gap-2">
            {nav.map((item) => (
              <li key={item.href} className={item.always ? "" : "hidden sm:block"}>
                <IridescentButton
                  href={item.href}
                  size="sm"
                  className="label text-muted transition-colors hover:text-fg"
                >
                  {item.label}
                </IridescentButton>
              </li>
            ))}
            <li className="ml-1 md:ml-2">
              <IridescentButton
                href="/Manea-Abdullah-CV.pdf"
                download
                size="sm"
                className="label text-fg"
              >
                CV ↓
              </IridescentButton>
            </li>
          </ul>
        </nav>
      </div>
    </motion.header>
  );
}
