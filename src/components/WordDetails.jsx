import React, { useEffect, useState } from "react";
import { decodeTag } from "../utils/tagDecoder";
import { toggleFavorite, isFavorite } from "../utils/favoriteManager";

export default function WordDetails({ word }) {
  if (!word) return null;

  const [fav, setFav] = useState(isFavorite(word.form));
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleFavorite = () => {
    const nowFav = toggleFavorite(word);
    setFav(nowFav);
  };

  const handleCopyWord = async () => {
    try {
      await navigator.clipboard.writeText(word.form);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
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
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1200);
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

        {copied && <span className="copy-toast">✓ Копирано!</span>}
        {shared && <span className="share-toast">✓ Линкот е копиран!</span>}
      </div>

      <p>
        <strong>Потекло:</strong> {word.lemma || "—"}
      </p>

      <p>
        <strong>Морфолошка ознака:</strong> {word.tag || "—"}
      </p>

      <p>
        <strong>Опис:</strong> {decodeTag(word.tag) || "—"}
      </p>
    </div>
  );
}