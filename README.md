# Manea Abdullah — Portfolio

Personal site for a systems architect and engineering lead.
Next.js 15 (App Router, fully static), Tailwind CSS 4, Geist. No animation
libraries; all content is server-rendered and readable without JavaScript.

## Structure

| Path | What |
|---|---|
| `app/page.tsx` | Home: hero showcase, work, experience, skills, about, contact |
| `app/work/[slug]/page.tsx` | One static case-study page per product |
| `lib/projects.ts` | All project content, metrics, links, logos, and screenshots |
| `lib/site.ts` | Site URL, email, and profile links |
| `components/ProjectVisuals.tsx` | Logo tiles, hover-to-scroll screenshots, and the flow strip |
| `components/HeroShowcase.tsx` | Tilting stack of live products in the hero (Motion) |
| `components/TechIcons.tsx` | Brand logos for the stack (simple-icons) |

## Design

Neutral, editorial, one accent colour. Light theme by default; dark follows
the OS. Tokens live at the top of `app/globals.css`; every text colour meets
WCAG AA contrast.

## Logos and screenshots

Logos live in `public/projects/logos/`, full-page live-site screenshots (1200px wide webp)
in `public/projects/shots/`. Reference them from the project in
`lib/projects.ts` (`logo`, `shot`).

## CV

`public/Manea-Abdullah-CV.pdf` — replace the file, keep the name, and every
download link keeps working.

## Run locally

```bash
npm install
npm run dev
```
