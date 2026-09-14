# Дигитален Македонски Речник
## Digital Macedonian Dictionary

A modern web application for searching and exploring Macedonian word forms, lemmas, and morphological information directly in the browser.

The project contains a full SQLite dictionary database with more than **1.3 million Macedonian word forms** and a smaller database used by the deployed demo for faster loading.

**Author:** Nikola Sarafimov  
**Degree Programme:** PIT, FINKI, III year

---

## Overview

Digital Macedonian Dictionary is a client-side dictionary application built with React and SQLite.

Unlike a traditional web application with a separate database server, the dictionary database is loaded directly in the browser using `sql.js`. SQL operations are executed inside a Web Worker so that large database queries do not block the user interface.

The application provides:

- search by word form;
- search suggestions while typing;
- exact word lookup;
- browsing words by Macedonian alphabet letter;
- random word selection;
- lemma and morphological tag information;
- decoded descriptions of morphological tags;
- similar word forms based on the same lemma;
- locally stored favorite words;
- information about the Macedonian language;
- a categorized abbreviations reference;
- responsive layouts for desktop, tablet, and mobile devices.

---

## Features

### Dictionary Search

Users can enter a Macedonian word or part of a word and receive matching dictionary forms.

The search interface includes autocomplete suggestions and keyboard navigation.

### Alphabetical Browsing

All 31 letters of the Macedonian alphabet are available through an alphabetical index.

Selecting a letter displays dictionary forms beginning with that letter.

### Word Details

Each dictionary entry can display:

- word form;
- lemma;
- morphological tag;
- decoded morphological description.

Users can also:

- add or remove the word from favorites;
- copy the word;
- share the current dictionary entry;
- explore related forms that share the same lemma.

### Random Word

The application can select a random word directly from the SQLite database.

### Favorites

Favorite words are stored locally in the browser using `localStorage`.

No account or external backend is required.

### Macedonian Language Information

The application contains an educational section covering topics such as:

- language classification;
- official use;
- dialects;
- the Macedonian alphabet;
- linguistic characteristics;
- historical development and codification.

### Abbreviations

A dedicated section presents common Macedonian abbreviations organized into seven groups.

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
- sql.js / WebAssembly

### Browser Storage

- IndexedDB for local database caching
- localStorage for favorite words

### Additional Tools

- Python for generating the reduced demo database
- Git LFS for storing the full SQLite database

---

## Architecture

The project is a fully client-side application.

```text
React UI
   │
   ▼
Database client
   │
   ▼
Web Worker
   │
   ▼
sql.js
   │
   ▼
SQLite database
```

The database is processed inside a Web Worker so that SQL operations remain separate from the main browser thread.

The database file is also cached in IndexedDB after it is loaded, reducing the need to download it again on future visits.

---

## Database Versions

Two SQLite database files are included in the project.

### Full database

```text
public/msd-mk.sqlite
```

This is the complete dictionary database containing more than 1.3 million word forms.

The full database is tracked using **Git LFS** because of its size.

During local development, the application uses this database.

### Demo database

```text
public/msd-mk-demo.sqlite
```

The production build uses a reduced version of the database to provide significantly faster loading in a browser-based live demo.

The reduced database can be regenerated from the full database using:

```bash
python tools/create_demo_db.py
```

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
└── vite.config.js
```

---

## Requirements

To run the project locally, install:

- Node.js
- npm
- Git LFS

Python 3 is required only if you want to regenerate the demo SQLite database.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/nikolasarafimov/mk-dictionary-app.git
cd mk-dictionary-app
```

Initialize Git LFS and retrieve the full database:

```bash
git lfs install
git lfs pull
```

Install the JavaScript dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will display the local URL in the terminal.

---

## Available Scripts

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run ESLint:

```bash
npm run lint
```

Preview the production build locally:

```bash
npm run preview
```

---

## Generate the Demo Database

To recreate the reduced database from the complete dictionary database, run:

```bash
python tools/create_demo_db.py
```

The script reads:

```text
public/msd-mk.sqlite
```

and generates:

```text
public/msd-mk-demo.sqlite
```

The full database remains unchanged.

---

## Client-Side SQLite

The application uses `sql.js`, which compiles SQLite to WebAssembly.

The required WebAssembly binary is stored at:

```text
public/sql-wasm.wasm
```

SQL queries are executed through:

```text
src/db/sqlWorker.js
```

This allows database operations to run outside the main UI thread.

---

## Local Data and Privacy

The application does not require registration or a user account.

Favorite words are stored locally in the browser using `localStorage`.

The dictionary database cache is stored using IndexedDB.

No favorites need to be sent to an external server.

---

## Academic Documentation

Project documentation is available in the `docs/` directory:

```text
docs/project_report.pdf
docs/project_reportMK.pdf
```

These files contain the project report in the available language versions.

---

## Responsive Design

The interface is designed to work across:

- desktop computers;
- laptops;
- tablets;
- mobile phones.

The UI includes responsive layouts, animated transitions, search suggestions, interactive cards, accessible focus states, and support for reduced-motion preferences.

---

## Author

**Nikola Sarafimov**

- GitHub: [nikolasarafimov](https://github.com/nikolasarafimov)
- LinkedIn: [Nikola Sarafimov](https://www.linkedin.com/in/nikola-sarafimov-418753357/)
- Website: [nikolasarafimov.github.io/personal-website](https://nikolasarafimov.github.io/personal-website/)

---

## Project Status

The project is being prepared as a finalized portfolio and academic project.

The complete dictionary database is available in the repository, while the deployed web version uses a reduced database optimized for browser loading.