import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { EMAIL, GITHUB, LINKEDIN, SITE_URL } from "@/lib/site";

const description =
  "Senior software engineer, technical lead, and software architect in Riyadh. I design, build, and ship production software: multi-tenant SaaS, real-time telehealth, marketplaces, and AI for industrial systems.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Manea Abdullah · Senior Software Engineer & Software Architect",
    template: "%s · Manea Abdullah",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Manea Abdullah · Senior Software Engineer & Software Architect",
    description,
    type: "website",
    url: SITE_URL,
    siteName: "Manea Abdullah",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manea Abdullah · Senior Software Engineer & Software Architect",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0d" },
  ],
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Manea Abdullah Al-Awbathani",
  jobTitle: "Software Engineering Lead",
  email: `mailto:${EMAIL}`,
  url: SITE_URL,
  address: { "@type": "PostalAddress", addressLocality: "Riyadh", addressCountry: "SA" },
  sameAs: [LINKEDIN, GITHUB],
  alumniOf: "University Malaysia Pahang",
  knowsAbout: [
    "Systems architecture",
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="flex min-h-svh flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <a
          href="#main"
          className="sr-only rounded-md bg-fg px-4 py-2 text-sm text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
