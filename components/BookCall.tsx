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
const DAYS_AHEAD = 14;
const OPEN = 10; // 10:00 Riyadh
const CLOSE = 17; // last call ends by 17:00

type Kind = (typeof KINDS)[number];

/** working days (Sun–Thu) from tomorrow, as Riyadh calendar dates */
function workingDays() {
  const out: { y: number; m: number; d: number; dow: number }[] = [];
  const now = new Date(Date.now() + RIYADH_OFFSET * 3600e3);
  for (let i = 1; out.length < 10 && i <= DAYS_AHEAD; i++) {
    const t = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + i));
    const dow = t.getUTCDay();
    if (dow === 5 || dow === 6) continue; // Friday, Saturday
    out.push({ y: t.getUTCFullYear(), m: t.getUTCMonth(), d: t.getUTCDate(), dow });
  }
  return out;
}

/** the UTC instant of hh:mm Riyadh time on a Riyadh date */
const instant = (day: { y: number; m: number; d: number }, minutes: number) =>
  new Date(Date.UTC(day.y, day.m, day.d, 0, minutes) - RIYADH_OFFSET * 3600e3);

const gcalStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export default function BookCall({ className, children }: { className: string; children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<Kind>(KINDS[1]);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<number | null>(null); // minutes after Riyadh midnight
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const days = useMemo(workingDays, []);
  const localZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const showLocal = !/Riyadh/.test(localZone) && new Date().getTimezoneOffset() !== -RIYADH_OFFSET * 60;

  const slots = useMemo(() => {
    const step = kind.minutes === 45 ? 60 : 30;
    const out: number[] = [];
    for (let t = OPEN * 60; t + kind.minutes <= CLOSE * 60; t += step) out.push(t);
    return out;
  }, [kind]);

  const day = days[dayIdx];
  const start = slot === null ? null : instant(day, slot);
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

  const canNext = step === 0 || (step === 1 && slot !== null) || (step === 2 && name.trim() && /\S+@\S+\.\S+/.test(email));
  const steps = ["Type", "Time", "Details"];

  return (
    <>
      <button type="button" onClick={open} className={className}>
        {children}
      </button>

      <dialog ref={dialog} aria-labelledby="book-title" className="book-dialog">
        <div className="book-panel relative w-full overflow-hidden rounded-3xl border border-line bg-bg text-fg shadow-2xl">
          <div aria-hidden="true" className="contact-glow pointer-events-none absolute inset-0" />
          <div className="relative p-5 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="meta text-muted">{"{ Book a call }"}</p>
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
                <div>
                  <div className="book-days -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                    {days.map((d, i) => {
                      const date = instant(d, 12 * 60);
                      return (
                        <button
                          key={`${d.m}-${d.d}`}
                          type="button"
                          onClick={() => {
                            setDayIdx(i);
                            setSlot(null);
                          }}
                          aria-pressed={dayIdx === i}
                          className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border py-2.5 transition-colors ${
                            dayIdx === i ? "border-fg bg-fg text-bg" : "border-line hover:border-line-strong"
                          }`}
                        >
                          <span className="meta text-[0.6875rem] opacity-70">
                            {fmt(date, "Asia/Riyadh", { weekday: "short" })}
                          </span>
                          <span className="text-lg font-semibold">{d.d}</span>
                          <span className="meta text-[0.6875rem] opacity-70">
                            {fmt(date, "Asia/Riyadh", { month: "short" })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="meta mt-4 text-muted">
                    Times in Riyadh (GMT+3){showLocal && ` · yours in ${localZone.split("/").pop()?.replace(/_/g, " ")}`}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map((t) => {
                      const at = instant(day, t);
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
                      className="rounded-xl border border-line bg-bg px-3 py-2.5 outline-none transition-colors focus:border-accent"
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
                      className="rounded-xl border border-line bg-bg px-3 py-2.5 outline-none transition-colors focus:border-accent"
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm">
                    <span className="text-muted">What would you like to talk about? (optional)</span>
                    <textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="resize-none rounded-xl border border-line bg-bg px-3 py-2.5 outline-none transition-colors focus:border-accent"
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
