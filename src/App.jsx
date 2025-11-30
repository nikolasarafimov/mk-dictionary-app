import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import initSqlJs from 'sql.js';

import LoadingOverlay from './components/LoadingOverlay';
import NavBar from './components/NavBar';
import SearchBar from './components/SearchBar';
import LetterNav from './components/LetterNav';
import WordList from './components/WordList';
import WordDetails from './components/WordDetails';
import RandomWordButton from './components/RandomWordButton';
import LanguageInfo from './components/LanguageInfo';
import Abbreviations from './components/Abbreviations';
import NotFoundPage from './components/NotFoundPage';
import Footer from './components/Footer';

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25 },
};

function Home({ onSearch, selectedLetter, onLetterClick, onRandom, totalWords }) {
  return (
    <div className="home-container">
      <section className="home-hero card">
        <h1 className="hero-title">Македонски дигитален речник</h1>
        <p className="hero-subtitle">
          Интерактивен, модерен и отворен ресурс за македонскиот јазик со{' '}
          <strong>{totalWords.toLocaleString()}</strong> форми во базата.
        </p>
      </section>

      <section className="home-search-section">
        <SearchBar onSearch={onSearch} />
      </section>

      <section className="home-alpha-section card">
        <div className="card-header">
          <h2>Азбучен индекс</h2>
          <p className="card-subtitle">
            Одберете буква за да ги прегледате зборовите што започнуваат со неа.
          </p>
        </div>
        <LetterNav selectedLetter={selectedLetter} onLetterClick={onLetterClick} />
      </section>

      <section className="home-random-section">
        <RandomWordButton onRandom={onRandom} />
      </section>

      <section className="home-info card">
        <h2>За овој речник</h2>
        <p>
          Речникот е изработен како дигитален ресурс кој овозможува брзо пребарување на
          форми, леми и морфолошки ознаки на македонскиот јазик.
        </p>
        <ul>
          <li>
            <strong>Почетна страница</strong> – пребарување, азбучен индекс и случаен збор.
          </li>
          <li>
            <strong>Македонскиот јазик</strong> – информации за јазикот, распространетост и
            лингвистички карактеристики.
          </li>
          <li>
            <strong>Скратеници</strong> – листа на најчести скратеници и нивните значења.
          </li>
        </ul>
        <p className="home-author">
          Автор: <strong>Никола Сарафимов</strong>, студент на ФИНКИ – III година (ПИТ).
        </p>
      </section>
    </div>
  );
}

function ListPage({ words, onSelect, searchTerm }) {
  const { letter } = useParams();
  const label = letter || searchTerm;

  if (!searchTerm && letter && words.length === 0) {
    return (
      <div className="list-page card">
        <h2>Азбучен индекс</h2>
        <p>
          За буквата „<strong>{letter}</strong>“ нема пронајдени зборови.
        </p>
      </div>
    );
  }

  if (searchTerm && words.length === 0) {
    return <Navigate to={`/not-found/${encodeURIComponent(searchTerm)}`} replace />;
  }

  return (
    <div className="list-page card">
      <div className="card-header">
        <h2>Резултати за: „{label}“</h2>
        <span className="results-count">{words.length} форми</span>
      </div>
      <WordList words={words} onSelect={onSelect} />
    </div>
  );
}

function DetailsByParam({ db }) {
  const { form } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [word, setWord] = useState(null);
  const [similar, setSimilar] = useState([]);

  const run = (sql, params = []) => {
    const res = db.exec(sql, params);
    if (!res.length) return [];
    const { columns, values } = res[0];
    return values.map((r) => Object.fromEntries(columns.map((c, i) => [c, r[i]])));
  };

  useEffect(() => {
    setLoading(true);
    setWord(null);
    setSimilar([]);
  }, [form]);

  useEffect(() => {
    if (!db) return;

    const main = run(
      `SELECT form, lemma, tag FROM words WHERE form = ? LIMIT 1`,
      [form],
    );

    if (main.length) {
      setWord(main[0]);

      const sims = run(
        `SELECT DISTINCT form FROM words
         WHERE lemma = ? AND form != ? 
         ORDER BY RANDOM() LIMIT 8`,
        [main[0].lemma, main[0].form],
      ).map((o) => o.form);
      setSimilar(sims);
    }
    setLoading(false);
  }, [db, form]);

  if (loading || !db) {
    return (
      <div className="details-page card">
        <p>Вчитување на поимот…</p>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="details-page card not-found">
        <p>
          Поимот „<strong>{form}</strong>“ не е пронајден или не постои.
        </p>
      </div>
    );
  }

  const handleSearch = (e) => {
    e.preventDefault();
    const q = e.target.search.value.trim();
    if (!q) return;
    const exact = run(
      `SELECT form FROM words WHERE LOWER(form)=? LIMIT 1`,
      [q.toLowerCase()],
    );
    if (exact.length) {
      navigate(`/details/${encodeURIComponent(exact[0].form)}`);
    } else {
      navigate(`/not-found/${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className="details-page">
      <form onSubmit={handleSearch} className="search-bar search-bar-inline">
        <input name="search" defaultValue={form} placeholder="Пребарајте друг поим..." />
        <button type="submit">🔍</button>
      </form>

      <div className="card word-details-card">
        <WordDetails word={word} />

        {similar.length > 0 && (
          <section className="similar-words">
            <h3>Слични форми</h3>
            <div className="similar-grid">
              {similar.map((s, i) => (
                <button
                  key={i}
                  className="similar-badge"
                  onClick={() => navigate(`/details/${encodeURIComponent(s)}`)}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [db, setDb] = useState(null);
  const [totalWords, setTotalWords] = useState(0);
  const [filteredWords, setFiltered] = useState([]);
  const [selectedLetter, setLetter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    (async () => {
      const SQL = await initSqlJs({ locateFile: (f) => `/${f}` });
      const resp = await fetch('/msd-mk.sqlite');
      const buf = await resp.arrayBuffer();
      const database = new SQL.Database(new Uint8Array(buf));
      setDb(database);
      const cnt = database.exec(`SELECT COUNT(*) AS cnt FROM words`);
      if (cnt.length) setTotalWords(cnt[0].values[0][0]);
    })();
  }, []);

  useEffect(() => {
    const m = pathname.match(/^\/list\/(.+)$/);
    setLetter(m ? decodeURIComponent(m[1]) : null);
  }, [pathname]);

  useEffect(() => {
    if (!db) return;
    const run = (sql, params = []) => {
      const res = db.exec(sql, params);
      if (!res.length) return [];
      const { columns, values } = res[0];
      return values.map((r) => Object.fromEntries(columns.map((c, i) => [c, r[i]])));
    };

    if (selectedLetter) {
      const rows = run(
        `SELECT form, lemma, tag FROM words 
         WHERE UPPER(form) LIKE ? 
         ORDER BY form COLLATE NOCASE 
         LIMIT 10000`,
        [selectedLetter.toUpperCase() + '%'],
      );
      setFiltered(rows);
      navigate(`/list/${encodeURIComponent(selectedLetter)}`, { replace: true });
    } else if (searchTerm) {
      const exact = run(
        `SELECT form, lemma, tag FROM words 
         WHERE LOWER(form)=? LIMIT 1`,
        [searchTerm.toLowerCase()],
      );
      if (exact.length) {
        navigate(`/details/${encodeURIComponent(exact[0].form)}`);
        return;
      }

      const rows = run(
        `SELECT form, lemma, tag FROM words 
         WHERE LOWER(form) LIKE ? 
         ORDER BY form COLLATE NOCASE 
         LIMIT 10000`,
        [`%${searchTerm.toLowerCase()}%`],
      );
      setFiltered(rows);
      if (rows.length) {
        navigate('/list', { replace: true });
      } else {
        navigate(`/not-found/${encodeURIComponent(searchTerm)}`, { replace: true });
      }
    } else {
      setFiltered([]);
    }
  }, [db, selectedLetter, searchTerm, navigate]);

  const handleNavSelect = (key) => {
    if (key === 'home') {
      setLetter(null);
      setSearchTerm('');
      navigate('/home');
    } else {
      navigate(`/${key}`);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setLetter(null);
  };

  const handleLetterClick = (letter) => {
    navigate(`/list/${encodeURIComponent(letter)}`);
  };

  const handleRandom = () => {
    if (!db) return;
    const res = db.exec(`SELECT form FROM words ORDER BY RANDOM() LIMIT 1`);
    if (!res.length) return;
    navigate(`/details/${encodeURIComponent(res[0].values[0][0])}`);
  };

  const navKey =
    pathname.startsWith('/home') ? 'home' : pathname.split('/')[1] || 'home';

  return (
    <div className="app-shell">
      <NavBar selected={navKey} onSelect={handleNavSelect} />

      <main className="app-main">
        {!db && <LoadingOverlay />}

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route
              path="/home"
              element={
                <motion.div {...pageTransition}>
                  <Home
                    onSearch={handleSearch}
                    selectedLetter={selectedLetter}
                    onLetterClick={handleLetterClick}
                    onRandom={handleRandom}
                    totalWords={totalWords}
                  />
                </motion.div>
              }
            />
            <Route
              path="/list/:letter?"
              element={
                <motion.div {...pageTransition}>
                  <ListPage
                    words={filteredWords}
                    searchTerm={searchTerm}
                    onSelect={(w) => {
                      setSearchTerm('');
                      setLetter(null);
                      navigate(`/details/${encodeURIComponent(w.form)}`);
                    }}
                  />
                </motion.div>
              }
            />
            <Route
              path="/details/:form"
              element={
                <motion.div {...pageTransition}>
                  <DetailsByParam db={db} />
                </motion.div>
              }
            />
            <Route
              path="/language"
              element={
                <motion.div {...pageTransition}>
                  <LanguageInfo />
                </motion.div>
              }
            />
            <Route
              path="/abbr/:group?"
              element={
                <motion.div {...pageTransition}>
                  <Abbreviations />
                </motion.div>
              }
            />
            <Route
              path="/not-found/:term"
              element={
                <motion.div {...pageTransition}>
                  <NotFoundPage />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}