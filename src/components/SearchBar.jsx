import React from 'react';

export default function SearchBar({
  term,
  onSearch,
  onTermChange,
  suggestions = [],
  onSuggestionSelect,
  disabled,
}) {
  const submit = (e) => {
    e.preventDefault();
    if (disabled) return;
    const q = term.trim();
    if (!q) return;
    onSearch(q);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    onTermChange(value);
  };

  const handleSuggestionClick = (word) => {
    if (disabled) return;
    onSuggestionSelect?.(word);
  };

  return (
    <div className="search-bar-wrapper">
      <form onSubmit={submit} className="search-bar">
        <input
          type="text"
          placeholder={disabled ? 'Речникот се вчитува...' : 'Пребарувајте...'}
          value={term}
          onChange={handleChange}
          disabled={disabled}
        />
        <button type="submit" disabled={disabled}>
          🔍
        </button>
      </form>

      {!disabled && suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              onMouseDown={() => handleSuggestionClick(s)}
              className="search-suggestion-item"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}