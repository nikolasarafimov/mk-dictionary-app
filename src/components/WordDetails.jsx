import React, { useEffect, useState } from "react";
import { decodeTag } from "../utils/tagDecoder";
import { toggleFavorite, isFavorite } from "../utils/favoriteManager";

export default function WordDetails({ word }) {
  if (!word) return null;

  const [fav, setFav] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    setFav(isFavorite(word.form));
  }, [word.form]);

  const handleFavorite = () => {
    const nowFav = toggleFavorite(word);
    setFav(nowFav);
  };

  const handleCopyWord = async () => {
    try {
      await navigator.clipboard.writeText(word.form);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      console.warn("Failed to copy");
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
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1200);
      }
    } catch {
      console.warn("Share cancelled or failed");
    }
  };

  return (
    <div className="word-details">
  
      <div className="word-details-header">
        <h2 className="word-title">{word.form}</h2>

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

      <div className="word-info">
        <p>
          <strong>Потекло:</strong>{" "}
          {word.lemma ? word.lemma : "—"}
        </p>

        <p>
          <strong>Морфолошка ознака:</strong>{" "}
          {word.tag ? word.tag : "—"}
        </p>

        <p>
          <strong>Опис:</strong>{" "}
          {word.tag ? decodeTag(word.tag) : "—"}
        </p>
      </div>

    </div>
  );
}