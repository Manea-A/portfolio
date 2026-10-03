"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import type { Project } from "@/lib/projects";
import TechIcon, { hasIcon } from "@/components/TechIcon";
import ArchDiagram from "@/components/ArchDiagram";
import IridescentButton from "@/components/ui/IridescentButton";

/**
 * One-page work gallery. A bento grid of project cards; clicking a card
 * morphs it into a full case-study panel (shared layoutId) with every
 * detail — problem, architecture, metrics, decisions, outcome, stack —
 * no separate pages. Deep-linkable: /?project=<slug> (and the legacy
 * /work/<slug> URLs redirect here) opens the matching panel on load.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/** screenshot slot — drop files into public/projects/ and set p.image */
function Cover({ p, className = "" }: { p: Project; className?: string }) {
  if (p.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={p.image}
        alt={`${p.title} screenshot`}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(120deg, color-mix(in srgb, ${p.hue[0]} 32%, var(--bg-soft)), color-mix(in srgb, ${p.hue[1]} 26%, var(--bg-soft)) 70%, var(--bg-soft))`,
      }}
    >
      {/* halftone dots give the placeholder its printed texture */}
      <div className="halftone absolute inset-0 opacity-80" />
      <span
        className="voice-display absolute -bottom-7 -right-2 text-[7rem] leading-none opacity-15 md:text-[9rem]"
        style={{ color: p.hue[1] }}
      >
        {p.index}
      </span>
    </div>
  );
}

function StackRow({ stack, size = 20 }: { stack: string[]; size?: number }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {stack.map((t) =>
        hasIcon(t) ? (
          <li key={t} title={t} className="text-muted transition-colors hover:text-fg">
            <TechIcon name={t} size={size} />
            <span className="sr-only">{t}</span>
          </li>
        ) : (
          <li key={t} className="label rounded-full border border-[var(--line)] px-2.5 py-1 text-muted">
            {t}
          </li>
        )
      )}
    </ul>
  );
}

export default function ProjectGallery({ projects }: { projects: Project[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const open = projects.find((p) => p.slug === openSlug);
  const openIndex = open ? projects.indexOf(open) : -1;
  const prev = openIndex >= 0 ? projects[(openIndex - 1 + projects.length) % projects.length] : null;
  const next = openIndex >= 0 ? projects[(openIndex + 1) % projects.length] : null;

  // deep link: /?project=<slug> opens the matching case study on load
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("project");
    if (slug && projects.some((p) => p.slug === slug)) {
      setOpenSlug(slug);
      document.getElementById("work")?.scrollIntoView({ behavior: "instant", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the URL shareable while a case study is open
  useEffect(() => {
    const url = new URL(window.location.href);
    if (openSlug) url.searchParams.set("project", openSlug);
    else url.searchParams.delete("project");
    window.history.replaceState(null, "", url);
  }, [openSlug]);

  // ESC closes; body scroll locks while the panel is up
  useEffect(() => {
    if (!openSlug) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenSlug(null);
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openSlug]);

  // prev/next inside the panel: jump back to the top of the new story
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [openSlug]);

  return (
    <>
      {/* bento grid: first project leads, the rest tile around it */}
      <div className="mx-auto grid max-w-6xl gap-5 px-5 md:grid-cols-6 md:px-8">
        {projects.map((p, i) => (
          <motion.button
            key={p.slug}
            type="button"
            layoutId={reduced ? undefined : `card-${p.slug}`}
            onClick={() => setOpenSlug(p.slug)}
            className={`group cursor-pointer overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] text-left transition-colors hover:border-[var(--line-strong)] ${
              i === 0 ? "md:col-span-4" : i === 1 ? "md:col-span-2" : "md:col-span-2"
            }`}
            aria-haspopup="dialog"
            aria-label={`Open ${p.title} case study`}
          >
            <div className={`relative overflow-hidden ${i === 0 ? "aspect-[16/8]" : "aspect-[16/10]"}`}>
              <Cover p={p} className="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
              <span className="label absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1.5 text-fg backdrop-blur-sm">
                {p.year.replace(" — present", " →")}
              </span>
            </div>
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="voice-display text-xl text-fg md:text-2xl">{p.title}</h3>
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--line)] text-muted transition-all group-hover:border-transparent group-hover:bg-gradient-accent group-hover:text-[#0d0c10]"
                >
                  +
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                {p.line ?? p.problem}
              </p>
              {/* verified numbers only — no metric, no chip */}
              {p.metrics.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {p.metrics.slice(0, 3).map((m) => (
                    <li
                      key={m.label}
                      className="label rounded-full border border-[var(--line)] px-2.5 py-1 text-muted"
                    >
                      <span className="text-gradient normal-case tracking-normal">{m.value}</span>{" "}
                      {m.label.split(",")[0]}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4">
                <StackRow stack={p.stack.filter(hasIcon).slice(0, 6)} />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* expanded case study — same page, morphs out of the card */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenSlug(null)}
          />
        )}
        {open && (
          <div
            key="panel-wrap"
            className="fixed inset-0 z-50 grid place-items-center p-3 md:p-8"
            onClick={() => setOpenSlug(null)}
          >
            <motion.div
              ref={panelRef}
              layoutId={reduced ? undefined : `card-${open.slug}`}
              transition={{ duration: 0.5, ease: EASE }}
              className="grain max-h-[90svh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[var(--line-strong)] bg-[var(--bg-soft)] shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
              role="dialog"
              aria-modal="true"
              aria-label={`${open.title} case study`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/7]">
                <Cover p={open} />
                <button
                  type="button"
                  autoFocus
                  onClick={() => setOpenSlug(null)}
                  className="label absolute right-4 top-4 cursor-pointer rounded-full bg-black/50 px-4 py-2 text-fg backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  Close ✕
                </button>
              </div>

              <div key={open.slug} className="p-6 md:p-9">
                <p className="label text-gradient">{open.context}</p>
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="voice-display text-3xl text-fg md:text-4xl">{open.title}</h3>
                  <span className="label text-muted">
                    {open.year.replace(" — present", " →").replace(" — ", " → ")}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted">{open.role}</p>

                <div className="rule mt-6 pt-6">
                  <h4 className="label mb-3 text-muted">The problem</h4>
                  <p className="voice-display text-lg leading-snug text-fg md:text-xl">
                    {open.problem}
                  </p>
                  <p className="mt-4 leading-relaxed text-muted">{open.summary}</p>
                </div>

                {open.metrics.length > 0 && (
                  <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {open.metrics.map((m) => (
                      <div key={m.label} className="glass grain rounded-2xl p-4">
                        <div className="voice-display text-gradient text-2xl">{m.value}</div>
                        <div className="label mt-2 leading-relaxed text-muted normal-case tracking-normal">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {open.diagram && (
                  <div className="rule mt-7 pt-6">
                    <h4 className="label mb-4 text-muted">The architecture</h4>
                    <ArchDiagram diagram={open.diagram} title={open.title} flow={open.flow} />
                  </div>
                )}

                {open.decisions.length > 0 && (
                  <div className="rule mt-7 pt-6">
                    <h4 className="label mb-4 text-muted">Decisions that mattered</h4>
                    <ol className="space-y-5">
                      {open.decisions.map((d, i) => (
                        <li key={d.title} className="flex gap-4">
                          <span className="voice-display text-gradient shrink-0 text-lg">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <h5 className="text-fg">{d.title}</h5>
                            <p className="mt-1 text-sm leading-relaxed text-muted">{d.body}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {open.retrospective && (
                  <div className="rule mt-7 pt-6">
                    <h4 className="label mb-3 text-muted">What broke / what I&apos;d change</h4>
                    <p className="leading-relaxed text-muted">{open.retrospective}</p>
                  </div>
                )}

                <div className="rule mt-7 pt-6">
                  <h4 className="label mb-3 text-muted">Outcome</h4>
                  <p className="leading-relaxed text-fg">{open.outcome}</p>
                </div>

                <div className="rule mt-7 pt-6">
                  <h4 className="label mb-4 text-muted">Stack</h4>
                  <StackRow stack={open.stack} size={24} />
                </div>

                {/* prev / next case study */}
                {prev && next && (
                  <nav
                    aria-label="More case studies"
                    className="rule mt-8 flex items-center justify-between gap-4 pt-6"
                  >
                    <IridescentButton
                      size="md"
                      onClick={() => setOpenSlug(prev.slug)}
                      className="label text-muted hover:text-fg"
                    >
                      <span aria-hidden="true">←</span>
                      {prev.title}
                    </IridescentButton>
                    <IridescentButton
                      size="md"
                      onClick={() => setOpenSlug(next.slug)}
                      className="label text-muted hover:text-fg"
                    >
                      {next.title}
                      <span aria-hidden="true">→</span>
                    </IridescentButton>
                  </nav>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
