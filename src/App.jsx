import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import LoadingOverlay from "./components/LoadingOverlay";
import NavBar from "./components/NavBar";
import SearchBar from "./components/SearchBar";
import LetterNav from "./components/LetterNav";
import WordList from "./components/WordList";
import WordDetails from "./components/WordDetails";
import RandomWordButton from "./components/RandomWordButton";
import LanguageInfo from "./components/LanguageInfo";
import Abbreviations from "./components/Abbreviations";
import NotFoundPage from "./components/NotFoundPage";
import Footer from "./components/Footer";
import Favorites from "./pages/Favorites";

import {
  getTotalForms,
  getRandomForm,
  getWordsByLetter,
  getWordByForm,
  searchForms,
  getSimilarForms,
  getSearchSuggestions,
} from "./db/client";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25 },
};

function Home({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  selectedLetter,
  onLetterClick,
  onRandom,
  totalWords,
  isDbBusy,
  suggestions,
  onSuggestionSelect,
}) {
  return (
    <div className="home-container">

      <section className="home-hero card">
        <div className="hero-top">
          <h1 className="hero-title">Македонски дигитален речник</h1>
          <p className="hero-subtitle">
            Интерактивен, модерен и отворен ресурс за македонскиот јазик.
          </p>
        </div>

        <div className="hero-meta">
          <div className="hero-stat">
            <span className="hero-stat-label">Форми во базата</span>
            <span className="hero-stat-value">
              {totalWords ? totalWords.toLocaleString("mk-MK") : "Вчитување..."}
            </span>
          </div>

          <div className="hero-stat">
            <span className="hero-stat-label">Тип</span>
            <span className="hero-stat-value">монолингвален речник</span>
          </div>
        </div>
      </section>

      <section className="search-wrapper">
        <SearchBar
          term={searchInput}
          onTermChange={onSearchInputChange}
          onSearch={onSearchSubmit}
          suggestions={suggestions}
          onSuggestionSelect={onSuggestionSelect}
          disabled={isDbBusy}
        />
      </section>

      <section className="home-random-section">
        <RandomWordButton onRandom={onRandom} disabled={isDbBusy} />
      </section>

      <section className="home-info card">
        <h2>За овој речник</h2>
        <p>
          Речникот е дигитален ресурс кој овозможува брзо пребарување на форми,
          леми и морфолошки ознаки на македонскиот јазик.
        </p>

        <ul>
          <li><strong>Почетна</strong> – пребарување, азбучен индекс, случаен збор.</li>
          <li><strong>Македонски јазик</strong> – информации за јазикот.</li>
          <li><strong>Скратеници</strong> – најчести скратеници и значења.</li>
          <li><strong>Омилени</strong> – ваши омилени зборови.</li>
        </ul>

        <p className="home-author">
          Автор: <strong>Никола Сарафимов</strong>
        </p>
      </section>

      <section className="home-alpha-section card">
        <div className="card-header">
          <h2>Азбучен индекс</h2>
          <p className="card-subtitle">
            Одберете буква за да ги прегледате зборовите што започнуваат со неа.
          </p>
        </div>

        <LetterNav
          selectedLetter={selectedLetter}
          onLetterClick={onLetterClick}
          disabled={isDbBusy}
        />
      </section>
    </div>
  );
}

function ListPage({ words, onSelect, searchTerm }) {
  const { letter } = useParams();
  const label = letter || searchTerm;

  if (letter && words.length === 0 && !searchTerm) {
    return (
      <div className="list-page card">
        <h2>Азбучен индекс</h2>
        <p>За „<strong>{letter}</strong>“ нема резултати.</p>
      </div>
    );
  }

  if (searchTerm && words.length === 0) {
    return <Navigate to={`/not-found/${searchTerm}`} replace />;
  }

  return (
    <div className="list-page-container">
      <div className="results-card">

        <div className="results-header">
          <h2 className="results-title">
            Резултати за: <span className="results-term">„{label}“</span>
          </h2>
          <span className="results-badge">{words.length} форми</span>
        </div>

        <div className="results-list-wrapper">
          <WordList words={words} onSelect={onSelect} />
        </div>

      </div>
    </div>
  );
}

function DetailsByParam() {
  const { form } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [word, setWord] = useState(null);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setWord(null);
      setSimilar([]);

      const main = await getWordByForm(form);
      if (cancelled) return;

      if (main) {
        setWord(main);
        const sims = await getSimilarForms(main.lemma, main.form);
        if (!cancelled) setSimilar(sims);
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => (cancelled = true);
  }, [form]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ height: "150px" }}
      />
    );
  }

  if (!word) {
    return (
      <motion.div
        className="details-page card not-found"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p>Поимот „<strong>{form}</strong>“ не е пронајден.</p>
      </motion.div>
    );
  }

  return (
    <div className="details-layout">
      <motion.div
        className="details-search-wrapper"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <SearchBar
          term={form}
          onTermChange={() => {}}
          onSearch={(q) => q.trim() && navigate(`/details/${q.trim()}`)}
          suggestions={[]}
        />
      </motion.div>

      <motion.div
        className="card word-details-card"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <WordDetails word={word} />

        {similar.length > 0 && (
          <section className="similar-words">
            <h3>Слични форми</h3>
            <div className="similar-grid">
              {similar.map((s, i) => (
                <button
                  key={i}
                  className="similar-badge"
                  onClick={() => navigate(`/details/${s}`)}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </div>
  );
}

export default function App() {
  const [totalWords, setTotalWords] = useState(0);
  const [filteredWords, setFiltered] = useState([]);

  const [selectedLetter, setLetter] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [isDbBusy, setIsDbBusy] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    let cancelled = false;
    const q = searchInput.trim();

    if (!q) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const arr = await getSearchSuggestions(q);
      if (!cancelled) setSuggestions(arr);
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchInput]);

  useEffect(() => {
    const match = pathname.match(/^\/list\/(.+)$/);
    setLetter(match ? decodeURIComponent(match[1]) : null);
  }, [pathname]);

  useEffect(() => {
    if (!pathname.startsWith("/home") || totalWords) return;

    let cancelled = false;

    async function loadCount() {
      setIsDbBusy(true);
      const cnt = await getTotalForms();
      if (!cancelled) setTotalWords(cnt);
      setIsDbBusy(false);
    }

    loadCount();
    return () => (cancelled = true);
  }, [pathname, totalWords]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!selectedLetter && !searchTerm) {
        setFiltered([]);
        return;
      }

      setIsDbBusy(true);

      if (selectedLetter && pathname.startsWith("/list")) {
        const rows = await getWordsByLetter(selectedLetter);
        if (!cancelled) setFiltered(rows);

        navigate(`/list/${selectedLetter}`, { replace: true });
        setIsDbBusy(false);
        return;
      }

      if (searchTerm) {
        const exact = await getWordByForm(searchTerm);

        if (exact && !cancelled) {
          navigate(`/details/${exact.form}`);
          setIsDbBusy(false);
          return;
        }

        const rows = await searchForms(searchTerm);
        if (!cancelled) setFiltered(rows);

        if (rows.length && !pathname.startsWith("/list")) {
          navigate("/list", { replace: true });
        } else if (!rows.length) {
          navigate(`/not-found/${searchTerm}`, { replace: true });
        }
      }

      setIsDbBusy(false);
    }

    run();
    return () => (cancelled = true);
  }, [selectedLetter, searchTerm, pathname]);

  const handleNavSelect = (key) => {
    if (key === "home") {
      setLetter(null);
      setSearchInput("");
      setSearchTerm("");
      setSuggestions([]);
      navigate("/home");
    } else {
      navigate(`/${key}`);
    }
  };

  const handleSearchInputChange = (v) => {
    setSearchInput(v);
    setLetter(null);
  };

  const handleSearchSubmit = (v) => {
    const q = v.trim();
    if (!q) return;
    setSearchInput(q);
    setSearchTerm(q);
    setSuggestions([]);
  };

  const handleLetterClick = (ltr) => {
    setLetter(ltr);
    setSearchInput("");
    setSearchTerm("");
    setSuggestions([]);
    navigate(`/list/${ltr}`);
  };

  const handleRandom = async () => {
    setIsDbBusy(true);
    const f = await getRandomForm();
    if (f) navigate(`/details/${f}`);
    setIsDbBusy(false);
  };

  const handleSuggestionSelect = (w) => {
    setSearchInput(w);
    setSearchTerm(w);
    setSuggestions([]);
  };

  const navKey =
    pathname.startsWith("/home") ? "home" : pathname.split("/")[1] || "home";

  return (
    <div className="app-shell">
      <NavBar selected={navKey} onSelect={handleNavSelect} />

      <main className="app-main">
        {isDbBusy && <LoadingOverlay />}

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>

            <Route path="/" element={<Navigate to="/home" replace />} />

            <Route
              path="/home"
              element={
                <motion.div {...pageTransition}>
                  <Home
                    searchInput={searchInput}
                    onSearchInputChange={handleSearchInputChange}
                    onSearchSubmit={handleSearchSubmit}
                    selectedLetter={selectedLetter}
                    onLetterClick={handleLetterClick}
                    onRandom={handleRandom}
                    totalWords={totalWords}
                    isDbBusy={isDbBusy}
                    suggestions={suggestions}
                    onSuggestionSelect={handleSuggestionSelect}
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
                    onSelect={(w) => navigate(`/details/${w.form}`)}
                  />
                </motion.div>
              }
            />

            <Route
              path="/details/:form"
              element={
                <motion.div {...pageTransition}>
                  <DetailsByParam />
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

            <Route
              path="/favorites"
              element={
                <motion.div {...pageTransition}>
                  <Favorites />
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