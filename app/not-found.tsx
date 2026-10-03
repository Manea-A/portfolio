import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-28 md:px-8">
      <p className="meta text-muted">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">This page doesn&apos;t exist.</h1>
      <Link href="/" className="link mt-6 inline-block">
        Back to the homepage
      </Link>
    </section>
  );
}
