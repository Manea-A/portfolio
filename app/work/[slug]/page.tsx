import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ArchDiagram from "@/components/ArchDiagram";
import { bySlug, projects } from "@/lib/projects";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
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
  if (!p) notFound();

  const i = projects.indexOf(p);
  const next = projects[(i + 1) % projects.length];

  return (
    <article className="mx-auto max-w-5xl px-5 md:px-8">
      <header className="pb-12 pt-10 md:pb-16 md:pt-14">
        <Link href="/#work" className="meta text-muted transition-colors hover:text-fg">
          ← All work
        </Link>
        <p className="meta mt-10 text-muted">
          {p.context} · {p.year}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{p.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed md:text-xl">{p.summary}</p>

        <dl className="mt-10 grid gap-6 border-t border-line pt-6 text-sm sm:grid-cols-3">
          <div>
            <dt className="meta text-muted">Role</dt>
            <dd className="mt-1.5 leading-relaxed">{p.role}</dd>
          </div>
          <div>
            <dt className="meta text-muted">Timeline</dt>
            <dd className="mt-1.5">{p.year}</dd>
          </div>
          <div>
            <dt className="meta text-muted">Stack</dt>
            <dd className="mt-1.5 leading-relaxed">{p.stack.join(", ")}</dd>
          </div>
        </dl>
      </header>

      {p.image && (
        <div className="mb-12 overflow-hidden rounded-xl border border-line">
          <Image
            src={p.image}
            alt={`${p.title} interface`}
            width={1600}
            height={1000}
            className="h-auto w-full"
            priority
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

      <Block title="Problem">
        <p className="max-w-2xl text-lg leading-relaxed">{p.problem}</p>
      </Block>

      {p.diagram && (
        <Block title="Architecture">
          <ArchDiagram project={p} />
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

      {p.retrospective && (
        <Block title="Looking back">
          <p className="max-w-2xl leading-relaxed">{p.retrospective}</p>
        </Block>
      )}

      <Block title="Outcome">
        <p className="max-w-2xl text-lg leading-relaxed">{p.outcome}</p>
      </Block>

      <nav aria-label="Next case study" className="border-t border-line py-12">
        <Link href={`/work/${next.slug}`} className="group block">
          <span className="meta text-muted">Next project</span>
          <span className="mt-2 flex items-baseline gap-3 text-2xl font-semibold tracking-tight md:text-3xl">
            {next.title}
            <span aria-hidden="true" className="text-accent transition-transform group-hover:translate-x-1">
              →
            </span>
          </span>
          <span className="mt-1 block text-muted">{next.line}</span>
        </Link>
      </nav>
    </article>
  );
}
