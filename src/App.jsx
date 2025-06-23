import React, { useState, useEffect } from 'react';
import {Routes, Route, useNavigate, useLocation, useParams, Navigate} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { decodeTag } from './utils/tagDecoder';
import initSqlJs from 'sql.js';

import NavBar           from './components/NavBar';
import SearchBar        from './components/SearchBar';
import LetterNav        from './components/LetterNav';
import WordList         from './components/WordList';
import WordDetails      from './components/WordDetails';
import RandomWordButton from './components/RandomWordButton';
import LanguageInfo     from './components/LanguageInfo';
import Abbreviations    from './components/Abbreviations';
import NotFoundPage     from './components/NotFoundPage';
import Footer           from './components/Footer';

const pageTransition = {
  initial:   { opacity: 0 },
  animate:   { opacity: 1 },
  exit:      { opacity: 0 },
  transition:{ duration: 0.4 }
};

// Home screen component
function Home({ onSearch, selectedLetter, onLetterClick, onRandom, totalWords }) {
  return (
    <>
      <SearchBar onSearch={onSearch} />
      <LetterNav selectedLetter={selectedLetter} onLetterClick={onLetterClick} />
      <RandomWordButton onRandom={onRandom} />
      <h2>Добредојдовте на страницата на Дигитален Македонски речник - интерактивен и отворен ресурс.</h2>
      <p className="dictionary-info">
        Овој речник моментално опфаќа <strong>{totalWords.toLocaleString()}</strong> македонски
        зборови со морфолошки ознаки и примери. <br/> Автор на овој речник е Никола Сарафимов, студент на ФИНКИ - III година (ПИТ).
      </p>
      <p className="dictionary-info2">
        Речникот содржи три дела:
        <ul>
          <li><b>Почетна страница</b> - пребарување, листа по букви и детали за зборовите.</li>
          <li><b>Македонскиот јазик</b> - информации за јазикот, распространетост и лингвистички карактеристики.</li>
          <li><b>Скратеници речник</b> - скратеници и нивните значења.</li>
        </ul>
      </p>
    </>
  );
}

// List of words by letter or search
function ListPage({ words, onSelect, searchTerm }) {
  const { letter } = useParams();
  const label = letter || searchTerm;
  
  if (!searchTerm && letter && words.length === 0) {
   return (
     <div className="list-page not-found">     
       <p>За буквата „<strong>{letter}</strong>“ нема зборови!</p>
     </div>
   );
  }

  if (searchTerm && words.length === 0) {
     return <Navigate to={`/not-found/${encodeURIComponent(searchTerm)}`} replace />;
  }

  return (
    <div className="list-page">
      <h2>Резултати за: {label}</h2>
      <WordList words={words} onSelect={onSelect} />
    </div>
  );
}

// Details view by URL param
function DetailsByParam({ db }) {
  const { form } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [word,    setWord]    = useState(null);
  const [similar, setSimilar] = useState([]);

  const run = (sql, params = []) => {
    const res = db.exec(sql, params);
    if (!res.length) return [];
    const { columns, values } = res[0];
    return values.map(r => Object.fromEntries(columns.map((c,i) => [c, r[i]])));
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
      [form]
    );

    if (main.length) {
      setWord(main[0]);

      const sims = run(
        `SELECT DISTINCT form FROM words
         WHERE lemma = ? AND form != ? ORDER BY RANDOM() LIMIT 5`,
        [main[0].lemma, main[0].form]
      ).map(o => o.form);
      setSimilar(sims);
    }
    setLoading(false);
  }, [db, form]);

  if (loading) return <p>Вчитување…</p>;

  if (!word) {
    return (
      <div className="details-page not-found">
        <p>Поимот „<strong>{form}</strong>“ не е пронајден или не постои!</p>
      </div>
    );
  }

  const handleSearch = e => {
    e.preventDefault();
    const q = e.target.search.value.trim();
    if (!q) return;
    const exact = run(
      `SELECT form FROM words WHERE LOWER(form)=? LIMIT 1`,
      [q.toLowerCase()]
    );
    if (exact.length) {
      navigate(`/details/${encodeURIComponent(exact[0].form)}`);
    } else {
      navigate(`/not-found/${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className="details-page">
      <form onSubmit={handleSearch} className="search-bar" style={{ marginBottom: '1rem' }}>
        <input name="search" defaultValue={form} placeholder="Пребарајте..." />
        <button type="submit">🔍</button>
      </form>

      <WordDetails word={word} />

      {similar.length > 0 && (
        <section className="similar-words">
          <h3>Слични форми:</h3>
          <div className="similar-grid">
            {similar.map((s, i) => (
              <button key={i} className="similar-badge" onClick={() => navigate(`/details/${encodeURIComponent(s)}`)}>
                {s}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function App() {
  const [db, setDb]                  = useState(null);
  const [totalWords, setTotalWords]  = useState(0);
  const [filteredWords, setFiltered] = useState([]);
  const [selectedLetter, setLetter]  = useState(null);
  const [searchTerm, setSearchTerm]  = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  // load DB & count
  useEffect(() => {
    (async () => {
      const SQL = await initSqlJs({ locateFile: f => `/${f}` });
      const resp = await fetch('/msd-mk.sqlite');
      const buf = await resp.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(buf));
      setDb(db);
      const cnt = db.exec(`SELECT COUNT(*) AS cnt FROM words`);
      if (cnt.length) setTotalWords(cnt[0].values[0][0]);
    })();
  }, []);

  // sync selectedLetter from URL
  useEffect(() => {
    const m = pathname.match(/^\/list\/(.+)$/);
    setLetter(m ? decodeURIComponent(m[1]) : null);
  }, [pathname]);

  // filter logic
  useEffect(() => {
    if (!db) return;
    const run = (sql, params = []) => {
      const res = db.exec(sql, params);
      if (!res.length) return [];
      const { columns, values } = res[0];
      return values.map(r => Object.fromEntries(columns.map((c, i) => [c, r[i]])));
    };

    if (selectedLetter) {
      const rows = run(
        `SELECT form, lemma, tag FROM words 
        WHERE UPPER(form) LIKE ? ORDER BY form COLLATE NOCASE LIMIT 10000`,
        [selectedLetter.toUpperCase() + '%']
      );
      setFiltered(rows);
      navigate(`/list/${encodeURIComponent(selectedLetter)}`, { replace: true });

    } else if (searchTerm) {
      const exact = run(
       `SELECT form, lemma, tag FROM words 
        WHERE LOWER(form)=? LIMIT 1`,
       [searchTerm.toLowerCase()]
     );
     if (exact.length) {
       navigate(`/details/${encodeURIComponent(exact[0].form)}`);
       return;
     }

     const rows = run(
       `SELECT form, lemma, tag FROM words 
        WHERE LOWER(form) LIKE ? ORDER BY form COLLATE NOCASE LIMIT 10000`,
       [`%${searchTerm.toLowerCase()}%`]
     );
     setFiltered(rows);
     if (rows.length) {
       navigate('/list',  { replace: true });
     } else {
       navigate(`/not-found/${encodeURIComponent(searchTerm)}`, { replace: true });
      }

    } else {
      setFiltered([]);
    }
  }, [db, selectedLetter, searchTerm, navigate]);

  // handlers
  const handleNavSelect = key => {
    if (key === 'home') {
      setLetter(null);
      setSearchTerm('');
      navigate('/home');
    } else {
      navigate(`/${key}`);
    }
  };

  const handleSearch = term => { setSearchTerm(term); setLetter(null); };
  const handleLetterClick = letter => { navigate(`/list/${encodeURIComponent(letter)}`); };
  const handleRandom = () => {
    if (!db) return;
    const res = db.exec(`SELECT form FROM words ORDER BY RANDOM() LIMIT 1`);
    if (!res.length) return;
    navigate(`/details/${encodeURIComponent(res[0].values[0][0])}`);
  };

  const navKey = pathname.startsWith('/home') ? 'home' : pathname.split('/')[1] || 'home';

  return (
    <div className="container">
      <img src="/recnikLogo.png" alt="Лого Македонски Речник" style={{ width: '250px', cursor: 'pointer' }} onClick={() => handleNavSelect('home')}/>
      <NavBar selected={navKey} onSelect={handleNavSelect} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition}><Home onSearch={handleSearch} selectedLetter={selectedLetter} onLetterClick={handleLetterClick} onRandom={handleRandom} totalWords={totalWords} /></motion.div>} />
          <Route path="/list/:letter?" element={<ListPage words={filteredWords} searchTerm={searchTerm} onSelect={w => { setSearchTerm(''); setLetter(null); navigate(`/details/${encodeURIComponent(w.form)}`)}} />} />
          <Route path="/details/:form" element={<DetailsByParam db={db} />} />
          <Route path="/language" element={<motion.div variants={pageTransition}><LanguageInfo /></motion.div>} />
          <Route path="/abbr/:group?" element={<motion.div variants={pageTransition}><Abbreviations /></motion.div>} />
          <Route path="/not-found/:term" element={<motion.div variants={pageTransition}><NotFoundPage /></motion.div>}/>
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  );
} 