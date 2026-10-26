"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EMAIL } from "@/lib/site";

/*
 * "Book a call": pick a kind of call, a day and a time (Riyadh working
 * hours, shown in the visitor's own time too), add a name and a note.
 *
 * With NEXT_PUBLIC_BOOKING_URL set (a Cal.com or Calendly page) the last
 * step hands over to it so the slot is booked for real. Without it the
 * visitor sends a prefilled request by email and can drop the invite
 * straight into their own Google Calendar.
 */

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;

const KINDS = [
  { id: "intro", label: "Intro call", minutes: 15, note: "Say hello, see if we're a fit." },
  { id: "project", label: "Project chat", minutes: 30, note: "A product, a system, or a role you're hiring for." },
  { id: "deep", label: "Technical deep-dive", minutes: 45, note: "Architecture, AI, or a codebase that needs a plan." },
] as const;

const RIYADH_OFFSET = 3; // UTC+3, no daylight saving
const DAYS_AHEAD = 60;
const OPEN = 10; // 10:00 Riyadh
const CLOSE = 17; // last call ends by 17:00

type Kind = (typeof KINDS)[number];

type Day = { y: number; m: number; d: number };

/** today's date in Riyadh */
function riyadhToday(): Day {
  const now = new Date(Date.now() + RIYADH_OFFSET * 3600e3);
  return { y: now.getUTCFullYear(), m: now.getUTCMonth(), d: now.getUTCDate() };
}
const dayNum = (d: Day) => Date.UTC(d.y, d.m, d.d) / 864e5;
/** bookable: from tomorrow up to DAYS_AHEAD, Sunday to Thursday */
function bookable(d: Day, today: Day) {
  const diff = dayNum(d) - dayNum(today);
  const dow = new Date(Date.UTC(d.y, d.m, d.d)).getUTCDay();
  return diff >= 1 && diff <= DAYS_AHEAD && dow !== 5 && dow !== 6;
}
const sameDay = (a: Day | null, b: Day) => !!a && a.y === b.y && a.m === b.m && a.d === b.d;

/** the UTC instant of hh:mm Riyadh time on a Riyadh date */
const instant = (day: Day, minutes: number) =>
  new Date(Date.UTC(day.y, day.m, day.d, 0, minutes) - RIYADH_OFFSET * 3600e3);

const gcalStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export default function BookCall({ className, children }: { className: string; children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<Kind>(KINDS[1]);
  const today = useMemo(riyadhToday, []);
  const [day, setDay] = useState<Day | null>(null);
  const [view, setView] = useState(() => ({ y: today.y, m: today.m }));
  const [slot, setSlot] = useState<number | null>(null); // minutes after Riyadh midnight
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const localZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const showLocal = !/Riyadh/.test(localZone) && new Date().getTimezoneOffset() !== -RIYADH_OFFSET * 60;

  const slots = useMemo(() => {
    const step = kind.minutes === 45 ? 60 : 30;
    const out: number[] = [];
    for (let t = OPEN * 60; t + kind.minutes <= CLOSE * 60; t += step) out.push(t);
    return out;
  }, [kind]);

  const start = slot === null || !day ? null : instant(day, slot);
  const end = start && new Date(start.getTime() + kind.minutes * 60e3);

  const fmt = (d: Date, zone: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: zone, ...opts }).format(d);
  const riyadhTime = (d: Date) => fmt(d, "Asia/Riyadh", { hour: "2-digit", minute: "2-digit" });
  const localTime = (d: Date) => fmt(d, localZone, { hour: "2-digit", minute: "2-digit" });
  const longDate = (d: Date) => fmt(d, "Asia/Riyadh", { weekday: "long", day: "numeric", month: "long" });

  const open = () => {
    setStep(0);
    setSent(false);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();

  // close on backdrop click
  useEffect(() => {
    const d = dialog.current!;
    const onClick = (e: MouseEvent) => {
      if (e.target === d) d.close();
    };
    d.addEventListener("click", onClick);
    return () => d.removeEventListener("click", onClick);
  }, []);

  const summary = start
    ? `${kind.label} (${kind.minutes} min), ${longDate(start)} at ${riyadhTime(start)} Riyadh time`
    : "";

  const mailto =
    start &&
    `mailto:${EMAIL}?subject=${encodeURIComponent(`Call request: ${kind.label}, ${longDate(start)} ${riyadhTime(start)}`)}&body=${encodeURIComponent(
      `Hi Manea,\n\nI'd like to book a ${summary}.\n\nName: ${name}\nEmail: ${email}\n\n${note ? `About:\n${note}\n\n` : ""}Thanks!`,
    )}`;

  const gcal =
    start &&
    end &&
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      `${kind.label} with Manea Abdullah`,
    )}&dates=${gcalStamp(start)}/${gcalStamp(end)}&add=${encodeURIComponent(EMAIL)}&details=${encodeURIComponent(
      note || "Call booked from manea-a.vercel.app",
    )}`;

  const send = () => {
    if (BOOKING_URL && start) {
      const u = new URL(BOOKING_URL);
      u.searchParams.set("date", start.toISOString().slice(0, 10));
      if (name) u.searchParams.set("name", name);
      if (email) u.searchParams.set("email", email);
      window.open(u.toString(), "_blank", "noopener");
    } else if (mailto) {
      window.location.href = mailto;
    }
    setSent(true);
  };

  const canNext = step === 0 || (step === 1 && !!day && slot !== null) || (step === 2 && name.trim() && /\S+@\S+\.\S+/.test(email));
  const steps = ["Type", "Time", "Details"];

  return (
    <>
      <button type="button" onClick={open} className={className}>
        {children}
      </button>

      <dialog ref={dialog} aria-labelledby="book-title" className="book-dialog">
        <div className="book-panel relative w-full overflow-hidden rounded-3xl border border-line text-fg shadow-2xl">
          <div aria-hidden="true" className="contact-glow pointer-events-none absolute inset-0" />
          <div className="relative p-5 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="meta text-muted">Book a call</p>
                <h2 id="book-title" className="mt-1 text-2xl font-semibold tracking-tight">
                  {sent ? "Request ready" : "Let's talk"}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg"
              >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {!sent && (
              <ol className="mt-5 flex items-center gap-2" aria-label="Steps">
                {steps.map((s, i) => (
                  <li key={s} className="flex flex-1 items-center gap-2">
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-medium transition-colors ${
                        i <= step ? "bg-fg text-bg" : "border border-line text-muted"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`text-sm ${i === step ? "text-fg" : "text-muted"}`}>{s}</span>
                    {i < steps.length - 1 && <span className="h-px flex-1 bg-line" />}
                  </li>
                ))}
              </ol>
            )}

            <div key={sent ? "sent" : step} className="book-step mt-6">
              {sent ? (
                <div>
                  <p className="leading-relaxed text-muted">
                    {BOOKING_URL
                      ? "Pick the same slot in the booking page that just opened to confirm it."
                      : "Your email app should have opened with the request. Send it and I'll confirm within a working day."}
                  </p>
                  <div className="mt-5 rounded-2xl border border-line bg-surface p-4">
                    <p className="font-medium">{kind.label}</p>
                    <p className="mt-1 text-sm text-muted">{start && `${longDate(start)} · ${riyadhTime(start)} Riyadh`}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {gcal && (
                      <a
                        href={gcal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg"
                      >
                        Add to Google Calendar
                      </a>
                    )}
                    {!BOOKING_URL && mailto && (
                      <a href={mailto} className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium">
                        Open email again
                      </a>
                    )}
                  </div>
                </div>
              ) : step === 0 ? (
                <div className="grid gap-3">
                  {KINDS.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => {
                        setKind(k);
                        setSlot(null);
                      }}
                      aria-pressed={kind.id === k.id}
                      className={`flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-colors ${
                        kind.id === k.id ? "border-accent bg-surface" : "border-line hover:border-line-strong"
                      }`}
                    >
                      <span>
                        <span className="block font-medium">{k.label}</span>
                        <span className="mt-0.5 block text-sm text-muted">{k.note}</span>
                      </span>
                      <span className="meta shrink-0 text-muted">{k.minutes} min</span>
                    </button>
                  ))}
                </div>
              ) : step === 1 ? (
                <div className="md:grid md:grid-cols-[1fr_15rem] md:gap-7">
                  <div>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {fmt(new Date(Date.UTC(view.y, view.m, 15)), "UTC", { month: "long", year: "numeric" })}
                    </p>
                    <div className="flex gap-1">
                      {[-1, 1].map((dir) => {
                        const next = new Date(Date.UTC(view.y, view.m + dir, 1));
                        const nv = { y: next.getUTCFullYear(), m: next.getUTCMonth() };
                        const months = (nv.y - today.y) * 12 + nv.m - today.m;
                        const off = months < 0 || months > Math.ceil(DAYS_AHEAD / 30);
                        return (
                          <button
                            key={dir}
                            type="button"
                            disabled={off}
                            onClick={() => setView(nv)}
                            aria-label={dir < 0 ? "Previous month" : "Next month"}
                            className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg disabled:opacity-30"
                          >
                            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                              <path d={dir < 0 ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
                      <span key={w} className="meta py-1 text-[0.6875rem] text-muted">
                        {w}
                      </span>
                    ))}
                    {Array.from({ length: new Date(Date.UTC(view.y, view.m, 1)).getUTCDay() }, (_, i) => (
                      <span key={`pad${i}`} />
                    ))}
                    {Array.from({ length: new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate() }, (_, i) => {
                      const d = { y: view.y, m: view.m, d: i + 1 };
                      const ok = bookable(d, today);
                      const sel = sameDay(day, d);
                      const isToday = sameDay(today, d);
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={!ok}
                          onClick={() => {
                            setDay(d);
                            setSlot(null);
                          }}
                          aria-pressed={sel}
                          aria-label={fmt(new Date(Date.UTC(d.y, d.m, d.d, 12)), "UTC", { weekday: "long", day: "numeric", month: "long" })}
                          className={`relative mx-auto grid aspect-square w-full max-w-10 place-items-center rounded-full text-sm transition-colors ${
                            sel
                              ? "bg-fg font-semibold text-bg"
                              : ok
                                ? "font-medium hover:bg-surface"
                                : "text-muted opacity-35"
                          }`}
                        >
                          {i + 1}
                          {isToday && !sel && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />}
                        </button>
                      );
                    })}
                  </div>
                  <p className="meta mt-2 text-muted">Sunday to Thursday · Riyadh working hours</p>
                  </div>
                  <div className="mt-5 md:mt-0 md:border-l md:border-line md:pl-7">
                  {day ? (
                    <>
                  <p className="meta text-muted">
                    {fmt(instant(day, 12 * 60), "Asia/Riyadh", { weekday: "long", day: "numeric", month: "long" })} · times in Riyadh (GMT+3){showLocal && ` · yours in ${localZone.split("/").pop()?.replace(/_/g, " ")}`}
                  </p>
                  <div className="book-times mt-3 grid grid-cols-3 gap-2 md:max-h-[19rem] md:grid-cols-2 md:overflow-y-auto md:pr-1">
                    {slots.map((t) => {
                      const at = instant(day!, t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSlot(t)}
                          aria-pressed={slot === t}
                          className={`rounded-xl border px-2 py-2 text-sm transition-colors ${
                            slot === t ? "border-accent bg-accent text-bg" : "border-line hover:border-line-strong"
                          }`}
                        >
                          <span className="block font-medium">{riyadhTime(at)}</span>
                          {showLocal && <span className="block text-[0.6875rem] opacity-70">{localTime(at)}</span>}
                        </button>
                      );
                    })}
                  </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted md:pt-1">Pick a day to see the available times.</p>
                  )}
                  </div>
                </div>
              ) : (
                <form
                  id="book-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (canNext) send();
                  }}
                  className="grid gap-3"
                >
                  <p className="rounded-2xl border border-line bg-surface p-3 text-sm">{summary}</p>
                  <label className="grid gap-1.5 text-sm">
                    <span className="text-muted">Your name</span>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="rounded-xl border border-line px-3 py-2.5 outline-none transition-colors focus:border-accent"
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm">
                    <span className="text-muted">Email</span>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="rounded-xl border border-line px-3 py-2.5 outline-none transition-colors focus:border-accent"
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm">
                    <span className="text-muted">What would you like to talk about? (optional)</span>
                    <textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="resize-none rounded-xl border border-line px-3 py-2.5 outline-none transition-colors focus:border-accent"
                    />
                  </label>
                </form>
              )}
            </div>

            {!sent && (
              <div className="mt-7 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className={`text-sm text-muted transition-colors hover:text-fg ${step === 0 ? "invisible" : ""}`}
                >
                  ← Back
                </button>
                {step < 2 ? (
                  <button
                    type="button"
                    disabled={!canNext}
                    onClick={() => setStep((s) => s + 1)}
                    className="rounded-full bg-fg px-6 py-2.5 text-sm font-medium text-bg transition-opacity disabled:opacity-40"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="book-form"
                    disabled={!canNext}
                    className="rounded-full bg-fg px-6 py-2.5 text-sm font-medium text-bg transition-opacity disabled:opacity-40"
                  >
                    {BOOKING_URL ? "Confirm on calendar" : "Send request"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
