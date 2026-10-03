import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrowserShot, Flow, Logo } from "@/components/ProjectVisuals";
import { bySlug, caseStudies } from "@/lib/projects";

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
    <section className="grid gap-4 border-t border-line py-10 md:grid-cols-[11rem_1fr] md:gap-12">
      <h2 className="meta pt-1 text-muted">{title}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default async function CaseStudy({ params }: Params) {
  const p = bySlug((await params).slug);
  if (!p || p.kind !== "product") notFound();

  const i = caseStudies.indexOf(p);
  const next = caseStudies[(i + 1) % caseStudies.length];

  return (
    <article className="mx-auto max-w-5xl px-5 md:px-8">
      <header className="pb-10 pt-10 md:pt-14">
        <Link href="/#work" className="meta text-muted transition-colors hover:text-fg">
          ← All work
        </Link>
        <div className="mt-10 flex items-center gap-4">
          <Logo src={p.logo} alt={`${p.title} logo`} dark={p.logoDark} size={52} />
          <div>
            <p className="meta text-muted">{p.org}</p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{p.title}</h1>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed md:text-xl">{p.summary}</p>

        {p.links.length > 0 && (
          <div className="mt-7 flex flex-wrap gap-3">
            {p.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-fg px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-85"
              >
                Visit {l.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}

        <dl className="mt-10 grid gap-6 border-t border-line pt-6 text-sm sm:grid-cols-3">
          <div>
            <dt className="meta text-muted">Role</dt>
            <dd className="mt-1.5 leading-relaxed">{p.role}</dd>
          </div>
          <div>
            <dt className="meta text-muted">Timeline</dt>
            <dd className="mt-1.5">{p.year}</dd>
          </div>
          {p.stack.length > 0 && (
            <div>
              <dt className="meta text-muted">Stack</dt>
              <dd className="mt-1.5 leading-relaxed">{p.stack.join(", ")}</dd>
            </div>
          )}
        </dl>
      </header>

      {p.shot && (
        <div className="mb-12">
          <BrowserShot
            src={p.shot}
            domain={p.links[0]?.label ?? ""}
            alt={`${p.title} live site`}
            priority
            sizes="(min-width: 1024px) 960px, 100vw"
          />
        </div>
      )}

      {p.metrics.length > 0 && (
        <Block title="Results">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            {p.metrics.map((m) => (
              <div key={m.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-sm leading-snug text-muted">{m.label}</dt>
                <dd className="text-3xl font-semibold tracking-tight">{m.value}</dd>
              </div>
            ))}
          </dl>
        </Block>
      )}

      {p.problem && (
        <Block title="Problem">
          <p className="max-w-2xl text-lg leading-relaxed">{p.problem}</p>
        </Block>
      )}

      <Block title="What I built">
        <ul className="max-w-2xl list-disc space-y-2.5 pl-5 leading-relaxed marker:text-muted">
          {p.built.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </Block>

      {p.flow && (
        <Block title="How it works">
          <Flow steps={p.flow} />
        </Block>
      )}

      {p.decisions.length > 0 && (
        <Block title="Key decisions">
          <ol className="max-w-2xl space-y-8">
            {p.decisions.map((d, n) => (
              <li key={d.title} className="grid grid-cols-[2rem_1fr]">
                <span className="meta pt-0.5 text-muted">{String(n + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-semibold">{d.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{d.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Block>
      )}

      {p.family && (
        <Block title="Also on this platform">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {p.family.map((f) => (
              <a
                key={f.href}
                href={f.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-line p-4 transition-colors hover:border-line-strong"
              >
                <BrowserShot src={f.shot} domain={new URL(f.href).hostname} alt={`${f.title} live site`} />
                <div className="mt-4 flex items-center gap-3">
                  <Logo src={f.logo} alt="" size={36} />
                  <div>
                    <p className="font-semibold">
                      {f.title} <span aria-hidden="true" className="text-muted">↗</span>
                    </p>
                    <p className="text-sm text-muted">{f.line}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </Block>
      )}

      {p.outcome && (
        <Block title="Outcome">
          <p className="max-w-2xl text-lg leading-relaxed">{p.outcome}</p>
        </Block>
      )}

      <nav aria-label="Next case study" className="border-t border-line py-12">
        <Link href={`/work/${next.slug}`} className="group flex items-center gap-4">
          <Logo src={next.logo} alt="" dark={next.logoDark} size={44} />
          <span>
            <span className="meta block text-muted">Next project</span>
            <span className="flex items-baseline gap-2 text-2xl font-semibold tracking-tight">
              {next.title}
              <span aria-hidden="true" className="text-accent transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </span>
        </Link>
      </nav>
    </article>
  );
}
