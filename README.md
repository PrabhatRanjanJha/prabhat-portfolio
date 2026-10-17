# Prabhat's portfolio

A scroll-driven portfolio built as an n8n-style workflow. A wire runs through six nodes (hero, about, skills, projects, services, contact) and the camera hops from node to node, left to right, as you scroll. Each project opens a node graph of its real workflow.

Stack: Vite, React, three.js, GSAP (ScrollTrigger), Lenis, and `@xyflow/react` for the project graphs. The background is a looping video (`public/chariot.mp4`, `chariot.webm`, `chariot-poster.jpg`) drawn through a three.js shader; headings use Cinzel and Yatra One.

## Run it

You need Node 20.19 or newer (or 22.12+), because Vite 7 requires it.

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173). `npm run build` makes a production build in `dist/`, and `npm run preview` serves it.

## Read this first

This zip was put together in a sandbox that could not reach the npm registry, so it was **never compiled with Vite or opened in a browser**. What was checked: every source file parses and every import and export resolves (an esbuild bundle of `src/` succeeded). What was not checked: the dependency install, the production build, and how the 3D scene looks and feels.

The original `package.json` was overwritten by mistake and rebuilt from the project's imports, with version ranges chosen from versions that are known to exist. If `npm install` complains about a version, change that line in `package.json` to the version npm suggests. Expect a first round of tuning once you see it running.

## Where things live

| To change | Edit |
| --- | --- |
| Any words on the site, project details | `src/data/content.js` |
| The node graphs inside each project | `src/data/flows.js` |
| Colours, node positions, camera distance, hop speed and lift, page length, background framing and brightness (`BG`) | `src/scene/config.js` |
| How scroll maps to the camera's hops | `src/scene/flight.js` |
| Layout and styling | `src/styles.css` |

Good tuning knobs in `src/scene/config.js`: `FLIGHT.hop` (how much of each chapter is spent travelling), `FLIGHT.hopLift` and `hopPull` (how dramatic the hop is), `FLIGHT.offsetX` (how far to the side the node sits), and `MOODS` (sky colour per chapter).

## Behaviour to know about

- Under 820px wide, with reduced motion turned on, or without WebGL, the site shows a flat layout instead of the 3D flight.
- Ctrl+K (Cmd+K on Mac) opens a chapter palette.
- The résumé button only appears if `public/resume.pdf` exists. Drop your file there.
- Nothing is deployed yet, so no project has a live link. Once a project is deployed, add `live: 'https://...'` next to `github` in that project's `links` in `src/data/content.js` and a "Live" button appears in its panel.

## Deploy (Vercel)

1. Put the project in a GitHub repo (`git init`, commit, push). Do not commit `node_modules` (already in `.gitignore`).
2. On vercel.com, choose Add New, then Project, and import the repo.
3. Vercel detects Vite. Leave the build command as `npm run build` and the output directory as `dist`, then Deploy.
4. Add a custom domain later under the project's Domains settings.

Netlify works the same way: build command `npm run build`, publish directory `dist`.

## Tuning with an AI editor

Open the folder in your editor and describe what you see in plain words, for example "the hop between About and Skills feels too fast, slow it down" or "the sky is too dark behind the text". Point it at `src/scene/config.js` first. Many looks can be changed there without touching the scene code.
