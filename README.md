# Дигитален Македонски Речник
## Digital Macedonian Dictionary

A modern client-side web application for searching and exploring Macedonian word forms, lemmas, and morphological information directly in the browser.

The project contains a full SQLite dictionary database with more than **1.3 million Macedonian word forms**, while the deployed version uses a smaller representative database optimized for fast browser loading.

**Author:** Nikola Sarafimov  
**Degree Programme:** PIT, FINKI, III year

### Live Demo

[Open the Digital Macedonian Dictionary](https://mkd-dictionary-app.vercel.app/home)

---

## Overview

Digital Macedonian Dictionary is a browser-based dictionary application built with React and SQLite.

Unlike a traditional web application with a separate backend database server, the dictionary database is loaded directly in the browser using `sql.js`.

SQL operations are executed inside a Web Worker, keeping database processing away from the main UI thread and allowing the interface to remain responsive.

---

## Features

### Dictionary Search

Users can search for Macedonian word forms or partial words.

The search interface includes:

- live search suggestions;
- keyboard navigation;
- exact word lookup;
- partial word matching.

### Alphabetical Browsing

The application includes all **31 letters of the Macedonian alphabet**.

Selecting a letter displays dictionary forms beginning with that letter.

### Word Details

Dictionary entries can display:

- word form;
- lemma;
- morphological tag;
- decoded morphological description.

Users can also:

- add or remove words from favorites;
- copy a word;
- share the current dictionary entry;
- explore related forms with the same lemma.

### Random Word

A random dictionary form can be selected directly from the SQLite database.

### Favorites

Favorite words are stored locally using `localStorage`.

No user account or backend service is required.

### Macedonian Language Information

The application contains an educational section covering:

- language classification;
- official use;
- dialectal organization;
- the Macedonian alphabet;
- linguistic characteristics;
- historical development and codification.

### Abbreviations

A separate reference section presents Macedonian abbreviations organized into seven groups.

### Responsive Interface

The interface is designed for:

- desktop computers;
- laptops;
- tablets;
- mobile phones.

The UI includes responsive layouts, animated page transitions, interactive cards, autocomplete suggestions, keyboard-accessible controls, focus states, and reduced-motion support.

---

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Framer Motion
- React Icons
- React Window

### Database

- SQLite
- sql.js
- WebAssembly

### Browser Storage

- IndexedDB for SQLite database caching
- localStorage for favorite words

### Development Tools

- ESLint
- Python
- Git LFS
- Vercel

---

## Architecture

The application is fully client-side.

```text
React UI
   │
   ▼
Database Client
   │
   ▼
Web Worker
   │
   ▼
sql.js / WebAssembly
   │
   ▼
SQLite Database
```

Database queries are executed through a Web Worker so that SQL processing does not block the main browser thread.

After loading, the SQLite database can be cached locally using IndexedDB.

---

## Database Versions

The project contains two SQLite database variants.

### Full Development Database

```text
public/msd-mk.sqlite
```

This is the complete dictionary database containing more than **1.3 million Macedonian word forms**.

It is tracked using **Git LFS** because of its size.

The development environment uses this database.

### Production Demo Database

```text
public/msd-mk-demo.sqlite
```

The deployed production version uses a reduced representative database for significantly faster browser loading.

The current generated demo database contains:

```text
28,580 word forms
31/31 Macedonian alphabet letters represented
```

The production build automatically excludes the full database from `dist/`, preventing the 100+ MB development database from being deployed unnecessarily.

---

## Demo Database Generation

The production database can be regenerated from the full database using:

```bash
python tools/create_demo_db.py
```

The script:

- reads the full SQLite database;
- creates a representative sample across all Macedonian letters;
- preserves the required `words` table structure;
- recreates the relevant database indexes;
- validates the generated row count;
- verifies Macedonian alphabet coverage;
- safely replaces the existing demo database only after successful generation.

The full database remains unchanged.

---

## Project Structure

```text
mk-dictionary-app/
├── docs/
│   ├── project_report.pdf
│   └── project_reportMK.pdf
│
├── public/
│   ├── logo.png
│   ├── msd-mk-demo.sqlite
│   ├── msd-mk.sqlite
│   ├── recnikLogo.png
│   └── sql-wasm.wasm
│
├── src/
│   ├── components/
│   │   ├── Abbreviations.jsx
│   │   ├── Footer.jsx
│   │   ├── LanguageInfo.jsx
│   │   ├── LetterNav.jsx
│   │   ├── LoadingOverlay.jsx
│   │   ├── NavBar.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── RandomWordButton.jsx
│   │   ├── SearchBar.jsx
│   │   ├── WordDetails.jsx
│   │   └── WordList.jsx
│   │
│   ├── db/
│   │   ├── client.js
│   │   ├── indexedDb.js
│   │   └── sqlWorker.js
│   │
│   ├── pages/
│   │   └── Favorites.jsx
│   │
│   ├── utils/
│   │   ├── favoriteManager.js
│   │   └── tagDecoder.js
│   │
│   ├── App.css
│   ├── App.jsx
│   └── main.jsx
│
├── tools/
│   └── create_demo_db.py
│
├── .gitattributes
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── vercel.json
└── vite.config.js
```

---

## Requirements

To run the complete project locally, install:

- Node.js
- npm
- Git
- Git LFS

Python 3 is required only when regenerating the production demo database.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/nikolasarafimov/mk-dictionary-app.git
cd mk-dictionary-app
```

Initialize Git LFS:

```bash
git lfs install
git lfs pull
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

---

## Available Scripts

### Development server

```bash
npm run dev
```

### ESLint

```bash
npm run lint
```

### Production build

```bash
npm run build
```

### Production preview

```bash
npm run preview
```

---

## Production Build

The production build is created with:

```bash
npm run build
```

The full development database:

```text
public/msd-mk.sqlite
```

is intentionally excluded from the resulting `dist/` directory.

The deployed application therefore uses only:

```text
msd-mk-demo.sqlite
sql-wasm.wasm
```

together with the compiled frontend assets.

---

## Client-Side SQLite

The application uses `sql.js`, which provides SQLite through WebAssembly.

The WebAssembly binary is stored at:

```text
public/sql-wasm.wasm
```

Database communication is handled through:

```text
src/db/client.js
```

SQL execution takes place in:

```text
src/db/sqlWorker.js
```

The application also supports IndexedDB caching with fallback to a fresh database download when the cache cannot be read.

---

## Local Data and Privacy

The application does not require registration or authentication.

Favorite words are stored locally using:

```text
localStorage
```

The SQLite database cache is stored locally using:

```text
IndexedDB
```

Favorite-word data does not need to be sent to an external application server.

---

## Deployment

The production application is deployed on Vercel:

[https://mkd-dictionary-app.vercel.app/home](https://mkd-dictionary-app.vercel.app/home)

Because the application uses React Router with browser history routing, `vercel.json` provides the SPA rewrite required for direct access to routes such as:

```text
/home
/language
/abbr/3
/favorites
/details/:form
```

---

## Academic Documentation

Project documentation is available in:

```text
docs/project_report.pdf
docs/project_reportMK.pdf
```

These files contain the available project report versions.

---

## Author

**Nikola Sarafimov**

- GitHub: [nikolasarafimov](https://github.com/nikolasarafimov)
- LinkedIn: [Nikola Sarafimov](https://www.linkedin.com/in/nikola-sarafimov-418753357/)
- Website: [nikolasarafimov.github.io/personal-website](https://nikolasarafimov.github.io/personal-website/)

---

## Release

Current stable release:

```text
v1.0.1
```

The release includes the finalized responsive interface, browser-based SQLite architecture, database caching, favorites, production deployment configuration, and optimized production database bundle.