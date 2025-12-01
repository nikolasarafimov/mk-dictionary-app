import React, { useEffect, useState } from "react";

export default function WordDetails({ word }) {
  const [fav, setFav] = useState(false);

  if (!word) return null;

  const handleFavorite = () => {
    const nowFav = toggleFavorite(word);
    setFav(nowFav);
  };

  const handleCopyWord = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(word.form).catch(() => {});
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: word.form,
          text: `Погледни го поимот „${word.form}“ во македонскиот речник.`,
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert("Врската е копирана во clipboard.");
      }
    } catch {}
  };

  return (
    <div className="word-details">
      <div className="word-details-header">
        <h2>{word.form}</h2>

        <div className="word-actions">
          <button
            type="button"
            className={`badge-button ${fav ? "badge-fav" : ""}`}
            onClick={handleFavorite}
          >
            {fav ? "★ Омилен" : "☆ Додај во омилени"}
          </button>

          <button
            type="button"
            className="badge-button"
            onClick={handleCopyWord}
          >
            📋 Копирај збор
          </button>

          <button
            type="button"
            className="badge-button"
            onClick={handleShare}
          >
            🔗 Сподели
          </button>
        </div>
      </div>

      <p>
        <strong>Потекло:</strong> {word.lemma}
      </p>

      <p>
        <strong>Морфолошка ознака:</strong> {word.tag}
      </p>

      <p>
        <strong>Опис:</strong> {decodeTag(word.tag)}
      </p>

      {grammar && grammar.length > 0 && (
        <p className="grammar-explanation">
          <strong>Граматички опис:</strong> {grammar.join(", ")}
        </p>
      )}
    </div>
  );
}