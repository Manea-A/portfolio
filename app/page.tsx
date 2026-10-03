import HeroVisual from "@/components/HeroVisual";
import Marquee from "@/components/Marquee";
import Magnetic from "@/components/Magnetic";
import SpotlightCard from "@/components/SpotlightCard";
import ProjectGallery from "@/components/ProjectGallery";
import CopyEmail from "@/components/CopyEmail";
import type { CSSProperties } from "react";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion-primitives";
import IridescentButton from "@/components/ui/IridescentButton";
import { projects } from "@/lib/projects";
// import Testimonials from "@/components/Testimonials"; // ready — mount when real quotes exist

const EMAIL = "sir.manea.a@gmail.com";

const stack = [
  "TypeScript",
  "NestJS",
  "Next.js",
  "React",
  "Node.js",
  "PostgreSQL",
  "Redis",
  "Socket.io",
  "Prisma",
  "TypeORM",
  "Express",
  "OpenAPI",
  "Vue.js",
  "MySQL",
  "Docker",
];

/* career facts, not project trivia — the hero is about the person.
   Each number is white, lit from beneath by a single spectral stop. */
const heroStats = [
  { value: "3+", label: "years shipping production systems", halo: "var(--spec-1)" },
  { value: "5", label: "platforms delivered end to end", halo: "var(--spec-6)" },
  { value: "2", label: "products live right now", halo: "var(--spec-4)" },
];

const capabilities = [
  {
    index: "01",
    title: "AI-Native Systems",
    body: "LLM, agentic, and RAG pipelines embedded into real operations — ERP, MES, and SCADA stacks — with MLOps governance from data pipeline to production deployment.",
    tags: ["LLM integration", "Agentic AI", "RAG", "MLOps", "Vector DBs"],
  },
  {
    index: "02",
    title: "Real-Time Platforms",
    body: "Event-driven architectures where latency is a clinical or financial requirement: BLE vitals streaming, live auctions, alerting systems that people act on.",
    tags: ["WebSockets", "Event-driven", "Socket.io", "BLE streaming"],
  },
  {
    index: "03",
    title: "Multi-Tenant SaaS",
    body: "Enterprise B2B platforms built for isolation, compliance, and scale — schema-driven engines, RBAC, documented APIs, and infrastructure owned end to end.",
    tags: ["NestJS", "PostgreSQL", "Redis", "Next.js", "AWS", "CI/CD"],
  },
];

/* DRAFT substance lines — review wording before it hardens into fact */
const experience = [
  {
    role: "Head of Software & AI",
    org: "AIP",
    where: "Riyadh",
    years: "2026 →",
    live: true,
    note: "Leading software and AI direction — embedding LLM, agentic, and RAG systems into industrial operations.",
  },
  {
    role: "Co-Founder & CTO",
    org: "ISOPluss",
    where: "Riyadh",
    years: "2025 →",
    live: true,
    note: "Co-founded the company; built the FSMS platform end to end — schema-driven engine, multi-tenant infrastructure, API-first.",
  },
  {
    role: "Technical Lead",
    org: "Me'Kaaz",
    where: "Riyadh",
    years: "2025 → 2026",
    live: false,
    note: "Led HealthWatch, MENA's first BLE-smartwatch telehealth platform — architecture, real-time pipeline, team direction.",
  },
  {
    role: "Assistant Development Manager",
    org: "MYCES",
    where: "Malaysia",
    years: "2024",
    live: false,
    note: "Directed AgroFarm from requirements to MVP — Gold Medal, Johor Innovation Competition 2024.",
  },
  {
    role: "Software Engineer",
    org: "MYCES",
    where: "Malaysia",
    years: "2023 → 2024",
    live: false,
    note: "Full-stack engineering across client platforms — Vue.js, NestJS, MySQL, D3.js.",
  },
];

const proof = [
  {
    what: "Gold Medal",
    detail: "Johor Agriculture Dept. Innovation Competition 2024 — AgroFarm, a national benchmark",
  },
  {
    what: "IEEE Publication",
    detail: "Charity & Donation Tracking System Using Queue Structure",
  },
  {
    what: "SCE Accredited",
    detail: "Saudi Council of Engineers — Specialist, Computer Science",
  },
];

function SectionHead({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-12 flex items-center gap-5">
      <span className="voice-display text-gradient text-lg">{index}</span>
      <h2 className="voice-display text-3xl text-fg md:text-5xl">{title}</h2>
      <span aria-hidden="true" className="rule mt-1 hidden flex-1 md:block" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* ── Hero: system beams, the person front and center ───── */}
      <section className="relative flex min-h-svh flex-col justify-center overflow-hidden">
        {/* blueprint substrate under the data beams */}
        <div aria-hidden="true" className="bg-grid absolute inset-0" />
        <HeroVisual className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_72%,transparent)]" />
        {/* soft scrim so type stays sovereign over the beams */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_38%_45%,rgba(5,7,5,0.72),transparent_75%)]"
        />

        <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-28 md:px-8">
          <FadeIn immediate delay={0.1} y={14}>
            <p className="label glass mb-7 inline-flex items-center gap-3 rounded-full px-4 py-2 text-muted">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--spec-6)] opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--spec-6)]" />
              </span>
              Available for select work · Riyadh
            </p>
          </FadeIn>

          <FadeIn immediate delay={0.2} y={12}>
            <p className="label text-muted">Systems Architect · Full-Stack Engineering Lead</p>
          </FadeIn>

          <FadeIn immediate delay={0.3} y={16}>
            <h1 className="voice-display mt-4 max-w-5xl text-[clamp(3rem,9vw,7rem)] text-fg">
              Manea{" "}
              <span className="prism-name" data-text="Abdullah">
                Abdullah
              </span>
            </h1>
          </FadeIn>

          <FadeIn immediate delay={0.75} y={18}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-fg/85 md:text-lg">
              I design and ship production platforms end to end — multi-tenant
              SaaS, real-time telehealth, and AI-native industrial systems that
              hold up under real users.
            </p>
          </FadeIn>

          <FadeIn immediate delay={0.9} y={18}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Magnetic>
                <IridescentButton href="#work" size="md" className="label text-fg">
                  See the work ↓
                </IridescentButton>
              </Magnetic>
              <Magnetic>
                <a
                  href="#contact"
                  className="label glass inline-block rounded-full px-7 py-3.5 text-fg transition-colors hover:border-[var(--line-strong)]"
                >
                  Get in touch
                </a>
              </Magnetic>
            </div>
          </FadeIn>

          <FadeIn immediate delay={1.05} y={14}>
            <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-5">
              {heroStats.map((s) => (
                <div key={s.label}>
                  <dd
                    className="stat-num voice-display text-3xl md:text-4xl"
                    style={{ "--halo": s.halo } as CSSProperties}
                  >
                    {s.value}
                  </dd>
                  <dt className="label mt-1.5 text-muted">{s.label}</dt>
                </div>
              ))}
            </dl>
          </FadeIn>
        </div>

        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <span className="label text-muted motion-safe:animate-bounce" aria-hidden="true">
            scroll ↓
          </span>
        </div>
      </section>

      {/* ── Stack ribbon: logos, not words ───────────────────── */}
      <Marquee items={stack} />

      {/* ── About: short, first person, no résumé speak ───────
           DRAFT COPY — flagged for Manea's review before it ships as final */}
      <section id="about" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-5 pt-20 md:px-8">
          <FadeIn>
            <SectionHead index="01" title="About" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="-mt-4 max-w-3xl text-xl leading-relaxed text-fg/90 md:text-2xl">
              I&apos;m Manea — a systems architect based in Riyadh. I lead
              Software &amp; AI at AIP and co-founded ISOPluss, where I still
              own the architecture end to end. Over the last three years
              I&apos;ve shipped telehealth, compliance, and auction platforms —
              the kind of systems that page someone at 3 a.m. if they fail.{" "}
              <span className="text-gradient">I build them so they don&apos;t.</span>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Work: every case study on this page ──────────────── */}
      <section id="work" className="relative scroll-mt-24">
        <div className="mx-auto max-w-6xl px-5 pt-20 md:px-8">
          <FadeIn>
            <SectionHead index="02" title="Selected Work" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="-mt-8 mb-10 max-w-xl text-muted">
              Click any project to open the full case study — problem,
              architecture, decisions, and outcomes — right here.
            </p>
          </FadeIn>
        </div>
        <ProjectGallery projects={projects} />
      </section>

      {/* ── Capabilities: spotlight bento ────────────────────── */}
      <section id="capabilities" className="relative mt-20 scroll-mt-24 overflow-hidden">
        <div
          aria-hidden="true"
          className="glow-violet pointer-events-none absolute -right-52 top-10 h-[30rem] w-[30rem] opacity-60"
        />
        <div className="halftone absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
          <FadeIn>
            <SectionHead index="03" title="Capabilities" />
          </FadeIn>
          <Stagger className="grid gap-5 md:grid-cols-3">
            {capabilities.map((c) => (
              <StaggerItem key={c.title}>
                <SpotlightCard className="grain h-full p-7">
                  <span className="voice-display text-gradient text-lg">{c.index}</span>
                  <h3 className="voice-display mt-4 text-xl text-fg md:text-2xl">
                    {c.title}
                  </h3>
                  <p className="mt-4 leading-relaxed text-muted">{c.body}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {c.tags.map((t) => (
                      <li
                        key={t}
                        className="label rounded-full border border-[var(--line)] px-3 py-1.5 text-muted"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Experience: the changelog ────────────────────────── */}
      <section id="experience" className="rule scroll-mt-24">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
          <FadeIn>
            <SectionHead index="04" title="Experience" />
          </FadeIn>
          <Stagger className="relative">
            <span
              aria-hidden="true"
              className="absolute bottom-1 left-[5px] top-1 w-px bg-gradient-to-b from-[var(--spec-6)] via-[var(--line-strong)] to-transparent"
            />
            <ol className="ml-0 list-none space-y-10 pl-10">
              {experience.map((e) => (
                <li key={`${e.role}${e.org}`}>
                  <StaggerItem className="relative">
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[39px] top-1.5 h-2.5 w-2.5 rounded-full ${
                        e.live
                          ? "bg-[var(--spec-6)] shadow-[0_0_10px_var(--glow-cyan)] motion-safe:animate-pulse"
                          : "bg-[var(--line-strong)]"
                      }`}
                    />
                    <div className="grid gap-1 md:grid-cols-[1.4fr_1fr_auto] md:items-baseline md:gap-6">
                      <span className="text-fg">{e.role}</span>
                      <span className="text-muted">
                        {e.org} · {e.where}
                      </span>
                      <span className="label text-muted md:text-right">{e.years}</span>
                    </div>
                    <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
                      {e.note}
                    </p>
                  </StaggerItem>
                </li>
              ))}
            </ol>
          </Stagger>
        </div>
      </section>

      {/* ── Proof band ───────────────────────────────────────── */}
      <section id="proof" className="rule scroll-mt-24">
        <Stagger className="mx-auto grid max-w-6xl gap-5 px-5 py-14 md:grid-cols-3 md:px-8">
          {proof.map((r) => (
            <StaggerItem key={r.what}>
              <SpotlightCard className="grain h-full p-6">
                <p className="label text-gradient">{r.what}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{r.detail}</p>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ── Testimonials: mount when real quotes exist ────────
      <Testimonials
        quotes={[
          { text: "…", name: "…", role: "…" },
        ]}
      />
      ─────────────────────────────────────────────────────── */}

      {/* ── Writing ──────────────────────────────────────────── */}
      <section id="writing" className="rule scroll-mt-24">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
          <FadeIn>
            <SectionHead index="05" title="Writing" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <SpotlightCard className="grain max-w-2xl p-7 md:p-9">
              <p className="label text-gradient">Book</p>
              <h3 className="voice-display mt-3 text-2xl text-fg md:text-3xl">
                The Living System
              </h3>
              <p className="mt-4 leading-relaxed text-muted">
                On AI-native software engineering — designing systems that
                learn, adapt, and hold up in production.
              </p>
              {/* TODO: replace with the real link when published */}
              <a
                href="#writing"
                aria-disabled="true"
                className="label mt-6 inline-block text-fg underline decoration-[var(--spec-6)] underline-offset-8 transition-colors hover:text-white"
              >
                Read more ↗
              </a>
            </SpotlightCard>
          </FadeIn>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────── */}
      <section id="contact" className="rule relative scroll-mt-24 overflow-hidden">
        <div
          aria-hidden="true"
          className="glow-amber pointer-events-none absolute -bottom-40 left-1/2 h-[28rem] w-[42rem] -translate-x-1/2 opacity-90"
        />
        <div
          aria-hidden="true"
          className="glow-cyan pointer-events-none absolute -bottom-24 right-0 h-[20rem] w-[26rem] opacity-70"
        />
        <div className="relative mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
          <FadeIn>
            <p className="label mb-6 text-muted">06 · Contact</p>
            <h2 className="voice-display max-w-4xl text-[clamp(2rem,6vw,4.5rem)] text-fg">
              Building something that has to{" "}
              <span className="text-gradient">hold up</span>?
            </h2>
            <div className="mt-12 flex flex-wrap items-center gap-4 md:gap-6">
              <Magnetic>
                <IridescentButton href={`mailto:${EMAIL}`} size="md" className="label text-fg">
                  {EMAIL}
                </IridescentButton>
              </Magnetic>
              <CopyEmail email={EMAIL} />
              <a
                href="/Manea-Abdullah-CV.pdf"
                download
                className="label glass rounded-full px-5 py-2.5 text-fg transition-colors hover:border-[var(--line-strong)]"
              >
                CV ↓
              </a>
              <a
                href="https://www.linkedin.com/in/manea-abdullah/"
                target="_blank"
                rel="noopener noreferrer"
                className="label text-muted transition-colors hover:text-fg"
              >
                LinkedIn ↗
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
