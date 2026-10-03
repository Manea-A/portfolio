# Manea Abdullah — Portfolio

Personal site for a systems architect and engineering lead.
Next.js 15 (App Router, fully static), Tailwind CSS 4, Geist. No animation
libraries; all content is server-rendered and readable without JavaScript.

## Structure

| Path | What |
|---|---|
| `app/page.tsx` | Home: intro, selected work, experience, expertise, about, contact |
| `app/work/[slug]/page.tsx` | One static case-study page per product |
| `lib/projects.ts` | All project content, metrics, links, logos, and screenshots |
| `lib/site.ts` | Site URL, email, and profile links |
| `components/ProjectVisuals.tsx` | Logo tiles, browser-framed screenshots, and the flow strip |

## Design

Neutral, editorial, one accent colour. Light theme by default; dark follows
the OS. Tokens live at the top of `app/globals.css`; every text colour meets
WCAG AA contrast.

## Logos and screenshots

Logos live in `public/projects/logos/`, live-site screenshots (1440×900 webp)
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
