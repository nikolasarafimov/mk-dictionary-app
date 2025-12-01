import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [term, setTerm] = useState('');
  const submit = e => {
    e.preventDefault();
    onSearch(term.trim());
  };
  return (
    <form onSubmit={submit} className="search-bar">
      <input type="text" placeholder="Пребарувајте..." value={term} onChange={e => setTerm(e.target.value)}/>
      <button type="submit">🔍</button>
    </form>
  );
}
