import Link from "next/link";
import CopyEmail from "@/components/CopyEmail";
import { BrowserShot, Logo } from "@/components/ProjectVisuals";
import { projects, type Project } from "@/lib/projects";
import { CV, EMAIL, GITHUB, LINKEDIN } from "@/lib/site";

const featured = projects.filter((p) => p.featured);
const more = projects.filter((p) => !p.featured && p.kind === "product");
const sites = projects.filter((p) => p.kind === "client-site");

/* every live product with a real logo, for the proof strip */
const liveLogos = [
  ...projects
    .filter((p) => p.kind === "product" && p.links.length > 0 && p.slug !== "ems")
    .map((p) => ({ title: p.title, logo: p.logo, dark: p.logoDark })),
  ...(projects[0].family ?? []).map((f) => ({ title: f.title, logo: f.logo, dark: false })),
];

const experience = [
  {
    role: "Software Engineering Lead",
    org: "AIP",
    meta: "Riyadh · Full-time",
    years: "Jan 2026 – now",
    note: "Lead software architecture across enterprise and industrial systems, set cloud and engineering standards, and architect AI solutions (LLMs, agents, RAG) for ERP, MES, CMMS, and SCADA environments.",
  },
  {
    role: "Lead Software Architect & Co-founder",
    org: "ISOPluss",
    meta: "Riyadh · Part-time",
    years: "Apr 2025 – now",
    note: "Architected the multi-tenant compliance platform behind ISOPluss, HaccPlus, and IsoProfissional, and own its infrastructure, CI/CD, and data security.",
  },
  {
    role: "Senior Software Engineer",
    org: "Me'Kaaz",
    meta: "Riyadh · Contract",
    years: "Jul 2025 – Jan 2026",
    note: "Architected and delivered HealthWatch, a BLE-smartwatch telehealth platform with under 3-second vitals latency and 99.9% uptime.",
  },
  {
    role: "Software Engineering Lead",
    org: "MYCES",
    meta: "Malaysia",
    years: "Jul – Dec 2024",
    note: "Shipped three enterprise platforms across agriculture, dam safety, and energy from requirements to MVP, cutting delivery timelines by 20% through reusable architecture.",
  },
  {
    role: "Software Engineer",
    org: "MYCES",
    meta: "Malaysia",
    years: "Dec 2023 – Aug 2024",
    note: "Built features for EMARS, an energy-monitoring SaaS serving 100+ facilities; alerting and analytics contributed to a reported 17% cut in energy waste.",
  },
];

const skills = [
  { area: "Languages & backend", items: "TypeScript, Python, JavaScript, PHP, Node.js, NestJS, Express, FastAPI" },
  { area: "Frontend", items: "React, Next.js, Vue.js, Quasar, Tailwind CSS, Zustand, TanStack Query" },
  { area: "APIs & real-time", items: "REST, GraphQL, OpenAPI, WebSockets, Socket.io, event-driven architecture" },
  { area: "Architecture", items: "System design, multi-tenant SaaS, real-time systems, workflow engines, RBAC" },
  { area: "AI", items: "LLMs (OpenAI, Claude, LLaMA), agents, RAG, prompt engineering, vector databases, MLOps" },
  { area: "Data & cloud", items: "PostgreSQL, MySQL, MongoDB, Redis, Prisma, TypeORM, AWS, Docker, CI/CD" },
  { area: "Security & quality", items: "JWT, Passport, OWASP practices, rate limiting, Jest, Supertest, Testing Library" },
];

const credentials = [
  { title: "B.Sc. Computer Science (Software Engineering)", detail: "University Malaysia Pahang, 2020–2024" },
  { title: "Saudi Council of Engineers", detail: "Professional accreditation, Specialist (Computer Science)" },
  { title: "Gold Medal", detail: "Johor Agriculture Department Innovation Competition 2024, for AgroFarm" },
  { title: "IEEE publication", detail: "Charity and Donation Tracking System Using Queue Structure" },
  { title: "IBM", detail: "Exploratory Data Analysis for Machine Learning" },
  { title: "Further coursework", detail: "Quantum Computing (Saint Petersburg State University), Blockchain Basics (University at Buffalo)" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-line">
      <div className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-20">
        <h2 id={`${id}-title`} className="meta mb-8 text-muted">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative z-10 text-sm text-muted transition-colors hover:text-fg"
    >
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
}

function WorkCard({ p, priority }: { p: Project; priority: boolean }) {
  return (
    <article className="group relative flex flex-col rounded-xl border border-line p-4 transition-colors hover:border-line-strong md:p-5">
      {p.shot && (
        <BrowserShot
          src={p.shot}
          domain={p.links[0]?.label ?? ""}
          alt={`${p.title} live site`}
          priority={priority}
        />
      )}
      <div className="mt-5 flex items-center gap-3">
        <Logo src={p.logo} alt="" dark={p.logoDark} />
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-tight tracking-tight">
            <Link href={`/work/${p.slug}`} className="after:absolute after:inset-0 after:rounded-xl">
              {p.title}
            </Link>
          </h3>
          <p className="meta truncate text-muted">{p.role}</p>
        </div>
      </div>
      <p className="mt-3 leading-relaxed text-muted">{p.line}</p>
      {p.metrics.length > 0 && (
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
          {p.metrics.slice(0, 2).map((m) => (
            <div key={m.label} className="flex flex-col-reverse">
              <dt className="text-xs text-muted">{m.label}</dt>
              <dd className="font-semibold">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-auto flex items-center justify-between gap-4 pt-5">
        <span className="text-sm font-medium text-accent">
          Case study <span aria-hidden="true">→</span>
        </span>
        {p.links[0] && <ExternalLink href={p.links[0].href}>Live site</ExternalLink>}
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <>
      {/* ── Intro ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 pb-14 pt-16 md:px-8 md:pb-20 md:pt-24">
        <p className="meta flex items-center gap-2 text-muted">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-ok" />
          Available for select work · Riyadh, Saudi Arabia
        </p>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">Manea Abdullah</h1>
        <p className="mt-3 text-xl text-muted md:text-2xl">
          Senior Software Engineer · Technical Lead · Software Architect
        </p>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed">
          I design, build, and ship production software end to end: multi-tenant
          SaaS, real-time telehealth, marketplaces, and AI for industrial
          operations. Currently Software Engineering Lead at AIP and Lead
          Software Architect at ISOPluss, which I co-founded.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="#work"
            className="rounded-md bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-85"
          >
            View my work
          </Link>
          <a
            href={CV}
            download
            className="rounded-md border border-line-strong px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
          >
            Download CV
          </a>
          <span className="ml-2 flex gap-5 text-sm">
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="link text-muted hover:text-fg">
              LinkedIn
            </a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="link text-muted hover:text-fg">
              GitHub
            </a>
            <a href={`mailto:${EMAIL}`} className="link text-muted hover:text-fg">
              Email
            </a>
          </span>
        </div>

        {/* live products proof strip */}
        <div className="mt-16">
          <p className="meta text-muted">Products I&apos;ve built that are live today</p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-4">
            {liveLogos.map((l) => (
              <li key={l.title} className="flex items-center gap-2.5">
                <Logo src={l.logo} alt="" dark={l.dark} size={32} />
                <span className="text-sm font-medium">{l.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Work ──────────────────────────────────────────────── */}
      <Section id="work" title="Selected work">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {featured.map((p, i) => (
            <WorkCard key={p.slug} p={p} priority={i < 2} />
          ))}
        </div>

        <h3 className="meta mt-14 text-muted">More work</h3>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {more.map((p) => (
            <li key={p.slug} className="relative flex items-center gap-4 py-4">
              <Logo src={p.logo} alt="" size={36} />
              <div className="min-w-0 flex-1">
                <Link href={`/work/${p.slug}`} className="font-semibold after:absolute after:inset-0 hover:text-accent">
                  {p.title}
                </Link>
                <p className="text-sm text-muted">{p.line}</p>
              </div>
              <span className="meta hidden text-muted sm:block">{p.year}</span>
            </li>
          ))}
        </ul>

        <h3 className="meta mt-14 text-muted">Client websites</h3>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {sites.map((p) => (
            <a
              key={p.slug}
              href={p.links[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-line p-4 transition-colors hover:border-line-strong"
            >
              {p.shot && <BrowserShot src={p.shot} domain={p.links[0].label} alt={`${p.title} website`} />}
              <div className="mt-4 flex items-center gap-3">
                <Logo src={p.logo} alt="" dark={p.logoDark} wide={p.logoWide} size={36} />
                <div className="min-w-0">
                  <p className="font-semibold">
                    {p.title} <span aria-hidden="true" className="text-muted">↗</span>
                  </p>
                  <p className="text-sm text-muted">{p.line}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </Section>

      {/* ── Experience ────────────────────────────────────────── */}
      <Section id="experience" title="Experience">
        <ol className="space-y-9">
          {experience.map((e) => (
            <li key={`${e.role}-${e.org}`} className="grid gap-1 md:grid-cols-[11rem_1fr] md:gap-8">
              <span className="meta pt-0.5 text-muted">{e.years}</span>
              <div>
                <h3 className="font-semibold">
                  {e.role} <span className="font-normal text-muted">· {e.org}</span>
                </h3>
                <p className="meta mt-0.5 text-muted">{e.meta}</p>
                <p className="mt-2 max-w-2xl leading-relaxed text-muted">{e.note}</p>
              </div>
            </li>
          ))}
        </ol>
        <a href={CV} download className="link mt-10 inline-block text-sm font-medium">
          Full CV (PDF)
        </a>
      </Section>

      {/* ── Skills ────────────────────────────────────────────── */}
      <Section id="skills" title="Skills">
        <dl className="divide-y divide-line border-y border-line">
          {skills.map((s) => (
            <div key={s.area} className="grid gap-1 py-4 md:grid-cols-[11rem_1fr] md:gap-8">
              <dt className="font-semibold">{s.area}</dt>
              <dd className="leading-relaxed text-muted">{s.items}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ── About ─────────────────────────────────────────────── */}
      <Section id="about" title="About">
        <div className="max-w-2xl space-y-5 text-lg leading-relaxed">
          <p>
            I&apos;m a hands-on engineer and technical lead based in Riyadh. I take
            products from requirements and architecture through implementation,
            deployment, and documentation, and I stay close to the code.
          </p>
          <p className="text-muted">
            My work spans compliance SaaS, real-time healthcare, energy
            monitoring, marketplaces, and AI in industrial systems. I care most
            about the decisions that are expensive to change later: tenancy,
            data models, and how events flow through a system.
          </p>
        </div>

        <h3 className="meta mt-14 text-muted">Education, accreditation &amp; awards</h3>
        <ul className="mt-5 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {credentials.map((c) => (
            <li key={c.title}>
              <p className="font-semibold">{c.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">{c.detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Contact ───────────────────────────────────────────── */}
      <Section id="contact" title="Contact">
        <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">Let&apos;s talk.</h3>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          Open to senior engineering, architecture, and technical-leadership
          roles, and to select product work. Email is the fastest way to reach
          me.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${EMAIL}`}
            className="rounded-md bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-85"
          >
            {EMAIL}
          </a>
          <CopyEmail email={EMAIL} />
        </div>
      </Section>
    </>
  );
}
