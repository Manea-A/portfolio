import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";

/* Self-hosted via npm; next/font/local adds preload + size-adjusted
   fallbacks so the display headline never jolts on first paint. */
const sora = localFont({
  src: "../node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2",
  variable: "--font-sora",
  display: "swap",
});
const manrope = localFont({
  src: "../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Manea Abdullah — Systems Architect & Full-Stack Engineering Lead",
  description:
    "Systems architect in Riyadh building production platforms end to end — multi-tenant SaaS, real-time telehealth, and AI-native industrial systems.",
  openGraph: {
    title: "Manea Abdullah — Systems Architect",
    description:
      "Production platforms end to end: multi-tenant SaaS, real-time systems, AI-native architecture.",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Manea Abdullah — Systems Architect",
    description:
      "Production platforms end to end: multi-tenant SaaS, real-time systems, AI-native architecture.",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Manea Abdullah Al-Awbathani",
  jobTitle: "Systems Architect & Head of Software and AI",
  email: "mailto:sir.manea.a@gmail.com",
  url: SITE_URL,
  address: { "@type": "PostalAddress", addressLocality: "Riyadh", addressCountry: "SA" },
  sameAs: ["https://www.linkedin.com/in/manea-abdullah/"],
  alumniOf: "University Malaysia Pahang",
  knowsAbout: [
    "Systems Architecture",
    "Multi-tenant SaaS",
    "Real-time systems",
    "LLM integration",
    "NestJS",
    "PostgreSQL",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <a
          href="#main"
          className="label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-gradient-accent focus:px-4 focus:py-2 focus:text-[#0d0c10]"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
