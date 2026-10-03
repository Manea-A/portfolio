import Link from "next/link";
import CopyEmail from "@/components/CopyEmail";
import HeroShowcase from "@/components/HeroShowcase";
import { Logo, ScrollShot } from "@/components/ProjectVisuals";
import { StackChips, StackIcons } from "@/components/TechIcons";
import { bySlug, projects, type Project } from "@/lib/projects";
import { CV, EMAIL, GITHUB, LINKEDIN } from "@/lib/site";

const featured = projects.filter((p) => p.featured);
const sites = projects.filter((p) => p.kind === "client-site");

/* hero stack, back to front */
const showcase = ["covita", "gavelmarket", "isopluss"].map((slug) => {
  const p = bySlug(slug)!;
  return { slug, title: p.title, shot: p.shot!, domain: p.links[0].label };
});

/* every live product, for the logo marquee */
const liveLogos = featured.flatMap((p) => [
  { title: p.title, logo: p.logo, dark: p.logoDark },
  ...(p.family ?? [])
    .filter((f) => f.href && f.logo !== p.logo)
    .map((f) => ({ title: f.title, logo: f.logo, dark: false })),
]);

const experience = [
  {
    role: "Software Engineering Lead",
    org: "AIP",
    logo: null,
    meta: "Riyadh · Full-time",
    years: "Jan 2026 – now",
    note: "Lead software architecture across enterprise and industrial systems, set cloud and engineering standards, and architect AI solutions (LLMs, agents, RAG) for ERP, MES, CMMS, and SCADA environments.",
  },
  {
    role: "Lead Software Architect & Co-founder",
    org: "ISOPluss",
    logo: "/projects/logos/isopluss.png",
    meta: "Riyadh · Part-time",
    years: "Apr 2025 – now",
    note: "Architected the multi-tenant compliance platform behind ISOPluss, HaccPlus, and IsoProfissional, and own its infrastructure, CI/CD, and data security.",
  },
  {
    role: "Senior Software Engineer",
    org: "Me'Kaaz",
    logo: "/projects/logos/mekaaz.png",
    meta: "Riyadh · Contract",
    years: "Jul 2025 – Jan 2026",
    note: "Architected and delivered HealthWatch, a BLE-smartwatch telehealth platform with under 3-second vitals latency and 99.9% uptime.",
  },
  {
    role: "Software Engineering Lead",
    org: "MYCES",
    logo: "/projects/logos/myces.png",
    meta: "Malaysia · Hybrid",
    years: "Jul – Dec 2024",
    note: "Shipped three enterprise platforms across agriculture, dam safety, and energy from requirements to MVP, cutting delivery timelines by 20% through reusable architecture.",
  },
  {
    role: "Software Engineer",
    org: "MYCES",
    logo: "/projects/logos/myces.png",
    meta: "Malaysia · On-site",
    years: "Dec 2023 – Aug 2024",
    note: "Built features for EMARS, an energy-monitoring SaaS serving 100+ facilities; alerting and analytics contributed to a reported 17% cut in energy waste.",
  },
];

const skills: { area: string; items: string[] }[] = [
  { area: "Languages & backend", items: ["TypeScript", "Python", "JavaScript", "PHP", "Node.js", "NestJS", "Express", "FastAPI"] },
  { area: "Frontend", items: ["React", "Next.js", "Vue.js", "Quasar", "Tailwind CSS", "Zustand", "TanStack Query", "React Hook Form"] },
  { area: "APIs & real-time", items: ["GraphQL", "OpenAPI", "Swagger", "Socket.io", "WebSockets", "REST", "Event-driven architecture"] },
  { area: "AI", items: ["Claude", "OpenAI GPT", "LLaMA", "Agentic AI", "RAG", "Prompt engineering", "Vector databases", "MLOps"] },
  { area: "Data & cloud", items: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Prisma", "TypeORM", "Docker", "AWS", "CI/CD"] },
  { area: "Security & testing", items: ["JWT", "Passport", "Jest", "Testing Library", "Supertest", "OWASP practices", "Rate limiting"] },
  { area: "Architecture", items: ["System design", "Multi-tenant SaaS", "Real-time systems", "Workflow engines", "RBAC", "API architecture"] },
];

const credentials = [
  { title: "B.Sc. Computer Science (Software Engineering)", detail: "University Malaysia Pahang, 2020–2024" },
  { title: "Saudi Council of Engineers", detail: "Professional accreditation, Specialist (Computer Science)" },
  { title: "Gold Medal", detail: "Johor Agriculture Department Innovation Competition 2024, for AgroFarm" },
  { title: "IEEE publication", detail: "Charity and Donation Tracking System Using Queue Structure" },
  { title: "IBM", detail: "Exploratory Data Analysis for Machine Learning" },
  { title: "Further coursework", detail: "Quantum Computing (Saint Petersburg State University), Blockchain Basics (University at Buffalo)" },
];

function Section({
  id,
  index,
  title,
  intro,
  children,
}: {
  id: string;
  index: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="reveal mb-12 max-w-2xl">
          <p className="meta text-muted">{index}</p>
          <h2 id={`${id}-title`} className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {title}
          </h2>
          {intro && <p className="mt-3 text-lg leading-relaxed text-muted">{intro}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function WorkCard({ p, priority }: { p: Project; priority: boolean }) {
  return (
    <article className="reveal group relative flex flex-col rounded-2xl border border-line bg-bg p-3 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.35)] md:p-4">
      <ScrollShot src={p.shot} domain={p.links[0]?.label} alt={`${p.title} live site`} priority={priority} />
      <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
        <div className="flex items-center gap-3">
          <Logo src={p.logo} alt="" dark={p.logoDark} size={44} />
          <div className="min-w-0">
            <h3 className="text-xl font-semibold leading-tight tracking-tight">
              <Link href={`/work/${p.slug}`} className="after:absolute after:inset-0 after:rounded-2xl">
                {p.title}
              </Link>
            </h3>
            <p className="meta truncate text-muted">{p.role}</p>
          </div>
        </div>
        <p className="mt-4 leading-relaxed text-muted">{p.line}</p>
        {p.metrics.length > 0 && (
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
            {p.metrics.slice(0, 2).map((m) => (
              <div key={m.label} className="flex flex-col-reverse">
                <dt className="text-xs text-muted">{m.label}</dt>
                <dd className="text-xl font-semibold tracking-tight">{m.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="relative z-10 mt-6 w-fit">
          <StackIcons items={p.stack} />
        </div>
        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <span className="text-sm font-medium text-accent">
            Read case study{" "}
            <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </span>
          {p.links[0] && (
            <a
              href={p.links[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 rounded-full border border-line px-3 py-1 text-sm text-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              Live site <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="hero-grid absolute inset-0" />
        <div aria-hidden="true" className="hero-glow absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 md:px-8 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:pb-28">
          <div>
            <p className="rise rise-1 meta inline-flex items-center gap-2 rounded-full border border-line bg-bg/70 px-3 py-1.5 text-muted backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-ok opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
              </span>
              Available for select work · Riyadh
            </p>
            <h1 className="rise rise-2 mt-7 text-5xl font-semibold tracking-[-0.035em] md:text-7xl">
              Manea
              <br />
              Abdullah
            </h1>
            <p className="rise rise-3 mt-5 text-lg text-muted">
              Senior Software Engineer · Technical Lead · Software Architect
            </p>
            <p className="rise rise-4 mt-6 max-w-xl text-lg leading-relaxed">
              I design, build, and ship production software end to end:
              multi-tenant SaaS, real-time telehealth, marketplaces, and AI for
              industrial operations. Currently Software Engineering Lead at AIP
              and Lead Software Architect at ISOPluss, which I co-founded.
            </p>
            <div className="rise rise-5 mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="#work"
                className="rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
              >
                View my work
              </Link>
              <a
                href={CV}
                download
                className="rounded-full border border-line-strong bg-bg/70 px-6 py-3 text-sm font-medium backdrop-blur transition-colors hover:bg-surface"
              >
                Download CV
              </a>
              <span className="ml-1 flex gap-5 text-sm">
                <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="link text-muted hover:text-fg">
                  LinkedIn
                </a>
                <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="link text-muted hover:text-fg">
                  GitHub
                </a>
              </span>
            </div>
          </div>
          <div className="rise rise-3">
            <HeroShowcase cards={showcase} />
          </div>
        </div>
      </section>

      {/* ── Live products marquee ─────────────────────────────── */}
      <section aria-label="Live products" className="border-t border-line bg-surface/50 py-7">
        <p className="meta mb-5 text-center text-muted">Products I&apos;ve built that are live today</p>
        <div className="marquee overflow-hidden">
          <div className="marquee-track">
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-hidden={copy === 1 || undefined}
                className={`flex shrink-0 items-center gap-12 pr-12 ${copy === 1 ? "marquee-dup" : ""}`}
              >
                {liveLogos.map((l) => (
                  <li key={l.title} className="flex items-center gap-3">
                    <Logo src={l.logo} alt="" dark={l.dark} size={34} />
                    <span className="whitespace-nowrap font-medium">{l.title}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>

      {/* ── Work ──────────────────────────────────────────────── */}
      <Section
        id="work"
        index="01 — Work"
        title="Selected work"
        intro="Live products I architected and built. Hover a preview to scroll through the real site."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {featured.map((p, i) => (
            <WorkCard key={p.slug} p={p} priority={i < 2} />
          ))}
        </div>

        <div className="reveal mt-20">
          <h3 className="text-xl font-semibold tracking-tight">Client websites</h3>
          <p className="mt-1 text-muted">Company sites I designed and built.</p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {sites.map((p) => (
            <a
              key={p.slug}
              href={p.links[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="reveal group block rounded-2xl border border-line p-3 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong md:p-4"
            >
              <ScrollShot src={p.shot} domain={p.links[0].label} alt={`${p.title} website`} />
              <div className="flex items-center gap-3 px-2 pb-1 pt-4">
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
      <Section id="experience" index="02 — Experience" title="Where I've worked">
        <ol className="space-y-4">
          {experience.map((e) => (
            <li key={`${e.role}-${e.org}`} className="reveal grid gap-2 md:grid-cols-[11rem_1fr] md:gap-0">
              <span className="meta hidden pt-5 text-muted md:block">{e.years}</span>
              <div className="flex gap-5 rounded-2xl border border-transparent p-3 transition-colors hover:border-line hover:bg-surface/70 md:p-4">
                {e.logo ? (
                  <Logo src={e.logo} alt="" size={40} />
                ) : (
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[22%] bg-fg text-[0.6875rem] font-bold tracking-wide text-bg">
                    {e.org}
                  </span>
                )}
                <div>
                  <h3 className="font-semibold">
                    {e.role} <span className="font-normal text-muted">· {e.org}</span>
                  </h3>
                  <p className="meta mt-0.5 text-muted">
                    <span className="md:hidden">{e.years} · </span>
                    {e.meta}
                  </p>
                  <p className="mt-2 max-w-2xl leading-relaxed text-muted">{e.note}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <a href={CV} download className="link mt-10 inline-block text-sm font-medium md:ml-[12rem]">
          Full CV (PDF)
        </a>
      </Section>

      {/* ── Skills ────────────────────────────────────────────── */}
      <Section id="skills" index="03 — Skills" title="Tools I use in production">
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {skills.map((s) => (
            <div key={s.area} className="reveal">
              <h3 className="meta mb-3 text-muted">{s.area}</h3>
              <StackChips items={s.items} />
            </div>
          ))}
        </div>
      </Section>

      {/* ── About ─────────────────────────────────────────────── */}
      <Section id="about" index="04 — About" title="About me">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
          <div className="reveal space-y-5 text-lg leading-relaxed">
            <p>
              I&apos;m a hands-on engineer and technical lead based in Riyadh. I
              take products from requirements and architecture through
              implementation, deployment, and documentation, and I stay close to
              the code.
            </p>
            <p className="text-muted">
              My work spans compliance SaaS, real-time healthcare, energy
              monitoring, marketplaces, and AI in industrial systems. I care most
              about the decisions that are expensive to change later: tenancy,
              data models, and how events flow through a system.
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-1">
            {credentials.map((c) => (
              <li key={c.title} className="reveal border-l-2 border-line pl-4">
                <p className="font-semibold">{c.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">{c.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ── Contact ───────────────────────────────────────────── */}
      <section id="contact" aria-labelledby="contact-title" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <div className="reveal relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-14 md:px-14 md:py-20">
            <div aria-hidden="true" className="hero-glow absolute inset-0" />
            <div className="relative">
              <p className="meta text-muted">05 — Contact</p>
              <h2 id="contact-title" className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.03em] md:text-6xl">
                Let&apos;s build something that lasts.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                Open to senior engineering, architecture, and technical-leadership
                roles, and to select product work. Email is the fastest way to
                reach me.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${EMAIL}`}
                  className="rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
                >
                  {EMAIL}
                </a>
                <CopyEmail email={EMAIL} />
                <a
                  href={LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-line-strong px-5 py-3 text-sm font-medium transition-colors hover:bg-bg"
                >
                  LinkedIn <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
