import Link from "next/link";
import CopyEmail from "@/components/CopyEmail";
import { DiagramThumb } from "@/components/ArchDiagram";
import { projects } from "@/lib/projects";
import { CV, EMAIL, GITHUB, LINKEDIN } from "@/lib/site";

const featured = projects.filter((p) => p.featured);
const other = projects.filter((p) => !p.featured);

const expertise = [
  {
    title: "AI in operations",
    body: "LLM, agent, and RAG pipelines embedded into ERP, MES, and SCADA environments, with MLOps from data pipeline to production.",
    tools: "LLM integration · Agents · RAG · Vector databases · MLOps",
  },
  {
    title: "Real-time platforms",
    body: "Event-driven systems where latency matters to the user: streaming medical vitals, live auctions, alerting that people act on.",
    tools: "WebSockets · Socket.io · Event-driven design · BLE streaming",
  },
  {
    title: "Multi-tenant SaaS",
    body: "B2B platforms built for tenant isolation, compliance, and growth: schema-driven engines, role-based access, documented APIs.",
    tools: "NestJS · Next.js · PostgreSQL · Redis · AWS · Docker · CI/CD",
  },
];

const experience = [
  {
    role: "Head of Software & AI",
    org: "AIP",
    where: "Riyadh",
    years: "2026–now",
    note: "Leading software and AI, embedding LLM, agent, and RAG systems into industrial operations.",
  },
  {
    role: "Co-founder & CTO",
    org: "ISOPluss",
    where: "Riyadh",
    years: "2025–now",
    note: "Built the food-safety management platform end to end: schema-driven engine, multi-tenant infrastructure, API-first design.",
  },
  {
    role: "Technical Lead",
    org: "Me'Kaaz",
    where: "Riyadh",
    years: "2025–2026",
    note: "Led HealthWatch: architecture, the real-time vitals pipeline, and the engineering team.",
  },
  {
    role: "Assistant Development Manager",
    org: "MYCES",
    where: "Malaysia",
    years: "2024",
    note: "Took AgroFarm from requirements to MVP; it won Gold at the Johor Innovation Competition 2024.",
  },
  {
    role: "Software Engineer",
    org: "MYCES",
    where: "Malaysia",
    years: "2023–2024",
    note: "Full-stack work across client platforms with Vue.js, NestJS, MySQL, and D3.js.",
  },
];

const recognition = [
  {
    title: "Gold Medal",
    detail: "Johor Agriculture Department Innovation Competition 2024, for AgroFarm",
  },
  {
    title: "IEEE publication",
    detail: "Charity & Donation Tracking System Using Queue Structure",
  },
  {
    title: "SCE accredited",
    detail: "Saudi Council of Engineers, Specialist in Computer Science",
  },
  {
    title: "The Living System",
    detail: "A book on AI-native software engineering, in progress",
  },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-line">
      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-16 md:grid-cols-[11rem_1fr] md:gap-12 md:px-8 md:py-20">
        <h2 id={`${id}-title`} className="meta pt-1 text-muted">
          {title}
        </h2>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      {/* ── Intro ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-16 md:px-8 md:pb-24 md:pt-28">
        <p className="meta flex items-center gap-2 text-muted">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-ok" />
          Available for select work · Riyadh, Saudi Arabia
        </p>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
          Manea Abdullah
        </h1>
        <p className="mt-3 text-xl text-muted md:text-2xl">
          Systems Architect &amp; Engineering Lead
        </p>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed">
          I design and build production platforms end to end: multi-tenant
          SaaS, real-time healthcare systems, and AI for industrial operations.
          Currently Head of Software &amp; AI at AIP and co-founder &amp; CTO of
          ISOPluss.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="#work"
            className="rounded-md bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-85"
          >
            View selected work
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
      </section>

      {/* ── Selected work ─────────────────────────────────────── */}
      <Section id="work" title="Selected work">
        <ul className="space-y-6">
          {featured.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/work/${p.slug}`}
                className="group block overflow-hidden rounded-xl border border-line transition-colors hover:border-line-strong"
              >
                <div className="p-6 md:p-7">
                  <p className="meta text-muted">
                    {p.context} · {p.year}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">{p.title}</h3>
                  <p className="mt-2 max-w-xl leading-relaxed text-muted">{p.line}</p>
                  {p.metrics.length > 0 && (
                    <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
                      {p.metrics.slice(0, 3).map((m) => (
                        <div key={m.label} className="flex flex-col-reverse">
                          <dt className="text-xs text-muted">{m.label}</dt>
                          <dd className="text-lg font-semibold">{m.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <p className="mt-6 text-sm font-medium text-accent">
                    Read case study{" "}
                    <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </p>
                </div>
                <div className="hidden border-t border-line bg-surface px-4 py-2 sm:block">
                  <DiagramThumb project={p} />
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <h3 className="meta mt-12 text-muted">Also</h3>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {other.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/work/${p.slug}`}
                className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6"
              >
                <span className="font-semibold group-hover:text-accent sm:w-32 sm:shrink-0">
                  {p.title}
                </span>
                <span className="flex-1 text-muted">{p.line}</span>
                <span className="meta text-muted">{p.year}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Experience ────────────────────────────────────────── */}
      <Section id="experience" title="Experience">
        <ol className="space-y-8">
          {experience.map((e) => (
            <li key={`${e.role}-${e.org}`} className="grid gap-1 sm:grid-cols-[7.5rem_1fr] sm:gap-6">
              <span className="meta pt-0.5 text-muted">{e.years}</span>
              <div>
                <h3 className="font-semibold">
                  {e.role} <span className="font-normal text-muted">· {e.org}, {e.where}</span>
                </h3>
                <p className="mt-1 leading-relaxed text-muted">{e.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── Expertise ─────────────────────────────────────────── */}
      <Section id="expertise" title="Expertise">
        <div className="grid gap-8 md:grid-cols-3">
          {expertise.map((x) => (
            <div key={x.title}>
              <h3 className="font-semibold">{x.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{x.body}</p>
              <p className="meta mt-3 leading-relaxed text-muted">{x.tools}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── About ─────────────────────────────────────────────── */}
      <Section id="about" title="About">
        <div className="max-w-2xl space-y-5 text-lg leading-relaxed">
          <p>
            I&apos;m a systems architect based in Riyadh. I lead Software &amp; AI
            at AIP, and I co-founded ISOPluss, where I own the architecture end
            to end.
          </p>
          <p className="text-muted">
            Over the last three years I&apos;ve built telehealth, compliance, and
            auction platforms: systems where downtime or a lost transaction has
            real consequences. I care most about the decisions that are expensive
            to change later, like tenancy, data models, and how events flow
            through a system.
          </p>
        </div>

        <h3 className="meta mt-12 text-muted">Recognition &amp; writing</h3>
        <ul className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {recognition.map((r) => (
            <li key={r.title}>
              <p className="font-semibold">{r.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">{r.detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Contact ───────────────────────────────────────────── */}
      <Section id="contact" title="Contact">
        <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Let&apos;s talk.
        </h3>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          Open to architecture and engineering-leadership work, especially
          platforms that need to be reliable from day one. Email is the fastest
          way to reach me.
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
