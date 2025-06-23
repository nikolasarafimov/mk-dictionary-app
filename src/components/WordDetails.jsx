import React from 'react';
import { decodeTag } from '../utils/tagDecoder';

export default function WordDetails({ word }) {
  if (!word) return null;

  return (
    <div className="word-details">
      <h2>{word.form}</h2>
      <p><strong>Потекло:</strong> {word.lemma}</p>
      <p><strong>Опис:</strong> {decodeTag(word.tag)}</p>
    </div>
  );
}