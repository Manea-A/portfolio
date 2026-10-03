"use client";

import SystemBeams from "./SystemBeams";

/* SVG beams are featherweight — no lazy loading needed anymore. */
export default function HeroVisual({ className = "" }: { className?: string }) {
  return <SystemBeams className={className} />;
}
