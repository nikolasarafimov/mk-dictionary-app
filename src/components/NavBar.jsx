import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

export default function NavBar({ selected, onSelect }) {
  const [open, setOpen] = useState(false);

  const links = [
    { key: "home", label: "Почетна", path: "/home" },
    { key: "language", label: "Македонски јазик", path: "/language" },
    { key: "abbr", label: "Скратеници", path: "/abbr" },
    { key: "favorites", label: "Омилени", path: "/favorites" }, // ⭐ NEW
  ];

  const handleSelect = (key) => {
    if (onSelect) onSelect(key);
    setOpen(false);
  };

  return (
    <nav className="pro-nav">
      <div className="pro-nav-inner">
        <Link
          to="/home"
          className="pro-nav-logo"
          onClick={() => handleSelect("home")}
        >
          <img src="/recnikLogo.png" alt="Македонски речник - Лого" />
        </Link>

        <div className="pro-nav-links">
          {links.map((l) => (
            <Link
              key={l.key}
              to={l.path}
              onClick={() => handleSelect(l.key)}
              className={`pro-nav-link ${selected === l.key ? "active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <button
          className="pro-nav-mobile-button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Затвори мени" : "Отвори мени"}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {open && (
        <div className="pro-nav-mobile-menu">
          {links.map((l) => (
            <Link
              key={l.key}
              to={l.path}
              onClick={() => handleSelect(l.key)}
              className={`pro-nav-mobile-item ${
                selected === l.key ? "active" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}