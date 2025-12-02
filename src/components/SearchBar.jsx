import React, { useState, useEffect, useRef } from "react";

export default function SearchBar({
  term,
  onTermChange,
  onSearch,
  suggestions,
  onSuggestionSelect,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const containerRef = useRef(null);

  useEffect(() => {
    if (suggestions && suggestions.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
    setHighlighted(-1); 
  }, [suggestions]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInput = (e) => {
    const value = e.target.value;
    onTermChange(value);
  };

  const handleSelect = (value) => {
    onSuggestionSelect(value);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0 && highlighted < suggestions.length) {
        handleSelect(suggestions[highlighted]);
      } else {
        onSearch(term); 
      }
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    onSearch(term);
    setOpen(false);
  };

  return (
    <div className="searchbar-container" ref={containerRef}>
      <form onSubmit={submit} className="search-bar">
        <input
          type="text"
          value={term}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Пребарувајте..."
          disabled={disabled}
        />
        <button type="submit" disabled={disabled}>
          🔍
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="suggestion-dropdown">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className={`suggestion-item ${
                i === highlighted ? "highlighted" : ""
              }`}
              onMouseDown={() => handleSelect(s)} 
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}