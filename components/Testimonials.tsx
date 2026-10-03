import SpotlightCard from "@/components/SpotlightCard";

/**
 * READY BUT NOT MOUNTED — real quotes only.
 * When quotes exist, uncomment the <Testimonials /> block in app/page.tsx
 * and pass them in. Never ship placeholder praise.
 */
export type Quote = {
  text: string;
  name: string;
  role: string; // e.g. "CTO, Me'Kaaz"
};

export default function Testimonials({ quotes }: { quotes: Quote[] }) {
  if (!quotes.length) return null;
  return (
    <section id="testimonials" className="rule scroll-mt-24">
      <div className="mx-auto grid max-w-6xl gap-5 px-5 py-14 md:grid-cols-2 md:px-8">
        {quotes.map((q) => (
          <SpotlightCard key={q.name} className="grain h-full p-7">
            <p className="text-lg leading-relaxed text-fg">“{q.text}”</p>
            <p className="label mt-5 text-gradient">{q.name}</p>
            <p className="mt-1 text-sm text-muted">{q.role}</p>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
