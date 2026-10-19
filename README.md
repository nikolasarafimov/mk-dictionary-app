# Македонски речник

### Digital Macedonian Dictionary

A modern, responsive web application for exploring Macedonian word forms, lemmas, and morphological tags. Built with **React 19**, **Vite 6**, **SQLite**, and **Turso**, with two supported database modes: a small browser-based demo and a server-backed full dictionary.

**[Live website](https://mk-dictionary-app.vercel.app/home)** · **[Source code](https://github.com/nikolasarafimov/mk-dictionary-app)**

**Developer:** [Nikola Sarafimov](https://github.com/nikolasarafimov)
**Version:** `1.0.0`
**Academic context:** PIT, Faculty of Computer Science and Engineering (FINKI)

## Overview

The dictionary supports two data sources without requiring a different user interface:

| Mode | Data source | Word forms | Processing |
| --- | --- | ---: | --- |
| Browser demo | `public/msd-mk-demo.sqlite` | 28,580 in the current snapshot | `sql.js` + WebAssembly inside a Web Worker |
| Full dictionary | Private Turso cloud database | **1,323,718** | Vercel serverless API + read-only SQL queries |

The **currently published production site uses the demo database**. The full-dictionary configuration has been exercised separately in a protected Vercel Preview deployment. Enabling the full dictionary for production requires an explicit environment configuration change and a new deployment.

The full database is **not downloaded to visitors' browsers** in Turso mode. Visitors receive only API query results. This does not prevent determined users from collecting publicly searchable results over time.

## Features

- Exact, prefix, and partial word-form and lemma search
- Autocomplete suggestions and keyboard navigation
- Alphabetical browsing across all 31 Macedonian letters
- Word details, lemmas, morphological tags, and related forms
- Random word discovery
- Favorites, recent words, and search history stored in the browser
- Command palette and keyboard shortcuts
- Macedonian language information and categorized abbreviations
- Responsive layouts, accessible interactions, and reduced-motion support

## Technology

| Layer | Tools |
| --- | --- |
| UI | React, Vite, React Router, Framer Motion, React Icons |
| Browser-based database | SQLite, `sql.js`, WebAssembly, Web Worker, IndexedDB |
| Full-dictionary database | Turso/libSQL (private, read-only application credentials) |
| API | Vercel Functions, `@libsql/client` |
| Quality assurance | ESLint, Vite build, GitHub Actions |
| Hosting | Vercel |

## Architecture

The app selects the backend at **build time** using `VITE_DICTIONARY_BACKEND`.

**Browser demo (default):**

```text
React UI → src/db/client.js → localClient.js
         → sqlWorker.js → sql.js / WebAssembly
         → demo SQLite file → IndexedDB cache
```

**Full dictionary (opt-in):**

```text
React UI → src/db/client.js → remoteClient.js
         → POST /api/dictionary → server/dictionary.js
         → read-only Turso cloud database
```

`/api/dictionary` exposes an allowlist of dictionary operations rather than arbitrary SQL. `/api/db-health` checks database connectivity and reports the record count. Database credentials are used only in server-side code.

## Running locally

### Requirements

- Node.js 22 and npm
- Python 3 only for optional demo database regeneration
- A personal copy of the full SQLite database only if you intend to use the full **local development** workflow

```bash
git clone https://github.com/nikolasarafimov/mk-dictionary-app.git
cd mk-dictionary-app
npm ci
npm run check
npm run preview
```

The Vite production preview uses the demo database by default at the URL displayed in the terminal (usually `http://localhost:4173`).

For `npm run dev` (port 8080), the local SQLite client expects `public/msd-mk.sqlite`. **That full database file is not distributed in the current repository tree** and must be supplied separately by an authorized developer. If you do not have the full database, you can copy the checked-in demo file to the expected local development filename **only if that file does not already exist**. Never overwrite a personal full-database copy, and do not commit the demo copy under the full-database name.

```powershell
if (-not (Test-Path .\public\msd-mk.sqlite)) {
  Copy-Item .\public\msd-mk-demo.sqlite .\public\msd-mk.sqlite
}
npm run dev
```

### npm scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Build the static frontend |
| `npm run preview` | Preview the latest production build |
| `npm run check` | Run ESLint and build |

## Full database on Vercel

The full-dictionary deployment uses a Turso database populated from an authorized SQLite source. The Vercel project needs these server-only environment variables:

| Variable | Purpose | Where used |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | Turso `libsql://…` URL | Server only |
| `TURSO_AUTH_TOKEN` | Turso **read-only** database token | Server only; mark as secret |
| `VITE_DICTIONARY_BACKEND` | Set to `turso` to enable remote mode | Vite build; value is public |

Do **not** prefix database credentials with `VITE_`, include them in the repository, or copy them into frontend JavaScript.

Preview and Production use separate Vercel environment settings. Test the full backend in a protected **Preview** deployment before explicitly enabling it for Production. Changing environment variables requires a fresh build/deployment to take effect in the frontend.

The local full database is excluded from static deployment uploads through `.vercelignore`. The Vite build also removes the full `msd-mk.sqlite` from `dist/`.

## CI

GitHub Actions runs ESLint, a production-mode build, and basic demo database and WebAssembly asset checks on pushes and pull requests. This workflow verifies the browser-demo build; it does **not** constitute an integration test of the live Turso backend. The protected Turso Preview deployment must be tested separately.

## Data and privacy

Favorites, recent words, and search history live in each visitor's browser. In browser-demo mode, the demo SQLite file can be cached in IndexedDB. In Turso mode, dictionary queries run on the server; the full SQLite file is not delivered as a website asset.

**Repository history note:** Removing `public/msd-mk.sqlite` from the current Git tree does not automatically remove earlier Git LFS objects, historical commits, forks, or previously downloaded copies. Historical-access cleanup is a separate repository-maintenance task. Review dataset redistribution rights before describing the underlying dictionary data as private or redistributable.

## Academic documentation

- [Project report — English](docs/project_report.pdf)
- [Project report — Macedonian](docs/project_reportMK.pdf)

## Author

**Nikola Sarafimov**
[GitHub](https://github.com/nikolasarafimov) · [LinkedIn](https://www.linkedin.com/in/nikola-sarafimov) · [Portfolio](https://nikolasarafimov.github.io)