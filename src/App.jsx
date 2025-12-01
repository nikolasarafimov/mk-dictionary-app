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

import {
  runQuery,
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
              {totalWords
                ? totalWords.toLocaleString("mk-MK")
                : "Вчитување..."}
            </span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-label">Тип</span>
            <span className="hero-stat-value">монолингвален речник</span>
          </div>
        </div>
      </section>

      <section className="home-search-section">
        <SearchBar
          term={searchInput}
          onTermChange={onSearchInputChange}
          onSearch={onSearchSubmit}
          suggestions={suggestions}
          onSuggestionSelect={onSuggestionSelect}
          disabled={isDbBusy}
        />
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

      <section className="home-random-section">
        <RandomWordButton onRandom={onRandom} disabled={isDbBusy} />
      </section>

      <section className="home-info card">
        <h2>За овој речник</h2>
        <p>
          Речникот е изработен као дигитален ресурс кој овозможува брзо
          пребарување на форми, леми и морфолошки ознаки на македонскиот јазик.
        </p>
        <ul>
          <li>
            <strong>Почетна страница</strong> – пребарување, азбучен индекс и
            случаен збор.
          </li>
          <li>
            <strong>Македонскиот јазик</strong> – информации за јазикот,
            распространетост и лингвистички карактеристики.
          </li>
          <li>
            <strong>Скратеници</strong> – листа на најчести скратеници и
            нивните значења.
          </li>
        </ul>
        <p className="home-author">
          Автор: <strong>Никола Сарафимов</strong>, студент на ФИНКИ – III
          година (ПИТ).
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
    return <Navigate to={`/not-found/${searchTerm}`} replace />;
  }

  return (
    <div className="list-page-container">
      <div className="results-card">
        <div className="results-header">
          <h2 className="results-title">
            Резултати за: <span className="results-term">„{label}“</span>
          </h2>

          <span className="results-badge">
            {words.length.toLocaleString()} форми
          </span>
        </div>

        <div className="results-list-wrapper">
          <WordList words={words} onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
}

function DetailsByParam({ queryFn }) {
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
    return () => {
      cancelled = true;
    };
  }, [form]);

  

  if (!word) {
    return (
      <div className="details-page card not-found">
        <p>
          Поимот „<strong>{form}</strong>“ не е пронајден или не постои.
        </p>
      </div>
    );
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = e.target.search.value.trim();
    if (!q) return;

    const exact = await runQuery(
      `SELECT form FROM words WHERE LOWER(form)=? LIMIT 1`,
      [q.toLowerCase()]
    );

    if (exact.length) {
      navigate(`/details/${exact[0].form}`);
    } else {
      navigate(`/not-found/${q}`);
    }
  };

  return (
    <div className="details-page">
      <form onSubmit={handleSearch} className="search-bar search-bar-inline">
        <input
          name="search"
          defaultValue={form}
          placeholder="Пребарајте друг поим..."
        />
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
                  onClick={() => navigate(`/details/${s}`)}
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
  const [totalWords, setTotalWords] = useState(0);

  const [filteredWords, setFiltered] = useState([]);
  const [selectedLetter, setLetter] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [isDbBusy, setIsDbBusy] = useState(false);

  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (!trimmed) {
      setSearchTerm("");
      return;
    }

    const id = setTimeout(() => {
      setSearchTerm(trimmed);
    }, 300);

    return () => clearTimeout(id);
  }, [searchInput]);

  // 🔹 Suggestions effect
  useEffect(() => {
    let cancelled = false;

    const trimmed = searchInput.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    const id = setTimeout(async () => {
      try {
        const suggs = await getSearchSuggestions(trimmed);
        if (!cancelled) {
          setSuggestions(suggs);
        }
      } catch (err) {
        console.error("Error loading suggestions:", err);
        if (!cancelled) {
          setSuggestions([]);
        }
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [searchInput]);

  useEffect(() => {
    const m = pathname.match(/^\/list\/(.+)$/);
    setLetter(m ? decodeURIComponent(m[1]) : null);
  }, [pathname]);

  useEffect(() => {
    if (!pathname.startsWith("/home")) return;
    if (totalWords) return;

    let cancelled = false;

    async function loadCount() {
      try {
        setIsDbBusy(true);
        const cnt = await getTotalForms();
        if (!cancelled) setTotalWords(cnt);
      } finally {
        if (!cancelled) setIsDbBusy(false);
      }
    }

    loadCount();
    return () => {
      cancelled = true;
    };
  }, [pathname, totalWords]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!selectedLetter && !searchTerm) {
        setFiltered([]);
        return;
      }

      try {
        setIsDbBusy(true);

        if (selectedLetter && pathname.startsWith("/list")) {
          const rows = await getWordsByLetter(selectedLetter);
          if (cancelled) return;
          setFiltered(rows);

          const desired = `/list/${selectedLetter}`;
          if (pathname !== desired) {
            navigate(desired, { replace: true });
          }
          return;
        }

        if (searchTerm) {
          const exact = await getWordByForm(searchTerm);
          if (cancelled) return;

          if (exact) {
            navigate(`/details/${exact.form}`);
            return;
          }

          const rows = await searchForms(searchTerm);
          if (cancelled) return;

          setFiltered(rows);

          if (rows.length) {
            if (!pathname.startsWith("/list")) {
              navigate("/list", { replace: true });
            }
          } else {
            navigate(`/not-found/${searchTerm}`, { replace: true });
          }
        }
      } finally {
        if (!cancelled) setIsDbBusy(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [selectedLetter, searchTerm, pathname, navigate]);

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

  const handleSearchInputChange = (value) => {
    setSearchInput(value);
    setLetter(null);
  };

  const handleSearchSubmit = (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearchInput(trimmed);
    setSearchTerm(trimmed);
    setSuggestions([]);
  };

  const handleLetterClick = (letter) => {
    setLetter(letter);
    setSearchInput("");
    setSearchTerm("");
    setSuggestions([]);
    navigate(`/list/${letter}`);
  };

  const handleRandom = async () => {
    try {
      setIsDbBusy(true);
      const form = await getRandomForm();
      if (form) {
        navigate(`/details/${form}`);
      }
    } finally {
      setIsDbBusy(false);
    }
  };

  const handleSuggestionSelect = (word) => {
    setSearchInput(word);
    setSearchTerm(word);
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
                    onSelect={(w) => {
                      navigate(`/details/${w.form}`);
                    }}
                  />
                </motion.div>
              }
            />

            <Route
              path="/details/:form"
              element={
                <motion.div {...pageTransition}>
                  <DetailsByParam queryFn={runQuery} />
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