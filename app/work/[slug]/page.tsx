import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flow, Logo, ScrollShot } from "@/components/ProjectVisuals";
import { StackChips } from "@/components/TechIcons";
import { bySlug, caseStudies, type SubProduct } from "@/lib/projects";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return caseStudies.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = bySlug((await params).slug);
  if (!p) return {};
  return {
    title: `${p.title} case study`,
    description: p.line,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title: `${p.title} · Manea Abdullah`, description: p.line, type: "article" },
  };
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="reveal grid gap-5 border-t border-line py-12 md:grid-cols-[12rem_1fr] md:gap-12">
      <h2 className="meta pt-1 text-muted">{title}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function SubCard({ s }: { s: SubProduct }) {
  const body = (
    <>
      <ScrollShot src={s.shot} domain={s.href ? new URL(s.href).hostname : undefined} alt={`${s.title} live site`} />
      <div className="px-2 pb-1 pt-4">
        <div className="flex items-center gap-3">
          <Logo src={s.logo} alt="" size={36} />
          <div className="min-w-0">
            <p className="font-semibold">
              {s.title} {s.href && <span aria-hidden="true" className="text-muted">↗</span>}
            </p>
            {(s.role || s.year) && (
              <p className="meta text-muted">{[s.role, s.year].filter(Boolean).join(" · ")}</p>
            )}
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">{s.line}</p>
        {s.metrics && (
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
            {s.metrics.map((m) => (
              <div key={m.label} className="flex flex-col-reverse">
                <dt className="text-xs text-muted">{m.label}</dt>
                <dd className="font-semibold">{m.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </>
  );
  const cls = "group block rounded-2xl border border-line p-3 transition-all duration-300";
  return s.href ? (
    <a href={s.href} target="_blank" rel="noopener noreferrer" className={`${cls} hover:-translate-y-1 hover:border-line-strong`}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default async function CaseStudy({ params }: Params) {
  const p = bySlug((await params).slug);
  if (!p || p.kind !== "product") notFound();

  const i = caseStudies.indexOf(p);
  const next = caseStudies[(i + 1) % caseStudies.length];

  return (
    <article>
      <header className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="hero-grid absolute inset-0" />
        <div aria-hidden="true" className="hero-glow absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-10 md:px-8 md:pt-14">
          <Link href="/#work" className="rise meta text-muted transition-colors hover:text-fg">
            ← All work
          </Link>
          <div className="rise rise-1 mt-10 flex items-center gap-4">
            <Logo src={p.logo} alt={`${p.title} logo`} dark={p.logoDark} size={56} />
            <div>
              <p className="meta text-muted">{p.org}</p>
              <h1 className="text-4xl font-semibold tracking-[-0.03em] md:text-6xl">{p.title}</h1>
            </div>
          </div>
          <p className="rise rise-2 mt-7 max-w-3xl text-lg leading-relaxed md:text-xl">{p.summary}</p>

          {p.links.length > 0 && (
            <div className="rise rise-3 mt-8 flex flex-wrap gap-3">
              {p.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
                >
                  Visit {l.label} <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          )}

          <dl className="rise rise-4 mt-12 grid gap-6 border-t border-line pt-6 text-sm sm:grid-cols-3">
            <div>
              <dt className="meta text-muted">Role</dt>
              <dd className="mt-1.5 leading-relaxed">{p.role}</dd>
            </div>
            <div>
              <dt className="meta text-muted">Timeline</dt>
              <dd className="mt-1.5">{p.year}</dd>
            </div>
            <div>
              <dt className="meta text-muted">Company</dt>
              <dd className="mt-1.5">{p.org}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 md:px-8">
        {p.shot && (
          <div className="rise rise-5 py-12">
            <ScrollShot
              src={p.shot}
              domain={p.links[0]?.label}
              alt={`${p.title} live site`}
              priority
              ratio="16 / 9"
              sizes="(min-width: 1152px) 1088px, 100vw"
            />
            <p className="meta mt-3 text-center text-muted">Hover the preview to scroll through the live site</p>
          </div>
        )}

        {p.metrics.length > 0 && (
          <Block title="Results">
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {p.metrics.map((m) => (
                <div key={m.label} className="flex flex-col-reverse rounded-2xl border border-line bg-surface p-5">
                  <dt className="mt-1 text-sm leading-snug text-muted">{m.label}</dt>
                  <dd className="text-3xl font-semibold tracking-tight">{m.value}</dd>
                </div>
              ))}
            </dl>
          </Block>
        )}

        {p.problem && (
          <Block title="Problem">
            <p className="max-w-2xl text-xl leading-relaxed">{p.problem}</p>
          </Block>
        )}

        <Block title="What I built">
          <ul className="max-w-2xl space-y-3 leading-relaxed">
            {p.built.map((b) => (
              <li key={b} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {b}
              </li>
            ))}
          </ul>
        </Block>

        {p.family && (
          <Block title={p.familyTitle ?? "Related"}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {p.family.map((s) => (
                <SubCard key={s.title} s={s} />
              ))}
            </div>
          </Block>
        )}

        {p.flow && (
          <Block title="How it works">
            <Flow steps={p.flow} />
          </Block>
        )}

        {p.stack.length > 0 && (
          <Block title="Stack">
            <StackChips items={p.stack} />
          </Block>
        )}

        {p.decisions.length > 0 && (
          <Block title="Key decisions">
            <ol className="grid gap-4 md:grid-cols-2">
              {p.decisions.map((d, n) => (
                <li key={d.title} className="rounded-2xl border border-line p-5">
                  <span className="meta text-muted">{String(n + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 font-semibold">{d.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{d.body}</p>
                </li>
              ))}
            </ol>
          </Block>
        )}

        {p.outcome && (
          <Block title="Outcome">
            <p className="max-w-2xl text-xl leading-relaxed">{p.outcome}</p>
          </Block>
        )}

        <nav aria-label="Next case study" className="border-t border-line py-14">
          <Link
            href={`/work/${next.slug}`}
            className="group flex items-center justify-between gap-6 rounded-2xl border border-line p-5 transition-all hover:-translate-y-1 hover:border-line-strong md:p-7"
          >
            <span className="flex items-center gap-4">
              <Logo src={next.logo} alt="" dark={next.logoDark} size={48} />
              <span>
                <span className="meta block text-muted">Next project</span>
                <span className="text-2xl font-semibold tracking-tight md:text-3xl">{next.title}</span>
              </span>
            </span>
            <span aria-hidden="true" className="text-2xl text-accent transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </nav>
      </div>
    </article>
  );
}
