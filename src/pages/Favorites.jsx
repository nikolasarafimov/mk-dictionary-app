import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFavorites } from "../utils/favoriteManager";
import { getWordsByForms } from "../db/client";

export default function Favorites() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      const favForms = getFavorites();

      if (!favForms || favForms.length === 0) {
        if (!cancelled) {
          setWords([]);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getWordsByForms(favForms);
        if (!cancelled) {
          setWords(data);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFavorites();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="favorites-page">
        <p>Вчитување…</p>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <h2>Омилени зборови</h2>

      {words.length === 0 ? (
        <p className="empty-state">Немате додадено омилени зборови.</p>
      ) : (
        <ul className="favorite-list">
          {words.map((w) => (
            <li key={w.form} className="favorite-item">
              <Link to={`/details/${w.form}`} className="favorite-link">
                {w.form}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}