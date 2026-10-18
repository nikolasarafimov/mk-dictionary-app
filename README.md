# Дигитален македонски речник

### Digital Macedonian Dictionary

A client-side web application for searching and exploring Macedonian word forms, lemmas, and morphological information. Built with React, SQLite, WebAssembly, and a dedicated Web Worker, the dictionary runs directly in the browser without a separate database server.

**[Live Demo](https://mkd-dictionary-app.vercel.app/home)** · **[Source Code](https://github.com/nikolasarafimov/mk-dictionary-app)**

**Author:** Nikola Sarafimov  
**Academic programme:** PIT, Faculty of Computer Science and Engineering (FINKI), third year  
**Project version:** `1.0.0`

## Overview

The application provides a searchable interface to Macedonian dictionary data, including word forms, their lemmas, and morphological tags. SQLite queries run inside a Web Worker through `sql.js` and WebAssembly, keeping database processing away from the main UI thread.

The repository includes a full development database containing more than **1.3 million word forms** and a smaller demonstration database intended for production deployment. The application can cache the downloaded database in IndexedDB for subsequent visits.

## Features

- **Dictionary search:** Exact and partial word-form lookup with autocomplete suggestions and keyboard navigation.
- **Alphabetical browsing:** Navigate word forms by the 31 letters of the Macedonian alphabet.
- **Word details:** View the selected form, lemma, morphological tag, and decoded morphological information.
- **Related word forms:** Explore other forms associated with the same lemma.
- **Random word:** Open a randomly selected dictionary entry.
- **Favorites:** Save and remove favorite words locally in the browser.
- **Search history and recent words:** Quickly revisit previous searches and recently opened entries.
- **Command palette:** Access search and navigation actions through a keyboard-friendly interface.
- **Language reference:** Read about Macedonian language classification, dialects, alphabet, linguistic characteristics, and development.
- **Abbreviations:** Browse and search abbreviations organized into seven groups.
- **Responsive experience:** Desktop, tablet, and mobile layouts, with accessible focus states and reduced-motion support.

No account or authentication is required.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite 6, React Router 7 |
| UI | CSS, Framer Motion, React Icons, React Window |
| Database | SQLite, sql.js, WebAssembly, Web Worker |
| Browser storage | IndexedDB, localStorage |
| Development | ESLint, Python 3, Git LFS |
| Deployment | Vercel |

## Architecture

```text
React UI
   |
   v
Database client (src/db/client.js)
   |
   v
Web Worker (src/db/sqlWorker.js)
   |
   v
sql.js + WebAssembly
   |
   v
SQLite database
```

The database client selects the appropriate database file for the build environment, loads a cached copy from IndexedDB when available, and communicates with the Web Worker for SQL execution. If a cached database cannot be opened, the client attempts to download a fresh copy.

The application is fully client-side; it does not require a separate API or database server for dictionary queries.

## Database Versions

| Environment | Database file | Purpose |
| --- | --- | --- |
| Development | `public/msd-mk.sqlite` | Full dictionary, tracked with Git LFS |
| Production | `public/msd-mk-demo.sqlite` | Smaller representative dictionary sample |

The full database contains **more than 1.3 million Macedonian word forms**. The documented demo snapshot contains **28,580 word forms** with **31/31 Macedonian letters represented**. These snapshot figures can change when the demo database is regenerated.

The generation script targets up to **30,000 rows**, sampling across the alphabet. The final number depends on how many matching rows are available for each letter.

The production build removes `msd-mk.sqlite` from the generated `dist/` folder. The demo database and `sql-wasm.wasm` remain available to the deployed application.

## Getting Started

### Requirements

- Node.js 20 or later (recommended) and npm
- Git
- Git LFS to download the full development database
- Python 3 only if you want to regenerate the demo database

### Installation

```bash
git clone https://github.com/nikolasarafimov/mk-dictionary-app.git
cd mk-dictionary-app

git lfs install
git lfs pull

npm ci
npm run dev
```

The development server uses port **8080**, as configured in `vite.config.js`. Open the local URL displayed by Vite.

The development environment expects `public/msd-mk.sqlite` to contain the actual SQLite data, not only its Git LFS pointer.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Run lint followed by the production build |

### Verify the project

```bash
npm run check
```

This command is available after updating `package.json` to the revised version. Passing it requires the lint and build steps to complete successfully in your local environment.

## Demo Database Generation

To regenerate the representative production database from the full development database:

```bash
python tools/create_demo_db.py
```

The script reads the full SQLite database, selects word forms across the 31 Macedonian letters, preserves the `words` table structure, copies its SQL-defined indexes, and validates the number of rows copied. It prints the alphabet coverage and replaces the previous demo database only after successful generation.

The script does not modify the source database. Its current validation prints alphabet coverage; it does **not** enforce complete 31/31 coverage as a failing condition.

## Project Structure

```text
mk-dictionary-app/
├── docs/
│   ├── project_report.pdf
│   └── project_reportMK.pdf
├── public/
│   ├── logo.png
│   ├── msd-mk-demo.sqlite
│   ├── msd-mk.sqlite
│   ├── recnikLogo.png
│   └── sql-wasm.wasm
├── src/
│   ├── components/
│   │   ├── AppErrorBoundary.jsx
│   │   ├── CommandPalette.jsx
│   │   ├── Footer.jsx
│   │   ├── LetterNav.jsx
│   │   ├── LoadingOverlay.jsx
│   │   ├── NavBar.jsx
│   │   ├── RandomWordButton.jsx
│   │   ├── ScrollManager.jsx
│   │   ├── SearchBar.jsx
│   │   ├── Toast.jsx
│   │   ├── ToastProvider.jsx
│   │   ├── WordDetails.jsx
│   │   └── WordList.jsx
│   ├── context/
│   │   └── ToastContext.js
│   ├── data/
│   │   └── abbreviations.js
│   ├── db/
│   │   ├── client.js
│   │   ├── indexedDb.js
│   │   └── sqlWorker.js
│   ├── hooks/
│   │   ├── useSearchSuggestions.js
│   │   └── useToast.js
│   ├── pages/
│   │   ├── Abbreviations.jsx
│   │   ├── Favorites.jsx
│   │   ├── Home.jsx
│   │   ├── LanguageInfo.jsx
│   │   ├── ListPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── SearchResults.jsx
│   │   └── WordPage.jsx
│   ├── styles/
│   │   ├── command-palette.css
│   │   ├── components.css
│   │   ├── design-system.css
│   │   ├── details.css
│   │   ├── home.css
│   │   ├── information.css
│   │   ├── loading.css
│   │   ├── navigation.css
│   │   ├── results.css
│   │   ├── secondary-pages.css
│   │   ├── shell.css
│   │   └── toast.css
│   ├── utils/
│   │   ├── favoriteManager.js
│   │   ├── recentManager.js
│   │   ├── routes.js
│   │   ├── searchHistoryManager.js
│   │   └── tagDecoder.js
│   ├── App.jsx
│   └── main.jsx
├── tools/
│   └── create_demo_db.py
├── .gitattributes
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── vercel.json
└── vite.config.js
```

This tree describes the revised project structure after applying the changes from the code review. The published GitHub repository may still contain older files until the changes are committed and pushed.

## Production Build and Deployment

Build the application with:

```bash
npm run build
npm run preview
```

Expected production assets include the compiled frontend, `msd-mk-demo.sqlite`, `sql-wasm.wasm`, and the public image files. The full `msd-mk.sqlite` should not appear in `dist/`.

The project is deployed on **Vercel**:

[https://mkd-dictionary-app.vercel.app/home](https://mkd-dictionary-app.vercel.app/home)

The `vercel.json` configuration rewrites SPA routes to `index.html`, allowing direct access and refreshes on routes such as:

```text
/home
/list/:letter
/search/:term
/details/:form
/language
/abbr/:group
/favorites
/not-found/:term
```

Deployment under a subdirectory additionally requires consistent Vite `base` paths and hosting support for client-side routes.

## Local Data and Privacy

The dictionary does not require sign-in. Favorites, recent words, and search history are stored locally in the browser using `localStorage`. The downloaded SQLite file may be cached in IndexedDB.

Clearing browser storage or using a different browser or device can remove or make this local data unavailable. No account-based synchronization is provided.

## Academic Documentation

- [Project report (English)](docs/project_report.pdf)
- [Project report (Macedonian)](docs/project_reportMK.pdf)

## Author

**Nikola Sarafimov**

- [GitHub](https://github.com/nikolasarafimov)
- [LinkedIn](https://www.linkedin.com/in/nikola-sarafimov)
- [Personal website](https://nikolasarafimov.github.io)

## Version

`1.0.0` — aligned with the revised `package.json`. The final lint, production-build, database, and deployment checks should be completed before tagging a release.
